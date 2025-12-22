import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusGardenRoutingModule } from './focus-garden-routing.module';
import { FocusGardenComponent } from './focus-garden.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    FocusGardenComponent
  ],
  imports: [
    CommonModule,
    FocusGardenRoutingModule,
    SharedModule
  ]
})
export class FocusGardenModule { }
