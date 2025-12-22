import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const userId = this.auth.getUserId();

    if (userId) {
      console.log("AuthGuard: User is logged in with ID:", userId);
      return true; // user is logged in
    }

    // user NOT logged in → redirect to login
    this.router.navigate(['/auth/login']);
    return false;
  }
}
