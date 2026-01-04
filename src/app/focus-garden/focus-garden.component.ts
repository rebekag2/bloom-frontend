import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

interface SessionWithEmotions {
  id: number;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  canceled: number;
  emotionBefore: string | null;
  emotionAfter: string | null;
}

interface GardenItem {
  icon: string;
  x: number;
  y: number;
  scale: number;
}

type ViewMode = 'week' | 'month' | 'year';

@Component({
  selector: 'app-focus-garden',
  standalone: false,
  templateUrl: './focus-garden.component.html',
  styleUrls: ['./focus-garden.component.scss']
})
export class FocusGardenComponent implements OnInit, AfterViewInit, OnDestroy {

  allSessions: SessionWithEmotions[] = [];
  filteredSessions: SessionWithEmotions[] = [];
  gardenItems: GardenItem[] = [];

  mode: ViewMode = 'week';
  currentDate: Date = new Date();

  totalMinutes = 0;
  totalSessions = 0;
  completedSessions = 0;

  private chart: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<SessionWithEmotions[]>('http://localhost:3000/focus-sessions/with-emotions')
      .subscribe(sessions => {
        this.allSessions = sessions;
        this.updateView();
      });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // --- VIEW MODE ---

  setMode(mode: ViewMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.currentDate = new Date();
    this.updateView();
  }

  prevInterval() {
    if (this.mode === 'week') {
      this.currentDate = this.addDays(this.currentDate, -7);
    } else if (this.mode === 'month') {
      this.currentDate = this.addMonths(this.currentDate, -1);
    } else {
      this.currentDate = this.addYears(this.currentDate, -1);
    }
    this.updateView();
  }

  nextInterval() {
    if (this.mode === 'week') {
      this.currentDate = this.addDays(this.currentDate, 7);
    } else if (this.mode === 'month') {
      this.currentDate = this.addMonths(this.currentDate, 1);
    } else {
      this.currentDate = this.addYears(this.currentDate, 1);
    }
    this.updateView();
  }

  get intervalLabel(): string {
    if (this.mode === 'week') {
      const { start, end } = this.getWeekRange(this.currentDate);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    } else if (this.mode === 'month') {
      return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      return this.currentDate.getFullYear().toString();
    }
  }

  // --- CORE UPDATE ---

  private updateView() {
    const { start, end } = this.getRangeForMode(this.mode, this.currentDate);
    this.filteredSessions = this.allSessions.filter(s => {
      const d = new Date(s.startTime);
      return d >= start && d <= end;
    });

    this.updateStats();
    this.updateGarden();
    this.updateChartData();
  }

  private updateStats() {
    this.totalSessions = this.filteredSessions.length;
    this.completedSessions = this.filteredSessions.filter(s => s.canceled === 0).length;
    this.totalMinutes = this.filteredSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }

  private updateGarden() {
    this.gardenItems = [];

    const plants: GardenItem[] = this.filteredSessions.map(s => ({
      icon: s.canceled === 0
        ? '/assets/illustrations/tree1.png'
        : '/assets/illustrations/dead-tree.png',
      x: 0,
      y: 0,
      scale: 0.9 + Math.random() * 0.2
    }));

    this.placeItems(plants);
  }

  // --- GARDEN PLACEMENT ---

  private placeItems(plants: GardenItem[]) {
    const areaWidth = 60;
    const areaTop = 30;
    const areaHeight = 60;

    const count = plants.length;
    if (!count) {
      this.gardenItems = [];
      return;
    }

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

  // --- CHART ---

  private initChart() {
    const ctx = document.getElementById('focusChart') as HTMLCanvasElement | null;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Focused minutes',
          data: [],
          backgroundColor: '#8BC48A',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    this.updateChartData();
  }

  private updateChartData() {
    if (!this.chart) return;

    let labels: string[] = [];
    let data: number[] = [];

    if (this.mode === 'week') {
      const { start } = this.getWeekRange(this.currentDate);
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = new Array(7).fill(0);

      this.filteredSessions.forEach(s => {
        const d = new Date(s.startTime);
        const dayIndex = (d.getDay() + 6) % 7; // Monday=0
        data[dayIndex] += s.durationMinutes || 0;
      });

    } else if (this.mode === 'month') {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      data = new Array(daysInMonth).fill(0);

      this.filteredSessions.forEach(s => {
        const d = new Date(s.startTime);
        const day = d.getDate();
        data[day - 1] += s.durationMinutes || 0;
      });

    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = new Array(12).fill(0);

      this.filteredSessions.forEach(s => {
        const d = new Date(s.startTime);
        const m = d.getMonth();
        data[m] += s.durationMinutes || 0;
      });
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }

  // --- DATE HELPERS ---

  private getRangeForMode(mode: ViewMode, date: Date) {
    if (mode === 'week') return this.getWeekRange(date);
    if (mode === 'month') return this.getMonthRange(date);
    return this.getYearRange(date);
  }

  private getWeekRange(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private getYearRange(date: Date) {
    const start = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }
}
