import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FocusSessionService } from '../services/focus-session.service';
import { MatDialog } from '@angular/material/dialog';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';
import { SettingsService } from '../services/settings.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-focus-session',
  standalone: false,
  templateUrl: './focus-session.component.html',
  styleUrls: ['./focus-session.component.scss']
})
export class FocusSessionComponent implements OnInit, OnDestroy {

  sessionId!: number;
  duration!: number;
  timeLeft!: number;
  totalTime!: number;
  timerRunning = false;
  interval: any;

  // ⭐ NEW: store user setting
  notificationSoundEnabled = false;

  private originalNavigate: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private focusSessionService: FocusSessionService,
    private settingsService: SettingsService,   // ⭐ NEW
    private auth: AuthService                   // ⭐ NEW
  ) {}

  ngOnInit(): void {

    // ⭐ LOAD USER SETTINGS
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

    this.originalNavigate = this.router.navigate.bind(this.router);

    this.router.navigate = async (...args: any[]) => {
      if (!this.timerRunning) {
        return this.originalNavigate(...args);
      }

      const confirmCancel = confirm(
        'You have an active focus session. Do you want to cancel it?'
      );

      if (!confirmCancel) return false;

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
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.timerRunning) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  // ⭐ PLAY SOUND FUNCTION
  playSound() {
    const audio = new Audio('/assets/sounds/notification.wav');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  }

  // 🌱 Evolution stage
  get plantStage(): string {
    if (this.progress < 0.33) return 'sprout';
    if (this.progress < 0.66) return 'plant';
    return 'tree';
  }

  // 🌿 Growth scale (smooth)
  get plantScale(): number {
    return 0.7 + this.progress * 0.6;
  }

  // 🌳 Pop animation trigger
  justEvolved = false;

  ngDoCheck() {
    const stage = this.plantStage;
    if (stage !== this.lastStage) {
      this.justEvolved = true;
      setTimeout(() => this.justEvolved = false, 400);
      this.lastStage = stage;
    }
  }

  private lastStage = 'sprout';

  // ⭐ PROGRESS FOR CIRCULAR TIMER (0–1)
  get progress(): number {
    if (!this.totalTime) return 0;
    return (this.totalTime - this.timeLeft) / this.totalTime;
  }

  // ⭐ CIRCLE CIRCUMFERENCE
  get circleCircumference(): number {
    return 2 * Math.PI * 52;
  }

  // ⭐ ADJUST TIME
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

      if (this.timeLeft <= 0) {
        clearInterval(this.interval);
        this.timerRunning = false;

        // ⭐ PLAY SOUND ONLY IF ENABLED
        if (this.notificationSoundEnabled) {
          this.playSound();
        }

        // ⭐ THEN OPEN THE DIALOG
        this.openPostSessionDialog();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  cancelSession() {
    const confirmCancel = confirm('Are you sure you want to cancel this session?');
    if (!confirmCancel) return;

    clearInterval(this.interval);

    const focusedMinutes = Math.floor((this.totalTime - this.timeLeft) / 60);

    this.timerRunning = false;
    this.router.navigate = this.originalNavigate;

    this.focusSessionService.cancelSession(this.sessionId, {
      focusedMinutes
    }).subscribe(() => {
      this.router.navigate(['/overview']);
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
