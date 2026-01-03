import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface GardenItem {
  icon: string;
  x: number;
  y: number;
  scale: number;
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

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/focus-sessions/with-emotions')
      .subscribe(sessions => {
        const items = sessions.map(s => ({
          icon: s.canceled === 0
            ? '/assets/illustrations/tree1.png'
            : '/assets/illustrations/dead-tree.png',
          x: 0,
          y: 0,
          scale: 0.9 + Math.random() * 0.2   // random size variation
        }));

        this.placeItems(items);
      });
  }

  placeItems(plants: GardenItem[]) {
    const areaWidth = 60;   // left 60%
    const areaTop = 30;     // 30% from top
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

      this.gardenItems.push(plant);
      index++;
    });
  }
}
