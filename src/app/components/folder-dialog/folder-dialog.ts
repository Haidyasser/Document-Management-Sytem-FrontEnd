import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface FolderDialogData {
  name?: string;
  description?: string;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-folder-dialog',
  templateUrl: './folder-dialog.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class FolderDialogComponent {
  folderName = '';
  description = '';

  constructor(
    public dialogRef: MatDialogRef<FolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FolderDialogData
  ) {
    if (data.mode === 'edit') {
      this.folderName = data.name || '';
      this.description = data.description || '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      name: this.folderName,
      description: this.description,
    });
  }
}
