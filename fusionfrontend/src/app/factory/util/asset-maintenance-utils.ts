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

import { FactoryAssetDetailsWithFields } from '../../core/store/factory-asset-details/factory-asset-details.model';

export enum MaintenanceState { CRITICAL, MEDIUMTERM, LONGTERM }

export class MaintenanceType {
  fieldName: string;
  lowerThreshold: number;
  upperThreshold: number;
  overshootingLimit: number;

  constructor(fieldName: string, lowerThreshold: number, upperThreshold: number, overshootingLimit: number) {
    this.fieldName = fieldName;
    this.lowerThreshold = lowerThreshold;
    this.upperThreshold = upperThreshold;
    this.overshootingLimit = overshootingLimit;
  }
}

export class AssetMaintenanceUtils {

  static readonly maintenanceHours = new MaintenanceType('Operating Hours till maintenance', 150, 750, 1500);
  static readonly maintenanceDays = new MaintenanceType('Days till maintenance', 90, 180, 365);

  public static getMaintenanceValue(asset: FactoryAssetDetailsWithFields, type: MaintenanceType): number {
    return +asset.fields.find(field => field.name === type.fieldName)?.value;
  }

  public static getMaintenancePercentage(asset: FactoryAssetDetailsWithFields, type: MaintenanceType): number {
    return this.getMaintenanceValue(asset, type) / type.overshootingLimit * 100;
  }

  public static getMaintenanceState(value: number, type: MaintenanceType): MaintenanceState {
    if (value < type.lowerThreshold) {
      return MaintenanceState.CRITICAL;
    } else if (value < type.upperThreshold) {
      return MaintenanceState.MEDIUMTERM;
    }
    return MaintenanceState.LONGTERM;
  }
}
