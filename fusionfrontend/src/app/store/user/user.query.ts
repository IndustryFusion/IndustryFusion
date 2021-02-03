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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseQueryEntity } from '../basequery';
import { User } from './user.model';
import { UserState, UserStore } from './user.store';

@Injectable({ providedIn: 'root' })
export class UserQuery extends BaseQueryEntity<UserState, User> {
  constructor(protected store: UserStore) {
    super(store);
  }

  isLoggedIn(): Observable<boolean> {
    return this.selectActiveId().pipe(map(activeId => activeId !== null));
  }
}
