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
import { OispAlert } from './oisp-alert.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { OispAlertStore } from './oisp-alert.store';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { UserManagementService } from '../../../services/api/user-management.service';

@Injectable({
  providedIn: 'root'
})
export class OispAlertService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispAlertStore: OispAlertStore,
              private userManagementService: UserManagementService,
              private http: HttpClient) { }

  getItems(): Observable<OispAlert[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.userManagementService.getOispAccountId()}/alerts`;
    return this.http.get<OispAlert[]>(url, { observe: 'response' })
      .pipe(map(response => {
        if (response.status !== 304) {
          this.oispAlertStore.upsertMany(response.body);
        }
        return response.body;
    }));
  }

  getItem(alertId: ID): Observable<OispAlert> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.userManagementService.getOispAccountId()}/alerts/${alertId}`;
    return this.http.get<OispAlert>(url, this.httpOptions)
      .pipe(map(alert => {
        this.oispAlertStore.upsert(alertId, alert);
        return alert;
      }));
  }

  closeAlert(alertId: ID): Observable<void> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.userManagementService.getOispAccountId()}/alerts/${alertId}/reset`;
    return this.http.put<void>(url, null, this.httpOptions).pipe(
      tap(() => {
        this.getItem(alertId).subscribe();
      })
    );
  }
}
