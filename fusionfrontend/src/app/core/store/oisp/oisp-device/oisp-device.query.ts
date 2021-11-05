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
import { QueryEntity } from '@datorama/akita';
import { OispDeviceState, OispDeviceStore } from './oisp-device.store';
import { Device, DeviceComponent } from './oisp-device.model';

@Injectable({ providedIn: 'root' })
export class OispDeviceQuery extends QueryEntity<OispDeviceState> {

  constructor(protected store: OispDeviceStore) {
    super(store);
  }

  getComponentOfFieldInstance(externalNameOfAsset: string, externalNameOfFieldInstance: string): DeviceComponent {
    if (this.getAll().length < 1) {
      console.error('[oisp device query]: No devices loaded. Forgot to add resolver?');
    }
    return this.getEntity(externalNameOfAsset)?.components.find(c => c.name === externalNameOfFieldInstance);
  }

  mapExternalNameOFieldInstanceToComponentId(externalNameOfAsset: string, externalNameOfFieldInstance: string): string {
    const component: DeviceComponent = this.getComponentOfFieldInstance(externalNameOfAsset, externalNameOfFieldInstance);
    let externalId = externalNameOfFieldInstance;
    if (component) {
      externalId = component.cid;
    }
    return externalId;
  }

  getDeviceOfAsset(externalName: string): Device {
    if (this.getAll().length < 1) {
      console.error('[oisp device query]: No devices loaded. Forgot to add resolver?');
    }
    return this.getEntity(externalName);
  }

  mapExternalNameOfAssetToDeviceUid(externalName: string): string {
    const device: Device = this.getDeviceOfAsset(externalName);
    return device ? device.uid : externalName;
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }

}
