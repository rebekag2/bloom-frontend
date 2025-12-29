import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface GardenItem {
  icon: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-overview',
  standalone: false,  
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  items: GardenItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOverviewGarden();
  }

  loadOverviewGarden() {
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions').subscribe(sessions => {
      const merged: GardenItem[] = [];

      sessions.forEach(session => {
        const isCompleted = session.canceled === 0;

        // 🌳 TREE or 🌱 SPROUT
        merged.push({
          icon: isCompleted ? '🌳' : '🌱',
          x: this.randomPosition(20, 80),
          y: this.randomPosition(20, 80)
        });

        // 🌸 BEFORE FLOWER
        merged.push({
          icon: this.mapEmotionToFlower(session.emotionBefore),
          x: this.randomPosition(20, 80),
          y: this.randomPosition(20, 80)
        });

        // 🌸 AFTER FLOWER (only if completed)
        if (isCompleted && session.emotionAfter) {
          merged.push({
            icon: this.mapEmotionToFlower(session.emotionAfter),
            x: this.randomPosition(20, 80),
            y: this.randomPosition(20, 80)
          });
        }
      });

      this.items = merged;
    });
  }

  mapEmotionToFlower(emotion: string): string {
    switch (emotion) {
      case 'Motivat': return '🌼';
      case 'Fericit': return '🌻';
      case 'Neutru': return '🌸';
      case 'Obosit': return '🪻';
      case 'Trist': return '🌷';
      case 'Anxios': return '🌺';
      default: return '🌸';
    }
  }

  randomPosition(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
