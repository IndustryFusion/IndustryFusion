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
import { EMPTY, Observable } from 'rxjs';
import { KairosDataPointGroup, DeviceStatus } from '../../models/kairos.model';
import { environment } from '../../../../environments/environment';
import { KairosService } from './kairos.service';
import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { FieldDetails } from '../../store/field-details/field-details.model';
import { StatusHours } from '../../models/kairos-status-aggregation.model';

@Injectable({
  providedIn: 'root'
})
export class KairosStatusAggregationService {

  private static readonly statusUpdatesPerSecond = 1.0 / (environment.assetStatusSampleRateMs / 1000.0);
  private static readonly secondsPerHour = 60 * 60;
  private static readonly hoursPerDay = 24;

  constructor(private kairosService: KairosService) {
  }

  public static isDateToday(date: Date): boolean {
    return date.toDateString() === new Date(Date.now()).toDateString();
  }

  public static getSecondsOfTodayUntilNow(date: Date): number {
    const midnightTodayMs = new Date(date.toDateString()).valueOf();
    const nowMs = Date.now().valueOf();
    return (nowMs - midnightTodayMs) / 1000;
  }

  public static secondsOfDay(date: Date) {
    let hoursOfDay: number;
    if (this.isDateToday(date)) {
      hoursOfDay = this.getSecondsOfTodayUntilNow(date) ;
    } else {
      hoursOfDay = this.hoursPerDay * (this.secondsPerHour);
    }
    return hoursOfDay;
  }

  public static getStatusUpdatesPerDay(date: Date): number {
    return this.secondsOfDay(date) * this.statusUpdatesPerSecond;
  }

  public static getStatusFieldOfAsset(asset: FactoryAssetDetailsWithFields): FieldDetails {
    return asset.fields.find(field => field.externalName === 'status');
  }

  private static sumOfGroupResults(group: KairosDataPointGroup) {
    return group.values.reduce((accumulator, value) => accumulator + value);
  }

  public selectHoursPerStatusOfAsset(assetWithFields: FactoryAssetDetailsWithFields, date: Date): Observable<StatusHours[]> {
    const startDateAtMidnight = new Date(date.toDateString()).valueOf();
    const endDate = moment(date).add(1, 'days').valueOf();

    return this.kairosService.getStatusCounts(assetWithFields,
        KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields), startDateAtMidnight, endDate,
        KairosStatusAggregationService.getStatusUpdatesPerDay(date))
      .pipe(
        catchError(() => EMPTY),
        map(groups => this.convertPointGroupsToStatusHours(groups, date))
      );
  }

  private calculateOfflineStatusCount(groups: KairosDataPointGroup[], date: Date): number {
    // Idea: All devices send 3-4 status types at an almost regular interval.
    // Offline (0) is often sent only at shutdown, followed by a gap of data.
    // Therefore, we can derive the offline count by subtracting the expected messages of the selected day (or so far, if today)
    // from the sum of Idle, Running and Error statuses including some existing offline points.
    let pointsOfStatusesWithoutOffline = 0;
    let pointsOfOfflineStatus = 0;
    groups.forEach(group => {
      if (group.index !== DeviceStatus.OFFLINE) {
        pointsOfStatusesWithoutOffline += KairosStatusAggregationService.sumOfGroupResults(group);
      } else {
        pointsOfOfflineStatus += KairosStatusAggregationService.sumOfGroupResults(group);
      }
    });

    const dataCountWithoutGaps = pointsOfStatusesWithoutOffline + pointsOfOfflineStatus;
    const estimatedOfflineCountByGaps = KairosStatusAggregationService.getStatusUpdatesPerDay(date) - dataCountWithoutGaps;
    const offlineCount = pointsOfOfflineStatus + estimatedOfflineCountByGaps;
    return Math.round(offlineCount);
  }

  private convertPointGroupsToStatusHours(statusGroups: KairosDataPointGroup[], date: Date): StatusHours[] {
    const statusGroupsIncludingOffline = this.upsertOfflineGroup(statusGroups, date);

    const statusHours: StatusHours[] = [];
    statusGroupsIncludingOffline.forEach((group: KairosDataPointGroup) => {
      const hour = (KairosStatusAggregationService.sumOfGroupResults(group) / KairosStatusAggregationService.statusUpdatesPerSecond) /
                    KairosStatusAggregationService.secondsPerHour;
      statusHours.push({ hours: hour, status: group.index as DeviceStatus });
    });

    return statusHours;
  }

  private upsertOfflineGroup(statusGroups: KairosDataPointGroup[], date: Date): KairosDataPointGroup[]  {
    const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroups, date);
    const statusGroupsIncludingOffline: KairosDataPointGroup[] = [...statusGroups];

    const existingOfflineGroup = statusGroupsIncludingOffline.find(x => x.index === DeviceStatus.OFFLINE);
    if (existingOfflineGroup) {
      existingOfflineGroup.values = [estimatedOfflineCount];
    } else {
      const newOfflineGroup: KairosDataPointGroup = ({ index: DeviceStatus.OFFLINE, values: [estimatedOfflineCount] });
      statusGroupsIncludingOffline.push(newOfflineGroup);
    }

    return statusGroupsIncludingOffline;
  }

}
