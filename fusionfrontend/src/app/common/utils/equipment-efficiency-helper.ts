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

import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { StatusHours } from '../../services/kairos-status-aggregation.model';
import { OispDeviceStatus } from '../../services/kairos.model';
import { EnumHelpers } from './enum-helpers';

export class EquipmentEfficiencyHelper {

  public static getAverageOfAggregatedStatusHours(aggregatedStatusHours: StatusHours[],
                                                  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[]): StatusHours[] {
    if (aggregatedStatusHours == null || factoryAssetDetailsWithFields == null) {
      return null;
    }

    const assetCountWithStatusData = this.getAssetCountWithStatusData(factoryAssetDetailsWithFields);
    for (const aggregatedStatusHour of aggregatedStatusHours) {
      aggregatedStatusHour.hours /= assetCountWithStatusData;
    }
    return aggregatedStatusHours;
  }

  private static getAssetCountWithStatusData(factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[]): number {
    let assetCountWithStatusData = 0;
    factoryAssetDetailsWithFields.forEach(asset => {
      assetCountWithStatusData += asset.statusHoursOneDay == null ? 0 : 1;
    });
    return assetCountWithStatusData;
  }

  public static getAggregatedStatusHours(factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[],
                                         enumHelpers: EnumHelpers): StatusHours[] {
    if (factoryAssetDetailsWithFields) {
      const aggregatedStatusHours: StatusHours[] = this.getEmptyAggregatedStatusHours(enumHelpers);
      for (const assetWithField of factoryAssetDetailsWithFields) {
        if (assetWithField.statusHoursOneDay) {
          assetWithField.statusHoursOneDay.statusHours.forEach(statusHours => {
            aggregatedStatusHours[statusHours.status].hours += statusHours.hours;
          });
        }
      }
      return aggregatedStatusHours;
    }
    return null;
  }

  private static getEmptyAggregatedStatusHours(enumHelpers: EnumHelpers): StatusHours[] {
    const aggregatedStatusHours: StatusHours[] = [];
    for (let i = 0; i < enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      aggregatedStatusHours.push({ status: i as OispDeviceStatus, hours: 0 });
    }
    return aggregatedStatusHours;
  }

}
