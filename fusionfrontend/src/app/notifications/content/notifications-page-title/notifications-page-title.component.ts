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
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-notifications-page-title',
  templateUrl: './notifications-page-title.component.html',
  styleUrls: ['./notifications-page-title.component.scss']
})
export class NotificationsPageTitleComponent implements OnInit {

  notificationsSubTitle: string;

  constructor(private router: Router, private location: Location) { }

  ngOnInit(): void {
    this.resolveSubTitle(this.location.path());
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.resolveSubTitle(val.urlAfterRedirects);
      }
    });
  }

  resolveSubTitle(path: string) {
    if (path.match('^\/notifications\/open+$')) {
      this.notificationsSubTitle = 'Open Notifications';
    }
    else if (path.match('^\/notifications\/cleared+$')) {
      this.notificationsSubTitle = 'Cleared Notifications';
 }
  }

}
