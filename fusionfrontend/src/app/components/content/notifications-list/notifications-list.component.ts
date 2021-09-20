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

import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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

import { OispAlertPriority, OispAlertStatus } from 'src/app/store/oisp-alert/oisp-alert.model';
import { Location } from '@angular/common';

export enum NotificationState { OPEN, CLEARED }

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit, OnDestroy {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertFetchingIntervalSec * 1000;

  @Input() notifications: Observable<OispNotification[]>;
  @Input() isInline = false;

  faSearch = faSearch;
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
  searchedNotifications: OispNotification[];
  displayedNotifications: OispNotification[];
  filteredNotifications: OispNotification[];
  notificationStates = NotificationState;
  notificationSubscription: Subscription;
  selectedNotifications: OispNotification[] = [];
  activeItem: OispNotification;
  shouldShowDeleteItem = false;

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  possibleFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset', attributeToBeFiltered: 'assetName' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Priority', attributeToBeFiltered: 'priority' },
    { filterType: FilterType.DATEFILTER, columnName: 'Date & Time', attributeToBeFiltered: 'timestamp'}];

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private oispAlertService: OispAlertService,
    private routingLocation: Location
  ) {
  }

  ngOnInit() {
    this.assetSeriesDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.initMappings();
    this.periodicallyFetchNotifications();
    this.filteredNotifications = this.searchedNotifications = this.allNotifications;
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    clearInterval(this.intervalId);
  }

  private getStatusName(): string {
    return this.isOpen ? 'Open' : 'Cleared';
  }


  deleteItem(id: ID): void {
    const filteredItem = this.displayedNotifications.find(value => value.id === id);
    this.oispAlertService.closeAlert(filteredItem.id).subscribe(() => {
    });
  }

  deselectAllItems(): void {
    this.selectedNotifications = [];
  }

  searchNotifications(event?) {
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

  public getCurrentState(): NotificationState {
    if (this.isRouteActive('cleared')) {
      return NotificationState.CLEARED;
    } else {
      return NotificationState.OPEN;
    }
  }

  public changeTab(state: NotificationState): void {
    if (state === NotificationState.CLEARED) {
      this.navigateToSubroute('cleared').then(_ => this.initMappings());
    } else {
      this.navigateToSubroute('open').then(_ => this.initMappings());
    }
    this.fetchNotifications();
  }

  navigateToSubroute(subroute): Promise<boolean> {
    let newRoute = ['..', subroute];
    if (this.routingLocation.path().match(`\/notifications$`)) {
      newRoute = [subroute];
    }
    return this.router.navigate(newRoute, { relativeTo: this.getActiveRouteLastChild() });
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  private getActiveRouteLastChild() {
    let route = this.activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }

  private initMappings(): void {
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
    switch (this.getCurrentState()) {
      case NotificationState.CLEARED:
        return 'Cleared';
      default:
        return 'Open';
    }
  }

  private filterNotifications(): void {
    this.filteredNotifications = this.allNotifications;

    this.filterBySearchText();
  }

  private filterBySearchText(): void {
    if (this.searchText) {
      this.filteredNotifications = this.filteredNotifications
        .filter(notification => notification.assetName.toLowerCase().includes(this.searchText.toLowerCase()));
    }
  }

  private periodicallyFetchNotifications(): void {
    this.fetchNotifications();
    this.intervalId = setInterval(() => this.fetchNotifications(), this.FETCHING_INTERVAL_MILLISECONDS);
  }


  private fetchNotifications(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = this.notifications?.subscribe(notifications => {
        if (notifications.length !== this.allNotifications.length) {
          this.allNotifications = notifications;
          this.updateNotifications();
        }
    });
  }

  closeMultibleItmes() {
    this.selectedNotifications.forEach(notification => {
      this.deleteItem(notification.id);
    });
    this.selectedNotifications = [];
  }

  showCloseItem(item: OispNotification) {
    this.activeItem = item;
    this.shouldShowDeleteItem = true;
  }

  closeItem() {
    if (this.activeItem.status === this.alertstatusTypes.NEW || this.activeItem.status === this.alertstatusTypes.OPEN) {
      this.shouldShowDeleteItem = false;
      this.deleteItem(this.activeItem.id);
    }
  }

  isFloatingNumber(text: string) {
    const n = Number(text);
    return Number(n) === n && n % 1 !== 0;
  }
}
