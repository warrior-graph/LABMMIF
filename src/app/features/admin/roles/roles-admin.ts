import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatCell, MatCellDef, MatColumnDef,
  MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef,
  MatNoDataRow, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';

import { RoleDefinition } from '../../../core/models';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-roles-admin',
  imports: [
    ReactiveFormsModule,
    MatButton, MatIconButton,
    MatCell, MatCellDef, MatColumnDef,
    MatError, MatFormField, MatLabel,
    MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef,
    MatIcon,
    MatInput,
    MatNoDataRow,
    MatOption,
    MatProgressSpinner,
    MatRow, MatRowDef, MatTable,
    MatSelect,
    MatTooltip,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Role Management</h1>

      <!-- Create form -->
      <div class="create-card">
        <h2>Add Custom Role</h2>
        <form [formGroup]="form" (ngSubmit)="create()" class="create-form">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Postdoc" />
            @if (form.get('name')?.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Level</mat-label>
            <mat-select formControlName="level">
              <mat-option [value]="0">0 – Same as Lab Coordinator</mat-option>
              <mat-option [value]="1">1 – Manager tier</mat-option>
              <mat-option [value]="2">2 – Lead tier</mat-option>
              <mat-option [value]="3">3 – Individual contributor</mat-option>
              <mat-option [value]="4">4 – Support staff</mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || creating()"
          >
            @if (creating()) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              Add Role
            }
          </button>
        </form>
        @if (createError()) {
          <p class="error-msg">{{ createError() }}</p>
        }
      </div>

      <!-- Roles table -->
      <mat-table [dataSource]="roles()" class="roles-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let r">{{ r.name }}</td>
        </ng-container>

        <ng-container matColumnDef="key">
          <th mat-header-cell *matHeaderCellDef>Key</th>
          <td mat-cell *matCellDef="let r"><code>{{ r.key }}</code></td>
        </ng-container>

        <ng-container matColumnDef="level">
          <th mat-header-cell *matHeaderCellDef>Level</th>
          <td mat-cell *matCellDef="let r">{{ r.level }}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let r">{{ r.is_system ? 'System' : 'Custom' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let r">
            @if (!r.is_system) {
              <button
                mat-icon-button
                color="warn"
                matTooltip="Delete role"
                [disabled]="deletingKey() === r.key"
                (click)="delete(r)"
              >
                @if (deletingKey() === r.key) {
                  <mat-progress-spinner diameter="18" mode="indeterminate" />
                } @else {
                  <mat-icon>delete</mat-icon>
                }
              </button>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let r; columns: columns"></tr>
        <tr class="mat-mdc-row mdc-data-table__row" *matNoDataRow>
          <td [attr.colspan]="columns.length" class="no-data">
            @if (loading()) {
              <mat-progress-spinner mode="indeterminate" diameter="32" />
            } @else {
              No roles found.
            }
          </td>
        </tr>
      </mat-table>
    </div>
  `,
  styles: [`
    .page-container { max-width: 760px; margin: 32px auto; padding: 0 16px; }
    .page-title { margin: 0 0 24px; }
    .create-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .create-card h2 { margin: 0 0 16px; font-size: 16px; }
    .create-form {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .create-form mat-form-field { flex: 1; min-width: 160px; }
    .create-form button { margin-top: 4px; }
    .error-msg { color: var(--mat-sys-error); font-size: 14px; margin: 8px 0 0; }
    .roles-table { width: 100%; border-radius: 12px; overflow: hidden; }
    .no-data { text-align: center; padding: 24px; }
    code { font-size: 12px; opacity: 0.75; }
  `],
})
export class RolesAdmin implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  protected readonly roles = signal<RoleDefinition[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly deletingKey = signal<string | null>(null);
  protected readonly createError = signal<string | null>(null);
  protected readonly columns = ['name', 'key', 'level', 'type', 'actions'];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    level: [3, Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.roleService.list().subscribe({
      next: roles => { this.roles.set(roles); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected create(): void {
    if (this.form.invalid) return;
    this.creating.set(true);
    this.createError.set(null);
    const { name, level } = this.form.getRawValue();
    this.roleService.create({ name, level }).subscribe({
      next: role => {
        this.roles.update(rs => [...rs, role].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)));
        this.form.reset({ name: '', level: 3 });
        this.creating.set(false);
        this.snackBar.open('Role created', 'Dismiss', { duration: 2000 });
      },
      error: err => {
        this.createError.set(err.error?.error ?? 'Failed to create role.');
        this.creating.set(false);
      },
    });
  }

  protected delete(role: RoleDefinition): void {
    this.deletingKey.set(role.key);
    this.roleService.delete(role.key).subscribe({
      next: () => {
        this.roles.update(rs => rs.filter(r => r.key !== role.key));
        this.deletingKey.set(null);
        this.snackBar.open('Role deleted', 'Dismiss', { duration: 2000 });
      },
      error: err => {
        this.snackBar.open(err.error?.error ?? 'Failed to delete role.', 'Dismiss', { duration: 3000 });
        this.deletingKey.set(null);
      },
    });
  }
}
