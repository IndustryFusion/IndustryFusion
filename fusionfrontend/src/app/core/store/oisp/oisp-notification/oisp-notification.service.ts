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
import { Device } from '../oisp-device/oisp-device.model';
import { OispDeviceQuery } from '../oisp-device/oisp-device.query';
import { AlertaAlertQuery } from '../alerta-alert/alerta-alert.query';
import { AlertaAlert } from '../alerta-alert/alerta-alert.model';

@Injectable({
  providedIn: 'root'
})
export class OispNotificationService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispNotificationStore: OispNotificationStore,
              private alertaAlertQuery: AlertaAlertQuery,
              private oispDeviceQuery: OispDeviceQuery) {
  }

  private static mapAlertToNotification(alert: AlertaAlert, assetNameFromOispDevice: string): OispNotification {
    const notification = new OispNotification();

    if (alert) {
      notification.id = alert.id;
      notification.severity = AlertaAlert.mapSeverityToIFAlertSeverity(alert.severity);
      notification.eventName = alert.attributes?.eventFriendlyName ?? alert.event;
      notification.condition = this.getAlertTextWithoutStatusPrefix(alert);
      notification.measuredValue = alert.value;
      notification.assetName = assetNameFromOispDevice ?? (alert.attributes?.resourceFriendlyName ?? alert.resource);
      notification.timestamp = alert.createTime;
      notification.status = AlertaAlert.mapStatusToIfAlertStatus(alert.status);
    } else {
      console.error('[oisp alert service] no alert was given to be mapped');
    }

    return notification;
  }

  private static getAlertTextWithoutStatusPrefix(alert: AlertaAlert): string {
    return alert.text.replace(alert.severity.toUpperCase() + ': ', '');
  }

  getNotificationsUsingAlertStore(limitToDeviceId: string = null): Observable<OispNotification[]> {
    return this.oispDeviceQuery.selectAll().pipe(
      map(devices => this.filterDevicesByDeviceId(devices, limitToDeviceId)),
      mergeMap((devices: Device[]) => {
        return this.alertaAlertQuery.selectAll().pipe(
          map(alerts => this.filterAlertsByDevices(alerts, limitToDeviceId ? devices : null)),
          map((alerts: AlertaAlert[]) => {
            return alerts.map<OispNotification>((alert: AlertaAlert) => this.getNotificationOfAlertWithDevices(alert, devices));
          }),
          tap(notifications => {
            this.oispNotificationStore.upsertMany(notifications);
          })
        );
      })
    );
  }

  private filterDevicesByDeviceId(devices: Device[], deviceId: string = null) {
    return devices.filter(device => {
      if (deviceId) {
        return device.deviceId === deviceId;
      }
      return true;
    });
  }

  private filterAlertsByDevices(alerts: AlertaAlert[], devices: Device[]) {
    return alerts.filter(alert => {
      if (devices) {
        return devices.find(device => device.deviceId === alert.resource) != null;
      }
      return true;
    });
  }

  private getNotificationOfAlertWithDevices(alert: AlertaAlert, devices: Device[]): OispNotification {
    let assetName = null;
    if (devices && alert) {
      const deviceOfAlert = devices.find(device => String(device.deviceId) === String(alert.resource));
      assetName = deviceOfAlert?.name;
    }
    return OispNotificationService.mapAlertToNotification(alert, assetName);
  }
}
