import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, Member, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = environment.apiUrl;

  readonly currentUser = signal<Member | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isInitialized = signal(false);

  constructor() {
    if (localStorage.getItem('access_token')) {
      this.http.get<Member>(`${this.api}/auth/me`).subscribe({
        next: member => {
          this.currentUser.set(member);
          this.isInitialized.set(true);
        },
        error: () => this.isInitialized.set(true),
      });
    } else {
      this.isInitialized.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
          this.currentUser.set(res.member);
        }),
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/register`, data)
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
          this.currentUser.set(res.member);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
