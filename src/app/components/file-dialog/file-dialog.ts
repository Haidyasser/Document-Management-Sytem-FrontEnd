import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button';

export interface FileDialogData {
  name?: string;
  type?: string;
  mode: 'create' | 'edit';
  
}

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.html',
  imports: [
  CommonModule,
  FormsModule,
  MatDialogModule,   // ✅ يحتوي على mat-dialog-title, mat-dialog-content, mat-dialog-actions
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
]
})
export class FileDialogComponent {
  fileName = '';
  fileType = '';

  constructor(
    public dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileDialogData
  ) {
    if (data.mode === 'edit') {
      this.fileName = data.name || '';
      this.fileType = data.type || '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      name: this.fileName,
      type: this.fileType,
    });
  }
}
