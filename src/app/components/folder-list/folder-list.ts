import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/workspace.model';

@Component({
  selector: 'app-folder-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-list.html',
  styleUrls: ['./folder-list.css']
})
export class FolderListComponent {
  @Input() folders: Folder[] = [];
  @Output() addFolder = new EventEmitter<Folder>();
  @Output() deleteFolder = new EventEmitter<string>();
openFolder: any;

  onDelete(id: string): void {
    this.deleteFolder.emit(id);
  }
  onOpen(folder: Folder): void {
    this.addFolder.emit(folder);
  }
}
