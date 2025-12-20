import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'], 
  standalone: false,
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.authService.signup(this.username, this.email, this.password).subscribe({
      next: (res) => {
        console.log('Signup success:', res);
        // store tokens if returned
        if ((res as any).accessToken) {
          localStorage.setItem('accessToken', (res as any).accessToken);
        }
        if ((res as any).refreshToken) {
          localStorage.setItem('refreshToken', (res as any).refreshToken);
        }
        // Save user info locally
        const stored = { email: this.email, username: this.username };
        localStorage.setItem('user', JSON.stringify(stored));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Signup failed:', err);
        alert('Signup failed. Please try again.');
      },
    });
  }
}
