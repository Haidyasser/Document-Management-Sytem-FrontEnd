import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RegisterData {
  firstName: string;
  lastName: string;
  nationalId?: string;
  email: string;
  password: string;
}

export interface Credentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterData): Observable<string> {
    const body = {
      email: data.email,
      password: data.password,
      nationalId: data.nationalId ?? '',
      firstName: data.firstName,
      lastName: data.lastName,
    };
    return this.http.post(`${this.baseUrl}/register`, body, { responseType: 'text' });
  }

  login(creds: Credentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, creds, { responseType: 'text' }).pipe(
      map(text => {
        try {
          const parsed = JSON.parse(text);
          if (parsed?.token) {
            localStorage.setItem('token', parsed.token);
            if (parsed.user) {
              localStorage.setItem('user', JSON.stringify(parsed.user));
            }
          }
          return parsed;
        } catch {
          const s = (text || '').trim();
          if (!s) return { message: 'empty response' };
          const token = s.startsWith('Bearer ') ? s.substring(7) : s;
          localStorage.setItem('token', token);
          return { token };
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
