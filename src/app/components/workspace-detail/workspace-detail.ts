import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FileListComponent } from "../file-list/file-list";
import { CommonModule } from '@angular/common';
import { FolderDialogComponent } from '../folder-dialog/folder-dialog';
import { FileDialogComponent } from '../file-dialog/file-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FileEntity } from '../../models/file.model';
import { Folder } from '../../models/folder.model';

@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.html',
  styleUrls: ['./workspace-detail.css'],
  imports: [TopBarComponent, SidebarComponent, FileListComponent, CommonModule]
})
export class WorkspaceDetailComponent implements OnInit {
  workspaceId!: string;
  workspace?: Workspace;
  loading = false;
  errorMessage = '';
  sidebarOpen = true; // Sidebar open by default
  showFolderForm = false;
  showFileForm = false;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private router: Router
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
      data: { workspaceId: this.workspaceId } // pass workspace id into dialog
    });

    dialogRef.afterClosed().subscribe((uploaded: boolean) => {
      if (uploaded) {
        this.loadWorkspace(); // refresh list after upload success
      }
    });
  }

  onOpenFolder(folder: Folder): void {
    // Navigate to folder detail or expand folder
    console.log('Opening folder', folder);
    this.workspaceId = folder.id!;
    this.loadWorkspace();
    
  }

   onPreviewFile(file: FileEntity): void {
  this.workspaceService.previewFile(this.workspaceId, file.id!).subscribe({
    next: (res :any) => {
      if (res.type.startsWith('image/')) {
        const imageSrc = `data:${res.type};base64,${res.base64}`;
        window.open(imageSrc, '_blank');
      } else if (res.type === 'application/pdf') {
        const pdfSrc = `data:${res.type};base64,${res.base64}`;
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="${pdfSrc}" width="100%" height="100%"></iframe>`);
        }
      } else {
        alert('Preview not supported for this file type');
      }
    },
    error: (err :any) => {
      console.error('Preview failed', err);
      alert('Failed to preview file');
    }
  });
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
    this.workspaceService.getById(this.workspaceId).subscribe({
      next: (data: Workspace) => {
        console.log('Loaded workspace data', data);
        this.workspace = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load workspace';
        this.loading = false;
      },
    });
  }

  onAddFolder(folder: Folder): void {
    console.log('Adding folder', folder); 
    this.workspaceService.addFolder(this.workspaceId, folder).subscribe({
      next: () => this.loadWorkspace(),
      error: (err: any) => {
        console.error('Failed to add folder', err);
        this.errorMessage = 'Failed to add folder';
      }
    });
  }

  onAddFile(file: FileEntity): void {
    this.workspaceService.addFile(this.workspaceId, file).subscribe({
      next: () => this.loadWorkspace(),
      error: (err: any) => {
        console.error('Failed to add file', err);
        this.errorMessage = 'Failed to add file';
      }
    });
  }

  onDeleteFolder(folderId: string): void {
    if (confirm('Are you sure you want to delete this folder?')) {
      this.workspaceService.deleteFolder(folderId).subscribe({
        next: () => {console.log("deleted folder", folderId); this.loadWorkspace()},
        error: (err: any) => {
          console.error('Failed to delete folder', err);
          this.errorMessage = 'Failed to delete folder';
        }
      });
    }
  }

  onDeleteFile(fileId: string): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.workspaceService.deleteFile(this.workspaceId, fileId).subscribe({
        next: () => this.loadWorkspace(),
        error: (err: any) => {
          console.error('Failed to delete file', err);
          this.errorMessage = 'Failed to delete file';
        }
      });
    }
  }

  onDownloadFile(file: FileEntity): void {
    this.workspaceService.downloadFile(this.workspaceId, file.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Download failed:', err);
      }
    });
  }

  onShareFile(file: FileEntity): void {
    console.log('Share file', file);
    // Implement share functionality
  }

  onAddToFolder(file: FileEntity): void {
    console.log('Add to folder', file);
    // Implement add to folder functionality
  }

  onFavoriteFile(file: FileEntity): void {
    console.log('Favorite file', file);
    // Implement favorite functionality
  }

  onRenameFile(file: FileEntity): void {
    console.log('Rename file', file);
    // Implement rename functionality
  }

  onMoveToFile(file: FileEntity): void {
    console.log('Move file', file);
    // Implement move functionality
  }

  onViewDetailsFile(file: FileEntity): void {
    console.log('View details', file);
    // Implement view details functionality
  }

  onShareFolder(folder: Folder): void {
    console.log('Share folder', folder);
    // Implement share folder functionality
  }

  onFavoriteFolder(folder: Folder): void {
    console.log('Favorite folder', folder);
    // Implement favorite folder functionality
  }

  onRenameFolder(folder: Folder): void {
    console.log('Rename folder', folder);
    // Implement rename folder functionality
  }

  onMoveToFolder(folder: Folder): void {
    console.log('Move folder', folder);
    // Implement move folder functionality
  }

  onViewDetailsFolder(folder: Folder): void {
    console.log('View folder details', folder);
    // Implement view folder details functionality
  }

  onAddFolderToFolder(folder: Folder): void {
    console.log('Add folder to folder', folder);
    // Implement add folder to folder functionality
  }

}