import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusSessionRoutingModule } from './focus-session-routing.module';
import { FocusSessionComponent } from './focus-session.component';


@NgModule({
  declarations: [
    FocusSessionComponent
  ],
  imports: [
    CommonModule,
    FocusSessionRoutingModule
  ]
})
export class FocusSessionModule { }
