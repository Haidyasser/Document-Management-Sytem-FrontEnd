import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component"; // 1. Import CommonModule

@Component({
  selector: 'app-home-workspace',
  standalone: true, // 2. Make the component standalone
  imports: [CommonModule, SidebarComponent], // 3. Import CommonModule here
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
}
