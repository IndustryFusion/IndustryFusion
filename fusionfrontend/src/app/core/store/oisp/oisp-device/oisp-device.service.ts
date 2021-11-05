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
import { environment } from '../../../../../environments/environment';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { Device } from './oisp-device.model';
import { UserManagementService } from '../../../services/api/user-management.service';

@Injectable({
  providedIn: 'root'
})
export class OispDeviceService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispDeviceStore: OispDeviceStore,
              private userManagementService: UserManagementService,
              private http: HttpClient) { }

  getItem(deviceUid: ID): Observable<Device> {
    if (!deviceUid) {
      return EMPTY;
    }

    const deviceRequest = `${environment.oispApiUrlPrefix}/accounts/${this.userManagementService.getOispAccountId()}/devices/${deviceUid}`;
    return this.http.get<Device>(deviceRequest, this.httpOptions).pipe(
      map((device: Device) => {
        this.oispDeviceStore.upsertCached(device);
        return device;
      })
    );
  }

  getItems(): Observable<Device[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.userManagementService.getOispAccountId()}/devices`;
    return this.http.get<Device[]>(url, this.httpOptions)
      .pipe(map((devices: Device[]) => {
        this.oispDeviceStore.upsertManyCached(devices);
        return devices;
      }));
  }

}
