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

import { Asset } from '../../store/asset/asset.model';
import { FieldDetails } from '../../store/field-details/field-details.model';
import { EMPTY, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  KairosAggregator,
  KairosDataPoint,
  KairosDataPointGroup,
  KairosGroupBy,
  KairosQuery,
  KairosRequest,
  KairosResponse,
  KairosResult,
  KairosSampling,
  MetricsWithAggregationAndGrouping
} from '../../models/kairos.model';
import { NgsiLdService } from './ngsi-ld.service';
import * as moment from 'moment/moment';

@Injectable({
  providedIn: 'root'
})
/**
 * @see https://kairosdb.github.io/docs/restapi/QueryMetrics.html#id3
 */
export class KairosService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private readonly EMPTY_DATA_POINT_GROUPS: KairosDataPointGroup[] = [];
  private readonly DEFAULT_ACCOUNT_NAME: string = 'default'; // multi-tenancy support will come later;
  private readonly PATH: string = 'datapoints/query'; // multi-tenancy support will come later;

  constructor(
    private http: HttpClient,
    private ngsiLdService: NgsiLdService) {
  }

  public static mapQueryResultToDataGroup(result: KairosResult): KairosDataPointGroup {
    return ({ index:      result.group_by[0].group?.group_number ?? 0,
              timestamps: result.values.map((valueArray: number[]) => valueArray[0]),
              values:    result.values.map((valueArray: number[]) => valueArray[1])});
  }

  public static getFieldIri(fieldDetails: FieldDetails): string {
    return fieldDetails.name;
  }

  /**
   * @see NgsiLdSerializer.getFieldInstanceCleanName (backend)
   */
  public static getFieldInstanceCleanName(fieldDetails: FieldDetails): string {
    let fieldName: string = fieldDetails.externalName;
    if (fieldName == null) {
      fieldName = fieldDetails.fieldLabel;
    }
    fieldName = this.cleanName(fieldName);
    return fieldName;
  }

  /**
   * @see NgsiLdSerializer.cleanName (backend)
   */
  private static cleanName(fieldName: string): string {
    fieldName = fieldName.replace('[\\<\\"\\\'\\=\\;\\(\\)\\>\\?\\*\\s]', '');
    return fieldName;
  }

  getValuesOfFieldByLastSeconds(asset: Asset,
                                fieldDetails: FieldDetails,
                                secondsInPast: number,
                                limit?: number): Observable<KairosDataPoint[]> {

    const fromDate = moment(Date.now()).subtract(secondsInPast, 'seconds').valueOf();
    const nowDate = moment(Date.now()).valueOf();

    const kairosIdentifier = this.generateKairosIdentifier(asset, fieldDetails);
    const request = this.prepareKairosRequestNoGrouping(kairosIdentifier, fromDate, nowDate, limit);

    return this.runKairosPostRequest(this.PATH, request).pipe(
      map(dataGroups => this.flatMapDataPointGroups(dataGroups))
    );
  }

  getValuesOfFieldByDateRange(asset: Asset,
                              fieldDetails: FieldDetails,
                              fromDate: number,
                              toDate: number,
                              limit: number,
                              samplingUnit?: string,
                              samplingValue?: number): Observable<KairosDataPoint[]> {

    const mySampling: KairosSampling = ({ unit: samplingUnit, value: samplingValue });
    const myAggregator: KairosAggregator = samplingUnit ? ({ name: 'avg', sampling: mySampling }) : ({ name: 'avg' });
    const myGrouping: KairosGroupBy = ({ name: 'value', range_size: 1 });

    const kairosIdentifier = this.generateKairosIdentifier(asset, fieldDetails);
    const request = this.prepareKairosRequest(kairosIdentifier, myGrouping, myAggregator, fromDate, toDate, limit);

    return this.runKairosPostRequest(this.PATH, request).pipe(
      map(dataGroups => this.flatMapDataPointGroups(dataGroups))
    );
  }

   // TODO has to be tested with new kairos version
  private flatMapDataPointGroups(dataPointGroups: KairosDataPointGroup[]): KairosDataPoint[] {
      const flattenedDataPoints: KairosDataPoint[] = [];
      dataPointGroups.forEach((group) => {
        for (let i = 0; i < group.values.length; i++) {
          flattenedDataPoints.push({ timestamp: group.timestamps[i], value: group.values[i] } as KairosDataPoint);
        }
      });
      return flattenedDataPoints;
  }

  getStatusCounts(asset: Asset,
                  fieldDetails: FieldDetails,
                  fromDate: number,
                  toDate: number,
                  limit?: number): Observable<KairosDataPointGroup[]> {

    const mySampling: KairosSampling = ({ unit: 'days', value: 1 });
    const myAggregator: KairosAggregator = ({ name: 'count', sampling: mySampling });
    const myGrouping: KairosGroupBy = ({ name: 'value', range_size: 1 });

    const kairosIdentifier = this.generateKairosIdentifier(asset, fieldDetails);
    const request = this.prepareKairosRequest(kairosIdentifier, myGrouping, myAggregator, fromDate, toDate, limit);

    return this.runKairosPostRequest(this.PATH, request);
  }

  private generateKairosIdentifier(asset: Asset,
                                   fieldDetails: FieldDetails): string {
    const assetUri = this.ngsiLdService.generateAssetUri(asset);
    const fieldIri = KairosService.getFieldIri(fieldDetails);

    return `${this.DEFAULT_ACCOUNT_NAME}\\${assetUri}\\${fieldIri}`;
  }

  private prepareKairosRequest(kairosIdentifier: string,
                               myGrouping: KairosGroupBy,
                               myAggregator: KairosAggregator,
                               fromDate: number,
                               toDate: number,
                               limit: number): KairosRequest {
    let metricsWithAggregationAndGrouping: MetricsWithAggregationAndGrouping;
    if (limit) {
      metricsWithAggregationAndGrouping = ({ name: kairosIdentifier, limit, group_by: [myGrouping], aggregators: [myAggregator] });
    } else {
      metricsWithAggregationAndGrouping = ({ name: kairosIdentifier, group_by: [myGrouping], aggregators: [myAggregator] });
    }

    return {
      start_absolute: fromDate,
      end_absolute: toDate,
      metrics: [metricsWithAggregationAndGrouping]
    } as KairosRequest;
  }

  private prepareKairosRequestNoGrouping(kairosIdentifier: string,
                                         fromDate: number,
                                         toDate: number,
                                         limit: number): KairosRequest {
    let metricsWithoutAggregation: MetricsWithAggregationAndGrouping;
    if (limit) {
      metricsWithoutAggregation = ({ name: kairosIdentifier, limit, group_by: [], aggregators: [] });
    } else {
      metricsWithoutAggregation = ({ name: kairosIdentifier, group_by: [], aggregators: [] });
    }

    return {
      start_absolute: fromDate,
      end_absolute: toDate,
      metrics: [metricsWithoutAggregation]
    } as KairosRequest;
  }

  private runKairosPostRequest(path: string, request: KairosRequest): Observable<KairosDataPointGroup[]> {
    if (request.metrics.length < 1) {
      return of(this.EMPTY_DATA_POINT_GROUPS);
    }
    return this.http.post<KairosResponse>(`${environment.kairosApiUrlPrefix}/${path}`, request, this.httpOptions)
      .pipe(
        catchError(() => {
          console.error('[kairos service] caught error during post request');
          return EMPTY;
        }),
        map(((response: KairosResponse) => {
          if (response.queries && this.hasAnyResult(response.queries)) {
            const groups: KairosDataPointGroup[] = [];
            response.queries.forEach(query => {
              query.results.forEach(result => groups.push(KairosService.mapQueryResultToDataGroup(result)));
            });
            return groups;
          } else {
            return this.EMPTY_DATA_POINT_GROUPS;
          }
        })));
  }

  private hasAnyResult(queries: KairosQuery[]): boolean {
    let answer = false;
    queries.forEach(query => {
      query.results.forEach(result => {
        answer = answer || (result.values.length > 0);
      });
    });
    return answer;
  }
}
