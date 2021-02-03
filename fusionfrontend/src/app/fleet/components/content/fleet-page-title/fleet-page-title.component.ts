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

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-fleet-page-title',
  templateUrl: './fleet-page-title.component.html',
  styleUrls: ['./fleet-page-title.component.scss']
})
export class FleetPageTitleComponent implements OnInit {

  subtitle: string;

  constructor(private router: Router, private location: Location) { }

  ngOnInit() {
    this.resolveSubTitle(this.location.path());
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.resolveSubTitle(val.urlAfterRedirects);
      }
    });
  }

  resolveSubTitle(path: string) {
    if (path.match('\/(assettypes$|assetseries\/+)')) {
      this.subtitle = 'Asset Series';
    }
    if (path.match('\/(assettypetemplate$|assets\/+)')) {
      this.subtitle = 'Assets';
    }
  }

}
