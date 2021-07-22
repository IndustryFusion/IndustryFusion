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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Asset, AssetWithFields } from '../store/asset/asset.model';
import { FieldDetails, FieldType } from '../store/field-details/field-details.model';
import {
  Aggregator,
  Metrics,
  MetricsWithAggregation,
  OispRequest,
  OispRequestWithAggregation,
  OispResponse,
  PointWithId,
  Rule,
  RuleStatus,
  Sampling,
  Series
} from './oisp.model';
import { AssetDetailsWithFields } from '../store/asset-details/asset-details.model';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class OispService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: environment.oispAuthToken })
  };
  private defaultPoints: PointWithId[] = [];

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService) {
  }

  getExternalIdForSingleField(field: FieldDetails, oispDevice: any): FieldDetails {
    if (oispDevice.components) {
      const fieldCopy = Object.assign({ }, field);
      oispDevice.components.map((el) => {
        if (el.name === field.externalId) {
          fieldCopy.externalId = el.cid;
        }
      });
      return fieldCopy;
    } else {
      return field;
    }
  }

  getAssetFieldsExternalIds(asset: AssetWithFields): Observable<AssetWithFields> {
    if (!asset) {
      return EMPTY;
    }
    const deviceRequest = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/devices/${asset.externalId}`;

    return this.http.get<any>(deviceRequest, this.httpOptions).pipe(
      catchError(() => {
        console.warn('[oisp service] caught error while searching for external Ids');
        return of(asset);
      }),
      startWith(asset),
      map((response) => {
        const newFields = asset.fields.map(field => this.getExternalIdForSingleField(field, response));
        return Object.assign(asset, { fields: newFields });
      })
    );
  }

  getAllRules(): Observable<Rule[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules`;
    return this.http.get<Rule[]>(url, this.httpOptions);
  }

  getRule(ruleId: string): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/${ruleId}`;
    return this.http.get<Rule>(url, this.httpOptions);
  }

  cloneRule(ruleId: string): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/clone/${ruleId}`;
    return this.http.post<Rule>(url, null, this.httpOptions);
  }

  createRuleDraft(ruleDraft: Rule): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/draft`;
    return this.http.put<Rule>(url, ruleDraft, this.httpOptions);
  }

  setRuleStatus(ruleId: string, status: RuleStatus.OnHold | RuleStatus.Active | RuleStatus.Archived): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/${ruleId}/status`;
    const body = { status};
    return this.http.put<Rule>(url, body, this.httpOptions);
  }

  deleteRule(ruleId: string): Observable<any> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/delete_rule_with_alerts/${ruleId}`;
    return this.http.delete(url, this.httpOptions);
  }

  getAssetDetailsFieldsExternalIds(assetDetails: AssetDetailsWithFields): Observable<AssetDetailsWithFields> {
    if (!assetDetails) {
      return EMPTY;
    }
    const deviceRequest = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/devices/${assetDetails.externalId}`;

    return this.http.get<any>(deviceRequest, this.httpOptions).pipe(
      catchError(() => {
        console.warn('[oisp service] caught error while searching for external Ids');
        return of(assetDetails);
      }),
      startWith(assetDetails),
      map((response) => {
        const newFields = assetDetails.fields.map(field => this.getExternalIdForSingleField(field, response));
        return Object.assign(assetDetails, { fields: newFields });
      })
    );
  }

  hasAnyPoints(oispSeries: Series[]): boolean {
    let answer = false;
    oispSeries.forEach(series => {
      answer = answer || (series.points.length > 0);
    });
    return answer;
  }

  getOispPoints(path: string, request: OispRequest, allFields: boolean): Observable<PointWithId[]> {
    if (request.metrics.length < 1) {
      return of(this.defaultPoints);
    }
    return this.http.post<OispResponse>(`${environment.oispApiUrlPrefix}/${path}`, request, this.httpOptions)
      .pipe(
        catchError(() => {
          console.error('[oisp service] caught error while searching for oispPoints');
          return EMPTY;
        }),
        map((entity) => {
          if (entity.series && this.hasAnyPoints(entity.series)) {
            if (allFields) {
              // returns the last value for each field
              const points = entity.series.map((series) => ({ id: series.componentId, ...series.points.slice(-1)[0] }));
              return points;
            } else if (!allFields) {
              // returns all values for one field
              const seriesId = entity.series[0].componentId;
              const points = entity.series[0].points
                .map((point) => ({ id: seriesId, ts: point.ts, value: point.value }));
              return points;
            }
          } else {
            return this.defaultPoints;
          }
        }));
  }

  getLastValueOfAllFields(asset: Asset, fields: FieldDetails[], secondsInPast: number): Observable<PointWithId[]> {
    const path = `accounts/${this.getOispAccountId()}/data/search`;
    const request: OispRequest = {
      from: -secondsInPast,
      targetFilter: { deviceList: [asset.externalId] },
      metrics: fields
        .filter(field => field.fieldType === FieldType.METRIC)
        .map(field => ({ id: field.externalId, op: 'none' }))
    };

    const oispPoints$ = this.getOispPoints(path, request, true);
    return oispPoints$;
  }

  getValuesOfSingleField(asset: Asset, field: FieldDetails, secondsInPast: number, maxPoints?: string): Observable<PointWithId[]> {
    const path = `accounts/${this.getOispAccountId()}/data/search`;
    let oispPoints$: Observable<PointWithId[]>;
    if (!maxPoints) {
      let metrics: Metrics;
      metrics = ({ id: field.externalId, op: 'none' });
      const request: OispRequest = {
        from: -secondsInPast,
        targetFilter: { deviceList: [asset.externalId] },
        metrics: [metrics]
      };
      oispPoints$ = this.getOispPoints(path, request, false);
    } else {
      let metricsWithAggregation: MetricsWithAggregation;
      const myAggregator: Aggregator = ({ name: 'avg' });
      metricsWithAggregation = ({ id: field.externalId, op: 'none', aggregator: myAggregator });
      const request: OispRequestWithAggregation = {
        from: -secondsInPast,
        maxItems: Number(maxPoints),
        targetFilter: { deviceList: [asset.externalId] },
        metrics: [metricsWithAggregation]
      };
      oispPoints$ = this.getOispPoints(path, request, false);
    }
    return oispPoints$;
  }

  getValuesOfSingleFieldByDates(asset: Asset,
                                field: FieldDetails,
                                fromDate: number,
                                toDate: number,
                                maxPoints: string,
                                samplingUnit?: string,
                                samplingValue?: number): Observable<PointWithId[]> {
    const path = `accounts/${this.getOispAccountId()}/data/search`;
    let metricsWithAggregation: MetricsWithAggregation;
    if (samplingUnit) {
      const mySampling: Sampling = ({ unit: samplingUnit, value: samplingValue });
      const myAggregator: Aggregator = ({ name: 'avg', sampling: mySampling });
      metricsWithAggregation = ({ id: field.externalId, op: 'none', aggregator: myAggregator });
      const request: OispRequestWithAggregation = {
        from: fromDate,
        to: toDate,
        targetFilter: { deviceList: [asset.externalId] },
        metrics: [metricsWithAggregation]
      };
      return this.getOispPoints(path, request, false);
    } else {
      const myAggregator: Aggregator = ({ name: 'avg' });
      metricsWithAggregation = ({ id: field.externalId, op: 'none', aggregator: myAggregator });
      const request: OispRequestWithAggregation = {
        from: fromDate,
        to: toDate,
        maxItems: Number(maxPoints),
        targetFilter: { deviceList: [asset.externalId] },
        metrics: [metricsWithAggregation]
      };
      return this.getOispPoints(path, request, false);
    }
  }

  private getOispAccountId(): string {
    const token = (this.keycloakService.getKeycloakInstance().tokenParsed as any);
    let oispAccountId = '';

    if (token.accounts && token.accounts.length > 0) {
      oispAccountId = token.accounts[0].id;
    } else {
      console.warn('cannot retrieve OISP accountId, subsequent calls to OISP will hence most likely fail!');
    }

    return oispAccountId;
  }

}
