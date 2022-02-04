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


import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, take } from 'rxjs/operators';
import { BaseSubtitleQuery } from '../../../../core/store/basesubtitlequery.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent implements OnInit, OnDestroy {

  @Input()
  title: string;
  menuItems: MenuItem[];

  private readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';
  private routerSubscription = Subscription.EMPTY;

  private breadcrumbItems: MenuItem[];
  private finishedQueries = 0;
  private pendingQueries = 0;
  private queriesFinished$ = new BehaviorSubject<boolean>(false);
  private isRouteProcessed = false;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private injector: Injector,
              private translate: TranslateService) {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetQueryCounts();
        this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
        this.isRouteProcessed = true;
        this.fireFinishedIfProcessedAnNoPendingQueries();
      });
  }

  private resetQueryCounts() {
    this.finishedQueries = 0;
    this.pendingQueries = 0;
    this.isRouteProcessed = false;
  }

  private addLabelIfExisting(breadcrumbData: any, url: string, breadcrumbs: MenuItem[]): MenuItem[] {
    let label;
    if (breadcrumbData) {
      label = this.translate.instant(breadcrumbData);
    }
    if (label) {
      breadcrumbs.push({ label, routerLink: url.substr(1).split('/')  });
    }
    return breadcrumbs;
  }

  ngOnInit(): void {
    this.alwaysUpdateMenuItemsAfterPendingQueriesFinished();
  }

  private alwaysUpdateMenuItemsAfterPendingQueriesFinished(): void {
    this.queriesFinished$.subscribe(isFinished => {
      if (isFinished) {
        this.menuItems = this.breadcrumbItems.slice();
      }
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: MenuItem[] = []): MenuItem[] {
    const firstChild: ActivatedRoute = route.firstChild;
    if (firstChild == null) {
      return breadcrumbs;
    }

    const routeURL: string = firstChild.snapshot.url.map(segment => segment.path).join('/');
    if (routeURL !== '') {
      url += `/${routeURL}`;
    }

    const breadcrumbData = firstChild.snapshot.data[this.ROUTE_DATA_BREADCRUMB];
    const isQuery = typeof(breadcrumbData) === 'function';
    if (isQuery) {
      breadcrumbs = this.addQueryResult(breadcrumbData, url, breadcrumbs);
    } else {
      breadcrumbs = this.addLabelIfExisting(breadcrumbData, url, breadcrumbs);
    }

    return this.createBreadcrumbs(firstChild, url, breadcrumbs);
  }

  private addQueryResult(breadcrumbData: any, url: string, breadcrumbs: MenuItem[]): MenuItem[]  {
    const query = this.injector.get(breadcrumbData);
    const subtitleQuery: BaseSubtitleQuery<typeof query> = this.injector.get(breadcrumbData);
    this.pendingQueries++;
    subtitleQuery.waitForActive()
      .subscribe((object: any) => {
        breadcrumbs = this.upsertLabel(object, query, url, subtitleQuery, breadcrumbs);
      });
    return breadcrumbs;
  }

  private upsertLabel(object: any, query: any, url: string,
                      subtitleQuery: BaseSubtitleQuery<typeof query>,
                      breadcrumbs: MenuItem[]): MenuItem[] {

    const routerLink = url.substr(1).split('/');
    subtitleQuery.selectSubtitleName(object).pipe(take(1)).subscribe(name => {
      if (breadcrumbs.findIndex(x => x.routerLink === routerLink) !== -1) {
        breadcrumbs[breadcrumbs.findIndex(x => x.routerLink === routerLink)].label = name;
        this.breadcrumbItems = breadcrumbs;
        this.fireFinishedIfProcessedAnNoPendingQueries();
      } else {
        breadcrumbs.push({ label: name, routerLink });
      }
    });

    this.finishedQueries++;
    this.fireFinishedIfProcessedAnNoPendingQueries();
    return breadcrumbs;
  }

  private fireFinishedIfProcessedAnNoPendingQueries(): void {
    if (this.isRouteProcessed && this.finishedQueries === this.pendingQueries) {
      this.preventMultipleFinishedCalls();
      this.queriesFinished$.next(true);
    }
  }

  private preventMultipleFinishedCalls(): void {
    this.finishedQueries = 0;
    this.pendingQueries = -1;
  }

  ngOnDestroy() {
    this.queriesFinished$.complete();
    this.routerSubscription.unsubscribe();
  }
}
