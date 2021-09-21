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
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { AssetSeriesDetailsResolver } from '../../../resolvers/asset-series-details-resolver.service';
import { Observable, Subscription } from 'rxjs';
import { OispNotification } from '../../../store/oisp/oisp-notification/oisp-notification.model';
import { OispAlertService } from '../../../store/oisp/oisp-alert/oisp-alert.service';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';

export enum NotificationState { OPEN, CLEARED }

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit, OnDestroy {

  @Input() notifications: Observable<OispNotification[]>;
  @Input() isInline = false;

  titleMapping: { [k: string]: string };
  editBarMapping: { [k: string]: string };

  sortField: string;
  selected: Set<ID> = new Set();
  intervalId: number;
  faSearch = faSearch;
  searchText = '';
  allNotifications: OispNotification[];
  filteredNotifications: OispNotification[];
  notificationStates = NotificationState;
  notificationSubscription: Subscription;

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

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
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    clearInterval(this.intervalId);
  }

  onSort(field: string): void {
    this.sortField = field;
  }

  onItemSelect(id: ID): void {
    this.selected.add(id);
  }

  onItemDeselect(id: ID): void {
    this.selected.delete(id);
  }

  deleteItems(): void {
    this.selected.forEach(id => {
      this.deleteItem(id);
    });
  }

  deleteItem(id: ID): void {
    const filteredItem = this.filteredNotifications.find(value => value.id === id);
    this.oispAlertService.closeAlert(filteredItem.id).subscribe(() => {
      this.selected.clear();
    });
  }

  deselectAllItems(): void {
    this.selected.clear();
  }

  isSelected(id: ID): boolean {
    return this.selected.has(id);
  }

  searchAssets(): void {
    this.filterNotifications();
  }

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
      this.allNotifications = notifications;
      this.filterNotifications();
    });
  }
}
