import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { ProjectStatus, Research } from '../../../core/models';
import { ProjectService } from '../../../core/services/project.service';

export interface ProjectFormData {
  labId: number;
  research: Research[];
}

@Component({
  selector: 'app-project-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatProgressSpinner,
  ],
  templateUrl: './project-form-dialog.html',
})
export class ProjectFormDialog {
  readonly dialogRef = inject(MatDialogRef<ProjectFormDialog>);
  readonly data = inject<ProjectFormData>(MAT_DIALOG_DATA);
  private readonly projectService = inject(ProjectService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly statuses = [
    { value: ProjectStatus.PLANNED, label: 'Planned' },
    { value: ProjectStatus.ACTIVE, label: 'Active' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.CANCELLED, label: 'Cancelled' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: [ProjectStatus.PLANNED as string],
    start_date: [''],
    end_date: [''],
    research_id: [null as number | null],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { name, description, status, start_date, end_date, research_id } =
      this.form.getRawValue();
    this.projectService
      .create(this.data.labId, {
        name,
        ...(description && { description }),
        ...(status && { status }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
        ...(research_id && { research_id }),
      })
      .subscribe({
        next: project => this.dialogRef.close(project),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.message ?? 'Failed to create project.');
          this.loading.set(false);
        },
      });
  }
}
