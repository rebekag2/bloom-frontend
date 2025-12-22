import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusSessionRoutingModule } from './focus-session-routing.module';
import { FocusSessionComponent } from './focus-session.component';
import { SharedModule } from '../shared/shared.module';
import { FocusSessionDialogComponent } from './focus-session-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@NgModule({
  declarations: [
    FocusSessionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FocusSessionRoutingModule,
    MatDialogModule
  ],
  providers: [ { provide: MAT_DIALOG_DATA, useValue: {} }, 
    { provide: MatDialogRef, useValue: {} } 
  ]
})
export class FocusSessionModule { }
