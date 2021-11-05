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
import { Resolve } from '@angular/router';
import { RoomService } from '../store/room/room.service';
import { ID } from '@datorama/akita';
import { CompanyQuery } from '../store/company/company.query';

@Injectable({ providedIn: 'root' })
export class RoomResolver implements Resolve<void>{
  constructor(private companyQuery: CompanyQuery,
              private roomService: RoomService) { }

  resolve(): void { // using Observable will result in deadlock when called from routing module
    const companyId: ID = this.companyQuery.getActiveId();
    if (companyId) {
      this.roomService.getRoomsOfCompany(companyId).subscribe();
    } else {
      console.error('[room resolver]: company unknown');
    }
  }
}
