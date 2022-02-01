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
import { Milliseconds } from '../store/factory-site/factory-site.model';

export class AssetChartHelper {
  private static AXIS_STEP_SIZE_SECONDS = 15;
  private static AXIS_STEP_SIZE_MINUTES = 5;
  private static AXIS_STEP_SIZE_MINUTES_FEW = 1;
  private static AXIS_STEP_SIZE_HOURS = 6;
  private static AXIS_STEP_SIZE_DAYS = 1;

  public static calculateXAxisOptions(chartPoints: ChartPoint[]):
    { startTimestampMs: Milliseconds, xAxisUnit: TimeUnit, xAxisStepSize: number } {
    const startTimestampMs = AssetChartHelper.getMinTimestampOfPoints(chartPoints);
    const endTimestampMs = AssetChartHelper.getMaxTimestampOfPoints(chartPoints);

    const minuteInMilliseconds = 60 * 1000;
    const hourInMilliseconds = 60 * 60 * 1000;
    const dayInMilliseconds = 24 * 60 * 60 * 1000;

    let xAxisStepSize =  this.AXIS_STEP_SIZE_HOURS;
    let xAxisUnit: TimeUnit = 'hour';
    if (endTimestampMs - startTimestampMs < 5 * minuteInMilliseconds) {
      xAxisUnit = 'second';
      xAxisStepSize = this.AXIS_STEP_SIZE_SECONDS;
    }
    else if (endTimestampMs - startTimestampMs < 0.5 * hourInMilliseconds) {
      xAxisUnit = 'minute';
      xAxisStepSize = this.AXIS_STEP_SIZE_MINUTES_FEW;
    }
    else if (endTimestampMs - startTimestampMs < 2 * hourInMilliseconds) {
      xAxisUnit = 'minute';
      xAxisStepSize = this.AXIS_STEP_SIZE_MINUTES;
    }
    else if (endTimestampMs - startTimestampMs > 5 * dayInMilliseconds) {
      xAxisUnit = 'day';
      xAxisStepSize = this.AXIS_STEP_SIZE_DAYS;
    }

    return { startTimestampMs, xAxisUnit, xAxisStepSize };
  }

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

  public static getMinTimestampOfPoints(chartPoints: ChartPoint[]): Milliseconds {
    if (chartPoints.length === 0) {
      return Date.now().valueOf();
    }
    return Math.min(...this.mapPointsToTimestamps(chartPoints));
  }

  public static getMaxTimestampOfPoints(chartPoints: ChartPoint[]): Milliseconds {
    if (chartPoints.length === 0) {
      return Date.now().valueOf();
    }
    return Math.max(...this.mapPointsToTimestamps(chartPoints));
  }

  private static mapPointsToTimestamps(chartPoints: ChartPoint[]): Milliseconds[] {
    return chartPoints.map(point => point.t as Milliseconds);
  }
}
