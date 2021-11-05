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

import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ID } from '@datorama/akita';

export class RouteHelpers {

  public static findParamInFullActivatedRoute(activatedRouteSnapshot: ActivatedRouteSnapshot, paramName: string): ID {
    let id = activatedRouteSnapshot.paramMap.get(paramName) as ID;
    while (id == null && activatedRouteSnapshot.parent != null) {
      activatedRouteSnapshot = activatedRouteSnapshot.parent;
      id = activatedRouteSnapshot.paramMap.get(paramName) as ID;
    }
    return id;
  }

  public static  getActiveRouteLastChild(activatedRoute: ActivatedRoute) {
    let route = activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }

  public static  getActiveRouteSecondLastChild(activatedRoute: ActivatedRoute) {
    let route = activatedRoute;
    let prevRoute = route;
    while (route.firstChild !== null) {
      prevRoute = route;
      route = route.firstChild;
    }
    return prevRoute;
  }

  public static isRouteActive(subroute: string, activatedRoute: ActivatedRoute): boolean {
    const snapshot = activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  public static matchRoutesAllowPostfix(route: string, urls: string[], urlPrefix: string = ''): boolean {
    return this.matchRoutes(route, urls, urlPrefix, true);
  }

  public static matchFullRoutes(route: string, urls: string[], urlPrefix: string = ''): boolean {
    return this.matchRoutes(route, urls, urlPrefix, false);
  }

  private static matchRoutes(route: string, urls: string[], urlPrefix: string, allowPostfix: boolean): boolean {
    let isMatching = false;
    if (route && urls) {
      for (const url of urls) {
        isMatching = isMatching || this.matchRoute(route, url, urlPrefix, allowPostfix);
      }
    }
    return isMatching;
  }


  public static matchRouteAllowPostfix(route: string, url: string, urlPrefix: string = ''): boolean {
    return this.matchRoute(route, url, urlPrefix, true);
  }

  public static matchFullRoute(route: string, url: string, urlPrefix: string = ''): boolean {
    return this.matchRoute(route, url, urlPrefix, false);
  }

  private static matchRoute(route: string, url: string, urlPrefix: string, allowPostfix: boolean): boolean {
    if (!route || !url) {
      console.warn('[route helpers]: invalid arguments for matching route');
      return false;
    }

    const optionalQueryParams = '(\\?[\\w\\W]*)?';
    const endSymbol = allowPostfix ? '' : '$';
    url = this.removeTrailingEndSymbol(url);
    return route.match(urlPrefix + url + optionalQueryParams + endSymbol) != null;
  }

  private static removeTrailingEndSymbol(url: string): string {
    if (url.endsWith('$')) {
      url = url.slice(0, url.length - 1);
    }
    return url;
  }
}
