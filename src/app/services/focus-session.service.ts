import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FocusSessionRequest {
  durationMinutes: number;
  emotionBeforeId: number;
}

export interface FocusSessionResponse {
  id: number;
  durationMinutes: number;
  emotionBeforeId: number;
  // add other fields your backend returns if needed
}

@Injectable({
  providedIn: 'root',
})
export class FocusSessionService {
  private baseUrl = '/backend';

  constructor(private http: HttpClient) {}

  startSession(body: FocusSessionRequest): Observable<FocusSessionResponse> {
    return this.http.post<FocusSessionResponse>(`${this.baseUrl}/focus-sessions/start`, body);
  }

  finishSession(id: number, body: { emotionAfterId: number }) {
    return this.http.patch(`${this.baseUrl}/focus-sessions/session/${id}/finish`, body);
  }

  cancelSession(id: number, body: { focusedMinutes: number }) {
    return this.http.patch(`${this.baseUrl}/focus-sessions/session/${id}/cancel`, body);
  }

}
