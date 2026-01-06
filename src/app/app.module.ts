import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

export function initAuthFactory(auth: AuthService) {
  return () => {
    // try to refresh access token on app start if refresh cookie exists
    return firstValueFrom(auth.refreshAccessToken()).then(() => {}).catch(() => {});
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initAuthFactory, deps: [AuthService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
