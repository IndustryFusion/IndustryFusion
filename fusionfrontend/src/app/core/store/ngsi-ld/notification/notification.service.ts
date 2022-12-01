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

import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { NotificationStore } from './notification.store';
import { Observable } from 'rxjs';
import { map, mergeMap, skipWhile, tap } from 'rxjs/operators';
import { AlertaAlertQuery } from '../alerta-alert/alerta-alert.query';
import { AlertaAlert } from '../alerta-alert/alerta-alert.model';
import { FactoryAssetDetailsWithFields } from '../../factory-asset-details/factory-asset-details.model';
import { AssetQuery } from '../../asset/asset.query';
import { NgsiLdService } from '../../../services/api/ngsi-ld.service';
import { Asset } from '../../asset/asset.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private notificationStore: NotificationStore,
              private assetQuery: AssetQuery,
              private ngsiLdService: NgsiLdService,
              private alertaAlertQuery: AlertaAlertQuery) {
  }

  private static mapAlertToNotification(alert: AlertaAlert, assetName: string): Notification {
    const notification = new Notification();

    if (alert) {
      notification.id = alert.id;
      notification.severity = AlertaAlert.mapSeverityToIFAlertSeverity(alert.severity);
      notification.eventName = alert.attributes?.eventFriendlyName ?? alert.event;
      notification.condition = this.getAlertTextWithoutStatusPrefix(alert);
      notification.measuredValue = alert.value;
      notification.assetName = assetName ?? (alert.attributes?.resourceFriendlyName ?? alert.resource);
      notification.timestamp = alert.createTime;
      notification.status = AlertaAlert.mapStatusToIfAlertStatus(alert.status);
    } else {
      console.error('[notification service] no alert was given to be mapped');
    }

    return notification;
  }

  private static getAlertTextWithoutStatusPrefix(alert: AlertaAlert): string {
    return alert.text.replace(alert.severity.toUpperCase() + ': ', '');
  }

  getNotificationsOfAsset(asset: FactoryAssetDetailsWithFields): Observable<Notification[]> {
    return this.alertaAlertQuery.selectAll().pipe(
      map((alerts: AlertaAlert[]) => {
        return alerts
          .filter(alert => this.ngsiLdService.getAssetUri(asset) === alert.resource)
          .map<Notification>((alert: AlertaAlert) => NotificationService.mapAlertToNotification(alert, asset.name));
      }),
      tap(notifications => this.notificationStore.upsertMany(notifications))
    );
  }

  getAllNotifications(): Observable<Notification[]> {
    return this.assetQuery.selectAll().pipe(
      skipWhile(assets => assets == null || assets.length === 0),
      mergeMap((assets: Asset[]) => {
        return this.alertaAlertQuery.selectAll().pipe(
          map((alerts: AlertaAlert[]) => {
            return alerts.map<Notification>((alert: AlertaAlert) => this.mapAlertToNotification(alert, assets));
          }),
          tap(notifications => this.notificationStore.upsertMany(notifications))
        );
      })
    );
  }

  private mapAlertToNotification(alert: AlertaAlert, assets: Asset[]): Notification {
    let assetName = null;
    if (!!assets && assets.length > 0 && alert) {
      const assetOfAlert = assets.find(asset => this.ngsiLdService.getAssetUri(asset) === String(alert.resource));
      assetName = assetOfAlert?.name;
    }
    return NotificationService.mapAlertToNotification(alert, assetName);
  }
}
