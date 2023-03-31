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
import { ngsiLdLatestKeyValues } from '../../models/kairos.model';
import { KairosService } from './kairos.service';

/**
 * @see https://ngsi-ld-tutorials.readthedocs.io/en/latest/ngsi-ld-operations.html
 */
@Injectable({
  providedIn: 'root'
})
export class NgsiLdService {
  private static runningRequests: Map<ID, Observable<any>> = new Map<ID, Observable<any>>();
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) {
  }

  generateAssetUri(asset: Asset): string {
    return `urn:ngsi-ld:asset:${asset.companyId}:${asset.id}`;
  }

  getLatestValuesOfAsset(asset: Asset): Observable<ngsiLdLatestKeyValues> {
    if (!NgsiLdService.runningRequests.has(asset.id)) {
      const newRequest = this.http.get<any>(`${environment.ngsiLdBrokerUrl}/${this.generateAssetUri(asset)}?options=keyValues`,
        this.httpOptions)
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
      NgsiLdService.runningRequests.set(asset.id, newRequest);
    }
    return NgsiLdService.runningRequests.get(asset.id);
  }

  getMergedFieldsByAssetWithFields(
    assetWithFields: FactoryAssetDetailsWithFields | AssetWithFields, period: number): Observable<FieldDetails[]> {
    let latestPoints$: Observable<ngsiLdLatestKeyValues>;
    if (period) {
      latestPoints$ = timer(0, period).pipe(
        switchMap(() => {

          return this.getLatestValuesOfAsset(assetWithFields);

        })
      );
    } else {
      latestPoints$ = this.getLatestValuesOfAsset(assetWithFields);
    }

    return latestPoints$.pipe(
      map(latestPoints => this.mergeFieldValuesToAsset(latestPoints, assetWithFields))
    );
  }

  mergeFieldValuesToAsset(lastValues: ngsiLdLatestKeyValues,
                          assetWithFields: FactoryAssetDetailsWithFields | AssetWithFields): FieldDetails[] {
    return assetWithFields.fields.map((field) => {
        const fieldCopy = Object.assign({ }, field);
        const cleanedExternalName = KairosService.getFieldInstanceCleanName(field);
        const point = lastValues[cleanedExternalName];
        if (point && point !== '') {
          fieldCopy.value = point;
        }
        return fieldCopy;
      }
    );
  }

}
