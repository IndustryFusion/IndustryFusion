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
import { Observable } from 'rxjs';
import { OispNotification } from '../../../../../store/oisp/oisp-notification/oisp-notification.model';
import { map } from 'rxjs/operators';
import { OispNotificationService } from '../../../../../store/oisp/oisp-notification/oisp-notification.service';
import { OispAlertStatus } from '../../../../../store/oisp/oisp-alert/oisp-alert.model';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { NotificationState } from '../../../../../components/content/notifications-list/notifications-list.component';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-asset-notifications',
  templateUrl: './asset-notifications.component.html',
  styleUrls: ['./asset-notifications.component.scss']
})
export class AssetNotificationsComponent implements OnInit {

  asset$: Observable<FactoryAssetDetailsWithFields>;
  allStates = NotificationState;

  openNotifications$: Observable<OispNotification[]>;
  clearedNotifications$: Observable<OispNotification[]>;

  constructor(private factoryResolver: FactoryResolver,
              private oispNotificationService: OispNotificationService,
              private activatedRoute: ActivatedRoute) {
    this.factoryResolver.resolve(this.activatedRoute);
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;
  }

  ngOnInit(): void {
    this.asset$.subscribe(asset => {
      console.warn('got asset', asset);
      this.openNotifications$ = this.oispNotificationService.getAllNotificationsUsingAlertStore(asset.externalName).pipe(
        map(notifications => this.filterNotificationsByStatus(notifications, NotificationState.OPEN))
      );
      this.clearedNotifications$ = this.oispNotificationService.getAllNotificationsUsingAlertStore(asset.externalName).pipe(
        map(notifications => this.filterNotificationsByStatus(notifications, NotificationState.CLEARED))
      );
    });
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  getOpenedTab(): NotificationState {
    if (this.isRouteActive('cleared')) {
      return NotificationState.CLEARED;
    } else {
      return NotificationState.OPEN;
    }
  }

  private filterNotificationsByStatus(notifications: OispNotification[], state: NotificationState): OispNotification[] {
    if (state === NotificationState.OPEN) {
      return notifications.filter(rule => rule.status !== OispAlertStatus.CLOSED);
    } else {
      return notifications.filter(rule => rule.status === OispAlertStatus.CLOSED);
    }
  }
}
