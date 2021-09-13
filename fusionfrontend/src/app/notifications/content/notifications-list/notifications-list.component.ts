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
import { Observable } from 'rxjs';
import { OispNotification } from '../../../store/oisp/oisp-notification/oisp-notification.model';
import { OispAlertService } from '../../../store/oisp/oisp-alert/oisp-alert.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit, OnDestroy {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  @Input() items$: Observable<OispNotification[]>;
  @Input() isOpen: boolean;

  titleMapping: { [k: string]: string };
  editBarMapping: { [k: string]: string };

  sortField: string;
  selected: Set<ID> = new Set();
  intervalId: number;

  faSearch = faSearch;
  searchText = '';
  allNotifications: OispNotification[];
  filteredNotifications: OispNotification[];

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

  private fetchNotifications() {
    this.items$.subscribe(notifications => {
      this.allNotifications = notifications;
      this.filterNotifications();
    });
  }
}
