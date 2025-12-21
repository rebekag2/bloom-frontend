import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSettings(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/${userId}`);
  }

  updateSettings(userId: number, body: any): Observable<any> {
    console.log("body:", body);
    return this.http.put<any>(`${this.baseUrl}/settings/${userId}`, body);
  }
}
