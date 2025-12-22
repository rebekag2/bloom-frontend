import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';
import { FocusSessionService } from '../services/focus-session.service';
import { SettingsService } from '../services/settings.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  sidebarOpen = true;
  username = '';
  email = '';
  emotions: any = null;
  accessTokenForSwagger: string | null = null;

  constructor(private router: Router, private authService: AuthService, private http: HttpClient, private focusSessionService: FocusSessionService,
     private settingsService: SettingsService, private dialog: MatDialog ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.username = user.username;
      this.email = user.email;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  goToSettings(): void {
    this.toggleSidebar();
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearTokens();
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // still clear local session on error
        this.authService.clearTokens();
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      }
    });
  }

 startFocusSession(): void {
  const dialogRef = this.dialog.open(FocusSessionDialogComponent, {
    width: '560px',
    data: { mode: 'before' }
  });

  dialogRef.afterClosed().subscribe((emotionBeforeId: number | null) => {
    if (!emotionBeforeId) return; // user canceled

    const user = this.authService.getUser();
    if (!user) return;

    // 1. Load settings from backend
    this.settingsService.getSettings(user.id).subscribe({
      next: (settings) => {
        const duration = settings.defaultFocusTime ?? 25;

        // 2. Start session with backend duration + selected emotion
        this.focusSessionService.startSession({
          durationMinutes: duration,
          emotionBeforeId: emotionBeforeId
        }).subscribe({
          next: (session) => {
            console.log('Focus session started:', session);
            this.router.navigate(
              ['/focus-session', session.id],
              { queryParams: { duration: session.durationMinutes } }
            );
          },
          error: (err) => {
            console.error('Failed to start focus session', err);
            alert('Could not start focus session.');
          }
        });
      },
      error: (err) => {
        console.error('Failed to load settings', err);
        alert('Could not load settings.');
      }
    });
  });
}

  // Helper to get access token (copy/paste into Swagger "Authorize" input)
  showAccessTokenForSwagger(): void {
    this.accessTokenForSwagger = this.authService.getAccessToken();
    console.log('Access token (copy for Swagger):', this.accessTokenForSwagger);
  }
}
