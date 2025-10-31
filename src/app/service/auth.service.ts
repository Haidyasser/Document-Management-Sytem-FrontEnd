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

  // POST /api/auth/register with the exact body shape you specified
  register(data: RegisterData): Observable<string> {
    const body = {
      email: data.email,
      password: data.password,
      nationalId: data.nationalId ?? '',
      firstName: data.firstName,
      lastName: data.lastName
    };
    // tell HttpClient we expect plain text (avoids JSON parse error)
    return this.http.post(`${this.baseUrl}/register`, body, { responseType: 'text' });
  }

  // replace login method
  login(creds: Credentials): Observable<any> {
    // expect plain text from backend to avoid JSON parse error
    return this.http.post(`${this.baseUrl}/login`, creds, { responseType: 'text' }).pipe(
      map(text => {
        // try JSON.parse first (in case backend returns JSON)
        try {
          const parsed = JSON.parse(text);
          if (parsed?.token) localStorage.setItem('token', parsed.token);
          return parsed;
        } catch {
          // backend returned plain text (maybe token or "Bearer ...")
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
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
