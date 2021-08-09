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
  selector: 'app-fusion-applet-page-title',
  templateUrl: './fusion-applet-page-title.component.html',
  styleUrls: ['./fusion-applet-page-title.component.scss']
})
export class FusionAppletPageTitleComponent implements OnInit {

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
    if (path.match('^\\/fusion-applets\/overview')) {
      this.subtitle = 'Applet Overview';
    }
    if (path.match('^\\/fusion-applets\/archiv')) {
      this.subtitle = 'Applet Archive';
    }
    if (path.match('^\\/fusion-applets\\/.*\\/detail')) {
      this.subtitle = 'Applet Detail';
    }
    if (path.match('^\\/fusion-applets\\/.*\\/editor')) {
      this.subtitle = 'Applet Editor';
    }
  }

}