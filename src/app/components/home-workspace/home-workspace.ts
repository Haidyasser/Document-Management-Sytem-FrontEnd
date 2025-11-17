import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog';

@Component({
  selector: 'app-home-workspace',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopBarComponent],
  templateUrl: './home-workspace.html',
  styleUrls: ['./home-workspace.css']
})
export class HomeWorkspaceComponent implements OnInit {
  toggleMenu(index: number): void {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }
  workspaces: Workspace[] = [];
  loading = false;
  error = '';
  sidebarOpen = true; // Sidebar open by default
  searchQuery = '';

  // track expanded state per item (by workspace ID or index fallback)
  expanded: Record<string | number, boolean> = {};
  openMenuIndex: number | null = null;

  constructor(
    private ws: WorkspaceService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.fetchWorkspaces(); }

  fetchWorkspaces(): void {
    this.loading = true;
    console.log('Fetching workspaces from', this.ws);
    this.ws.getAll().subscribe({
      next: (data: Workspace[]) => {
        console.log('Fetched workspaces:', data);
        this.workspaces = data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load workspaces';
        console.error(err);
        this.loading = false;
      }
    });
  }

  toggleExpand(ws: Workspace, i: number): void {
    const key = ws.id || i;
    this.expanded[key] = !this.expanded[key];
  }

  isExpanded(ws: Workspace, i: number): boolean {
    const key = ws.id || i;
    return this.expanded[key] || false;
  }

  onCreateWorkspace(): void { this.router.navigate(['/create-workspace']); }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  openWorkspace(ws: Workspace): void {
    // Close menu if open
    this.openMenuIndex = null;
    if (ws.id) this.router.navigate(['/workspaces', ws.id]);
    else this.router.navigate(['/']);
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
  }

  getFilteredWorkspaces(): Workspace[] {
    if (!this.searchQuery.trim()) {
      return this.workspaces;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.workspaces.filter(ws => 
      ws.name?.toLowerCase().includes(query)
    );
  }

  onEdit(ws: Workspace): void {
    this.openMenuIndex = null;
    if (!ws.id) return;

    const dialogRef = this.dialog.open(WorkspaceDialogComponent, {
      width: '500px',
      data: {
        workspace: ws,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe((updates: Partial<Workspace>) => {
      if (updates && ws.id) {
        this.ws.update(ws.id, updates).subscribe({
          next: () => {
            this.fetchWorkspaces();
          },
          error: (err) => {
            console.error('Error updating workspace:', err);
            this.error = 'Failed to update workspace';
          }
        });
      }
    });
  }

  onDelete(ws: Workspace): void {
    this.openMenuIndex = null;
    if (confirm(`Are you sure you want to delete "${ws.name}"?`)) {
      if (ws.id) {
        this.ws.delete(ws.id).subscribe({
          next: () => {
            this.fetchWorkspaces();
          },
          error: (err) => {
            console.error('Error deleting workspace:', err);
            this.error = 'Failed to delete workspace';
          }
        });
      }
    }
  }

  onDetails(ws: Workspace): void {
    this.openMenuIndex = null;
    if (ws.id) {
      this.router.navigate(['/workspaces', ws.id]);
    }
  }
}
