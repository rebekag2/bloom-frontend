import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FlowerItem {
  icon: string;
  x: number;
  y: number;
  scale: number;
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
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions')
      .subscribe(sessions => {
        const plants = sessions.flatMap(session => {
          const list: FlowerItem[] = [];

          // BEFORE flower
          list.push({
            icon: this.mapEmotionToFlower(session.emotionBefore),
            x: 0,
            y: 0,
            scale: 0.9 + Math.random() * 0.2
          });

          // AFTER flower
          if (session.canceled === 0 && session.emotionAfter) {
            list.push({
              icon: this.mapEmotionToFlower(session.emotionAfter),
              x: 0,
              y: 0,
              scale: 0.9 + Math.random() * 0.2
            });
          }

          return list;
        });

        this.placeFlowers(plants);
      });
  }

  placeFlowers(plants: FlowerItem[]) {
    const areaWidth = 60;   // left 60%
    const areaTop = 30;     // same as trees
    const areaHeight = 60;  // 30%–90%

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

      this.flowers.push(plant);
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
