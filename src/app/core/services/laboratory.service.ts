import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Laboratory } from '../models';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.api}/labs`);
  }

  getById(id: number): Observable<Laboratory> {
    return this.http.get<Laboratory>(`${this.api}/labs/${id}`);
  }

  create(data: { name: string; description: string }): Observable<Laboratory> {
    return this.http.post<Laboratory>(`${this.api}/labs`, data);
  }

  update(
    id: number,
    data: Partial<{ name: string; description: string }>,
  ): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.api}/labs/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/labs/${id}`);
  }
}
