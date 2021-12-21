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

import { Asset, AssetWithFields } from '../../store/asset/asset.model';
import { EMPTY, Observable, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { FieldDetails } from '../../store/field-details/field-details.model';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class NgsiLdService {
  private static runningRequest: Map<ID, Observable<any>> = new Map<ID, Observable<any>>();
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient) {
  }

  private getAssetUri(asset: Asset) {
    return `urn:ngsi-ld:asset:${asset.companyId}:${asset.id}`;
  }

  getLastValueOfAllFields(asset: Asset): Observable<any> {
    if (!NgsiLdService.runningRequest.has(asset.id)) {
      const newRequest = this.http.get<any>(`${environment.ngsiLdBrokerUrl}/${this.getAssetUri(asset)}?options=keyValues`, this.httpOptions)
        .pipe(
          catchError(() => {
            console.error(`[NGSI-LD service] caught error while update metrics of Asset ${asset.id}`);
            return EMPTY;
          }),
          map(keyValuePairs => {
            delete keyValuePairs.metainfo;
            return keyValuePairs;
          })
        );
      NgsiLdService.runningRequest.set(asset.id, newRequest);
    }
    return NgsiLdService.runningRequest.get(asset.id);
  }

  getMergedFieldsByAssetWithFields(
    assetWithFields: FactoryAssetDetailsWithFields | AssetWithFields, period: number): Observable<FieldDetails[]> {
    let latestPoints$: Observable<any>;
    if (period) {
      latestPoints$ = timer(0, period).pipe(
        switchMap(() => {
          return this.getLastValueOfAllFields(assetWithFields);
        })
      );
    } else {
      latestPoints$ = this.getLastValueOfAllFields(assetWithFields);
    }

    return latestPoints$.pipe(
      map(latestPoints => {
        return assetWithFields.fields.map(field => {
          const fieldCopy = Object.assign({ }, field);
          const point = latestPoints[field.externalName];
          if (point) {
            fieldCopy.value = point;
          }
          return fieldCopy;
        });
      })
    );
  }
}
