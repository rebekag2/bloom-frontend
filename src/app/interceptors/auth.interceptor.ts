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
      // attach Authorization header
      console.debug('[AuthInterceptor] Attaching Authorization header for', req.url);
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
    } else {
      console.debug('[AuthInterceptor] No access token available for', req.url);
    }

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          if (this.isAuthOrRefreshEndpoint(req.url)) {
            this.auth.clearTokens();
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          }
          return this.handle401Error(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private isAuthOrRefreshEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    // use includes to handle full URLs and base paths
    return url.includes('/auth/refresh') || url.includes('/users/login') || url.includes('/users/signup') || url.includes('/auth/logout');
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      console.debug('[AuthInterceptor] 401 detected, attempting refresh');
      return this.auth.refreshAccessToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          if (res && res.accessToken) {
            this.refreshSubject.next(res.accessToken);
            const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
            return next.handle(cloned);
          }
          this.auth.clearTokens();
          this.router.navigate(['/auth/login']);
          return throwError(() => new Error('Refresh failed'));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.auth.clearTokens();
          this.router.navigate(['/auth/login']);
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(cloned);
        })
      );
    }
  }
}
