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
  searchQuery = '';

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
    const workspaceId = (file as any).workspaceId || this.extractWorkspaceIdFromPath(file.path);
    if (!workspaceId || !file.id) {
      alert('Cannot download: workspace ID or file ID missing');
      return;
    }

    this.workspaceService.downloadFile(workspaceId, file.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name || 'download';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Download failed:', err);
        alert(err?.error?.message || err?.message || 'Failed to download file');
      }
    });
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
      if (!fileId) return;
      this.fileService.deleteFile(fileId).subscribe({
        next: () => this.loadRecentFiles(),
        error: (err) => {
          console.error('Delete failed', err);
          const msg = err?.error?.message || err?.message || 'Failed to delete file';
          alert(msg);
        }
      });
    }
  }

  private isImageFile(file: FileEntity, mimeType?: string): boolean {
    // Check by MIME type
    if (mimeType && mimeType.startsWith('image/')) {
      return true;
    }
    // Check by file extension as fallback
    const fileName = file.name?.toLowerCase() || '';
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
  }

  private getImageMimeType(file: FileEntity, responseType?: string): string {
    // If response has correct MIME type, use it
    if (responseType && responseType.startsWith('image/')) {
      return responseType;
    }
    // Fallback: determine MIME type from file extension
    const fileName = file.name?.toLowerCase() || '';
    if (fileName.endsWith('.png')) return 'image/png';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
    if (fileName.endsWith('.gif')) return 'image/gif';
    if (fileName.endsWith('.bmp')) return 'image/bmp';
    if (fileName.endsWith('.webp')) return 'image/webp';
    if (fileName.endsWith('.svg')) return 'image/svg+xml';
    // Default fallback
    return responseType || 'image/png';
  }

  onPreviewFile(file: FileEntity): void {
    // Try to get workspaceId from file object (might be present even if not in interface)
    // or extract from path
    const workspaceId = (file as any).workspaceId || this.extractWorkspaceIdFromPath(file.path);
    
    if (!workspaceId || !file.id) {
      alert('Cannot preview file: workspace ID not available');
      return;
    }

    console.log('Previewing file:', file);
    
    // First try JSON response (base64)
    this.workspaceService.previewFile(workspaceId, file.id).subscribe({
      next: (res: any) => {
        console.log('Preview response:', res);
        const mimeType = res.type || res.mimeType || file.type || '';
        const base64Data = res.base64 || res.data || res.content || res;
        
        // Check if it's an image (including PNG)
        if (this.isImageFile(file, mimeType)) {
          const imageMimeType = this.getImageMimeType(file, mimeType);
          
          // Handle different response formats
          let imageSrc: string;
          if (typeof base64Data === 'string') {
            // If already a data URL, use it directly
            if (base64Data.startsWith('data:')) {
              imageSrc = base64Data;
            } else {
              // If it's base64 without prefix, add the data URL prefix
              imageSrc = `data:${imageMimeType};base64,${base64Data}`;
            }
          } else {
            console.error('Unexpected response format for image preview, trying blob...');
            // Fallback to blob approach
            this.tryBlobPreview(file, imageMimeType, workspaceId);
            return;
          }
          
          console.log('Opening image preview:', imageSrc.substring(0, 50) + '...');
          this.openImagePreview(imageSrc, file.name);
        } else if (mimeType === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
          const pdfBase64 = typeof base64Data === 'string' ? base64Data : '';
          const pdfSrc = pdfBase64.startsWith('data:') ? pdfBase64 : `data:application/pdf;base64,${pdfBase64}`;
          this.openPdfPreview(pdfSrc, file.name);
        } else {
          alert('Preview not supported for this file type');
        }
      },
      error: (err: any) => {
        console.error('Preview failed (JSON), trying blob...', err);
        // If JSON fails, try blob response
        if (this.isImageFile(file)) {
          const imageMimeType = this.getImageMimeType(file);
          this.tryBlobPreview(file, imageMimeType, workspaceId);
        } else {
          alert(`Failed to preview file: ${err?.error?.message || err?.message || 'Unknown error'}`);
        }
      }
    });
  }

  private tryBlobPreview(file: FileEntity, mimeType: string, workspaceId: string): void {
    this.workspaceService.previewFileAsBlob(workspaceId, file.id!).subscribe({
      next: (blob: Blob) => {
        console.log('Received blob preview:', blob.type, blob.size);
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageSrc = reader.result as string;
          this.openImagePreview(imageSrc, file.name);
        };
        reader.onerror = () => {
          console.error('Failed to read blob');
          alert('Failed to preview image');
        };
        reader.readAsDataURL(blob);
      },
      error: (err: any) => {
        console.error('Blob preview failed', err);
        alert(`Failed to preview file: ${err?.error?.message || err?.message || 'Unknown error'}`);
      }
    });
  }

  private openImagePreview(imageSrc: string, fileName: string): void {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <img src="${imageSrc}" alt="${fileName}" />
          </body>
        </html>
      `);
      win.document.close();
    }
  }

  private openPdfPreview(pdfSrc: string, fileName: string): void {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${fileName}</title></head>
          <body style="margin:0;padding:0;">
            <iframe src="${pdfSrc}" width="100%" height="100%" style="border:none;"></iframe>
          </body>
        </html>
      `);
      win.document.close();
    }
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

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
  }

  getFilteredFiles(): FileEntity[] {
    if (!this.files || !this.searchQuery.trim()) {
      return this.files || [];
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.files.filter(file => 
      file.name?.toLowerCase().includes(query)
    );
  }
}
