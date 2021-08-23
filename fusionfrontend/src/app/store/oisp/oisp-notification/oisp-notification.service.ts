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
import { OispNotification } from './oisp-notification.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { OispNotificationStore } from './oisp-notification.store';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Device } from '../../../services/oisp.model';
import { OispService } from '../../../services/oisp.service';
import { OispAlert } from '../oisp-alert/oisp-alert.model';
import { OispAlertQuery } from '../oisp-alert/oisp-alert.query';

@Injectable({
  providedIn: 'root'
})
export class OispNotificationService {

  constructor(private oispNotificationStore: OispNotificationStore,
              private oispAlertQuery: OispAlertQuery,
              private oispService: OispService) { }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  private static getNotificationOfAlert(alert: OispAlert, assetName: string): OispNotification {
    const notification = new OispNotification();

    if (alert) {
      const hasMeasuredValue = alert.conditions.length > 0 && alert.conditions[0].components.length > 0
        && alert.conditions[0].components[0].valuePoints.length > 0;

      notification.id = alert.alertId;
      notification.priority = alert.priority;
      notification.ruleName = alert.ruleName;
      notification.condition = alert.naturalLangAlert;
      notification.measuredValue = hasMeasuredValue ? alert.conditions[0].components[0].valuePoints[0].value : '';
      notification.assetName = assetName;
      notification.timestamp = alert.triggered;
      notification.status = alert.status;
    } else {
      console.error('[oisp alert service] no alert was given to be mapped');
    }

    return notification;
  }

  private getNotificationOfAlertWithDevices(alert: OispAlert, devices: Device[]): OispNotification {
    let assetName = null;
    if (devices && alert) {
      const deviceOfAlert = devices.find(device => String(device.uid) === String(alert.deviceUID));
      assetName = deviceOfAlert?.name;
    }

    return OispNotificationService.getNotificationOfAlert(alert, assetName);
  }

  getNotificationsUsingAlertStore(): Observable<OispNotification[]> {
    return this.oispService.getAllDevices()
      .pipe(mergeMap((devices: Device[]) => {
          return this.oispAlertQuery.selectAll().pipe(
            map((alerts: OispAlert[]) => {
              return alerts.map<OispNotification>((alert: OispAlert) => this.getNotificationOfAlertWithDevices(alert, devices));
            }),
            tap(notifications => {
              this.oispNotificationStore.upsertMany(notifications);
            })
          );
        })
      );
  }
}
