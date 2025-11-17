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
  searchQuery = '';

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

  private isImageFile(file: FileEntity, mimeType?: string): boolean {
    // Check by MIME type
    if (mimeType && mimeType.startsWith('image/')) {
      return true;
    }
    // Check by file extension as fallback
    const fileName = file.displayName?.toLowerCase() || '';
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
  }

  private getImageMimeType(file: FileEntity, responseType?: string): string {
    // If response has correct MIME type, use it
    if (responseType && responseType.startsWith('image/')) {
      return responseType;
    }
    // Fallback: determine MIME type from file extension
    const fileName = file.displayName?.toLowerCase() || '';
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
          this.openImagePreview(imageSrc, file.displayName);
        } else if (mimeType === 'application/pdf' || file.displayName?.toLowerCase().endsWith('.pdf')) {
          const pdfBase64 = typeof base64Data === 'string' ? base64Data : '';
          const pdfSrc = pdfBase64.startsWith('data:') ? pdfBase64 : `data:application/pdf;base64,${pdfBase64}`;
          this.openPdfPreview(pdfSrc, file.displayName);
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
          this.openImagePreview(imageSrc, file.displayName);
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
    // Convert large data URLs to object URLs and ensure the iframe fills the window
    const src = this.dataUrlToObjectUrl(pdfSrc);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName}</title>
            <meta charset="utf-8" />
            <style>
              html,body{height:100%;margin:0;padding:0}
              iframe,embed{position:fixed;top:0;left:0;width:100%;height:100%;border:none}
            </style>
          </head>
          <body>
            <iframe src="${src}"></iframe>
            <script>
              (function(){
                try{ const s='${src}'; if(s.startsWith('blob:')){ window.addEventListener('unload', ()=>{ URL.revokeObjectURL(s); }); } }catch(e){}
              })();
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  }

  private dataUrlToObjectUrl(dataUrl: string): string {
    if (!dataUrl.startsWith('data:')) return dataUrl;
    try {
      const parts = dataUrl.split(',');
      const meta = parts[0];
      const base64 = parts[1] || '';
      const mimeMatch = meta.match(/data:([^;]+);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const byteString = atob(base64);
      const ab = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      return dataUrl;
    }
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
        a.download = file.displayName;
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

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
  }

  getFilteredFiles(): FileEntity[] {
    if (!this.workspace?.files || !this.searchQuery.trim()) {
      return this.workspace?.files || [];
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.workspace.files.filter(file => 
      file.displayName?.toLowerCase().includes(query)
    );
  }

  getFilteredFolders(): Folder[] {
    if (!this.workspace?.folders || !this.searchQuery.trim()) {
      return this.workspace?.folders || [];
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.workspace.folders.filter(folder => 
      folder.name?.toLowerCase().includes(query)
    );
  }

}