import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileEntity } from '../../models/file.model';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.html',
  styleUrls: ['./file-list.css'],
  imports: [CommonModule],
})
export class FileListComponent {
  @Input() files: FileEntity[] = [];
  @Output() previewFile = new EventEmitter<FileEntity>();
  @Output() deleteFile = new EventEmitter<string>();
  @Output() downloadFile = new EventEmitter<FileEntity>();

  onDelete(fileId: string): void {
    this.deleteFile.emit(fileId);
  }

  onDownload(file: FileEntity): void {
    this.downloadFile.emit(file);
  }
}
