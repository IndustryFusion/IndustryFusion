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

  private static readonly statusUpdatesPerSecond = 1.0 / (environment.assetStatusUpdateIntervalMs / 1000.0);
  private static readonly secondsPerHour = 60 * 60;
  private static readonly hoursPerDay = 24;

  // private destroy$: Subject<boolean> = new Subject<boolean>();
  // private latestGroups$: Observable<KairosResponseGroup[]>;

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
        // takeUntil(this.destroy$),
        catchError(() => EMPTY),
        map(groups => this.convertResponseToStatusHours(groups, date))
      );
  }

  private calculateOfflineStatusCount(groups: KairosResponseGroup[], date: Date): number {
    // Idea: As devices sent all status messages except offline  (apart from few potential 0 at shutdown) in a more or less period interval
    // we can derive the offline count by subtracting the expected messages of the selected day (or until now if today)
    // from the sum of status idle, online and error.
    let pointsOfAllStatiExceptOffline = 0;
    groups.forEach(group => {
      if (group.index !== OispDeviceStatus.OFFLINE) {
        pointsOfAllStatiExceptOffline += this.sumOfResults(group);
      }
    });

    const offlineCount = KairosStatusAggregationService.getStatusUpdatesPerDay(date) - pointsOfAllStatiExceptOffline;
    return Math.round(offlineCount);
  }

  private convertResponseToStatusHours(statusGroupsExcludingOffline: KairosResponseGroup[], date: Date): StatusHours[] {
    const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroupsExcludingOffline, date);
    const offlineGroup: KairosResponseGroup = ({ index: OispDeviceStatus.OFFLINE, results: [estimatedOfflineCount] });
    const statusGroups: KairosResponseGroup[] = [...statusGroupsExcludingOffline];
    statusGroups.unshift(offlineGroup);

    const statusHours: StatusHours[] = [];
    statusGroups.forEach((group: KairosResponseGroup) => {
      const hour = (this.sumOfResults(group) / KairosStatusAggregationService.statusUpdatesPerSecond) /
                    KairosStatusAggregationService.secondsPerHour;
      statusHours.push({ hours: hour, status: group.index as OispDeviceStatus });
    });

    return statusHours;
  }

  private sumOfResults(group: KairosResponseGroup) {
    let count = 0;
    group.results.forEach(result => count += result);
    return count;
  }

}
