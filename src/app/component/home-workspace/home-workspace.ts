import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopBarComponent } from "../top-bar/top-bar.component";

@Component({
  selector: 'app-home-workspace',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopBarComponent],
  templateUrl: './home-workspace.html',
  styleUrls: ['./home-workspace.css']
})
export class HomeWorkspaceComponent {
  folders = [
    { name: 'Internship Docs' },
    { name: 'School Papers' },
    { name: 'Financial' },
    { name: 'Legal' },
  ];

  constructor(private router: Router) {}

  onCreateWorkspace() {
    this.router.navigate(['/create-workspace']);
  }
}
