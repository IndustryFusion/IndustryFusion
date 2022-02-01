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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldDetails } from '../../../../../core/store/field-details/field-details.model';
import { Observable, Subject, timer } from 'rxjs';
import { PointWithId } from '../../../../../core/services/api/oisp.model';
import { Asset } from '../../../../../core/store/asset/asset.model';
import { OispService } from '../../../../../core/services/api/oisp.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { AssetChartInterval } from '../../../../models/asset-chart-interval.model';


@Component({
  selector: 'app-asset-table',
  templateUrl: './asset-table.component.html',
  styleUrls: ['./asset-table.component.scss']
})

export class AssetTableComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  field: FieldDetails;

  @Input()
  asset: Asset;

  @Input()
  interval: AssetChartInterval;

  @Output()
  loadedEvent = new EventEmitter<void>();

  latestPoints$: Observable<PointWithId[]>;

  allPoints: [string, number][] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  initialized = false;

  currentTimestamps: number[] = [];

  lastReceivedTimestamp = 0;

  slidingTimeWindow = 0;

  constructor(
    private oispService: OispService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
    if (changes.interval) {
        switch ( this.interval ){
          case AssetChartInterval.CURRENT:
            this.flushData();
            this.loadNewData(environment.dataUpdateIntervalMs / 1000);
            break;
          case AssetChartInterval.TEN_MINUTES:
            this.flushData();
            this.loadNewData(600);
            break;
          case AssetChartInterval.ONE_HOUR:
            this.flushData();
            this.loadNewData(3600);
            break;
          case AssetChartInterval.ONE_DAY:
            this.flushData();
            this.loadNewData(86400);
            break;
          default:
            break;
        }
    }
    } else {
      this.initialized = true;
      this.loadNewData(environment.dataUpdateIntervalMs / 1000);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  flushData() {
    this.allPoints = [];
    this.destroy$.next(true);
  }

  loadNewData(secondsInPast: number) {
    let gotFirstPoints = false;
    this.latestPoints$ = timer(0, environment.dataUpdateIntervalMs)
        .pipe(
          switchMap(() => {
            // If we already received some points, only take points from relevant past + n seconds margin.
            if (gotFirstPoints) {
              secondsInPast = this.slidingTimeWindow + environment.dataUpdateIntervalMs / 1000;
            } else {
              gotFirstPoints = true;
            }
            return this.oispService.getValuesOfSingleField(this.asset, this.field, secondsInPast);
          })
        );

    this.latestPoints$.pipe(takeUntil(this.destroy$))
      .subscribe(points => {
        points.filter(point => !this.currentTimestamps.includes(point.ts)).forEach(point => {
          if (this.lastReceivedTimestamp < point.ts) {
            this.lastReceivedTimestamp = point.ts;
          }
          this.currentTimestamps.push(point.ts);
          if (this.allPoints.length > 0) {
            if ( point.value !== this.allPoints[0][0]) { // only add value if it has changed
              this.allPoints.unshift([point.value, point.ts]);
            }
          } else {
            this.allPoints.unshift([point.value, point.ts]);
          }
        });

        if (this.lastReceivedTimestamp > 0) {
          this.slidingTimeWindow = (Date.now() - this.lastReceivedTimestamp) / 1000;
        } else { // no points received -> set default value n s
          this.slidingTimeWindow = environment.dataUpdateIntervalMs / 1000;
        }
        // only memorize last 50 values
        this.currentTimestamps = this.currentTimestamps.slice(Math.max(this.currentTimestamps.length - 50, 0));

        this.loadedEvent.emit();
      });
  }
}
