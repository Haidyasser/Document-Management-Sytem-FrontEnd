import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from '../../services/file.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.html',
  styleUrls: ['./file-dialog.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 👈 REQUIRED for [formGroup]
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class FileDialogComponent {
  fileForm: FormGroup;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  private workspaceId?: string;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { workspaceId?: string }
  ) {
    this.fileForm = this.fb.group({
      name: ['']
    });
    this.workspaceId = data?.workspaceId;
  }

  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.filePreview = null;

    // create preview if image
    if (this.isImage(file.name)) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.filePreview = e.target.result);
      reader.readAsDataURL(file);
    }
    // Do NOT overwrite a user-typed name. Placeholder will show uploaded filename.
  }

  isImage(path: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(path);
  }

  uploadFile(): void {
    console.log('Uploading file...');
    if (!this.selectedFile) return;

    // Pick the user-provided name if non-empty, otherwise use the uploaded filename
    const raw = this.fileForm.get('name')?.value;
    const provided = typeof raw === 'string' ? raw.trim() : '';
    const effectiveName = provided.length ? provided : this.selectedFile.name;
    
    const formData = new FormData();
    // File.name is readonly; pass the desired filename as the third argument to append()
    formData.append('file', this.selectedFile, effectiveName);

    console.log('Uploading with name:', effectiveName);

    const workspaceId = this.workspaceId;
    if (!workspaceId) {
      console.error('No workspaceId provided to FileDialogComponent');
      return;
    }
    console.log('Form Data', formData);
    this.fileService.uploadFile(workspaceId, formData).subscribe({
      next: (res) => {
        console.log('File uploaded:', res);
        // return the uploaded file info (or true) to caller so parent can refresh
        this.dialogRef.close(res || true);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        // keep dialog open or close with false depending on UI flow
        this.dialogRef.close(false);
      }
    });
  }
}
