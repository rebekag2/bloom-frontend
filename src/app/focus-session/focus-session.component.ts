import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FocusSessionService } from '../services/focus-session.service';
import { MatDialog } from '@angular/material/dialog';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';
import { SettingsService } from '../services/settings.service';
import { AuthService } from '../services/auth.service';
import { LogoutConfirmDialogComponent } from '../home/logout-confirm-dialog.component';
import { FocusCancelDialogComponent } from './focus-cancel-dialog.component';

@Component({
  selector: 'app-focus-session',
  standalone: false,
  templateUrl: './focus-session.component.html',
  styleUrls: ['./focus-session.component.scss']
})
export class FocusSessionComponent implements OnInit, OnDestroy, DoCheck {

  sessionId!: number;
  duration!: number;
  timeLeft!: number;
  totalTime!: number;
  timerRunning = false;
  interval: any;

  notificationSoundEnabled = false;

  private originalNavigate: any;
  private originalTitle = document.title;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private focusSessionService: FocusSessionService,
    private settingsService: SettingsService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {

    // Load user settings
    const userId = this.auth.getUserId();
    if (userId) {
      this.settingsService.getSettings(userId).subscribe(settings => {
        this.notificationSoundEnabled = settings.notificationSound;
      });
    }

    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.duration = Number(this.route.snapshot.queryParamMap.get('duration'));

    this.timeLeft = this.duration * 60;
    this.totalTime = this.timeLeft;

    // Override navigation to prevent accidental leaving
    this.originalNavigate = this.router.navigate.bind(this.router);

    this.router.navigate = async (...args: any[]) => {
      if (!this.timerRunning) {
        return this.originalNavigate(...args);
      }

      const dialogRef = this.dialog.open(FocusCancelDialogComponent, {
        width: '380px'
      });

      const confirmed = await dialogRef.afterClosed().toPromise();
      if (!confirmed) return false;

      const focusedMinutes = Math.floor((this.totalTime - this.timeLeft) / 60);

      await this.focusSessionService.cancelSession(this.sessionId, {
        focusedMinutes
      }).toPromise();

      this.timerRunning = false;
      this.router.navigate = this.originalNavigate;

      return this.originalNavigate(...args);
    };

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy(): void {
    if (this.originalNavigate) {
      this.router.navigate = this.originalNavigate;
    }

    // Restore tab title
    document.title = this.originalTitle;

    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.timerRunning) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  playSound() {
    const audio = new Audio('/assets/sounds/notification.wav');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  }

  // Plant evolution logic
  get plantStage(): string {
    if (this.progress < 0.33) return 'sprout';
    if (this.progress < 0.66) return 'plant';
    return 'tree';
  }

  get plantScale(): number {
    return 0.7 + this.progress * 0.6;
  }

  justEvolved = false;
  private lastStage = 'sprout';

  ngDoCheck() {
    const stage = this.plantStage;
    if (stage !== this.lastStage) {
      this.justEvolved = true;
      setTimeout(() => this.justEvolved = false, 400);
      this.lastStage = stage;
    }
  }

  get progress(): number {
    if (!this.totalTime) return 0;
    return (this.totalTime - this.timeLeft) / this.totalTime;
  }

  get circleCircumference(): number {
    return 2 * Math.PI * 52;
  }

  adjustTime(minutes: number) {
    if (this.timerRunning) return;

    const newMinutes = this.timeLeft / 60 + minutes;

    if (newMinutes < 5) return;
    if (newMinutes > 180) return;

    this.timeLeft = newMinutes * 60;
    this.totalTime = this.timeLeft;
  }

  startTimer() {
    this.timerRunning = true;

    this.interval = setInterval(() => {
      this.timeLeft--;

      // Update tab title every second
      document.title = `${this.formatTime(this.timeLeft)} · Bloom`;

      if (this.timeLeft <= 0) {
        clearInterval(this.interval);
        this.timerRunning = false;

        // Restore title
        document.title = this.originalTitle;

        if (this.notificationSoundEnabled) {
          this.playSound();
        }

        this.openPostSessionDialog();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  // ⭐ CANCEL SESSION WITH DIALOG
  cancelSession() {
    const dialogRef = this.dialog.open(FocusCancelDialogComponent, {
      width: '380px'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      clearInterval(this.interval);

      // Restore title
      document.title = this.originalTitle;

      const focusedMinutes = Math.floor((this.totalTime - this.timeLeft) / 60);

      this.timerRunning = false;
      this.router.navigate = this.originalNavigate;

      this.focusSessionService.cancelSession(this.sessionId, {
        focusedMinutes
      }).subscribe(() => {
        this.router.navigate(['/overview']);
      });
    });
  }

  // ⭐ SETTINGS CLICK WHILE TIMER RUNNING
  onSettingsClick() {
    if (!this.timerRunning) {
      this.router.navigate(['/settings']);
      return;
    }

    const dialogRef = this.dialog.open(FocusCancelDialogComponent, {
      width: '380px'
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      clearInterval(this.interval);

      const focusedMinutes = Math.floor((this.totalTime - this.timeLeft) / 60);

      await this.focusSessionService.cancelSession(this.sessionId, {
        focusedMinutes
      }).toPromise();

      this.router.navigate(['/settings']);
    });
  }

  // ⭐ LOGOUT CLICK WHILE TIMER RUNNING
  onLogoutClick() {
    if (!this.timerRunning) {
      this.dialog.open(LogoutConfirmDialogComponent, { width: '380px' });
      return;
    }

    const dialogRef = this.dialog.open(FocusCancelDialogComponent, {
      width: '380px'
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      clearInterval(this.interval);

      const focusedMinutes = Math.floor((this.totalTime - this.timeLeft) / 60);

      await this.focusSessionService.cancelSession(this.sessionId, {
        focusedMinutes
      }).toPromise();

      this.dialog.open(LogoutConfirmDialogComponent, { width: '380px' });
    });
  }

  openPostSessionDialog() {
    const dialogRef = this.dialog.open(FocusSessionDialogComponent, {
      width: '560px',
      data: { mode: 'after' }
    });

    dialogRef.afterClosed().subscribe((emotionAfterId: number | null) => {
      if (!emotionAfterId) return;

      this.focusSessionService.finishSession(this.sessionId, {
        emotionAfterId
      }).subscribe(() => {
        this.router.navigate(['/overview']);
      });
    });
  }
}
