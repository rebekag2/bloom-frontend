import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoodGardenRoutingModule } from './mood-garden-routing.module';
import { MoodGardenComponent } from './mood-garden.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    MoodGardenComponent
  ],
  imports: [
    CommonModule,
    MoodGardenRoutingModule,
    SharedModule
  ]
})
export class MoodGardenModule { }
