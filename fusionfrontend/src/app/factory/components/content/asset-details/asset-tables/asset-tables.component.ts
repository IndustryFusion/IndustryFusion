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
import { KairosService } from '../../../../../core/services/api/kairos.service';
import { Asset } from '../../../../../core/store/asset/asset.model';
import { KairosDataPoint } from '../../../../../core/models/kairos.model';
import { switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'app-asset-tables',
  templateUrl: './asset-tables.component.html',
  styleUrls: ['./asset-tables.component.scss']
})

export class AssetTablesComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  field: FieldDetails;

  @Input()
  asset: Asset;

  @Input()
  options: string;

  @Output()
  loadedEvent = new EventEmitter<void>();

  pointsOfInterval$: Observable<KairosDataPoint[]>;

  allPoints: [number, number][] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  initialized = false;

  currentTimestamps: number[] = [];

  lastReceivedTimestamp = 0;

  slidingTimeWindow = 0;

  constructor(
    private kairosService: KairosService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
    if (changes.options) {
        switch ( this.options ){
          case 'current':
            this.flushData();
            this.loadNewData(environment.dataUpdateIntervalMs / 1000);
            break;
          case '10min':
            this.flushData();
            this.loadNewData(600);
            break;
          case '1hour':
            this.flushData();
            this.loadNewData(3600);
            break;
          case '1day':
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
    this.pointsOfInterval$ = timer(0, environment.dataUpdateIntervalMs)
        .pipe(
          switchMap(() => {
            // If we already received some points, only take points from relevant past + n seconds margin.
            if (gotFirstPoints) {
              secondsInPast = this.slidingTimeWindow + environment.dataUpdateIntervalMs / 1000;
            } else {
              gotFirstPoints = true;
            }
            return this.kairosService.getValuesOfFieldByLastSeconds(this.asset, this.field, secondsInPast);
          })
        );

    this.pointsOfInterval$.pipe(takeUntil(this.destroy$))
      .subscribe(points => {
        points.filter(point => !this.currentTimestamps.includes(point.timestamp)).forEach(point => {
          if (this.lastReceivedTimestamp < point.timestamp) {
            this.lastReceivedTimestamp = point.timestamp;
          }
          this.currentTimestamps.push(point.timestamp);
          if (this.allPoints.length > 0) {
            if (point.value !== this.allPoints[0][0]) { // only add value if it has changed
              this.allPoints.unshift([point.value, point.timestamp]);
            }
          } else {
            this.allPoints.unshift([point.value, point.timestamp]);
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
