import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusGardenRoutingModule } from './focus-garden-routing.module';
import { FocusGardenComponent } from './focus-garden.component';


@NgModule({
  declarations: [
    FocusGardenComponent
  ],
  imports: [
    CommonModule,
    FocusGardenRoutingModule
  ]
})
export class FocusGardenModule { }
