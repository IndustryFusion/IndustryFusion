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

import { RestService } from 'src/app/services/rest.service';
import { Injectable } from '@angular/core';
import { QuantityType } from './quantity-type.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { QuantityTypeStore } from './quantity-type.store';


@Injectable({
  providedIn: 'root'
})
export class QuantityTypeService implements RestService<QuantityType> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private quantityStore: QuantityTypeStore, private http: HttpClient) { }

  getItems(): Observable<QuantityType[]> {
    const path = `quantitytypes`;
    return this.http.get<QuantityType[]>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
      .pipe(tap(entities => {
        this.quantityStore.upsertMany(entities);
      }));
  }

  getItem(id: ID): Observable<QuantityType> {
    const path = `quantitytypes/${id}`;
    return this.http.get<QuantityType>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, this.httpOptions)
      .pipe(tap(entity => {
        this.quantityStore.upsert(id, entity);
      }));
  }

  createItem(item: QuantityType): Observable<QuantityType> {
    const path = `quantitytypes`;
    return this.http.post<QuantityType>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.quantityStore.upsert(entity.id, entity);
        }));
  }

  editBaseUnit(id: ID, baseUnitId: ID): Observable<QuantityType> {
    const path = `quantitytypes/${id}`;
    const putPath = `${environment.apiUrlPrefix}/${path}?baseUnitId=${baseUnitId}`;
    return this.http.put<QuantityType>(putPath, this.httpOptions)
      .pipe(
        tap(entity => {
          this.quantityStore.upsert(id, entity);
        }));
  }

  editItem(id: ID, item: QuantityType): Observable<QuantityType> {
    const path = `quantitytypes/${id}`;
    return this.http.patch<QuantityType>(`${environment.apiUrlPrefix}/${path}?embedChildren=true`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.quantityStore.upsert(id, entity);
        }));
  }

  deleteItem(id: ID): Observable<any> {
    const path = `quantitytypes/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.quantityStore.remove(id);
      },
      error: (error) => {
        this.quantityStore.setError(error);
      }
    }));
  }

  setActive(id: ID) {
    this.quantityStore.setActive(id);
  }
}
