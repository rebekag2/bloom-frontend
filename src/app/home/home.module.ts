import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FocusSessionDialogComponent } from '../focus-session/focus-session-dialog.component';
import { LogoutConfirmDialogComponent } from './logout-confirm-dialog.component';

@NgModule({
  declarations: [
    HomeComponent,
    LogoutConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
  ]
})
export class HomeModule { }
