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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { OispDeviceStore } from './oisp-device.store';
import { EMPTY, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { KeycloakService } from 'keycloak-angular';
import { ComponentType, Device } from './oisp-device.model';

@Injectable({
  providedIn: 'root'
})
export class OispDeviceService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispDeviceStore: OispDeviceStore,
              private keycloakService: KeycloakService,
              private http: HttpClient) { }

  getItem(deviceUid: ID): Observable<Device> {
    if (!deviceUid) {
      return EMPTY;
    }

    const deviceRequest = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/devices/${deviceUid}`;
    return this.http.get<Device>(deviceRequest, this.httpOptions).pipe(
      map((device: Device) => {
        this.oispDeviceStore.upsertCached(device);
        return device;
      })
    );
  }

  getItems(): Observable<Device[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/devices`;
    return this.http.get<Device[]>(url, this.httpOptions)
      .pipe(map((devices: Device[]) => {
        this.oispDeviceStore.upsertManyCached(devices);
        return devices;
      }));
  }
/*
  mapExternalNameOFieldInstanceToComponentId(externalNameOfAsset: string, externalNameOfFieldInstance: string): string {
    let externalId: string = externalNameOfFieldInstance;
    this.getItems().toPromise().then(devices => {
      const device = this.findDevice(devices, externalNameOfAsset);
      if (device) {
        externalId = device.components.find(component => component.name === externalNameOfFieldInstance)?.cid;
      }
    });
    return externalId;
  }

  mapExternalNameOfAssetToDeviceUid(externalName: string): string {
    let externalId: string = externalName;
    this.getItems().toPromise().then(devices => {
      const device = this.findDevice(devices, externalName);
      externalId = device?.uid;
    });
    return externalId;
  }

  private findDevice(devices: Device[], deviceId: string) {
    return devices.find(device => device.deviceId === deviceId);
  }*/

  getComponentTypesCatalog(): Observable<ComponentType[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/cmpcatalog`;
    return this.http.get<ComponentType[]>(url, this.httpOptions);
  }

  private getOispAccountId(): string {
    const token = (this.keycloakService.getKeycloakInstance().tokenParsed as any);
    let oispAccountId = '';

    if (token.accounts && token.accounts.length > 0) {
      oispAccountId = token.accounts[0].id;
    } else {
      console.warn('cannot retrieve OISP accountId, subsequent calls to OISP will hence most likely fail!');
    }

    return oispAccountId;
  }
}
