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
import { HttpHeaders } from '@angular/common/http';
import { ID } from '@datorama/akita';
import { UserStore } from './user.store';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(private userStore: UserStore) {
  }

  login(user: string, password: string): Observable<boolean> {
    if (user === 'admin' && password === 'admin') {
      this.userStore.add({ id: 123, name: '', email: ''});
      this.userStore.setActive(123);
      return  of(true);
    }
    return of(false);
  }

  setActive(userId: ID) {
    this.userStore.setActive(userId);
  }
}
