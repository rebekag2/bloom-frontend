import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], 
  standalone: false,
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login success:', res);

        // Save tokens if present (leave this as you had it)
        if ((res as any).accessToken) {
          localStorage.setItem('accessToken', (res as any).accessToken);
        }
        if ((res as any).refreshToken) {
          localStorage.setItem('refreshToken', (res as any).refreshToken);
        }

        // Save the REAL user returned by backend
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Login failed. Please check your credentials.');
      },
    });
  }
}
