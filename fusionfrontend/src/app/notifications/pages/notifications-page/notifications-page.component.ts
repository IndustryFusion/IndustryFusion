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
import { Notification } from '../../../core/store/ngsi-ld/notification/notification.model';
import { NotificationService } from '../../../core/store/ngsi-ld/notification/notification.service';
import { RouteHelpers } from '../../../core/helpers/route-helpers';
import { IFAlertStatus } from '../../../core/store/ngsi-ld/alerta/alerta.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {

  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.notifications$ = this.notificationService.getAllNotifications().pipe(
      map(notifications => this.filterNotificationsByStatus(notifications)),
    );
  }

  private filterNotificationsByStatus(notifications: Notification[]): Notification[] {
    const status = RouteHelpers.isRouteActive('open', this.activatedRoute) ? IFAlertStatus.OPEN : IFAlertStatus.CLEARED;
    return notifications.filter(notification => notification.status === status);
  }
}
