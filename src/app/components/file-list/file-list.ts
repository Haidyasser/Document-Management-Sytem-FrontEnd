import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileEntity } from '../../models/file.model';
import { Folder } from '../../models/folder.model';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.html',
  styleUrls: ['./file-list.css'],
  imports: [CommonModule],
})
export class FileListComponent {
  @Input() files: FileEntity[] = [];
  @Input() folders: Folder[] = [];
  @Input() title: string = 'My Drive';
  @Input() isDeletedView: boolean = false;
  @Output() previewFile = new EventEmitter<FileEntity>();
  @Output() openFolder = new EventEmitter<Folder>();
  @Output() deleteFile = new EventEmitter<string>();
  @Output() permanentDeleteFile = new EventEmitter<string>();
  @Output() deleteFolder = new EventEmitter<string>();
  @Output() downloadFile = new EventEmitter<FileEntity>();
  @Output() shareFile = new EventEmitter<FileEntity>();
  @Output() shareFolder = new EventEmitter<Folder>();
  @Output() addToFolder = new EventEmitter<FileEntity>();
  @Output() addFolderToFolder = new EventEmitter<Folder>();
  @Output() favoriteFile = new EventEmitter<FileEntity>();
  @Output() favoriteFolder = new EventEmitter<Folder>();
  @Output() renameFile = new EventEmitter<FileEntity>();
  @Output() renameFolder = new EventEmitter<Folder>();
  @Output() moveToFile = new EventEmitter<FileEntity>();
  @Output() moveToFolder = new EventEmitter<Folder>();
  @Output() viewDetailsFile = new EventEmitter<FileEntity>();
  @Output() viewDetailsFolder = new EventEmitter<Folder>();
  @Output() deleteAll = new EventEmitter<void>();

  showContextMenu = false;
  contextMenuFile: FileEntity | null = null;
  contextMenuFolder: Folder | null = null;

  // Tag colors for shared with badges
  tagColors = ['#10B981', '#F97316', '#3B82F6', '#8B5CF6', '#06B6D4', '#1E40AF'];
  usedColors: Map<string, string> = new Map();
  private sharedCache: Map<string, string[]> = new Map();

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.showContextMenu) {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu') && !target.closest('.more-options')) {
        this.closeContextMenu();
      }
    }
  }

  private cacheKey(file: FileEntity): string {
    return (file.id || file.name || JSON.stringify(file)).toString();
  }

  getSharedFor(file: FileEntity): string[] {
    if (file.sharedWith && file.sharedWith.length > 0) {
      return file.sharedWith;
    }
    const key = this.cacheKey(file);
    if (this.sharedCache.has(key)) {
      return this.sharedCache.get(key)!;
    }
    const mockShared = ['IT', 'M', 'F', 'CS', 'HR', 'S', 'Q'];
    const hash = Array.from(key).reduce((a, c) => a + c.charCodeAt(0), 0);
    const count = hash % 4; // 0..3 deterministic count
    const list = mockShared.slice(0, count);
    this.sharedCache.set(key, list);
    return list;
  }

  getTagColor(tag: string): string {
    if (this.usedColors.has(tag)) {
      return this.usedColors.get(tag)!;
    }
    const color = this.tagColors[this.usedColors.size % this.tagColors.length];
    this.usedColors.set(tag, color);
    return color;
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  getFileType(file: FileEntity): string {
    const type = (file?.type || '').trim();
    if (type.includes('/')) {
      const subtype = type.split('/')[1];
      return (subtype || type).toUpperCase();
    }
    const name = file?.name || '';
    const dot = name.lastIndexOf('.');
    if (dot > -1 && dot < name.length - 1) {
      return name.substring(dot + 1).toUpperCase();
    }
    return type ? type.toUpperCase() : '—';
  }

  toggleContextMenu(file: FileEntity, event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuFile?.id === file.id && this.showContextMenu) {
      this.closeContextMenu();
    } else {
      this.contextMenuFile = file;
      this.contextMenuFolder = null;
      this.showContextMenu = true;
    }
  }

  toggleFolderContextMenu(folder: Folder, event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuFolder?.id === folder.id && this.showContextMenu) {
      this.closeContextMenu();
    } else {
      this.contextMenuFolder = folder;
      this.contextMenuFile = null;
      this.showContextMenu = true;
    }
  }

  closeContextMenu() {
    this.showContextMenu = false;
    this.contextMenuFile = null;
    this.contextMenuFolder = null;
  }

  onDelete(fileId: string): void {
    this.deleteFile.emit(fileId);
    this.closeContextMenu();
  }

  onPermanentDelete(fileId: string): void {
    this.permanentDeleteFile.emit(fileId);
    this.closeContextMenu();
  }

  onDownload(file: FileEntity): void {
    this.downloadFile.emit(file);
    this.closeContextMenu();
  }

  onShare(file: FileEntity): void {
    this.shareFile.emit(file);
  }

  onAddToFolder(file: FileEntity): void {
    this.addToFolder.emit(file);
  }

  onAddFolderToFolder(folder: Folder): void {
    this.addFolderToFolder.emit(folder);
  }

  onFavorite(file: FileEntity): void {
    this.favoriteFile.emit(file);
  }

  onRename(file: FileEntity): void {
    this.renameFile.emit(file);
  }

  onMoveTo(file: FileEntity): void {
    this.moveToFile.emit(file);
  }

  onViewDetails(file: FileEntity): void {
    this.viewDetailsFile.emit(file);
  }

  onFileClick(file: FileEntity): void {
    // Emit preview event when file row is clicked
    this.previewFile.emit(file);
  }

  onFolderClick(folder: Folder): void {
    // Emit openFolder event when folder row is clicked
    this.openFolder.emit(folder);
  }

  getFolderFileCount(folder: Folder): number {
    return folder.files?.length || 0;
  }

  isFolder(item: any): item is Folder {
    return 'files' in item && !('type' in item && 'path' in item);
  }

  onShareFolder(folder: Folder): void {
    this.shareFolder.emit(folder);
  }

  onFavoriteFolder(folder: Folder): void {
    this.favoriteFolder.emit(folder);
  }

  onRenameFolder(folder: Folder): void {
    this.renameFolder.emit(folder);
  }

  onMoveToFolder(folder: Folder): void {
    this.moveToFolder.emit(folder);
  }

  onViewDetailsFolder(folder: Folder): void {
    this.viewDetailsFolder.emit(folder);
  }
}
