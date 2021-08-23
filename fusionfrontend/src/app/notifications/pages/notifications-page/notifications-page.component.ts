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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { OispNotification } from '../../../store/oisp/oisp-notification/oisp-notification.model';
import { OispAlertStatus } from '../../../store/oisp/oisp-alert/oisp-alert.model';
import { OispNotificationService } from '../../../store/oisp/oisp-notification/oisp-notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {

  notifications$: Observable<OispNotification[]>;

  constructor(private oispNotificationService: OispNotificationService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.notifications$ = this.oispNotificationService.getNotificationsUsingAlertStore().pipe(
      map(notifications => this.filterNotificationsByStatus(notifications))
    );
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
}
