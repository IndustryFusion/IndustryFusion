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
import { tap } from 'rxjs/operators';

import { FieldTargetStore } from './field-target.store';
import { FieldTarget } from './field-target.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FieldTargetService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private fieldTargetStore: FieldTargetStore, private http: HttpClient) {

  }

  getItems(assetTypeTemplateId: ID): Observable<FieldTarget[]> {
    const path = `assettypetemplates/${assetTypeTemplateId}/fieldtargets`;
    return this.http.get<FieldTarget[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.fieldTargetStore.upsertMany(entities);
      }));
  }

  createItem(assetTypeTemplateId: ID, fieldTarget: FieldTarget): Observable<FieldTarget> {
    const path = `assettypetemplates/${assetTypeTemplateId}/fieldtargets`;
    return this.http.post<FieldTarget>(`${environment.apiUrlPrefix}/${path}`, fieldTarget,
      { params: { fieldId: fieldTarget.fieldId.toString() }, ...this.httpOptions }).pipe(
        tap({
          next: (entity) => {
            this.fieldTargetStore.upsert(entity.id, entity);
          }
        })
      );
  }

  editItem(assetTypeTemplateId: ID, fieldTarget: FieldTarget): Observable<FieldTarget> {
    const path = `assettypetemplates/${assetTypeTemplateId}/fieldtargets/${fieldTarget.id}`;
    return this.http.patch<FieldTarget>(`${environment.apiUrlPrefix}/${path}`, fieldTarget, this.httpOptions)
      .pipe(
        tap(entity => {
          this.fieldTargetStore.upsert(entity.id, entity);
        }));
  }

  deleteItem(assetTypeTemplateId: ID, fieldTargetId: ID): Observable<any> {
    const path = `assettypetemplates/${assetTypeTemplateId}/fieldtargets/${fieldTargetId}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`)
      .pipe(tap({
        complete: () => {
          this.fieldTargetStore.remove(fieldTargetId);
        },
        error: (error) => {
          this.fieldTargetStore.setError(error);
        }
      }));
  }
}
