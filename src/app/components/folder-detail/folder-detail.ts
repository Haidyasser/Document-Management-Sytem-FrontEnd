import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FileListComponent } from '../file-list/file-list';
import { FileEntity } from '../../models/file.model';
import { Folder } from '../../models/folder.model';
import { MatDialog } from '@angular/material/dialog';
import { FileDialogComponent } from '../file-dialog/file-dialog';

@Component({
  selector: 'app-folder-detail',
  templateUrl: './folder-detail.html',
  styleUrls: ['./folder-detail.css'],
  imports: [TopBarComponent, SidebarComponent, FileListComponent, CommonModule]
})
export class FolderDetailComponent implements OnInit {
  workspaceId!: string;
  folderId!: string;
  folder?: Folder;
  files: FileEntity[] = [];
  loading = false;
  errorMessage = '';
  sidebarOpen = false;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;
    this.folderId = this.route.snapshot.paramMap.get('id')!;
    this.loadFolder();
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  loadFolder(): void {
    this.loading = true;
    this.workspaceService.getById(this.workspaceId).subscribe({
      next: ws => {
        const found = ws.folders?.find(f => f.id === this.folderId);
        if (!found) {
          this.errorMessage = 'Folder not found';
          this.loading = false;
          return;
        }
        this.folder = found;
        // files may be stored on folder or on workspace; adapt if needed
        this.files = (found as any).files || [];
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Failed to load folder';
        this.loading = false;
      }
    });
  }

  openFileForm(): void {
    const ref = this.dialog.open(FileDialogComponent, {
      width: '500px',
      data: { workspaceId: this.workspaceId, folderId: this.folderId }
    });
    ref.afterClosed().subscribe((uploaded: boolean) => {
      if (uploaded) this.loadFolder();
    });
  }

  onPreviewFile(file: FileEntity): void {
    // implement preview logic if you have one
    console.log('Preview file', file);
  }

  onDeleteFile(fileId: string): void {
    if (!confirm('Delete this file?')) return;
    this.workspaceService.deleteFile(this.workspaceId, fileId).subscribe({
      next: () => this.loadFolder(),
      error: err => {
        console.error('Failed to delete file', err);
        this.errorMessage = 'Failed to delete file';
      }
    });
  }

  onDownloadFile(file: FileEntity): void {
    this.workspaceService.downloadFile(this.workspaceId, file.id!).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => console.error('Download failed', err)
    });
  }

  backToWorkspace(): void {
    this.router.navigate(['/workspaces', this.workspaceId]);
  }
}