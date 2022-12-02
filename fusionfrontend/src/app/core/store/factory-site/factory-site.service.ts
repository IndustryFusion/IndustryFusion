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
import { FactorySite } from './factory-site.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { FactorySiteStore } from './factory-site.store';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FactorySiteService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private factorySiteStore: FactorySiteStore, private http: HttpClient) { }

  /**
   * Caution: Completes observable directly (no next-call) if data exist in cache.
   * @param companyId Id of the company
   */
  getFactorySites(companyId: ID): Observable<FactorySite[]> {
    const path = `companies/${companyId}/factorysites`;
    return this.factorySiteStore.cachedByParentId(companyId,
      this.http.get<FactorySite[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.factorySiteStore.upsertManyByParentIdCached(companyId, entities);
      })));
  }

  /**
   * Caution: Completes observable directly (no next-call) if data exist in cache.
   */
  getFactorySite(companyId: ID, factorySiteId: ID): Observable<FactorySite> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}`;
    return this.factorySiteStore.cachedById(factorySiteId,
      this.http.get<FactorySite>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.factorySiteStore.upsertCached(entity);
      })));
  }

  createFactorySite(factorySite: FactorySite): Observable<FactorySite> {
    const path = `companies/${factorySite.companyId}/factorysites`;
    return this.http.post<FactorySite>(`${environment.apiUrlPrefix}/${path}`, factorySite, this.httpOptions)
      .pipe(tap(entity => {
        this.factorySiteStore.upsertCached(entity);
      }));
  }

  updateFactorySite(factorySite: FactorySite): Observable<FactorySite> {
    const path = `companies/${factorySite.companyId}/factorysites/${factorySite.id}`;
    return this.http.patch<FactorySite>(`${environment.apiUrlPrefix}/${path}`, factorySite, this.httpOptions)
      .pipe(tap(entity => {
        this.factorySiteStore.upsertCached(entity);
      }));
  }

  setActive(factorySiteId: ID) {
    this.factorySiteStore.setActive(factorySiteId);
  }
}
