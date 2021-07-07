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
import { FieldInstance } from './field-instance.model';
import { FieldInstanceStore } from './field-instance.store';

@Injectable({
  providedIn: 'root'
})

export class FieldInstanceService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(private fieldInstanceStore: FieldInstanceStore, private http: HttpClient) {
  }

  getFieldInstances(companyId: ID, assetID: ID): Observable<FieldInstance[]> {
    const path = `companies/${companyId}/asset/${assetID}/fieldinstances`;
    const cacheKey = 'asset-' + assetID;
    return this.fieldInstanceStore.cachedByParentId(cacheKey,
      this.http.get<FieldInstance[]>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
        .pipe(tap(entities => {
          this.fieldInstanceStore.upsertManyCached(entities);
        })));
  }

  editItem(companyId: ID, fieldInstance: FieldInstance): Observable<FieldInstance> {
    const path = `/companies/${companyId}/asset/${fieldInstance.assetId}/fieldinstances/${fieldInstance.id}`;
    return this.http.patch<FieldInstance>(`${environment.apiUrlPrefix}/${path}`, fieldInstance, this.httpOptions)
      .pipe(
        tap(entity => {
          this.fieldInstanceStore.upsert(entity.id, entity);
        }));
  }
}
