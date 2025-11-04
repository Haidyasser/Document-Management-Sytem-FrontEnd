import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, Folder, FileEntity } from '../../models/workspace.model';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FolderListComponent } from "../folder-list/folder-list";
import { FileListComponent } from "../file-list/file-list";
import { CommonModule } from '@angular/common';
import { FolderDialogComponent } from '../folder-dialog/folder-dialog';
import { FileDialogComponent } from '../file-dialog/file-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.html',
  styleUrls: ['./workspace-detail.css'],
  imports: [TopBarComponent, SidebarComponent, FolderListComponent, FileListComponent, CommonModule]
})
export class WorkspaceDetailComponent implements OnInit {
  workspaceId!: string;
  workspace?: Workspace;
  loading = false;
  errorMessage = '';
  sidebarOpen = false;
  showFolderForm = false;
  showFileForm = false;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.route.snapshot.paramMap.get('id')!;
    this.loadWorkspace();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  openFolderForm(): void {
    const dialogRef = this.dialog.open(FolderDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Folder) => {
      if (result) {
        this.onAddFolder(result);
      }
    });
  }

  openFileForm(): void {
    const dialogRef = this.dialog.open(FileDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: FileEntity) => {
      if (result) {
        this.onAddFile(result);
      }
    });
  }

  onOpenFolder(folder: Folder): void {
    // Navigate to folder detail or expand folder
    console.log('Opening folder', folder);
    // You can implement navigation or expand logic here
  }

  onPreviewFile(file: FileEntity): void {
    // Open file preview dialog or download file
    console.log('Previewing file', file);
    // You can implement file preview logic here
  }

  onFolderCreated(folder: Folder): void {
    this.showFolderForm = false;
    this.onAddFolder(folder);
  }

  onFileUploaded(file: FileEntity): void {
    this.showFileForm = false;
    this.onAddFile(file);
  }

  loadWorkspace(): void {
    this.loading = true;
    this.workspaceService.getWorkspaceById(this.workspaceId).subscribe({
      next: (data) => {
        this.workspace = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load workspace';
        this.loading = false;
      },
    });
  }

  onAddFolder(folder: Folder): void {
    this.workspaceService.addFolder(this.workspaceId, folder).subscribe({
      next: () => this.loadWorkspace(),
      error: (err) => {
        console.error('Failed to add folder', err);
        this.errorMessage = 'Failed to add folder';
      }
    });
  }

  onAddFile(file: FileEntity): void {
    this.workspaceService.addFile(this.workspaceId, file).subscribe({
      next: () => this.loadWorkspace(),
      error: (err) => {
        console.error('Failed to add file', err);
        this.errorMessage = 'Failed to add file';
      }
    });
  }

  onDeleteFolder(folderId: string): void {
    if (confirm('Are you sure you want to delete this folder?')) {
      this.workspaceService['deleteFolder'](this.workspaceId, folderId).subscribe({
        next: () => this.loadWorkspace(),
        error: (err: any) => {
          console.error('Failed to delete folder', err);
          this.errorMessage = 'Failed to delete folder';
        }
      });
    }
  }

  onDeleteFile(fileId: string): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.workspaceService['deleteFile'](this.workspaceId, fileId).subscribe({
        next: () => this.loadWorkspace(),
        error: (err: any) => {
          console.error('Failed to delete file', err);
          this.errorMessage = 'Failed to delete file';
        }
      });
    }
  }
}