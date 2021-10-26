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
import { Aggregator, Sampling } from './oisp.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OispDeviceQuery } from '../../store/oisp/oisp-device/oisp-device.query';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import {
  KairosGroupBy,
  KairosQuery,
  KairosRequest,
  KairosResponse,
  KairosResponseGroup,
  KairosResult,
  MetricsWithAggregationAndGrouping
} from './kairos.model';

@Injectable({
  providedIn: 'root'
})
export class KairosService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private readonly emptyResponse: KairosResponseGroup[] = [];

  constructor(
    private http: HttpClient,
    private oispDeviceQuery: OispDeviceQuery) {
  }

  public static mapResultToResponseGroup(result: KairosResult): KairosResponseGroup {
    return ({ index: result.group_by[0].group.group_number,
              timestamps: result.values.map((valueArray: number[]) => valueArray[0]),
              results:    result.values.map((valueArray: number[]) => valueArray[1])});
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

  private makeKairosRequest(path: string, request: KairosRequest): Observable<KairosResponseGroup[]> {
    if (request.metrics.length < 1) {
      return of(this.emptyResponse);
    }
    return this.http.post<KairosResponse>(`${environment.kairosApiUrlPrefix}/${path}`, request, this.httpOptions)
      .pipe(
        catchError(() => {
          console.error('[kairos service] caught error during post request');
          return EMPTY;
        }),
        map(((response: KairosResponse) => {
          if (response.queries && this.hasAnyResult(response.queries)) {
            const groups: KairosResponseGroup[] = [];
            response.queries.forEach(query => {
              query.results.forEach(result => groups.push(KairosService.mapResultToResponseGroup(result)));
            });
            return groups;
          } else {
            return this.emptyResponse;
          }
        })));
  }

  getStatusCounts(asset: Asset,
                  fieldDetails: FieldDetails,
                  fromDate: number,
                  toDate: number,
                  limit?: number): Observable<KairosResponseGroup[]> {

    const path = `datapoints/query`;
    let metricsWithAggregationAndGrouping: MetricsWithAggregationAndGrouping;

    const mySampling: Sampling = ({ unit: 'days', value: 1 });
    const myAggregator: Aggregator = ({ name: 'count', sampling: mySampling });
    const myGrouping: KairosGroupBy = ({ name: 'value', range_size: 1 });
    const domainIdOfDevice = this.oispDeviceQuery.getDeviceOfAsset(asset.externalName)?.domainId;
    const externalIdOfFieldInstance = this.oispDeviceQuery.mapExternalNameOFieldInstanceToComponentId(asset.externalName,
      fieldDetails.externalName);

    if (domainIdOfDevice == null) {
      return of(this.emptyResponse);
    }

    if (limit) {
      metricsWithAggregationAndGrouping = ({ name: domainIdOfDevice + '.' + externalIdOfFieldInstance, limit,
        group_by: [myGrouping], aggregators: [myAggregator] });
    } else {
      metricsWithAggregationAndGrouping = ({ name: domainIdOfDevice + '.' + externalIdOfFieldInstance,
        group_by: [myGrouping], aggregators: [myAggregator] });
    }
    const request: KairosRequest = {
      start_absolute: fromDate,
      end_absolute: toDate,
      metrics: [metricsWithAggregationAndGrouping]
    };
    return this.makeKairosRequest(path, request);
  }
}
