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
import { first, map, mergeMap } from 'rxjs/operators';
import { OispNotificationService } from '../../../../../store/oisp/oisp-notification/oisp-notification.service';
import { OispAlertStatus } from '../../../../../store/oisp/oisp-alert/oisp-alert.model';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-asset-notifications',
  templateUrl: './asset-notifications.component.html',
  styleUrls: ['./asset-notifications.component.scss']
})
export class AssetNotificationsComponent implements OnInit {

  asset$: Observable<FactoryAssetDetailsWithFields>;

  allNotifications$: Observable<OispNotification[]>;

  constructor(private factoryResolver: FactoryResolver,
              private oispNotificationService: OispNotificationService,
              private activatedRoute: ActivatedRoute) {
    this.factoryResolver.resolve(this.activatedRoute);
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;
  }

  ngOnInit(): void {
    this.allNotifications$ = this.asset$.pipe(first(),
      mergeMap(asset => this.getFilteredNotifications(asset))
    );
  }

  getFilteredNotifications(asset: FactoryAssetDetailsWithFields): Observable<OispNotification[]> {
    return this.oispNotificationService.getAllNotificationsUsingAlertStore(asset.externalName).pipe(
      map(notifications => this.filterNotificationsByStatus(notifications)),
    );
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  private filterNotificationsByStatus(notifications: OispNotification[]): OispNotification[] {
    if (this.isRouteActive('cleared')) {
      return notifications.filter(rule => rule.status === OispAlertStatus.CLOSED);
    } else {
      return notifications.filter(rule => rule.status !== OispAlertStatus.CLOSED);
    }
  }
}
