import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TopBarComponent } from '../layout/topbar/topbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';

@NgModule({
  declarations: [TopBarComponent, SidebarComponent, FocusSessionDialogComponent],
  imports: [CommonModule],
  exports: [TopBarComponent, SidebarComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class SharedModule {}
