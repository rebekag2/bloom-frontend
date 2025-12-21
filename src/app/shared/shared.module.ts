import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TopBarComponent } from '../layout/topbar/topbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { BottomNavComponent } from '../layout/bottom-nav/bottom-nav.component';
import { AuthInterceptor } from '../interceptors/auth.interceptor';

@NgModule({
  declarations: [TopBarComponent, SidebarComponent, BottomNavComponent],
  imports: [CommonModule],
  exports: [TopBarComponent, SidebarComponent, BottomNavComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class SharedModule {}
