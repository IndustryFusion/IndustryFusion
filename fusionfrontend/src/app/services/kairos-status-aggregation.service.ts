import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { catchError, map } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { KairosResponseGroup, OispDeviceStatus } from './kairos.model';
import { environment } from '../../environments/environment';
import { KairosService } from './kairos.service';
import { FactoryAssetDetailsWithFields } from '../store/factory-asset-details/factory-asset-details.model';
import { FieldDetails } from '../store/field-details/field-details.model';
import { StatusHours } from './kairos-status-aggregation.model';

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
    return asset.fields.find(field => field.name === 'Asset status');
  }

  public selectHoursPerStatusOfAsset(assetWithFields: FactoryAssetDetailsWithFields, date: Date): Observable<StatusHours[]> {
    const startDateAtMidnight = new Date(date.toDateString()).valueOf();
    const endDate = moment(date).add(1, 'days').valueOf();

    return this.kairosService.getStatusCounts(assetWithFields,
        KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields), startDateAtMidnight, endDate,
        KairosStatusAggregationService.getStatusUpdatesPerDay(date))
      .pipe(
        catchError(() => EMPTY),
        map(groups => this.convertResponseToStatusHours(groups, date))
      );
  }

  private calculateOfflineStatusCount(groups: KairosResponseGroup[], date: Date): number {
    // Idea: All devices send 3-4 status types at an almost regular interval.
    // Offline (0) is often sent only at shutdown, followed by a gap of data.
    // Therefore, we can derive the offline count by subtracting the expected messages of the selected day (or so far, if today)
    // from the sum of Idle, Online and Error statuses including some existing offline points.
    let pointsOfAllStatiExceptOffline = 0;
    let pointsOfOfflineStatus = 0;
    groups.forEach(group => {
      if (group.index !== OispDeviceStatus.OFFLINE) {
        pointsOfAllStatiExceptOffline += this.sumOfGroupResults(group);
      } else {
        pointsOfOfflineStatus += this.sumOfGroupResults(group);
      }
    });

    const estimatedOfflineCountByGaps = KairosStatusAggregationService.getStatusUpdatesPerDay(date) - pointsOfAllStatiExceptOffline;
    const offlineCount = pointsOfOfflineStatus + estimatedOfflineCountByGaps;
    return Math.round(offlineCount);
  }

  private convertResponseToStatusHours(statusGroups: KairosResponseGroup[], date: Date): StatusHours[] {
    const statusGroupsIncludingOffline = this.upsertOfflineGroup(statusGroups, date);

    const statusHours: StatusHours[] = [];
    statusGroupsIncludingOffline.forEach((group: KairosResponseGroup) => {
      const hour = (this.sumOfGroupResults(group) / KairosStatusAggregationService.statusUpdatesPerSecond) /
                    KairosStatusAggregationService.secondsPerHour;
      statusHours.push({ hours: hour, status: group.index as OispDeviceStatus });
    });

    return statusHours;
  }

  private upsertOfflineGroup(statusGroups: KairosResponseGroup[], date: Date): KairosResponseGroup[]  {
    const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroups, date);
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

  private sumOfGroupResults(group: KairosResponseGroup) {
    let count = 0;
    group.results.forEach(result => count += result);
    return count;
  }

}
