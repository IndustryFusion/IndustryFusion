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
import { Metric } from './metric.model';
import { MetricStore } from './metric.store';


@Injectable({
  providedIn: 'root'
})
export class MetricService implements RestService<Metric> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private metricStore: MetricStore, private http: HttpClient) { }

  getItems(): Observable<Metric[]> {
    const path = `fields`;
    return this.http.get<Metric[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.metricStore.upsertMany(entities);
      }));
  }

  getItem(id: ID): Observable<Metric> {
    const path = `fields/${id}`;
    return this.http.get<Metric>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.metricStore.upsert(id, entity);
      }));
  }

  createItem(item: Metric): Observable<Metric> {
    const path = `fields`;
    return this.http.post<Metric>(`${environment.apiUrlPrefix}/${path}`, item,
      { params: item.unitId ? { unitId: `${item.unitId}` } : undefined, ...this.httpOptions })
      .pipe(
        tap({
          next: (entity) => {
            this.metricStore.upsert(entity.id, entity);
          },
          error: (error) => {
            this.metricStore.setError(error);
          }
        }));
  }

  editItem(id: ID, item: Metric): Observable<Metric> {
    const path = `fields/${id}`;
    return this.http.patch<Metric>(`${environment.apiUrlPrefix}/${path}`, item, this.httpOptions)
      .pipe(
        tap(entity => {
          this.metricStore.upsert(id, entity);
        }));
  }

  deleteItem(id: ID): Observable<any> {
    const path = `fields/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.metricStore.remove(id);
      },
      error: (error) => {
        this.metricStore.setError(error);
      }
    }));
  }

  setActive(id: ID) {
    this.metricStore.setActive(id);
  }
}
