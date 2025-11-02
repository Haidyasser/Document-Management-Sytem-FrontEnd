import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  validationSummary: string[] = [];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      nid: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private clearServerErrors() {
    this.validationSummary = [];
    Object.keys(this.form.controls).forEach(key => {
      const c = this.form.get(key);
      if (!c) return;
      const errs = { ...(c.errors || {}) } as any;
      if (errs.server) {
        delete errs.server;
        c.setErrors(Object.keys(errs).length ? errs : null);
      }
    });
  }

  private applyServerValidation(body: any) {
    const mapKey = (k: string) => ({ nationalId: 'nid' } as any)[k] || k;
    const v = body?.validationErrors || {};
    const keys = Object.keys(v);
    keys.forEach(k => {
      const control = this.form.get(mapKey(k));
      const msg = typeof v[k] === 'string' ? v[k] : String(v[k]);
      if (control) {
        control.setErrors({ ...(control.errors || {}), server: msg });
        control.markAsTouched();
      }
      this.validationSummary.push(`${k}: ${msg}`);
    });
    this.error = body?.message || body?.error || 'Registration failed';
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.clearServerErrors();

    const { firstName, lastName, nid, email, password } = this.form.value as {
      firstName: string; lastName: string; nid: string; email: string; password: string;
    };
    this.auth.register({ firstName, lastName, nationalId: nid, email, password }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        console.error('Register error:', err); // <--- log full error
        let body: any = err?.error ?? null;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch { body = null; }
        }
        if (body && typeof body === 'object') {
          this.applyServerValidation(body);
        } else if (err?.status === 0) {
          this.error = 'Cannot reach server. Check backend and CORS (status 0).';
        } else if (err?.status) {
          // show server status + message for debugging
          this.error = `Server returned ${err.status} ${err.statusText || ''}: ${body?.message || err?.message || 'Registration failed'}`;
        } else {
          this.error = err?.message || 'Registration failed';
        }
        this.loading = false;
      }
    });
  }
}
