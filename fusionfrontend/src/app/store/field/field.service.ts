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
import { Field } from './field.model';
import { FieldStore } from './field.store';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private fieldStore: FieldStore, private http: HttpClient) { }

  getFieldsOfAsset(companyId: ID, assetId: ID): Observable<Field[]> {
    const path = `companies/${companyId}/assets/${assetId}/fields`;
    return this.fieldStore.cachedByParentId(assetId, this.http.get<Field[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.fieldStore.upsertManyByParentIdCached(assetId, entities);
      })));
  }
}
