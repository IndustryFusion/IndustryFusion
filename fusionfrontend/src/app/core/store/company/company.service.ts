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
import { Company } from './company.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { CompanyStore } from './company.store';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private companyStore: CompanyStore, private http: HttpClient) { }

  getCompanies(): Observable<Company[]> {
    const path = `companies`;
    return this.companyStore.cachedByParentId('root', this.http.get<Company[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.companyStore.setByParentIdCached('root', entities);
      })));
  }

  getCompany(companyId: ID): Observable<Company> {
    const path = `companies/${companyId}`;
    return this.companyStore.cachedById(companyId, this.http.get<Company>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.companyStore.upsertCached(entity);
      })));
  }

  setActive(companyId: ID) {
    this.companyStore.setActive(companyId);
  }
}
