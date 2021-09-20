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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FieldDetails } from './field-details.model';
import { FieldDetailsStore } from './field-details.store';

@Injectable({
  providedIn: 'root'
})
export class FieldDetailsService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private fieldStore: FieldDetailsStore, private http: HttpClient) { }

  getFieldsOfAsset(companyId: ID, assetId: ID): Observable<FieldDetails[]> {
    const path = `companies/${companyId}/assets/${assetId}/fields`;
    return this.fieldStore.cachedByParentId(assetId, this.http.get<FieldDetails[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.fieldStore.upsertManyByParentIdCached(assetId, entities);
      })));
  }
}
