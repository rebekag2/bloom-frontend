import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './topbar.component.html',
  standalone: false,
  styleUrls: ['./topbar.component.scss'],
})
export class TopBarComponent {
  @Input() username: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();
}
