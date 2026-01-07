import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
  user?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/backend';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/users/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  signup(username: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/users/signup`,
      { username, email, password },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.clearTokens())
    );
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  refreshAccessToken(): Observable<{ accessToken: string } | null> {
    return this.http.post<{ accessToken: string }>(
      `${this.baseUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res?.accessToken) {
          this.accessToken = res.accessToken;
        }
      }),
      catchError(() => of(null))
    );
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserId(): number | null {
    const u = this.getUser();
    return u?.id ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  // ⭐ NEW METHODS
  requestPasswordReset(email: string) {
    return this.http.post(
      `${this.baseUrl}/auth/request-password-reset`,
      { email },
      { withCredentials: true }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(
      `${this.baseUrl}/auth/reset-password`,
      { token, newPassword },
      { withCredentials: true }
    );
  }
}
