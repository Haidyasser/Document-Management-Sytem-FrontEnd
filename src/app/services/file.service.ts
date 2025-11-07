import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = 'http://localhost:8080/api/workspaces';

  constructor(private http: HttpClient) {}

  uploadFile(workspaceId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/${workspaceId}/files`, formData);
  }
}
