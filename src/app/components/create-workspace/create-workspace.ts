import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-create-workspace',
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, TopBarComponent],
  templateUrl: './create-workspace.html',
  styleUrls: ['./create-workspace.css']
})
export class CreateWorkspaceComponent implements OnInit {
  workspaceForm!: FormGroup;
  sidebarOpen = true;
  submitting = false;
  error = '';

  constructor(private fb: FormBuilder, private ws: WorkspaceService, private router: Router) {}

  ngOnInit(): void {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      access: ['private', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.workspaceForm.invalid) return;
    this.submitting = true;
    this.ws.createWorkspace(this.workspaceForm.value).subscribe({
      next: () => { this.submitting = false; this.router.navigate(['/']); },
      error: (err: any) => { this.submitting = false; this.error = 'Failed to create workspace'; console.error(err); }
    });
  }

  onCancel(): void { this.router.navigate(['/']); }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
}
