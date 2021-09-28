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
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RestService } from '../../services/rest.service';
import { environment } from '../../../environments/environment';
import { Field } from './field.model';
import { FieldStore } from './field.store';


@Injectable({
  providedIn: 'root'
})
export class FieldService implements RestService<Field> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private fieldStore: FieldStore, private http: HttpClient) { }

  getItems(): Observable<Field[]> {
    const path = `fields`;
    return this.http.get<Field[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.fieldStore.upsertMany(entities);
      }));
  }

  getItem(id: ID): Observable<Field> {
    const path = `fields/${id}`;
    return this.http.get<Field>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.fieldStore.upsert(id, entity);
      }));
  }

  createItem(item: Field): Observable<Field> {
    const path = `fields`;
    return this.http.post<Field>(`${environment.apiUrlPrefix}/${path}`, item,
      { params: item.unitId ? { unitId: `${item.unitId}` } : undefined, ...this.httpOptions })
      .pipe(
        tap({
          next: (entity) => {
            this.fieldStore.upsert(entity.id, entity);
          },
          error: (error) => {
            this.fieldStore.setError(error);
          }
        }));
  }

  editItem(id: ID, item: Field): Observable<Field> {
    const path = `fields/${id}`;
    return this.http.patch<Field>(`${environment.apiUrlPrefix}/${path}`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.fieldStore.upsert(id, entity);
        }));
  }

  deleteItem(id: ID): Observable<any> {
    const path = `fields/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.fieldStore.remove(id);
      },
      error: (error) => {
        this.fieldStore.setError(error);
      }
    }));
  }

  setActive(id: ID) {
    this.fieldStore.setActive(id);
  }
}
