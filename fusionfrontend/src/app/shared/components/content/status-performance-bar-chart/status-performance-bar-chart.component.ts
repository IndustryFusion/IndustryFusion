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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { StatusHours, StatusHoursOneDay } from '../../../../core/models/kairos-status-aggregation.model';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { KairosStatusAggregationService } from '../../../../core/services/api/kairos-status-aggregation.service';
import {
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import * as moment from 'moment';
import { StatusHoursHelper } from '../../../../core/helpers/status-hours-helper';
import { ShiftWithDate } from '../../../../core/store/factory-site/factory-site.model';
import { RoomQuery } from '../../../../core/store/room/room.query';
import { RoomResolver } from '../../../../core/resolvers/room.resolver';
import { FactorySiteService } from '../../../../core/store/factory-site/factory-site.service';
import { Room } from '../../../../core/store/room/room.model';
import { ShiftsHelper } from '../../../../core/helpers/shifts-helper';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { SegmentationType } from '../../../models/segmentation-type.model';
import { ID } from '@datorama/akita';


@Component({
  selector: 'app-status-performance-bar-chart',
  templateUrl: './status-performance-bar-chart.component.html',
  styleUrls: ['./status-performance-bar-chart.component.scss']
})

export class StatusPerformanceBarChartComponent implements OnInit, OnChanges {
  @Input()
  segmentationCount = 3;

  @Input()
  segmentationType = SegmentationType.DAYS;

  @Input()
  assetDetailsWithFields: FactoryAssetDetailsWithFields;

  @Output()
  loaded = new EventEmitter<void>();

  @Output()
  statusHoursOfTodayAggregated = new EventEmitter<StatusHours[]>();

  yBarChartLabelsLastSegmentsAsc: string[];
  statusHoursLastSegmentsAsc: StatusHoursOneDay[];
  isLoaded = false;

  private allStatusHoursLoaded$ = new Subject<FactoryAssetDetailsWithFields[]>();
  private lastDatesAsc: Date[];
  private lastShiftsAsc: ShiftWithDate[];

  private statusCountToLoad: number;
  private loadedStatusCount = 0;
  private lastShiftsWithDateDesc: ShiftWithDate[];
  private previousAssetDetailsWithFieldsId: ID;

  private readonly statusHoursHelper: StatusHoursHelper;

  constructor(private kairosStatusAggregationService: KairosStatusAggregationService,
              private roomResolver: RoomResolver,
              private roomQuery: RoomQuery,
              private factorySiteService: FactorySiteService,
              enumHelpers: EnumHelpers) {
    this.statusHoursHelper = new StatusHoursHelper(enumHelpers);
  }

  ngOnInit() {
    this.roomResolver.resolve();
    this.aggregateHoursWhenLoaded();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetDetailsWithFields
      && this.assetDetailsWithFields
      && this.assetDetailsWithFields.id !== this.previousAssetDetailsWithFieldsId) {
      this.previousAssetDetailsWithFieldsId = this.assetDetailsWithFields.id;
      this.loadStatusHours();
    }
  }

  private loadStatusHours(): void {
    switch (this.segmentationType) {
      case SegmentationType.DAYS:
        this.initStatusHoursLastSegments();
        break;

      case SegmentationType.SHIFTS:
        this.selectLastShiftsFromNow().subscribe(shiftsWithDate => {
          this.lastShiftsWithDateDesc = shiftsWithDate;
          this.initStatusHoursLastSegments();
        });
        break;
    }
  }

  private selectLastShiftsFromNow(): Observable<ShiftWithDate[]> {
    if (this.assetDetailsWithFields.roomId) {
      const room: Room = this.roomQuery.getEntity(this.assetDetailsWithFields.roomId);
      return this.factorySiteService.getFactorySiteWithShiftsSettings(this.assetDetailsWithFields.companyId, room.factorySiteId)
        .pipe(map(factorySite => {
          return ShiftsHelper.getLastNCompletedShiftsWithDate(factorySite?.shiftSettings, this.segmentationCount);
        }));
    }

    return of([]);
  }

  private initStatusHoursLastSegments(): void {
    this.resetData();

    if (KairosStatusAggregationService.getStatusFieldOfAsset(this.assetDetailsWithFields) != null) {
      for (let index = 0; index < this.segmentationCount; index++) {
        switch (this.segmentationType) {
          case SegmentationType.DAYS:
            this.addDate(index);
            break;

          case SegmentationType.SHIFTS:
            this.addShift(index);
            break;
        }

        this.statusCountToLoad++;
        const selectedShifts = this.lastShiftsAsc.length > index ? [this.lastShiftsAsc[index]] : [];
        this.kairosStatusAggregationService.selectHoursPerStatusOfAsset(this.assetDetailsWithFields,
          this.lastDatesAsc[index], selectedShifts)
          .subscribe(statusHoursOfOneDay => this.insertStatusHoursOfOneDayAsc(index, statusHoursOfOneDay));
      }
    }
    this.yBarChartLabelsLastSegmentsAsc.reverse();

    if (this.statusCountToLoad === 0) {
      this.allStatusHoursLoaded$.next();
    }
  }

  private resetData(): void {
    this.statusCountToLoad = this.loadedStatusCount = 0;
    this.lastDatesAsc = [];
    this.lastShiftsAsc = [];
    this.yBarChartLabelsLastSegmentsAsc = [];
    this.statusHoursLastSegmentsAsc = [];
    for (let index = 0; index < this.segmentationCount; index++) {
      this.statusHoursLastSegmentsAsc.push(StatusHoursOneDay.empty());
    }
  }

  private addDate(index: number) {
    const date: Date = new Date(Date.now());
    this.lastDatesAsc.push(new Date(date.setDate(date.getDate() - index)));
    this.yBarChartLabelsLastSegmentsAsc.push(moment(this.lastDatesAsc[index]).format('DD.MM'));
  }

  private addShift(index: number): void {
    this.lastShiftsAsc.push(this.lastShiftsWithDateDesc[index]);
    this.lastDatesAsc.push(this.lastShiftsWithDateDesc[index].date);
    this.yBarChartLabelsLastSegmentsAsc.push(`${this.lastShiftsAsc[index].name} - ${formatDate(this.lastShiftsAsc[index].date, 'dd.MM.', 'en-Us')}`);
  }

  private insertStatusHoursOfOneDayAsc(index: number, statusHours: StatusHours[]): void {
    if (index < 0 || index >= this.segmentationCount) {
      throw new Error('[status performance bar chart]: Illegal index value');
    }

    this.statusHoursLastSegmentsAsc[this.segmentationCount - index - 1] = new StatusHoursOneDay(statusHours);
    this.loadedStatusCount++;

    if (this.statusCountToLoad === this.loadedStatusCount) {
      this.allStatusHoursLoaded$.next();
    }
  }

  private aggregateHoursWhenLoaded(): void {
    this.allStatusHoursLoaded$.subscribe(() => {
      if (this.statusHoursLastSegmentsAsc && this.statusHoursLastSegmentsAsc.length === this.segmentationCount) {
        this.updateAggregatedStatusHoursToday();
        this.isLoaded = true;
        this.loaded.emit();
      }
    });
  }

  private updateAggregatedStatusHoursToday(): void {
    const hoursOfToday = [this.statusHoursLastSegmentsAsc[this.statusHoursLastSegmentsAsc.length - 1]];
    const aggregatedStatusHoursToday = this.statusHoursHelper.getAggregatedStatusHours(hoursOfToday);
    this.statusHoursOfTodayAggregated.emit(aggregatedStatusHoursToday);
  }
}
