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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-sub-header',
  templateUrl: './notifications-sub-header.component.html',
  styleUrls: ['./notifications-sub-header.component.scss']
})
export class NotificationsSubHeaderComponent implements OnInit, OnDestroy {

  private unSubscribe$ = new Subject<void>();

  route: string;

  constructor(private location: Location, private router: Router) { }

  ngOnInit() {
    this.checkUrl();
    this.router.events
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(() => {
        this.checkUrl();
      });
  }

  checkUrl(): void {
    if (this.location.path() !== '') {
      this.route = this.location.path();
    } else {
      this.route = '/';
    }
  }

  isOpenActive = () => {
    return this.route && this.route.match('^\/notifications\/open+$');
  }

  isClearedActive = () => {
    return this.route && this.route.match('^\/notifications\/cleared+$');
  }

  onOpenClick() {
    return this.router.navigate(['/notifications/open']);
  }

  onClearedClick() {
    return this.router.navigate(['/notifications/cleared']);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
