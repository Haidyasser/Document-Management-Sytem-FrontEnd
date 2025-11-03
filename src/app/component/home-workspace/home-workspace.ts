import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-home-workspace',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopBarComponent],
  templateUrl: './home-workspace.html',
  styleUrls: ['./home-workspace.css']
})
export class HomeWorkspaceComponent implements OnInit {
  workspaces: Workspace[] = [];
  loading = false;
  error = '';
  sidebarOpen = true;

  constructor(private ws: WorkspaceService, private router: Router) {}

  ngOnInit(): void { this.fetchWorkspaces(); }

  fetchWorkspaces(): void {
    this.loading = true;
    this.ws.getUserWorkspaces().subscribe({
      next: (data: Workspace[]) => { this.workspaces = data ?? []; this.loading = false; },
      error: (err: any) => { this.error = 'Failed to load workspaces'; console.error(err); this.loading = false; }
    });
  }

  onCreateWorkspace(): void { this.router.navigate(['/create-workspace']); }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
}
