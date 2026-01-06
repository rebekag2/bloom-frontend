import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.auth.getAccessToken();
    let authReq = req;

    if (accessToken) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
    }

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {

          // Do NOT refresh for login/signup/refresh/logout
          if (this.isAuthOrRefreshEndpoint(req.url)) {
            this.auth.clearTokens();
            return of(err as any); // 🔥 prevent redirect + prevent error spam
          }

          return this.handle401Error(authReq, next);
        }

        return throwError(() => err);
      })
    );
  }

  private isAuthOrRefreshEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    return (
      url.includes('/auth/refresh') ||
      url.includes('/users/login') ||
      url.includes('/users/signup') ||
      url.includes('/auth/logout')
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshAccessToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;

          // 🔥 If refresh returned null → user is logged out
          if (!res || !res.accessToken) {
            this.auth.clearTokens();
            return of(null as any); // 🔥 do NOT throw, do NOT redirect
          }

          // Refresh succeeded → retry original request
          this.refreshSubject.next(res.accessToken);
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
          return next.handle(cloned);
        }),

        catchError(err => {
          this.isRefreshing = false;
          this.auth.clearTokens();
          return of(null as any); // 🔥 silent fail
        })
      );
    }

    // If refresh is already happening → wait for it
    return this.refreshSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(cloned);
      })
    );
  }
}
