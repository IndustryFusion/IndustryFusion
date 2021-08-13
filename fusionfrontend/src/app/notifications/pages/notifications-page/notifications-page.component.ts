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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { OispService } from '../../../services/oisp.service';
import { OispAlertStatus, OispNotification } from '../../../services/notification.model';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit, OnDestroy {

  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertFetchingIntervalSec * 1000;

  notifications$: Observable<OispNotification[]>;
  intervalId: number;

  constructor(private oispService: OispService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.periodicallyFetchNotifications();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  private filterNotificationsByStatus(notifications: OispNotification[]): OispNotification[] {
    if (this.isRouteActive('open')) {
      return notifications.filter(rule => rule.status !== OispAlertStatus.CLOSED);
    } else {
      return notifications.filter(rule => rule.status === OispAlertStatus.CLOSED);
    }
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  private periodicallyFetchNotifications(): void {
    this.fetchNotifications(this.oispService);
    this.intervalId = setInterval(() => this.fetchNotifications(this.oispService), this.FETCHING_INTERVAL_MILLISECONDS);
  }

  private fetchNotifications(oispService: OispService): void {
    this.notifications$ = oispService.getNotifications().pipe(
      map(notifications => this.filterNotificationsByStatus(notifications))
    );
  }
}
