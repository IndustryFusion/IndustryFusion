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
import { ChartPoint, TimeUnit } from 'chart.js';

export class AssetChartHelper {
  public static getYMinMaxByAbsoluteThreshold(fieldDetails: FieldDetails): { min?: number, max?: number } {
    if (fieldDetails.absoluteThreshold) {
      return {
        min: fieldDetails.absoluteThreshold.valueLower,
        max: fieldDetails.absoluteThreshold.valueUpper
      };
    } else {
      return { };
    }
  }

  public static getMinDateForLineChart(chartPoints: ChartPoint[], axisUnit: TimeUnit): number {
    let stepSize = 0;
    if (axisUnit === 'day') {
      stepSize = 12;
    } else if (axisUnit === 'hour') {
      stepSize = 3;
    }
    if (chartPoints.length === 0) {
      return Date.now().valueOf();
    }
    const dates = chartPoints.map(point => point.t as number);
    const minDate = new Date(Math.min(...dates));
    return minDate.setHours(minDate.getHours() - stepSize);
  }

  public static getMaxDateForLineChart(chartPoints: ChartPoint[]): number {
    if (chartPoints.length === 0) {
      return Date.now().valueOf();
    }
    const dates = chartPoints.map(point => point.t as number);
    return Math.max(...dates);
  }
}
