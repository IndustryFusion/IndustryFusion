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
import { AlertaAlert, AlertaResponse } from './alerta-alert.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AlertaAlertStore } from './alerta-alert.store';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
// see https://docs.alerta.io/api/reference.html#set-alert-status
export class AlertaAlertService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: 'Key ' + environment.alertaApiKey }),
    params: new HttpParams()
  };

  constructor(private alertaAlertStore: AlertaAlertStore,
              private http: HttpClient) { }

  getItems(): Observable<AlertaAlert[]> {
    const url = `${environment.alertaApiUrlPrefix}/alerts`;
    return this.http.get<AlertaResponse>(url, this.httpOptions)
      .pipe(map(response => {
        if (response.status === 'ok') {
          this.alertaAlertStore.upsertMany(response.alerts);
        }
        return response.alerts;
      }));
  }

  getItem(alertId: ID): Observable<AlertaAlert> {
    const url = `${environment.alertaApiUrlPrefix}/alert/${alertId}`;
    return this.http.get<AlertaResponse>(url, this.httpOptions)
      .pipe(map(response => {
        if (response.status === 'ok') {
          this.alertaAlertStore.upsert(alertId, response.alert);
        }
        return response.alert;
      }));
  }

  closeAlert(alertId: ID): Observable<void> {
    const url = `${environment.alertaApiUrlPrefix}/alert/${alertId}/status`;
    const body = {
      status: 'closed',
      text: 'closed by user'
    };
    return this.http.put<void>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getItem(alertId).subscribe();
      })
    );
  }
}
