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

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Location } from '@angular/common';

import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

/**
 * This interceptor includes the bearer token into whitelisted URLs
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private bearerUrlWhitelist: RegExp[] = [
    new RegExp('^' + TokenInterceptor.ensureTrailingSlash(environment.kairosApiUrlPrefix)),
    new RegExp('^' + TokenInterceptor.ensureTrailingSlash(window.location.origin +
      this.location.prepareExternalUrl(environment.apiUrlPrefix))),
    new RegExp('^' + TokenInterceptor.ensureTrailingSlash(this.location.prepareExternalUrl(environment.apiUrlPrefix))),
    new RegExp('^' + TokenInterceptor.ensureTrailingSlash(environment.apiUrlPrefix)),
    new RegExp('^' + TokenInterceptor.ensureTrailingSlash(environment.ngsiLdBrokerUrl))
  ];

  constructor(private keycloak: KeycloakService,
              protected readonly location: Location) {

  }

  public static ensureTrailingSlash(str: string) {
    return str + (str.endsWith('/') ? '' : '/');
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const includeBearerToken: boolean =
      this.bearerUrlWhitelist.findIndex(item => item.test(req.url)) > -1;
    if (!includeBearerToken) {
      return next.handle(req);
    }

    return from(this.keycloak.isLoggedIn()).pipe(
      mergeMap(loggedIn => {
        if (loggedIn) {
          return this.handleRequestWithTokenHeader(req, next);
        } else {
          return next.handle(req);
        }
      }
    ));
  }

  private handleRequestWithTokenHeader(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.keycloak.addTokenToHeader(req.headers).pipe(
      mergeMap(headersWithBearer => {
        const kcReq = req.clone({ headers: headersWithBearer });
        return next.handle(kcReq);
      })
    );
  }
}
