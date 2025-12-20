import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopBarComponent } from '../layout/topbar/topbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { BottomNavComponent } from '../layout/bottom-nav/bottom-nav.component';

@NgModule({
  declarations: [TopBarComponent, SidebarComponent, BottomNavComponent],
  imports: [CommonModule],
  exports: [TopBarComponent, SidebarComponent, BottomNavComponent]
})
export class SharedModule {}
