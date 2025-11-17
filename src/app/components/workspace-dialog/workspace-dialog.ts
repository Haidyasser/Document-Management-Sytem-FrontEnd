import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Workspace } from '../../models/workspace.model';

export interface WorkspaceDialogData {
  workspace: Workspace;
  mode: 'edit';
}

@Component({
  selector: 'app-workspace-dialog',
  templateUrl: './workspace-dialog.html',
  styleUrls: ['./workspace-dialog.css'],
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
export class WorkspaceDialogComponent {
  workspaceName = '';
  description = '';

  constructor(
    public dialogRef: MatDialogRef<WorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkspaceDialogData
  ) {
    if (data.workspace) {
      this.workspaceName = data.workspace.name || '';
      this.description = data.workspace.description || '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const updates: Partial<Workspace> = {};
    if (this.workspaceName) {
      updates.name = this.workspaceName;
    }
    if (this.description !== undefined) {
      updates.description = this.description;
    }
    this.dialogRef.close(updates);
  }
}

