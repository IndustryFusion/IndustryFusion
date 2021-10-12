/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { AssetSeriesDetailsResolver } from '../../../resolvers/asset-series-details-resolver.service';
import { Observable, Subscription } from 'rxjs';
import { OispNotification } from '../../../store/oisp/oisp-notification/oisp-notification.model';
import { OispAlertService } from '../../../store/oisp/oisp-alert/oisp-alert.service';
import { environment } from '../../../../environments/environment';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FilterOption, FilterType } from 'src/app/components/ui/table-filter/filter-options';

import { OispAlertPriority, OispAlertStatus } from 'src/app/store/oisp/oisp-alert/oisp-alert.model';
import { Location } from '@angular/common';
import { RouteHelpers } from '../../../common/utils/route-helpers';
import { TableSelectedItemsBarType } from '../../ui/table-selected-items-bar/table-selected-items-bar.type';
import { OispDeviceQuery } from '../../../store/oisp/oisp-device/oisp-device.query';
import { OispDeviceResolver } from '../../../resolvers/oisp-device-resolver';

export enum NotificationState { OPEN, CLEARED}

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit, OnDestroy {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  @Input() notifications$: Observable<OispNotification[]>;
  @Input() isInline = false;
  state: NotificationState;

  faInfoCircle = faInfoCircle;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faTimes = faTimes;

  titleMapping: { [k: string]: string };
  editBarMapping: { [k: string]: string };

  intervalId: number;

  searchText = '';
  allNotifications: OispNotification[] = [];
  displayedNotifications: OispNotification[];
  filteredNotifications: OispNotification[];
  searchedNotifications: OispNotification[];
  OispPriority = OispAlertPriority;
  selectedNotifications: OispNotification[] = [];
  alertStatusTypes = OispAlertStatus;
  activeNotification: OispNotification;
  shouldShowDeleteNotification = false;
  notificationStates = NotificationState;
  notificationSubscription: Subscription;

  TableSelectedItemsBarType = TableSelectedItemsBarType;

  tableFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset', attributeToBeFiltered: 'assetName' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Priority', attributeToBeFiltered: 'priority' },
    { filterType: FilterType.DATEFILTER, columnName: 'Date & Time', attributeToBeFiltered: 'timestamp'}];

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private oispAlertService: OispAlertService,
    private oispDeviceQuery: OispDeviceQuery,
    private oispDeviceResolver: OispDeviceResolver,
    private routingLocation: Location
  ) {
  }

  ngOnInit() {
    this.state = this.getCurrentState();
    this.assetSeriesDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.periodicallyFetchNotifications();
    this.initNameMappings();
    this.resetNotificationVariablesToAllNotifications();
  }

  private resetNotificationVariablesToAllNotifications() {
    this.displayedNotifications = this.filteredNotifications = this.searchedNotifications = this.allNotifications;
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    clearInterval(this.intervalId);
  }

  deleteNotification(id: ID): void {
    const filteredNotification = this.displayedNotifications.find(value => value.id === id);
    this.oispAlertService.closeAlert(filteredNotification.id).subscribe(() => {
    });
  }

  deselectAllNotifications(): void {
    this.selectedNotifications = [];
  }

  public getCurrentState(): NotificationState {
    if (RouteHelpers.isRouteActive('cleared', this.activatedRoute)) {
      return NotificationState.CLEARED;
    } else {
      return NotificationState.OPEN;
    }
  }

  onChangeTab() {
    if (this.state === NotificationState.CLEARED) {
      this.navigateToSubroute('cleared');
    } else {
      this.navigateToSubroute('open');
    }
    this.initNameMappings();
  }

  navigateToSubroute(subroute): Promise<boolean> {
    let newRoute = ['..', subroute];
    if (this.routingLocation.path().match(`\/notifications$`)) {
      newRoute = [subroute];
    }
    return this.router.navigate(newRoute, { relativeTo: this.getActiveRouteLastChild() });
  }

  private getActiveRouteLastChild() {
    let route = this.activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }

  private initNameMappings(): void {
    this.titleMapping = {
      '=0': `No ${this.getStatusName()} Notification`,
      '=1': `# ${this.getStatusName()} Notification`,
      other: `# ${this.getStatusName()} Notifications`
    };
    this.editBarMapping = {
      '=0': `No ${this.getStatusName()} Notification selected`,
      '=1': `# ${this.getStatusName()} Notification selected`,
      other: `# ${this.getStatusName()} Notifications selected`
    };
  }

  private getStatusName(): string {
    switch (this.state) {
      case NotificationState.CLEARED:
        return 'Cleared';
      case NotificationState.OPEN:
        return 'Open';
    }
  }

  searchNotifications(event?): void {
    this.searchedNotifications = event;
    this.updateNotifications();
  }

  filterNotifications(event?) {
    this.filteredNotifications = event;
    this.updateNotifications();
  }

  private updateNotifications(): void {
    this.displayedNotifications = this.allNotifications;
    if (this.searchedNotifications) {
      this.displayedNotifications = this.filteredNotifications.filter(notification =>
        this.searchedNotifications.includes(notification));
    }
  }

  private periodicallyFetchNotifications(): void {
    this.initialLoadOfNotificationsEnsureDevicesLoaded();
    this.intervalId = setInterval(() => this.fetchNotifications(), this.FETCHING_INTERVAL_MILLISECONDS);
  }

  private initialLoadOfNotificationsEnsureDevicesLoaded() {
    if (this.oispDeviceQuery.getCount() < 1) {
      this.oispDeviceResolver.resolve().subscribe(() => {
        this.fetchNotifications();
      });
    } else {
      this.fetchNotifications();
    }
  }

  private fetchNotifications() {
    this.notificationSubscription?.unsubscribe();

    this.notificationSubscription = this.notifications$.subscribe(notifications => {
      if (notifications.length !== this.allNotifications.length) {
        this.allNotifications = notifications;
        this.resetNotificationVariablesToAllNotifications();
        this.updateNotifications();
      }
    });
  }

  closeMultibleNotifications() {
    this.selectedNotifications.forEach(notification => {
      this.deleteNotification(notification.id);
    });
    this.selectedNotifications = [];
  }

  showCloseNotification(notification: OispNotification) {
    this.activeNotification = notification;
    this.shouldShowDeleteNotification = true;
  }

  closeNotification() {
    if (this.activeNotification.status === this.alertStatusTypes.NEW || this.activeNotification.status === this.alertStatusTypes.OPEN) {
      this.shouldShowDeleteNotification = false;
      this.deleteNotification(this.activeNotification.id);
    }
  }

  isFloatingNumber(text: string) {
    const n = Number(text);
    return Number(n) === n && n % 1 !== 0;
  }
}
