import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, Folder, FileEntity } from '../../models/workspace.model';
import { FolderListComponent } from "../folder-list/folder-list";
import { FileListComponent } from "../file-list/file-list";
import { FolderForm } from "../folder-form/folder-form";
import { FileForm } from "../file-form/file-form";
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.html',
  styleUrls: ['./workspace-detail.css'],
  imports: [CommonModule, FolderListComponent, FileListComponent, FolderForm, FileForm, TopBarComponent, SidebarComponent],
})
export class WorkspaceDetailsComponent implements OnInit {
closeSidebar(): void { this.sidebarOpen = false; }
  sidebarOpen: boolean = true;
toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
}
  workspaceId!: string;
  workspace?: Workspace;

  showFolderForm = false;
  showFileForm = false;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.route.snapshot.paramMap.get('id')!;
    this.loadWorkspace();
  }

  loadWorkspace(): void {
    this.workspaceService.getWorkspaceById(this.workspaceId).subscribe({
      next: (data) => (this.workspace = data),
      error: (err) => console.error('Failed to load workspace:', err)
    });
  }

  // 🟦 Folder handlers
  openFolderForm() {
    this.showFolderForm = true;
  }

  onFolderCreated(folder: any) {
    this.showFolderForm = false;
    this.workspace?.folders?.push(folder);
  }

  // 🟩 File handlers
  openFileForm() {
    this.showFileForm = true;
  }

  onFileUploaded(file: any) {
    this.showFileForm = false;
    this.workspace?.files?.push(file);
  }

  // 🟥 Other CRUD actions
  onDeleteFolder(folderId: string) {
    this.workspace!.folders = this.workspace!.folders!.filter(f => f.id !== folderId);
  }

  onDeleteFile(fileId: string) {
    this.workspace!.files = this.workspace!.files!.filter(f => f.id !== fileId);
  }

  onPreviewFile(file: any) {
    console.log('Preview file:', file);
  }

  onOpenFolder(folder: any) {
    console.log('Open folder:', folder);
  }
}
