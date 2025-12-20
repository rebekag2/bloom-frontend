import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FocusGardenComponent } from './focus-garden.component';

const routes: Routes = [
    { path: '', component: FocusGardenComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FocusGardenRoutingModule { }
