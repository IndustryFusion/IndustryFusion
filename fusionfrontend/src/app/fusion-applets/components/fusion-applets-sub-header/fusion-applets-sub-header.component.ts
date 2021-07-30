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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-fusion-applet-sub-header',
  templateUrl: './fusion-applets-sub-header.component.html',
  styleUrls: ['./fusion-applets-sub-header.component.scss']
})
export class FusionAppletsSubHeaderComponent implements OnInit, OnDestroy {
  private unSubscribe$ = new Subject<void>();

  route: string;
  sub: Subscription;

  constructor(
    private router: Router,
    public activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  onRouteClick(subroute: string): Promise<boolean> {
    return this.router.navigate(['..', subroute], { relativeTo: this.getActiveRouteLastChild()});
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.getActiveRouteLastChild().snapshot;
    return snapshot.url.map(sement => sement.path).includes(subroute);
  }

  private getActiveRouteLastChild() {
    let route = this.activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }
}