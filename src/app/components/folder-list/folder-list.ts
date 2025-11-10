import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/folder.model';

@Component({
  selector: 'app-folder-list',
  standalone: true,
  templateUrl: './folder-list.html',
  styleUrls: ['./folder-list.css'],
  imports: [CommonModule]
})
export class FolderListComponent {
  @Input() folders: Folder[] = [];
  @Output() openFolder = new EventEmitter<Folder>();
  @Output() deleteFolder = new EventEmitter<string>();

  onOpen(folder: Folder): void {
    this.openFolder.emit(folder);
  }

  onDelete(folderId: string): void {
    this.deleteFolder.emit(folderId);
  }

  
}
