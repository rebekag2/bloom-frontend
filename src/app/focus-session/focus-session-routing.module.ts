import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FocusSessionComponent } from './focus-session.component';

const routes: Routes = [
    { path: '', component: FocusSessionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FocusSessionRoutingModule { }
