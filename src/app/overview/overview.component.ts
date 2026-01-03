import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface GardenItem {
  icon: string;
  x: number;
  y: number;
  type: 'tree' | 'flower';
  scale: number;
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
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions')
      .subscribe(sessions => {
        const items: GardenItem[] = [];

        sessions.forEach(session => {
          const isCompleted = session.canceled === 0;

          // TREE
          items.push({
            icon: isCompleted
              ? '/assets/illustrations/tree1.png'
              : '/assets/illustrations/dead-tree.png',
            x: 0,
            y: 0,
            type: 'tree',
            scale: 0.9 + Math.random() * 0.2
          });

          // BEFORE FLOWER
          items.push({
            icon: this.mapEmotionToFlower(session.emotionBefore),
            x: 0,
            y: 0,
            type: 'flower',
            scale: 0.9 + Math.random() * 0.2
          });

          // AFTER FLOWER
          if (isCompleted && session.emotionAfter) {
            items.push({
              icon: this.mapEmotionToFlower(session.emotionAfter),
              x: 0,
              y: 0,
              type: 'flower',
              scale: 0.9 + Math.random() * 0.2
            });
          }
        });

        this.placeItems(items);
      });
  }

  placeItems(plants: GardenItem[]) {
    const areaWidth = 60;
    const areaTop = 30;
    const areaHeight = 60;

    const count = plants.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const cellWidth = areaWidth / cols;
    const cellHeight = areaHeight / rows;

    let index = 0;

    plants.forEach(plant => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      let x = col * cellWidth + cellWidth / 2;
      let y = areaTop + row * cellHeight + cellHeight / 2;

      x += (Math.random() - 0.5) * (cellWidth * 0.4);
      y += (Math.random() - 0.5) * (cellHeight * 0.4);

      plant.x = x;
      plant.y = y;

      this.items.push(plant);
      index++;
    });
  }

  mapEmotionToFlower(emotion: string): string {
    switch (emotion) {
      case 'Motivat': return '/assets/flowers/motivat.png';
      case 'Fericit': return '/assets/flowers/fericit.png';
      case 'Neutru': return '/assets/flowers/neutru.png';
      case 'Obosit': return '/assets/flowers/obosit.png';
      case 'Trist': return '/assets/flowers/trist.png';
      case 'Anxios': return '/assets/flowers/anxios.png';
      default: return '/assets/flowers/neutru.png';
    }
  }
}
