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
    new RegExp('^' + this.ensureTrailingSlash(environment.oispApiUrlPrefix)),
    new RegExp('^' + this.ensureTrailingSlash(window.location.origin + this.location.prepareExternalUrl(environment.apiUrlPrefix))),
    new RegExp('^' + this.ensureTrailingSlash(this.location.prepareExternalUrl(environment.apiUrlPrefix))),
    new RegExp('^' + this.ensureTrailingSlash(environment.apiUrlPrefix))
  ];

  constructor(
    private keycloak: KeycloakService,
    protected readonly location: Location
  ) { }

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

  private ensureTrailingSlash(str: string) {
    return str + (str.endsWith('/') ? '' : '/');
  }
}
