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
import { faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FilterOption, FilterType } from 'src/app/components/ui/table-filter/filter-options';

import { OispAlertPriority, OispAlertStatus } from 'src/app/store/oisp/oisp-alert/oisp-alert.model';
import { Location } from '@angular/common';
import { RouteHelpers } from '../../../common/utils/route-helpers';
import { TableSelectedItemsBarType } from '../../ui/table-selected-items-bar/table-selected-items-bar.type';
import { OispDeviceQuery } from '../../../store/oisp/oisp-device/oisp-device.query';
import { OispDeviceResolver } from '../../../resolvers/oisp-device-resolver';
import { ConfirmationService } from 'primeng/api';
import { TableHelper } from '../../../common/utils/table-helper';

export enum NotificationState { OPEN, CLEARED}

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
  providers: [ConfirmationService]
})
export class NotificationsListComponent implements OnInit, OnDestroy {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  @Input() notifications$: Observable<OispNotification[]>;
  @Input() isInline = false;
  state: NotificationState;

  titleMapping: { [k: string]: string };
  editBarMapping: { [k: string]: string };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  intervalId: number;

  searchText = '';
  allNotifications: OispNotification[] = [];
  displayedNotifications: OispNotification[];
  filteredNotifications: OispNotification[];
  searchedNotifications: OispNotification[];
  selectedNotifications: OispNotification[] = [];
  notificationSubscription: Subscription;

  OispPriority = OispAlertPriority;
  alertStatusTypes = OispAlertStatus;
  notificationStates = NotificationState;
  TableSelectedItemsBarType = TableSelectedItemsBarType;

  faInfoCircle = faInfoCircle;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;

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
    private routingLocation: Location,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit() {
    this.state = this.getCurrentState();
    this.assetSeriesDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.periodicallyFetchNotifications();
    this.initNameMappings();
    this.resetNotificationVariablesToAllNotifications();

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  private resetNotificationVariablesToAllNotifications() {
    this.displayedNotifications = this.filteredNotifications = this.searchedNotifications = this.allNotifications;
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    clearInterval(this.intervalId);
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
    if (RouteHelpers.matchFullRoute(this.routingLocation.path(), `\/notifications`)) {
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

  private closeMultipleNotifications() {
    this.selectedNotifications.forEach(notification => {
      this.deleteNotification(notification.id);
    });
    this.selectedNotifications = [];
  }

  private closeNotification(notification: OispNotification) {
    if (notification.status === this.alertStatusTypes.NEW || notification.status === this.alertStatusTypes.OPEN) {
      this.deleteNotification(notification.id);
      if (this.selectedNotifications.includes(notification)) {
        this.selectedNotifications.splice(this.selectedNotifications.indexOf(notification), 1);
      }
    }
  }

  showCloseDialog(notifications: OispNotification[]) {
    this.confirmationService.confirm({
      message: notifications.length === 1 ? 'Are you sure you want to clear the notification "' + notifications[0].ruleName + '"?' :
        'Are you sure you want to clear ' + notifications.length + ' notifications ?',
      header: 'Close Notification Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (notifications.length === 1) {
          this.closeNotification(notifications[0]);
        } else {
          this.closeMultipleNotifications();
        }
      },
      reject: () => {
      }
    });
  }

  deleteNotification(id: ID): void {
    const filteredNotification = this.displayedNotifications.find(value => value.id === id);
    this.oispAlertService.closeAlert(filteredNotification.id).subscribe(() => {
    });
  }

  isFloatingNumber(text: string) {
    const n = Number(text);
    return Number(n) === n && n % 1 !== 0;
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
