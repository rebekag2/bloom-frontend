import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Emotion {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class EmotionService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getEmotions(): Observable<Emotion[]> {
    return this.http.get<Emotion[]>(`${this.baseUrl}/emotions`);
  }
}
