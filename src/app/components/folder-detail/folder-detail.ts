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
  searchQuery = '';

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
    console.log('Previewing file:', file);
    
    // First try JSON response (base64)
    this.workspaceService.previewFile(this.workspaceId, file.id!).subscribe({
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
            this.tryBlobPreview(file, imageMimeType);
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
          this.tryBlobPreview(file, imageMimeType);
        } else {
          alert(`Failed to preview file: ${err?.error?.message || err?.message || 'Unknown error'}`);
        }
      }
    });
  }

  private tryBlobPreview(file: FileEntity, mimeType: string): void {
    this.workspaceService.previewFileAsBlob(this.workspaceId, file.id!).subscribe({
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