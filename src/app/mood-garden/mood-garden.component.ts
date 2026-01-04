import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

interface FlowerItem {
  icon: string;
  x: number;
  y: number;
  scale: number;
}

interface SessionEmotion {
  startTime: string;
  durationMinutes: number;
  emotionBefore: string | null;
  emotionAfter: string | null;
  canceled: number;
}

type ViewMode = 'week' | 'month' | 'year';

@Component({
  selector: 'app-mood-garden',
  standalone: false,
  templateUrl: './mood-garden.component.html',
  styleUrls: ['./mood-garden.component.scss']
})
export class MoodGardenComponent implements OnInit, AfterViewInit, OnDestroy {

  flowers: FlowerItem[] = [];
  allSessions: SessionEmotion[] = [];
  filteredSessions: SessionEmotion[] = [];

  mode: ViewMode = 'week';
  currentDate: Date = new Date();

  insights: string[] = [];

  private moodChart: Chart | null = null;

  private emotionOrder = ['Anxios', 'Trist', 'Obosit', 'Neutru', 'Motivat', 'Fericit'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMoodChart(), 200);
  }

  ngOnDestroy() {
    this.moodChart?.destroy();
  }

  loadSessions() {
    this.http.get<SessionEmotion[]>('http://localhost:3000/focus-sessions/with-emotions')
      .subscribe(sessions => {
        this.allSessions = sessions || [];
        this.updateView();
      });
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
    this.currentDate = new Date();
    this.updateView();
  }

  prevInterval() {
    if (this.mode === 'week') this.currentDate = this.addDays(this.currentDate, -7);
    if (this.mode === 'month') this.currentDate = this.addMonths(this.currentDate, -1);
    if (this.mode === 'year') this.currentDate = this.addYears(this.currentDate, -1);
    this.updateView();
  }

  nextInterval() {
    if (this.mode === 'week') this.currentDate = this.addDays(this.currentDate, 7);
    if (this.mode === 'month') this.currentDate = this.addMonths(this.currentDate, 1);
    if (this.mode === 'year') this.currentDate = this.addYears(this.currentDate, 1);
    this.updateView();
  }

  get intervalLabel(): string {
    if (this.mode === 'week') {
      const { start, end } = this.getWeekRange(this.currentDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    }
    if (this.mode === 'month') {
      return this.currentDate.toLocaleString('ro-RO', { month: 'short', year: 'numeric' });
    }
    return this.currentDate.getFullYear().toString();
  }

  private updateView() {
    const { start, end } = this.getRangeForMode(this.mode, this.currentDate);

    this.filteredSessions = this.allSessions.filter(s => {
      const d = new Date(s.startTime);
      return d >= start && d <= end;
    });

    this.buildFlowers();
    this.computeInsights();
    this.updateMoodChart();
  }

  buildFlowers() {
    this.flowers = [];

    const plants = this.filteredSessions.flatMap(session => {
      const list: FlowerItem[] = [];

      if (session.emotionBefore) {
        list.push({
          icon: this.mapEmotionToFlower(session.emotionBefore),
          x: 0,
          y: 0,
          scale: 0.9 + Math.random() * 0.2
        });
      }

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
  }

  placeFlowers(plants: FlowerItem[]) {
    const areaWidth = 60;
    const areaTop = 30;
    const areaHeight = 60;

    const count = plants.length;
    if (!count) return;

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

  mapEmotionToFlower(emotion: string | null): string {
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

  private emotionIndex(e: string | null): number {
    const idx = this.emotionOrder.indexOf(e || '');
    return idx === -1 ? this.emotionOrder.indexOf('Neutru') : idx;
  }

  computeInsights() {
    this.insights = [];
    if (!this.filteredSessions.length) return;

    let improved = 0;
    let declined = 0;
    let total = 0;

    const timeBuckets = { dim: { imp: 0, dec: 0, total: 0 }, pranz: { imp: 0, dec: 0, total: 0 }, seara: { imp: 0, dec: 0, total: 0 } };
    const durationBuckets = { short: { imp: 0, dec: 0, total: 0 }, medium: { imp: 0, dec: 0, total: 0 }, long: { imp: 0, dec: 0, total: 0 } };
    const transitions: Record<string, number> = {};

    this.filteredSessions.forEach(s => {
      if (!s.emotionBefore || !s.emotionAfter) return;

      const beforeIdx = this.emotionIndex(s.emotionBefore);
      const afterIdx = this.emotionIndex(s.emotionAfter);

      total++;

      if (afterIdx > beforeIdx) improved++;
      if (afterIdx < beforeIdx) declined++;

      const d = new Date(s.startTime);
      const h = d.getHours();

      let bucketKey: keyof typeof timeBuckets = 'dim';
      if (h >= 12 && h < 17) bucketKey = 'pranz';
      else if (h >= 17 || h < 5) bucketKey = 'seara';

      timeBuckets[bucketKey].total++;
      if (afterIdx > beforeIdx) timeBuckets[bucketKey].imp++;
      if (afterIdx < beforeIdx) timeBuckets[bucketKey].dec++;

      const dur = s.durationMinutes || 0;
      let durKey: keyof typeof durationBuckets = 'short';
      if (dur >= 20 && dur < 40) durKey = 'medium';
      else if (dur >= 40) durKey = 'long';

      durationBuckets[durKey].total++;
      if (afterIdx > beforeIdx) durationBuckets[durKey].imp++;
      if (afterIdx < beforeIdx) durationBuckets[durKey].dec++;

      const key = `${s.emotionBefore} → ${s.emotionAfter}`;
      transitions[key] = (transitions[key] || 0) + 1;
    });

    if (total > 0) {
      const rate = Math.round((improved / total) * 100);
      const declineRate = Math.round((declined / total) * 100);

      if (rate > 0)
        this.insights.push(`Starea s-a îmbunătățit în <span class="insight-number insight-up">▲ ${rate}%</span> dintre sesiuni.`);

      if (declineRate > 0)
        this.insights.push(`Starea a scăzut în <span class="insight-number insight-down">▼ ${declineRate}%</span> dintre sesiuni.`);
    }

    const timeLabelMap: Record<string, string> = { dim: 'dimineața', pranz: 'la prânz', seara: 'seara' };
    let bestTime: string | null = null;
    let bestTimeRate = 0;

    Object.entries(timeBuckets).forEach(([key, val]) => {
      if (!val.total) return;
      const r = val.imp / val.total;
      if (r > bestTimeRate) {
        bestTimeRate = r;
        bestTime = timeLabelMap[key];
      }
    });

    if (bestTime && bestTimeRate > 0) {
      this.insights.push(
        `Cele mai multe <span class="insight-keyword">îmbunătățiri</span> apar <span class="insight-emphasis">${bestTime}</span>.`
      );
    }

    let bestDur: string | null = null;
    let bestDurRate = 0;

    const durLabelMap: Record<string, string> = {
      short: 'sesiunile scurte',
      medium: 'sesiunile medii',
      long: 'sesiunile lungi'
    };

    Object.entries(durationBuckets).forEach(([key, val]) => {
      if (!val.total) return;
      const r = val.imp / val.total;
      if (r > bestDurRate) {
        bestDurRate = r;
        bestDur = durLabelMap[key];
      }
    });

    if (bestDur && bestDurRate > 0) {
      this.insights.push(
        `<span class="insight-keyword">${bestDur}</span> par să aducă <span class="insight-emphasis">cele mai bune schimbări</span>.`
      );
    }

    const transEntries = Object.entries(transitions);
    if (transEntries.length) {
      transEntries.sort((a, b) => b[1] - a[1]);
      const [topTrans] = transEntries[0];
      this.insights.push(
        `Cea mai frecventă schimbare este <span class="insight-keyword">${topTrans}</span>.`
      );
    }
  }

  private initMoodChart() {
    const ctx = document.getElementById('moodChart') as HTMLCanvasElement;
    if (!ctx) return;

    const connectorPlugin = {
      id: 'beforeAfterConnector',
      afterDatasetsDraw: (chart: any) => {
        const ctx = chart.ctx;
        const beforeDataset = chart.getDatasetMeta(0);
        const afterDataset = chart.getDatasetMeta(1);

        if (!beforeDataset || !afterDataset) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(47, 58, 47, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);

        const len = Math.min(beforeDataset.data.length, afterDataset.data.length);
        for (let i = 0; i < len; i++) {
          const p1 = beforeDataset.data[i];
          const p2 = afterDataset.data[i];
          if (!p1 || !p2) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        ctx.restore();
      }
    };

    this.moodChart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#2F3A2F', font: { size: 11 } }
          }
        },
        scales: {
          y: {
            min: 0,
            max: this.emotionOrder.length - 1,
            ticks: {
              stepSize: 1,
              color: '#2F3A2F',
              font: { size: 11 },
              callback: (value: any) => this.emotionOrder[value] || ''
            },
            grid: { color: 'rgba(0,0,0,0.04)' }
          },
          x: {
            ticks: { color: '#2F3A2F', maxRotation: 0, autoSkip: true, font: { size: 11 } },
            grid: { display: false }
          }
        }
      },
      plugins: [connectorPlugin]
    });

    this.updateMoodChart();
  }

  private updateMoodChart() {
    if (!this.moodChart) return;

    const valid = this.filteredSessions
      .filter(s => s.emotionBefore && s.emotionAfter)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const labels = valid.map(s =>
      new Date(s.startTime).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
    );

    const beforeData = valid.map(s => this.emotionIndex(s.emotionBefore));
    const afterData = valid.map(s => this.emotionIndex(s.emotionAfter));

    const emotionDotColor = (emotion: string | null) => {
      switch (emotion) {
        case 'Anxios': return '#D9534F';
        case 'Trist': return '#E58BB3';
        case 'Obosit': return '#9A7BB0';
        case 'Neutru': return '#FFFFFF';
        case 'Motivat': return '#F4A259';
        case 'Fericit': return '#F7D84B';
        default: return '#FFFFFF';
      }
    };

    const beforeDots = valid.map(s => emotionDotColor(s.emotionBefore));
    const afterDots = valid.map(s => emotionDotColor(s.emotionAfter));

    this.moodChart.data.labels = labels;
    this.moodChart.data.datasets = [
      {
        label: 'Înainte',
        data: beforeData,
        borderColor: '#BFC3C9', // muted grey
        backgroundColor: 'rgba(191,195,201,0.25)',
        fill: false,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: beforeDots,
        pointBorderColor: beforeDots
      },
      {
        label: 'După',
        data: afterData,
        borderColor: '#7DBF7A', // soft green
        backgroundColor: 'rgba(125,191,122,0.25)',
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: afterDots,
        pointBorderColor: afterDots
      }
    ];

    this.moodChart.update();
  }

  private getRangeForMode(mode: ViewMode, date: Date) {
    if (mode === 'week') return this.getWeekRange(date);
    if (mode === 'month') return this.getMonthRange(date);
    return this.getYearRange(date);
  }

  private getWeekRange(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
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
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  private getYearRange(date: Date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
    return { start, end };
  }

  private addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private addYears(date: Date, years: number) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }
}
