import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  ERROR_TOAST_DURATION = 500000;

  constructor(private messageService: MessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        console.warn(error);
        const errorMessage = error.error?.error ? `${error.error?.error} (${error.error?.status})` : error.statusText;
        const errorSummary = error.error?.message ? error.error.message : error.message;
        this.messageService.add(({
          severity: 'info',
          summary: errorSummary,
          detail: errorMessage,
          life: this.ERROR_TOAST_DURATION
        }));
        return throwError(error.message);
      })
    );
  }
}
