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
import { Field } from 'src/app/store/field/field.model';
import { Status } from '../factory/models/status.model';
import { Asset } from 'src/app/store/asset/asset.model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  determineStatus(fields: Field[], asset: Asset): Status {
    if (fields.length <= 0) {
      return ({ gotData: false, type: 'nofields', statusValue: 'none'})
    }
    let gotAnyValues = false;
    fields.forEach( field => {
      if (field.value) {
        gotAnyValues = true;
      }
    });

    if (!gotAnyValues) {
      return ({ gotData: false, type: 'none', statusValue: 'none'});
    } else {
      const category = this.getCategory(asset);
      const value = this.getStatusValue(category, fields);
      return ({ gotData: true, type: category, statusValue: value});
    }
  }

  getCategory(asset: Asset): string {
    switch (asset.name) {
          case('ZPF 6H'):
            return 'ZPF';
          case('Gasversorgung aus 2x2 Sauerstoffflaschen'):
            return 'Gasversorgung';
          case('Airtracker Raumluftüberwachung'):
            return 'Airtracker';
          case('Novus Airline ALG26P'):
            return 'Novus';
          case('Novus Airtower 360M'):
            return 'Novus';
          default:
            return 'microstep';
    }
  }

  getStatusValue(category: string, fields: Field[]): string {
    const assetStatusField = fields.filter(field => field.description === 'Asset status')[0];
    const assetWarningField = fields.filter(field => field.description === 'Warning')[0];
    const assetErrorField = fields.filter(field => field.description === 'Alarm')[0];
    const assetIdleField = fields.filter(field => field.description === 'Idle')[0];
    if (assetStatusField) {
      if (!assetStatusField.value) {
        return null;
      } else {
        switch (category) {
          case 'Airtracker':
            return '';
          case 'Gasversorgung':
            return assetStatusField.value;
          case 'microstep':
            return assetStatusField.value;
          case 'ZPF':
            if (assetStatusField.value === 'true') {
              return 'mldBetriebOn';
            } else {
              return 'mldBetriebOff';
            }
          case 'Novus':
            if (assetStatusField.value === 'true') {
              return 'mldBetriebOn';
            } else if (assetWarningField.value === 'true') {
              return 'mldWarningOn';
            } else if (assetErrorField.value === 'true') {
              return 'mldErrorOn';
            } else if (assetIdleField.value === 'true') {
              return 'mldIdleOn';
            } else {
              return 'mldBetriebOff';
            }
          break;
          default:
            return null;
        }
      }
    } else {
      return '';
    }
  }
}
