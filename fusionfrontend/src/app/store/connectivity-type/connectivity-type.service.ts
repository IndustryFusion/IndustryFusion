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
import { ConnectivityType } from './connectivity-type.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConnectivityTypeStore } from './connectivity-type.store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityTypeService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private connectivityTypeStore: ConnectivityTypeStore,
              private http: HttpClient) { }

  getItems(): Observable<ConnectivityType[]> {
    const path = `connectivity-types`;
    return this.http.get<ConnectivityType[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.connectivityTypeStore.upsertMany(entities);
      }));
  }
}
