import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoodGardenComponent } from './mood-garden.component';

const routes: Routes = [
   { path: '', component: MoodGardenComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoodGardenRoutingModule { }
