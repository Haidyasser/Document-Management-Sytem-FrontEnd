import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
export interface Credentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  register(data: RegisterData): Observable<void> {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as RegisterData[];
    if (users.find(u => u.email === data.email)) {
      return throwError(() => new Error('Email already registered')).pipe(delay(200));
    }
    users.push(data);
    localStorage.setItem('users', JSON.stringify(users));
    return of(void 0).pipe(delay(200));
  }

  login(creds: Credentials): Observable<void> {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as RegisterData[];
    const found = users.find(u => u.email === creds.email && u.password === creds.password);
    return of(found).pipe(
      delay(200),
      map(f => {
        if (!f) throw new Error('Invalid credentials');
        localStorage.setItem('token', 'fake-jwt-token');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}