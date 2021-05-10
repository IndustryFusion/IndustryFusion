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

import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { UserQuery } from './store/user/user.query';
import { User } from './store/user/user.model';
import { akitaDevtools } from '@datorama/akita';
import { enableAkitaProdMode } from '@datorama/akita';
import { environment } from '../environments/environment';
import { FactoryResolver } from './factory/services/factory-resolver.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loggedUser$: Observable<User>;
  factorySubTitle$: Observable<string>;

  constructor(private factoryResolver: FactoryResolver,
              private userQuery: UserQuery,
              private ngZone: NgZone) { }

  ngOnInit() {
    this.factorySubTitle$ = this.factoryResolver.factorySubTitle$;
    this.loggedUser$ = this.userQuery.selectActive();
    if (environment.production) {
      enableAkitaProdMode();
    } else {
      akitaDevtools(this.ngZone);
    }
  }

}
