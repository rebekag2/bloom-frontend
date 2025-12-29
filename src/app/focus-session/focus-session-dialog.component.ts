import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmotionService, Emotion } from '../services/emotion.service';

@Component({
  selector: 'app-focus-session-dialog',
  standalone: false,
  templateUrl: './focus-session-dialog.component.html',
  styleUrls: ['./focus-session-dialog.component.scss'],
})
export class FocusSessionDialogComponent implements OnInit {
  emotions: Emotion[] = [];
  selectedEmotionId: number | null = null;

  // NEW: PNG flower mapping
  flowerImages: Record<string, string> = {
    Fericit: 'assets/flowers/fericit.png',
    Neutru: 'assets/flowers/neutru.png',
    Obosit: 'assets/flowers/obosit.png',
    Trist: 'assets/flowers/trist.png',
    Anxios: 'assets/flowers/anxios.png',
    Motivat: '../assets/flowers/motivat.png'
  };

  constructor(
    private dialogRef: MatDialogRef<FocusSessionDialogComponent>,
    private emotionService: EmotionService,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'before' | 'after' }
  ) {}

  ngOnInit(): void {
    this.emotionService.getEmotions().subscribe({
      next: (res) => { console.log('Loaded emotions:', res);
        this.emotions = res;
      },
      error: () => alert('Could not load emotions')
    });

  }

  selectEmotion(id: number) {
    this.selectedEmotionId = id;
  }

  confirm() {
    if (this.selectedEmotionId == null) return;
    this.dialogRef.close(this.selectedEmotionId);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
