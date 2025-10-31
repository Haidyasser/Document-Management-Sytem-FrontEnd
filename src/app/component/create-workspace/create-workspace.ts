import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-workspace',
  templateUrl: './create-workspace.html',
  styleUrls: ['./create-workspace.css'],
  imports: [SidebarComponent, ReactiveFormsModule, TopBarComponent],
})
export class CreateWorkspaceComponent implements OnInit {
  workspaceForm!: FormGroup;

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
}
