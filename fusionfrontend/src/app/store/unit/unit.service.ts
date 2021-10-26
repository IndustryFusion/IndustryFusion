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

import { RestService } from 'src/app/services/api/rest.service';
import { Injectable } from '@angular/core';
import { Unit } from './unit.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { UnitStore } from './unit.store';


@Injectable({
  providedIn: 'root'
})
export class UnitService implements RestService<Unit> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private unitStore: UnitStore, private http: HttpClient) {
  }

  getItems(): Observable<Unit[]> {
    const path = `units`;
    return this.http.get<Unit[]>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
      .pipe(tap(entities => {
        this.unitStore.upsertMany(entities);
      }));
  }

  getItem(id: ID): Observable<Unit> {
    const path = `units/${id}`;
    return this.http.get<Unit>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
      .pipe(tap(entity => {
        this.unitStore.upsert(id, entity);
      }));
  }

  createItem(_: Unit): Observable<Unit> {
    throw new Error('Not applicable');
  }

  editItem(_: ID, __: Unit): Observable<Unit> {
    throw new Error('Not applicable');
  }

  deleteItem(_: ID): Observable<any> {
    throw new Error('Not applicable');
  }

  getUnits(quantityTypeId: ID): Observable<Unit[]> {
    const path = `quantitytypes/${quantityTypeId}/units`;
    return this.http.get<Unit[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.unitStore.upsertMany(entities);
      }));
  }

  getUnit(quantityTypeId: ID, id: ID): Observable<Unit> {
    const path = `quantitytypes/${quantityTypeId}/units/${id}`;
    return this.http.get<Unit>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.unitStore.upsert(id, entity);
      }));
  }

  createUnit(quantityTypeId: ID, item: Unit): Observable<Unit> {
    const path = `quantitytypes/${quantityTypeId}/units`;
    return this.http.post<Unit>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.unitStore.upsert(entity.id, entity);
        }));
  }

  editUnit(quantityTypeId: ID, id: ID, item: Unit): Observable<Unit> {
    const path = `quantitytypes/${quantityTypeId}/units/${id}`;
    return this.http.patch<Unit>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.unitStore.upsert(id, entity);
        }));
  }

  deleteUnit(quantityTypeId: ID, id: ID): Observable<any> {
    const path = `quantitytypes/${quantityTypeId}/units/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.unitStore.remove(id);
      },
      error: (error) => {
        this.unitStore.setError(error);
      }
    }));
  }

  setActive(id: ID) {
    this.unitStore.setActive(id);
  }
}
