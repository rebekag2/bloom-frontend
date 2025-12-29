import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  templateUrl: './topbar.component.html',
  standalone: false,
  styleUrls: ['./topbar.component.scss'],
})
export class TopBarComponent {
  @Input() username: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  constructor(private router: Router) {}
  
  goHome() { this.router.navigate(['/home']); } 
  goFocusGarden() { this.router.navigate(['/focus-garden']); } 
  goMoodGarden() { this.router.navigate(['/mood-garden']); } 
  goOverview() { this.router.navigate(['/overview']); }

  onSettings() { this.settingsClicked.emit(); }
  onLogout() { this.logoutClicked.emit(); }
}
