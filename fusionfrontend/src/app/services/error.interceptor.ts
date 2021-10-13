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
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private prevErrorSummary = '';
  private prevErrorTime = new Date('1.1.2000').getTime();
  private readonly SECONDS_OF_HIDING_SAME_ERROR = 60;

  constructor(private messageService: MessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        const errorSummary = `Error: ${error.error?.message ? error.error.message : error.message}`;
        const errorMessage = error.error?.error ? `${error.error?.error} (${error.error?.status})` : error.statusText;

        const secondsToPrevError = Math.abs((new Date().getTime() - this.prevErrorTime) / 1000);
        if (errorSummary !== this.prevErrorSummary || secondsToPrevError > this.SECONDS_OF_HIDING_SAME_ERROR) {
          this.messageService.add(({
            severity: 'info',
            summary: errorSummary,
            detail: errorMessage,
            sticky: true,
          }));

          this.prevErrorSummary = errorSummary;
          this.prevErrorTime = Date.now();
        }

        return throwError(error.message);
      })
    );
  }
}
