import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace, CreateWorkspaceDto } from '../models/workspace.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly baseUrl = 'http://localhost:8080/api/workspaces';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.baseUrl);
  }

  create(payload: CreateWorkspaceDto): Observable<Workspace> {
    return this.http.post<Workspace>(this.baseUrl, payload);
  }
}