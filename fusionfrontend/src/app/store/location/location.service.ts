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
import { Location } from './location.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { LocationStore } from './location.store';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private locationStore: LocationStore, private http: HttpClient) { }

  getLocations(companyId: ID): Observable<Location[]> {
    const path = `companies/${companyId}/locations`;
    return this.locationStore.cachedByParentId(companyId, this.http.get<Location[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.locationStore.upsertManyByParentIdCached(companyId, entities);
      })));
  }

  getLocation(companyId: ID, locationId: ID): Observable<Location> {
    const path = `companies/${companyId}/locations/${locationId}`;
    return this.locationStore.cachedById(locationId, this.http.get<Location>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.locationStore.upsertCached(entity);
      })));
  }

  setActive(locationId: ID) {
    this.locationStore.setActive(locationId);
  }
}
