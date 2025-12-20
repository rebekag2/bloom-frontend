import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: false,
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {
  constructor(private router: Router) {}

  goHome() { this.router.navigate(['/home']); }
  goFocusGarden() { this.router.navigate(['/focus-garden']); }
  goMoodGarden() { this.router.navigate(['/mood-garden']); }
  goOverview() { this.router.navigate(['/overview']); }

}
