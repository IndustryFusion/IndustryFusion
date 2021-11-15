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

import { FieldDetails } from '../store/field-details/field-details.model';
import { ChartPoint } from 'chart.js';

export class AssetChartHelper {
  public static getYMinMaxByAbsoluteThreshold(fieldDetails: FieldDetails): { min?: number, max?: number } {
    if (fieldDetails.absoluteThreshold) {
      return {
        min: fieldDetails.absoluteThreshold.valueLower,
        max: fieldDetails.absoluteThreshold.valueUpper
      };
    } else {
      return {};
    }
  }

  public static getMinDate(data: ChartPoint[]): number {
    if (data.length == 0) return Date.now().valueOf();
    const dates = data.map(datum => datum.t as number);
    return Math.min(...dates);
  }
}
