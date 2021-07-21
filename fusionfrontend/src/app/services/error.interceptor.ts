import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private prevErrorSummary = '';
  private prevErrorTime = new Date('1.1.2000').getTime();

  constructor(private messageService: MessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        const errorSummary = `Error: ${error.error?.message ? error.error.message : error.message}`;
        const errorMessage = error.error?.error ? `${error.error?.error} (${error.error?.status})` : error.statusText;

        const secondsToPrevError = Math.abs((new Date().getTime() - this.prevErrorTime) / 1000);
        if (errorSummary !== this.prevErrorSummary || secondsToPrevError > 5) {
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
