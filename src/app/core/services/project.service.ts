import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Project } from '../models';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  research_id?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(labId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.api}/labs/${labId}/projects`);
  }

  getById(labId: number, projectId: number): Observable<Project> {
    return this.http.get<Project>(
      `${this.api}/labs/${labId}/projects/${projectId}`,
    );
  }

  create(labId: number, data: CreateProjectPayload): Observable<Project> {
    return this.http.post<Project>(`${this.api}/labs/${labId}/projects`, data);
  }

  update(
    labId: number,
    projectId: number,
    data: Partial<CreateProjectPayload>,
  ): Observable<Project> {
    return this.http.put<Project>(
      `${this.api}/labs/${labId}/projects/${projectId}`,
      data,
    );
  }

  delete(labId: number, projectId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/labs/${labId}/projects/${projectId}`,
    );
  }

  addMember(labId: number, projectId: number, memberId: number): Observable<Project> {
    return this.http.post<Project>(
      `${this.api}/labs/${labId}/projects/${projectId}/members`,
      { member_id: memberId },
    );
  }

  removeMember(labId: number, projectId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/labs/${labId}/projects/${projectId}/members/${memberId}`,
    );
  }
}
