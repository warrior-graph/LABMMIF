import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Article } from '../models';

export interface CreateArticlePayload {
  title: string;
  abstract?: string;
  journal?: string;
  doi?: string;
  published_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(labId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.api}/labs/${labId}/articles`);
  }

  getById(labId: number, articleId: number): Observable<Article> {
    return this.http.get<Article>(
      `${this.api}/labs/${labId}/articles/${articleId}`,
    );
  }

  create(labId: number, data: CreateArticlePayload): Observable<Article> {
    return this.http.post<Article>(`${this.api}/labs/${labId}/articles`, data);
  }

  update(
    labId: number,
    articleId: number,
    data: Partial<CreateArticlePayload>,
  ): Observable<Article> {
    return this.http.put<Article>(
      `${this.api}/labs/${labId}/articles/${articleId}`,
      data,
    );
  }

  delete(labId: number, articleId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/labs/${labId}/articles/${articleId}`,
    );
  }

  addAuthor(labId: number, articleId: number, memberId: number): Observable<Article> {
    return this.http.post<Article>(
      `${this.api}/labs/${labId}/articles/${articleId}/authors`,
      { member_id: memberId },
    );
  }
}
