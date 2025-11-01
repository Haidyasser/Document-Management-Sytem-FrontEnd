import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent, TopBarComponent],
  templateUrl: './create-workspace.html',
  styleUrls: ['./create-workspace.css']
})
export class CreateWorkspaceComponent implements OnInit {
  workspaceForm!: FormGroup;
  sidebarOpen = true;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      access: ['Private', Validators.required]
    });
  }

  onSubmit() {
    if (this.workspaceForm.valid) {
      console.log('Form Data:', this.workspaceForm.value);
      // TODO: call your workspace API endpoint here
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
