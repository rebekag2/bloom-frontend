import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface GardenItem {
  icon: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-focus-garden',
  standalone: false,
  templateUrl: './focus-garden.component.html',
  styleUrls: ['./focus-garden.component.scss']
})
export class FocusGardenComponent implements OnInit {
  gardenItems: GardenItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGarden();
  }

  loadGarden() {
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions').subscribe(sessions => {
      this.gardenItems = sessions.map((session, index) => {
        const isCompleted = session.canceled === 0;

        return {
          icon: isCompleted ? '🌳' : '🌱',
          x: this.randomPosition(20, 80),
          y: this.randomPosition(20, 80)
        };
      });
    });
  }

  randomPosition(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
