import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoodGardenRoutingModule } from './mood-garden-routing.module';
import { MoodGardenComponent } from './mood-garden.component';


@NgModule({
  declarations: [
    MoodGardenComponent
  ],
  imports: [
    CommonModule,
    MoodGardenRoutingModule
  ]
})
export class MoodGardenModule { }
