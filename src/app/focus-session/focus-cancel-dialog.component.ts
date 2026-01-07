import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-focus-cancel-dialog',
  standalone: false,
  templateUrl: './focus-cancel-dialog.component.html',
  styleUrls: ['./focus-cancel-dialog.component.scss']
})
export class FocusCancelDialogComponent {
  constructor(private dialogRef: MatDialogRef<FocusCancelDialogComponent>) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
