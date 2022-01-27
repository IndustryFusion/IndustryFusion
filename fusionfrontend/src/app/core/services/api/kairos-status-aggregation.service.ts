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
import * as moment from 'moment';
import { catchError, map } from 'rxjs/operators';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { KairosResponseGroup, OispDeviceStatus, TimeInterval } from '../../models/kairos.model';
import { environment } from '../../../../environments/environment';
import { KairosService } from './kairos.service';
import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { FieldDetails } from '../../store/field-details/field-details.model';
import { StatusHours } from '../../models/kairos-status-aggregation.model';
import { Milliseconds, Minutes, Shift } from '../../store/factory-site/factory-site.model';
import { EnumHelpers } from '../../helpers/enum-helpers';

@Injectable({
  providedIn: 'root'
})
export class KairosStatusAggregationService {

  private static readonly STATUS_UPDATES_PER_SECOND = 1.0 / (environment.assetStatusSampleRateMs / 1000.0);
  private static readonly SECONDS_PER_HOUR = 60 * 60;
  private static readonly MINUTES_PER_DAY = 24 * 60;
  private static readonly MILLISECONDS_PER_MINUTE = 60 * 1000;
  private static readonly MILLISECONDS_PER_SECOND = 1000;

  constructor(private kairosService: KairosService,
              private enumHelpers: EnumHelpers) {
  }

  public static getStatusFieldOfAsset(asset: FactoryAssetDetailsWithFields): FieldDetails {
    return asset.fields.find(field => field.externalName === 'status');
  }

  public static getBoundingIntervalOfShiftsOfDate(date: Date, selectedShifts: Shift[]): TimeInterval {
    const dayStartTimestampMs: Milliseconds = new Date(date.toDateString()).valueOf();

    const startTimestampMs: Milliseconds = KairosStatusAggregationService.getStartTimestampOfShifts(dayStartTimestampMs, selectedShifts);
    const endTimestampMs: Milliseconds = KairosStatusAggregationService.getEndTimestampOfShifts(date, dayStartTimestampMs, selectedShifts);

    return new TimeInterval(startTimestampMs, endTimestampMs);
  }

  public static getCorrectedIntervalsOfShifts(date: Date, boundingInterval: TimeInterval, shifts: Shift[]): TimeInterval[] {
    const intervals: TimeInterval[] = [];
    if (shifts != null && shifts.length > 1) {
      const dayStartTimestampMs: Milliseconds = new Date(date.toDateString()).valueOf();
      const shiftSorted = shifts.sort((shift1, shift2) => shift1.startMinutes - shift2.startMinutes);

      let intervalStartMs = this.convertMinutesToMilliseconds(shiftSorted[0].startMinutes);
      for (let i = 0; i < shiftSorted.length - 1; i++) {
        const correctedIntervalEndMs = this.convertMinutesToMilliseconds(this.getCorrectedEndMinutes(shiftSorted[i]));
        const isGapToNextShift = shiftSorted[i + 1].startMinutes > correctedIntervalEndMs;
        if (isGapToNextShift) {
          intervals.push(new TimeInterval(dayStartTimestampMs + intervalStartMs, dayStartTimestampMs + correctedIntervalEndMs));
          intervalStartMs = this.convertMinutesToMilliseconds(shiftSorted[i + 1].startMinutes);
        }
      }

      const correctedLastIntervalEndMs = this.convertMinutesToMilliseconds(
        this.getCorrectedEndMinutes(shiftSorted[shiftSorted.length - 1])
      );
      intervals.push(new TimeInterval(dayStartTimestampMs + intervalStartMs, dayStartTimestampMs + correctedLastIntervalEndMs));

    } else {
      intervals.push(boundingInterval);
    }

    return intervals;
  }

  public static getCorrectedEndMinutes(shift: Shift) {
    const isShiftExceedingMidnight = shift.endMinutes < shift.startMinutes;
    return shift.endMinutes + (isShiftExceedingMidnight ? this.MINUTES_PER_DAY : 0);
  }

  private static sumOfGroupResults(group: KairosResponseGroup) {
    return group.results.reduce((accumulator, value) => accumulator + value);
  }

  private static isDateToday(date: Date): boolean {
    return date.toDateString() === new Date(Date.now()).toDateString();
  }

  private static getStatusUpdateCountOfInterval(interval: TimeInterval): number {
    const secondsOfInterval = (interval.endMs - interval.startMs) / this.MILLISECONDS_PER_SECOND;
    return secondsOfInterval * this.STATUS_UPDATES_PER_SECOND;
  }

  private static getStartTimestampOfShifts(dayStartTimestampMs: Milliseconds, shifts: Shift[]): Milliseconds {
    if (shifts == null || shifts.length < 1) {
      return dayStartTimestampMs;
    }

    const earliestShift = shifts.sort((shift1, shift2) => shift1.startMinutes - shift2.startMinutes)[0];
    return dayStartTimestampMs + this.convertMinutesToMilliseconds(earliestShift.startMinutes);
  }

