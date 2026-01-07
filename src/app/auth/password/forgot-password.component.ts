import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone  : false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  loading = false;

  constructor(private auth: AuthService) {}

  submit() {
    this.loading = true;

    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.message = 'Dacă acest email există, ți-am trimis un link de resetare.';
        this.loading = false;
      },
      error: () => {
        this.message = 'Dacă acest email există, ți-am trimis un link de resetare.';
        this.loading = false;
      }
    });
  }
}
