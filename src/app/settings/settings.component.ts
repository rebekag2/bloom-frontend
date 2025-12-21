import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  loading = false;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      notificationSound: [false],
      firstDayOfWeek: ['Luni'],
      defaultFocusTime: [25]
    });
  }

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    console.log("Loaded user ID:", userId);

    if (!userId) {
      console.error("User ID is null. User not logged in or not saved.");
      return;
    }

    this.loading = true;

    this.settings.getSettings(userId).subscribe({
      next: (res) => {
        this.loading = false;

        this.form.patchValue({
          notificationSound: res.notificationSound,
          firstDayOfWeek: res.firstDayOfWeek,
          defaultFocusTime: res.defaultFocusTime
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load settings', err);
      }
    });
  }

  onSubmit(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    const body = {
      notificationSound: this.form.value.notificationSound,
      firstDayOfWeek: this.form.value.firstDayOfWeek,
      defaultFocusTime: Number(this.form.value.defaultFocusTime)
    };

    this.loading = true;

    this.settings.updateSettings(userId, body).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Settings saved.';
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to save settings', err);
        this.message = 'Failed to save settings.';
      }
    });
  }
}