  private static getEndTimestampOfShifts(date: Date, dayStartTimestampMs: Milliseconds, shifts: Shift[]): Milliseconds {
    if (shifts == null || shifts.length < 1) {
      const dayEndTimestampMs: Milliseconds = moment(dayStartTimestampMs)
        .add(1, 'days')
        .subtract(1, 'second')
        .valueOf();
      const dayUntilNowTimestampMs: Milliseconds = Date.now().valueOf();

      return KairosStatusAggregationService.isDateToday(date) ? dayUntilNowTimestampMs : dayEndTimestampMs;
    }

    const lastShift = shifts.sort((shift1, shift2) => this.getCorrectedEndMinutes(shift2) - this.getCorrectedEndMinutes(shift1))[0];
    return dayStartTimestampMs + this.convertMinutesToMilliseconds(this.getCorrectedEndMinutes(lastShift));
  }

  private static convertMinutesToMilliseconds(minutes: Minutes): Milliseconds {
    return minutes * this.MILLISECONDS_PER_MINUTE;
  }

  public selectHoursPerStatusOfAsset(assetWithFields: FactoryAssetDetailsWithFields,
                                     date: Date,
                                     selectedShifts: Shift[]): Observable<StatusHours[]> {

    const boundingInterval = KairosStatusAggregationService.getBoundingIntervalOfShiftsOfDate(date, selectedShifts);
    const intervals: TimeInterval[] = KairosStatusAggregationService.getCorrectedIntervalsOfShifts(date, boundingInterval, selectedShifts);

    const intervalResults$: Observable<StatusHours[]>[] = [];
    for (const interval of intervals) {
      intervalResults$.push(this.kairosService.getStatusCounts(assetWithFields,
        KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields), interval.startMs, interval.endMs,
        KairosStatusAggregationService.getStatusUpdateCountOfInterval(interval))
        .pipe(
          catchError(() => EMPTY),
          map(groups => this.convertResponseToStatusHours(groups, interval))
        ));
    }

    return this.joinIntervalResults(intervalResults$);
  }

  private joinIntervalResults(intervalResults$: Observable<StatusHours[]>[]): Observable<StatusHours[]> {
    return forkJoin(intervalResults$)
      .pipe(map((statusHoursOfIntervals: StatusHours[][]) => {
        const resultStatusHours: StatusHours[] = [];
        for (let i = 0; i < this.enumHelpers.getLength(OispDeviceStatus); i++) {
          resultStatusHours.push(new StatusHours(i as OispDeviceStatus, 0));
        }

        statusHoursOfIntervals.forEach(statusHoursOfInterval => {
          for (const statusHour of statusHoursOfInterval) {
            resultStatusHours[statusHour.status].hours += statusHour.hours;
          }
        });

        return resultStatusHours;
      }));
  }


  private calculateOfflineStatusCount(groups: KairosResponseGroup[], interval: TimeInterval): number {
    // Idea: All devices send 3-4 status types at an almost regular interval.
    // Offline (0) is often sent only at shutdown, followed by a gap of data.
    // Therefore, we can derive the offline count by subtracting the expected messages of the selected day (or so far, if today)
    // from the sum of Idle, Running and Error statuses including some existing offline points.
    let pointsOfStatusesWithoutOffline = 0;
    let pointsOfOfflineStatus = 0;
    groups.forEach(group => {
      if (group.index !== OispDeviceStatus.OFFLINE) {
        pointsOfStatusesWithoutOffline += KairosStatusAggregationService.sumOfGroupResults(group);
      } else {
        pointsOfOfflineStatus += KairosStatusAggregationService.sumOfGroupResults(group);
      }
    });

    const dataCountWithoutGaps = pointsOfStatusesWithoutOffline + pointsOfOfflineStatus;
    const estimatedOfflineCountByGaps = KairosStatusAggregationService.getStatusUpdateCountOfInterval(interval) - dataCountWithoutGaps;
    const offlineCount = pointsOfOfflineStatus + estimatedOfflineCountByGaps;
    return Math.round(offlineCount);
  }

  private convertResponseToStatusHours(statusGroups: KairosResponseGroup[], interval: TimeInterval): StatusHours[] {
    const statusGroupsIncludingOffline = this.upsertOfflineGroup(statusGroups, interval);

    const statusHours: StatusHours[] = [];
    statusGroupsIncludingOffline.forEach((group: KairosResponseGroup) => {
      const hour = (KairosStatusAggregationService.sumOfGroupResults(group) / KairosStatusAggregationService.STATUS_UPDATES_PER_SECOND) /
                    KairosStatusAggregationService.SECONDS_PER_HOUR;

      if (hour < 0) {
        console.error('[status aggregation]: Hour must not be negative.');
      }

      statusHours.push({ hours: hour, status: group.index as OispDeviceStatus });
    });

    return statusHours;
  }

  private upsertOfflineGroup(statusGroups: KairosResponseGroup[], interval: TimeInterval): KairosResponseGroup[]  {
    const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroups, interval);
    const statusGroupsIncludingOffline: KairosResponseGroup[] = [...statusGroups];

    const existingOfflineGroup = statusGroupsIncludingOffline.find(x => x.index === OispDeviceStatus.OFFLINE);
    if (existingOfflineGroup) {
      existingOfflineGroup.results = [estimatedOfflineCount];
    } else {
      const newOfflineGroup: KairosResponseGroup = ({ index: OispDeviceStatus.OFFLINE, results: [estimatedOfflineCount] });
      statusGroupsIncludingOffline.push(newOfflineGroup);
    }

    return statusGroupsIncludingOffline;
  }
}
