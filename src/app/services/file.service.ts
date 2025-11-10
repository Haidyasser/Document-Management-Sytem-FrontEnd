import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileEntity } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = 'http://localhost:8080/api';
  private filesUrl = `${this.baseUrl}/files`;
  private workspacesUrl = `${this.baseUrl}/workspaces`;
  authService: any;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFilesByUser(nid: string): Observable<FileEntity[]> {
    return this.http.get<FileEntity[]>(`${this.filesUrl}/user/${nid}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRecentlyDeletedFiles(options: { userId?: string; workspaceId?: string }): Observable<FileEntity[]> {
    const { userId, workspaceId } = options || {};
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    if (workspaceId) params = params.set('workspaceId', workspaceId);

    return this.http.get<FileEntity[]>(`${this.filesUrl}/deleted`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  restoreFile(id: string): Observable<{ message: string; file: FileEntity }> {
    return this.http.put<{ message: string; file: FileEntity }>(`${this.filesUrl}/restore/${id}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  permanentlyDeleteFile(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.filesUrl}/permanent/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadFile(workspaceId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData - browser will set it with boundary
    });
    const user = localStorage.getItem('user');
    console.log(user);
    const nid = JSON.parse(user || '{}').nid;
    formData.append('nid', nid);
    console.log('nid', nid);
    console.log('formData', formData);
    return this.http.post(`${this.workspacesUrl}/${workspaceId}/files`, formData, { headers });
  }
}
