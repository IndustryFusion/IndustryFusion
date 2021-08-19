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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { BaseQueryEntity } from '../basequery';
import { Room } from './room.model';
import { RoomState, RoomStore } from './room.store';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoomQuery extends BaseQueryEntity<RoomState, Room> {
  constructor(protected store: RoomStore) {
    super(store);
  }

  selectRoomsOfFactorySite(factorySiteId: ID): Observable<Room[]> {
    return this.selectAll({
      filterBy: entity => String(entity.factorySiteId) === String(factorySiteId)
    });
  }

  selectRoomsOfCompany(companyId: ID): Observable<Room[]> {
    return this.selectAll().pipe(map(rooms => {
      return rooms.filter(room => String(room.factorySite.companyId) === String(companyId));
    }));
  }
}
