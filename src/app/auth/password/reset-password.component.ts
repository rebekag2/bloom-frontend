import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone  : false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  password = '';
  confirmPassword = '';
  token = '';
  message = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Parolele nu coincid.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.message = 'Parola a fost resetată. Te poți autentifica.';
        this.loading = false;

        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: () => {
        this.message = 'Link invalid sau expirat.';
        this.loading = false;
      }
    });
  }
}
