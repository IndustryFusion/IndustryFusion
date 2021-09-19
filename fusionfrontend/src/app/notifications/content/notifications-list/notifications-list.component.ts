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

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { AssetSeriesDetailsResolver } from '../../../resolvers/asset-series-details-resolver.service';
import { Observable } from 'rxjs';
import { OispNotification } from '../../../store/oisp-notification/oisp-notification.model';
import { OispAlertService } from '../../../store/oisp-alert/oisp-alert.service';
import { environment } from '../../../../environments/environment';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FilterOption, FilterType } from 'src/app/components/ui/table-filter/filter-options';

import { OispAlertPriority, OispAlertStatus } from 'src/app/store/oisp-alert/oisp-alert.model';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit, OnDestroy, OnChanges {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertFetchingIntervalSec * 1000;

  @Input()
  items$: Observable<OispNotification[]>;
  @Input()
  isOpen: boolean;

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
  filteredNotifications: OispNotification[];
  searchedNotifications: OispNotification[];
  OispPriority = OispAlertPriority;
  selectedNotifications: OispNotification[] = [];
  alertstatusTypes = OispAlertStatus;
  activeItem: OispNotification;
  shouldShowDeleteItem = false;

  possibleFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset', attributeToBeFiltered: 'assetName' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Priority', attributeToBeFiltered: 'priority' },
    { filterType: FilterType.DATEFILTER, columnName: 'Date & Time', attributeToBeFiltered: 'timestamp'}];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private oispAlertService: OispAlertService
  ) {
  }

  ngOnInit() {
    this.assetSeriesDetailsResolver.resolve(this.route.snapshot);
    this.periodicallyFetchNotifications();
    this.initMappings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedNotifications) {
      console.log(this.selectedNotifications);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
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
    return this.isOpen ? 'Open' : 'Cleared';
  }


  deleteItem(id: ID): void {
    const filteredItem = this.filteredNotifications.find(value => value.id === id);
    this.oispAlertService.closeAlert(filteredItem.id).subscribe(() => {
    });
  }

  deselectAllItems(): void {
    this.selectedNotifications = [];
  }

  searchAssets(event?): void {
    this.searchedNotifications = event;
    this.filterNotifications();
  }

  private filterNotifications(): void {
    this.filteredNotifications = this.allNotifications;
    if (this.searchedNotifications) {
      this.filteredNotifications = this.filteredNotifications.filter(notification =>
        this.searchedNotifications.includes(notification));
    }
  }

  private periodicallyFetchNotifications(): void {
    this.fetchNotifications();
    this.intervalId = setInterval(() => this.fetchNotifications(), this.FETCHING_INTERVAL_MILLISECONDS);
  }

  private fetchNotifications() {
    this.items$.subscribe(notifications => {
      if (notifications.length !== this.allNotifications.length) {
        this.allNotifications = notifications;
        this.filterNotifications();
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
