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
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class OispAlertService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private oispAlertStore: OispAlertStore,
              private keycloakService: KeycloakService,
              private http: HttpClient) { }

  getItems(): Observable<OispAlert[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/alerts`;
    return this.http.get<OispAlert[]>(url, this.httpOptions)
      .pipe(map(alerts => {
        alerts.forEach(alert => alert.id = alert.alertId);
        this.oispAlertStore.upsertMany(alerts);
        return alerts;
    }));
  }

  getItem(alertId: ID): Observable<OispAlert> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/alerts/${alertId}`;
    return this.http.get<OispAlert>(url, this.httpOptions)
      .pipe(map(alert => {
        alert.id = alert.alertId;
        this.oispAlertStore.upsert(alertId, alert);
        return alert;
      }));
  }

  closeAlert(alertId: ID): Observable<void> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/alerts/${alertId}/reset`;
    return this.http.put<void>(url, null, this.httpOptions).pipe(
      tap(() => {
        this.getItem(alertId).subscribe();
      })
    );
  }

  private getOispAccountId(): string {
    const token = (this.keycloakService.getKeycloakInstance().tokenParsed as any);
    let oispAccountId = '';

    if (token.accounts && token.accounts.length > 0) {
      oispAccountId = token.accounts[0].id;
    } else {
      console.warn('cannot retrieve OISP accountId, subsequent calls to OISP will hence most likely fail!');
    }

    return oispAccountId;
  }
}
