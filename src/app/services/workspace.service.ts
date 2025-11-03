import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace, Folder, FileEntity } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  [x: string]: any;
  private apiUrl = 'http://localhost:8080/api/workspaces'; // update if needed

  constructor(private http: HttpClient) {}

  createWorkspace(workspace: Workspace): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}`, workspace);
  }

  getUserWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}`);
  }

  getWorkspaceById(workspaceId: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${workspaceId}`);
  }

  addFolder(workspaceId: string, folder: Folder): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/${workspaceId}/folders`, folder);
  }

  addFile(workspaceId: string, file: FileEntity): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/${workspaceId}/files`, file);
  }

  addFileToFolder(workspaceId: string, folderId: string, file: FileEntity): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/${workspaceId}/folders/${folderId}/files`, file);
  }

  addSubFolder(workspaceId: string, parentFolderId: string, subFolder: Folder): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/${workspaceId}/folders/${parentFolderId}/subfolders`, subFolder);
  }
}
