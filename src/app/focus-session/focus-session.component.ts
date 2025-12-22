import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FocusSessionService } from '../services/focus-session.service';
import { MatDialog } from '@angular/material/dialog';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';

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
  timerRunning = false;
  interval: any;

  private originalNavigate: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private focusSessionService: FocusSessionService
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.duration = Number(this.route.snapshot.queryParamMap.get('duration'));
    this.timeLeft = this.duration * 60;

    // Save original navigate()
    this.originalNavigate = this.router.navigate.bind(this.router);

    // Override navigate()
    this.router.navigate = async (...args: any[]) => {
      if (!this.timerRunning) {
        return this.originalNavigate(...args);
      }

      const confirmCancel = confirm(
        'You have an active focus session. Do you want to cancel it?'
      );

      if (!confirmCancel) return false;

      const focusedMinutes = Math.floor((this.duration * 60 - this.timeLeft) / 60);

      await this.focusSessionService.cancelSession(this.sessionId, {
        focusedMinutes
      }).toPromise();

      // Disable override after cancel
      this.timerRunning = false;
      this.router.navigate = this.originalNavigate;

      return this.originalNavigate(...args);
    };

    // Prevent browser tab closing
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy(): void {
    // Restore original navigate()
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

  // ⭐ ADJUST TIME BY ±5 MINUTES ⭐
  adjustTime(minutes: number) {
    if (this.timerRunning) return;

    const newMinutes = this.timeLeft / 60 + minutes;

    if (newMinutes < 5) return;      // minimum 5 minutes
    if (newMinutes > 180) return;    // maximum 3 hours

    this.timeLeft = newMinutes * 60;

  }

  startTimer() {
    this.timerRunning = true;

    this.interval = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        clearInterval(this.interval);
        this.timerRunning = false;
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

    const focusedMinutes = Math.floor((this.duration * 60 - this.timeLeft) / 60);

    // Disable override before navigating
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
