import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FlowerItem {
  icon: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-mood-garden',
  standalone: false,
  templateUrl: './mood-garden.component.html',
  styleUrls: ['./mood-garden.component.scss']
})
export class MoodGardenComponent implements OnInit {

  flowers: FlowerItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFlowers();
  }

  loadFlowers() {
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions').subscribe(sessions => {
      const items: FlowerItem[] = [];

      sessions.forEach(session => {
        const before = session.emotionBefore;
        const after = session.emotionAfter;

        // 🌸 Always add the BEFORE flower
        items.push({
          icon: this.mapEmotionToFlower(before),
          x: this.randomPosition(20, 80),
          y: this.randomPosition(20, 80)
        });

        // 🌸 Add AFTER flower only if session completed
        if (session.canceled === 0 && after) {
          items.push({
            icon: this.mapEmotionToFlower(after),
            x: this.randomPosition(20, 80),
            y: this.randomPosition(20, 80)
          });
        }
      });

      this.flowers = items;
    });
  }

  mapEmotionToFlower(emotion: string): string {
    switch (emotion) {
      case 'Motivat': return '🌼';   // yellow
      case 'Fericit': return '🌻';   // sunflower
      case 'Neutru': return '🌸';    // pink
      case 'Obosit': return '🪻';    // purple
      case 'Trist': return '🌷';     // sad pink
      case 'Anxios': return '🌺';    // red
      default: return '🌸';
    }
  }

  randomPosition(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
