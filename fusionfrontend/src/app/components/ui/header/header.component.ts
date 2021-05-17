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

import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/store/user/user.model';
import { ManagerType } from '../../content/manager-type/manager-type.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unSubscribe$ = new Subject<void>();

  @Input()
  factorySubTitle: string;

  @Input()
  ecoSystemManagerSubTitle: string;

  @Input()
  user: User;

  route: string;

  show: boolean;

  ManagerType = ManagerType;

  constructor(private location: Location,
              private router: Router) { }

  ngOnInit() {
    this.show = true;
    this.router.events
    .pipe(
      takeUntil(this.unSubscribe$)
    ).subscribe(() => {
      if (this.location.path() !== '') {
        this.route = this.location.path();
      } else {
        this.route = '/';
      }
    });
  }

  isManager(manager: ManagerType) {
    return this.route && this.route.match(`\/${manager}\/`);
  }

  isDashboards() {
    return this.route && this.route.match(`\/${'dashboards'}\/`);
  }

  isHome() {
    return this.route && this.route.match('/home');
  }

  onHomeClick() {
    return this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
