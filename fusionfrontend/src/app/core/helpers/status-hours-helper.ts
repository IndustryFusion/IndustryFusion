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

import { StatusHours, StatusHoursOneDay } from '../models/kairos-status-aggregation.model';
import { OispDeviceStatus } from '../models/kairos.model';
import { EnumHelpers } from './enum-helpers';

export class StatusHoursHelper {

  constructor(private enumHelpers: EnumHelpers) {
  }

  private static getAssetCountWithStatusData(statusHoursOfDays: StatusHoursOneDay[]): number {
    let assetCountWithStatusData = 0;
    for (const statusHoursOneDay of statusHoursOfDays) {
      assetCountWithStatusData += statusHoursOneDay == null ? 0 : 1;
    }
    return assetCountWithStatusData;
  }

  public getAverageOfAggregatedStatusHours(statusHoursOfDays: StatusHoursOneDay[]): StatusHours[] {
    if (statusHoursOfDays == null) {
      return null;
    }

    const aggregatedStatusHours = this.getAggregatedStatusHours(statusHoursOfDays);
    const assetCountWithStatusData = StatusHoursHelper.getAssetCountWithStatusData(statusHoursOfDays);

    for (const aggregatedStatusHour of aggregatedStatusHours) {
      aggregatedStatusHour.hours /= assetCountWithStatusData;
    }

    return aggregatedStatusHours;
  }

  public getAggregatedStatusHours(statusHoursOfDays: StatusHoursOneDay[]): StatusHours[] {
    if (!statusHoursOfDays) {
      return null;
    }

    const aggregatedStatusHours: StatusHours[] = this.createEmptyAggregatedStatusHours();
    for (const statusHoursOneDay of statusHoursOfDays) {
      if (statusHoursOneDay) {
        statusHoursOneDay.statusHours.forEach(statusHours => {
          aggregatedStatusHours[statusHours.status].hours += statusHours.hours;
        });
      }
    }

    return aggregatedStatusHours;
  }

  private createEmptyAggregatedStatusHours(): StatusHours[] {
    const aggregatedStatusHours: StatusHours[] = [];
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      aggregatedStatusHours.push({ status: i as OispDeviceStatus, hours: 0 });
    }
    return aggregatedStatusHours;
  }

}
