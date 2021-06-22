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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { FieldSource } from './field-source.model';
import { FieldSourceStore } from './field-source.store';

@Injectable({
  providedIn: 'root'
})
export class FieldSourceService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(private fieldSourceStore: FieldSourceStore, private http: HttpClient) {
  }

  getFieldSourcesOfAssetSeries(companyId: ID, assetSeriesId: ID): Observable<FieldSource[]> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}/fieldsources`;
    const cacheKey = 'assetseries-' + assetSeriesId;
    return this.fieldSourceStore.cachedByParentId(cacheKey,
      this.http.get<FieldSource[]>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
        .pipe(tap(entities => {
          this.fieldSourceStore.upsertManyCached(entities);
        })));
  }

  editItem(companyId: ID, fieldSource: FieldSource): Observable<FieldSource> {
    const path = `/companies/${companyId}/assetseries/${fieldSource.assetSeriesId}/fieldsources/${fieldSource.id}`;
    return this.http.patch<FieldSource>(`${environment.apiUrlPrefix}/${path}`, fieldSource, this.httpOptions)
      .pipe(
        tap(entity => {
          this.fieldSourceStore.upsert(entity.id, entity);
        }));
  }

  updateUnit(companyId: ID, fieldSource: FieldSource): Observable<FieldSource> {
    const path = `/companies/${companyId}/assetseries/${fieldSource.assetSeriesId}/fieldsources/${fieldSource.id}?unitId=${fieldSource.sourceUnitId}`;
    return this.http.put<FieldSource>(`${environment.apiUrlPrefix}/${path}`, fieldSource.sourceUnitId, this.httpOptions)
      .pipe(
        tap(() => {
          this.fieldSourceStore.upsert(fieldSource.id, fieldSource);
        }));
  }
}
