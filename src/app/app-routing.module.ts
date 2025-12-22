import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'focus-session',
    canActivate: [AuthGuard],
    loadChildren: () => import('./focus-session/focus-session.module').then(m => m.FocusSessionModule)
  },
  {
    path: 'overview',
    canActivate: [AuthGuard],
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule)
  },
  {
    path: 'focus-garden',
    canActivate: [AuthGuard],
    loadChildren: () => import('./focus-garden/focus-garden.module').then(m => m.FocusGardenModule)
  },
  {
    path: 'mood-garden',
    canActivate: [AuthGuard],
    loadChildren: () => import('./mood-garden/mood-garden.module').then(m => m.MoodGardenModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  },

  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
