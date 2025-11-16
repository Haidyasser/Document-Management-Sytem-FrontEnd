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
    return this.http.get<Workspace[]>(this.baseUrl + '/root', { headers: this.getAuthHeaders() });
  }

  getById(workspaceId: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.baseUrl}/${workspaceId}/tree`, {
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
  // 🔸 Subfolders / children
  // -----------------------

  getSubfolders(parentId: string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.baseUrl}/${parentId}/children`, {
      headers: this.getAuthHeaders(),
    });
  }

  // -----------------------
  // 📂 Folder Operations
  // -----------------------

  addFolder(workspaceId: string, folder: Folder): Observable<Workspace> {
  const folderData = { ...folder, parentId: workspaceId };
  console.log('Adding folder from service', folderData);
  return this.http.post<Workspace>(this.baseUrl, folderData, {
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

  deleteFolder(folderId: string): Observable<Workspace> {
    return this.http.delete<Workspace>(
      `${this.baseUrl}/${folderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // -----------------------
  // 📄 File Operations
  // -----------------------

  // metadata-only add (if backend supports)
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

  // backend controller expects DELETE /api/workspaces/files/{fileId} for soft delete
  deleteFile(_workspaceId: string | null, fileId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/files/${fileId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // upload binary multipart form (backend: POST /{workspaceId}/files)
  uploadFile(workspaceId: string, file: File, folderId?: string, providedName?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (providedName) {
      // backend controller currently uses original filename; include if backend updated to accept it
      formData.append('name', providedName);
    }

    const url = folderId
      ? `${this.baseUrl}/${workspaceId}/folders/${folderId}/files`
      : `${this.baseUrl}/${workspaceId}/files`;

    const headers = this.getAuthHeaders(); // do not set Content-Type — browser sets boundary
    return this.http.post<any>(url, formData, { headers });
  }

  downloadFile(workspaceId: string, fileId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${workspaceId}/files/${fileId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob' as 'blob'
    });
  }

  previewFile(workspaceId: string, fileId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${workspaceId}/files/${fileId}/preview`, {
      headers: this.getAuthHeaders(),
      responseType: 'json' as 'json'
    });
  }

  previewFileAsBlob(workspaceId: string, fileId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${workspaceId}/files/${fileId}/preview`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob' as 'blob'
    });
  }

}

