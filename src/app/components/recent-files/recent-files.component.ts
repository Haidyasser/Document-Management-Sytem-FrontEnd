import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../services/file.service';
import { AuthService } from '../../services/auth.service';
import { FileEntity } from '../../models/file.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { FileListComponent } from '../file-list/file-list';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-recent-files',
  templateUrl: './recent-files.component.html',
  styleUrls: ['./recent-files.component.css'],
  imports: [CommonModule, SidebarComponent, TopBarComponent, FileListComponent]
})
export class RecentFilesComponent implements OnInit {
  files: FileEntity[] = [];
  loading = false;
  errorMessage = '';
  sidebarOpen = true;
  isDeletedView = false;
  listTitle = 'Recent Files';

  constructor(
    private fileService: FileService,
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Decide which list to load based on current route
    this.isDeletedView = this.router.url.includes('deleted');
    this.listTitle = this.isDeletedView ? 'Recently Deleted' : 'Recent Files';
    if (this.isDeletedView) {
      this.loadDeletedFiles();
    } else {
      this.loadRecentFiles();
    }
  }

  loadRecentFiles(): void {
    this.loading = true;
    this.errorMessage = '';
    const user = this.authService.getUser();
    
    // Try to get nationalId from user object (could be nationalId or nid)
    const nid = user?.nationalId || user?.nid;
    
    if (!user || !nid) {
      this.errorMessage = 'User information not found. Please login again.';
      this.loading = false;
      return;
    }

    this.fileService.getFilesByUser(nid).subscribe({
      next: (data: FileEntity[]) => {
        this.files = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load recent files:', err);
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load recent files';
        this.loading = false;
      }
    });
  }

  loadDeletedFiles(): void {
    this.loading = true;
    this.errorMessage = '';

    const user = this.authService.getUser();
    const inferredUserId = user?.id || user?.userId || user?.nationalId || user?.nid || undefined;
    const workspaceId = this.route.snapshot.queryParamMap.get('workspaceId') || undefined;

    this.fileService.getRecentlyDeletedFiles({
      userId: inferredUserId,
      workspaceId: workspaceId || undefined
    }).subscribe({
      next: (data: FileEntity[]) => {
        this.files = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load deleted files:', err);
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load deleted files';
        this.loading = false;
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  onDownloadFile(file: FileEntity): void {
    // Find the workspace ID from the file if available, or use a default approach
    // For now, we'll need to get the workspace ID from the file path or metadata
    if (file.id) {
      // Try to extract workspace ID from file path or use a service method
      // This is a placeholder - adjust based on your file structure
      console.log('Download file:', file);
      // You may need to add a method to get workspace ID from file
    }
  }

  onDeleteFile(fileId: string): void {
    if (this.isDeletedView) {
      if (!fileId) return;
      this.fileService.restoreFile(fileId).subscribe({
        next: () => this.loadDeletedFiles(),
        error: (err) => {
          console.error('Restore failed', err);
          alert('Failed to restore file');
        }
      });
    } else {
      console.log('Delete file:', fileId);
      this.loadRecentFiles();
    }
  }

  onPreviewFile(file: FileEntity): void {
    // Try to get workspaceId from file object (might be present even if not in interface)
    // or extract from path
    const workspaceId = (file as any).workspaceId || this.extractWorkspaceIdFromPath(file.path);
    
    if (!workspaceId || !file.id) {
      alert('Cannot preview file: workspace ID not available');
      return;
    }

    this.workspaceService.previewFile(workspaceId, file.id).subscribe({
      next: (res: any) => {
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
      error: (err: any) => {
        console.error('Preview failed', err);
        alert('Failed to preview file');
      }
    });
  }

  onPermanentDeleteFile(fileId: string): void {
    if (!fileId) return;
    this.fileService.permanentlyDeleteFile(fileId).subscribe({
      next: () => this.loadDeletedFiles(),
      error: (err) => {
        console.error('Permanent delete failed', err);
        alert('Failed to delete file permanently');
      }
    });
  }

  private extractWorkspaceIdFromPath(path: string): string | null {
    // Try to extract workspaceId from path patterns like:
    // /workspaces/{workspaceId}/...
    // or similar patterns
    if (!path) return null;
    
    const match = path.match(/\/workspaces\/([^\/]+)/);
    return match ? match[1] : null;
  }

  onShareFile(file: FileEntity): void {
    console.log('Share file:', file);
  }

  onAddToFolder(file: FileEntity): void {
    console.log('Add to folder:', file);
  }

  onFavoriteFile(file: FileEntity): void {
    console.log('Favorite file:', file);
  }

  onRenameFile(file: FileEntity): void {
    console.log('Rename file:', file);
  }

  onMoveToFile(file: FileEntity): void {
    console.log('Move file:', file);
  }

  onViewDetailsFile(file: FileEntity): void {
    console.log('View details:', file);
  }
}

