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

import { RestService } from 'src/app/core/services/api/rest.service';
import { Injectable } from '@angular/core';
import { Threshold } from './threshold.model';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { ThresholdStore } from './threshold.store';


@Injectable({
  providedIn: 'root'
})
export class ThresholdService implements RestService<Threshold> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private thresholdStore: ThresholdStore) {
  }

  getItems(): Observable<Threshold[]> {
    throw new Error('Not applicable');
  }

  getItem(_: ID): Observable<Threshold> {
    throw new Error('Not applicable');
  }

  createItem(_: Threshold): Observable<Threshold> {
    throw new Error('Not applicable');
  }

  editItem(_: ID, __: Threshold): Observable<Threshold> {
    throw new Error('Not applicable');
  }

  deleteItem(_: ID): Observable<any> {
    throw new Error('Not applicable');
  }

  setActive(id: ID) {
    this.thresholdStore.setActive(id);
  }
}
