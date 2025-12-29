import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TopBarComponent } from '../layout/topbar/topbar.component';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';

@NgModule({
  declarations: [TopBarComponent, FocusSessionDialogComponent],
  imports: [CommonModule],
  exports: [TopBarComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class SharedModule {}
