import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Research } from '../models';

export interface CreateResearchPayload {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ResearchService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(labId: number): Observable<Research[]> {
    return this.http.get<Research[]>(`${this.api}/labs/${labId}/research`);
  }

  getById(labId: number, researchId: number): Observable<Research> {
    return this.http.get<Research>(
      `${this.api}/labs/${labId}/research/${researchId}`,
    );
  }

  create(labId: number, data: CreateResearchPayload): Observable<Research> {
    return this.http.post<Research>(`${this.api}/labs/${labId}/research`, data);
  }

  update(
    labId: number,
    researchId: number,
    data: Partial<CreateResearchPayload>,
  ): Observable<Research> {
    return this.http.put<Research>(
      `${this.api}/labs/${labId}/research/${researchId}`,
      data,
    );
  }

  delete(labId: number, researchId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/labs/${labId}/research/${researchId}`,
    );
  }

  addMember(labId: number, researchId: number, memberId: number): Observable<Research> {
    return this.http.post<Research>(
      `${this.api}/labs/${labId}/research/${researchId}/members`,
      { member_id: memberId },
    );
  }

  removeMember(labId: number, researchId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/labs/${labId}/research/${researchId}/members/${memberId}`,
    );
  }
}
