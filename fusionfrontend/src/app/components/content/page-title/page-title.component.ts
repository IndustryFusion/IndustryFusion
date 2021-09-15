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


import { Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent implements OnInit {

  @Input()
  title: string;

  menuItems: MenuItem[];
  private readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private injector: Injector) { }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.menuItems = this.createBreadcrumbs(this.activatedRoute.root));
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: MenuItem[] = []): MenuItem[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const breadcrumbData = child.snapshot.data[this.ROUTE_DATA_BREADCRUMB];
      const isQuery = typeof(breadcrumbData) === 'function';
      if (isQuery) {
        const query = this.injector.get(breadcrumbData);
        query.waitForActives()
          .subscribe((object: any) => {
            // Only add (last) active item matching with id at end of url to avoid concurrency issues
            const lastUrlParameter = url.split('/')[url.split('/').length - 1];
            if (String(object.id) === String(lastUrlParameter)) {
              breadcrumbs.push({ label: object.name, url });
            }
          });
      } else {
        const label = breadcrumbData;
        if (label) {
          breadcrumbs.push({ label, url });
        }
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }

}
