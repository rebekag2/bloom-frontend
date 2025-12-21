import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000'; // change if needed
  private accessToken: string | null = null; // keep in memory
  private readonly refreshKey = 'refreshToken';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/users/login`, {
      email,
      password,
    }).pipe(
      tap(res => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  signup(username: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/users/signup`, {
      username,
      email,
      password,
    }).pipe(
      tap(res => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  logout(): Observable<any> {
    // backend expects Authorization header; caller/interceptor will attach it
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearTokens())
    );
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    try {
      if (accessToken) {
        // keep for legacy usage; primary use is in-memory
        localStorage.setItem('accessToken', accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }

      if (refreshToken) {
        localStorage.setItem(this.refreshKey, refreshToken);
      }
    } catch (e) {
      console.warn('Could not persist tokens to localStorage', e);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    try {
      localStorage.removeItem(this.refreshKey);
      localStorage.removeItem('accessToken');
    } catch (e) {
      // ignore
    }
  }

  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  getStoredRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshKey);
    } catch (e) {
      return null;
    }
  }

  refreshAccessToken(): Observable<{ accessToken: string } | null> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return of(null);
    }
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(res => {
        if (res?.accessToken) {
          this.setTokens(res.accessToken, refreshToken);
        }
      })
    );
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Call protected GET /emotions endpoint. Interceptor will attach Authorization header.
   * Returns the raw observable so callers can subscribe and inspect results (useful for testing).
   */
  getEmotions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/emotions`);
  }
}
