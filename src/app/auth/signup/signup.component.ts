import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    // For now, just log values or implement your signup logic here
    console.log('Signup form submitted:', {
      username: this.username,
      email: this.email,
      password: this.password,
    });

    // Redirect after signup (or show message)
    this.router.navigate(['/login']);
  }
}
