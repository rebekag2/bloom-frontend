import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth/signup', pathMatch: 'full' },
  { 
    path: 'home', 
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'focus-session', 
    loadChildren: () => import('./focus-session/focus-session.module').then(m => m.FocusSessionModule) 
  },
  { 
    path: 'overview', 
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) 
  },
  { 
    path: 'focus-garden', 
    loadChildren: () => import('./focus-garden/focus-garden.module').then(m => m.FocusGardenModule) 
  },
  { 
    path: 'mood-garden', 
    loadChildren: () => import('./mood-garden/mood-garden.module').then(m => m.MoodGardenModule) 
  },
  { 
    path: 'settings', 
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) 
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
