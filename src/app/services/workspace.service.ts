import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../models/workspace.model';
import { FileEntity } from '../models/file.model';
import { Folder } from '../models/folder.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly baseUrl = 'http://localhost:8080/api/workspaces';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // -----------------------
  // 🔹 Workspace CRUD
  // -----------------------

  getAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  getById(workspaceId: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.baseUrl}/${workspaceId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  create(workspace: Workspace): Observable<Workspace> {
    return this.http.post<Workspace>(this.baseUrl, workspace, {
      headers: this.getAuthHeaders(),
    });
  }

  update(workspaceId: string, workspace: Workspace): Observable<Workspace> {
    return this.http.put<Workspace>(`${this.baseUrl}/${workspaceId}`, workspace, {
      headers: this.getAuthHeaders(),
    });
  }

  delete(workspaceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${workspaceId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // -----------------------
  // 📂 Folder Operations
  // -----------------------

  addFolder(workspaceId: string, folder: Folder): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.baseUrl}/${workspaceId}/folders`, folder, {
      headers: this.getAuthHeaders(),
    });
  }

  addSubFolder(workspaceId: string, parentFolderId: string, folder: Folder): Observable<Workspace> {
    return this.http.post<Workspace>(
      `${this.baseUrl}/${workspaceId}/folders/${parentFolderId}`,
      folder,
      { headers: this.getAuthHeaders() }
    );
  }

  updateFolder(workspaceId: string, folderId: string, folder: Folder): Observable<Workspace> {
    return this.http.put<Workspace>(
      `${this.baseUrl}/${workspaceId}/folders/${folderId}`,
      folder,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteFolder(workspaceId: string, folderId: string): Observable<Workspace> {
  return this.http.delete<Workspace>(
    `${this.baseUrl}/${workspaceId}/folders/${folderId}`,
    { headers: this.getAuthHeaders() }
  );
}

  // -----------------------
  // 📄 File Operations
  // -----------------------

  addFile(workspaceId: string, file: FileEntity, folderId?: string): Observable<Workspace> {
    const url = folderId
      ? `${this.baseUrl}/${workspaceId}/folders/${folderId}/files`
      : `${this.baseUrl}/${workspaceId}/files`;

    return this.http.post<Workspace>(url, file, { headers: this.getAuthHeaders() });
  }

  updateFile(workspaceId: string, fileId: string, file: FileEntity): Observable<Workspace> {
    return this.http.put<Workspace>(
      `${this.baseUrl}/${workspaceId}/files/${fileId}`,
      file,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteFile(workspaceId: string, fileId: string): Observable<Workspace> {
    return this.http.delete<Workspace>(`${this.baseUrl}/${workspaceId}/files/${fileId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

