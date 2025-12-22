import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

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
    // this.toggleSidebar();
    // this.router.navigate(['/focus-session']);
    // this.authService.getEmotions().subscribe({
    //   next: (res) => {
    //     this.emotions = res;
    //     console.log('emotions:', res);
    //   },
    //   error: (err) => {
    //     console.error('Error fetching emotions', err);
    //   }
    // });
  }

  // Helper to get access token (copy/paste into Swagger "Authorize" input)
  showAccessTokenForSwagger(): void {
    this.accessTokenForSwagger = this.authService.getAccessToken();
    console.log('Access token (copy for Swagger):', this.accessTokenForSwagger);
  }
}
