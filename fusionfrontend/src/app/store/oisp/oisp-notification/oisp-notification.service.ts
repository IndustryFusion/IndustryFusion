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
import { OispAlert } from '../oisp-alert/oisp-alert.model';
import { OispAlertQuery } from '../oisp-alert/oisp-alert.query';
import { Device } from '../oisp-device/oisp-device.model';
import { OispDeviceQuery } from '../oisp-device/oisp-device.query';

@Injectable({
  providedIn: 'root'
})
export class OispNotificationService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispNotificationStore: OispNotificationStore,
              private oispAlertQuery: OispAlertQuery,
              private oispDeviceQuery: OispDeviceQuery) {
  }

  private static mapAlertToNotification(alert: OispAlert, assetName: string): OispNotification {
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

  getAllNotificationsUsingAlertStore(limitToDeviceId: string = null): Observable<OispNotification[]> {
    return this.oispDeviceQuery.selectAll().pipe(
      map(devices => this.filterDevicesByUid(devices, limitToDeviceId)),
      mergeMap((devices: Device[]) => {
        return this.oispAlertQuery.selectAll().pipe(
          map(alerts => this.filterAlertsByDevices(alerts, limitToDeviceId ? devices : null)),
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

  filterDevicesByUid(devices: Device[], deviceId: string = null) {
    return devices.filter(device => {
      if (deviceId) {
        return device.deviceId === deviceId;
      }
      return true;
    });
  }

  filterAlertsByDevices(alerts: OispAlert[], devices: Device[]) {
    return alerts.filter(alert => {
      if (devices) {
        return devices.find(device => device.uid === alert.deviceUID) != null;
      }
      return true;
    });
  }

  private getNotificationOfAlertWithDevices(alert: OispAlert, devices: Device[]): OispNotification {
    let assetName = null;
    if (devices && alert) {
      const deviceOfAlert = devices.find(device => String(device.uid) === String(alert.deviceUID));
      assetName = deviceOfAlert?.name;
    }
    return OispNotificationService.mapAlertToNotification(alert, assetName);
  }
}
