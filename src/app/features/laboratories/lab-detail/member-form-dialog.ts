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

import { CompensationType, LabRole, LAB_ROLE_LABELS } from '../../../core/models';
import { MemberService } from '../../../core/services/member.service';

export interface MemberFormData {
  labId: number;
}

@Component({
  selector: 'app-member-form-dialog',
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
  templateUrl: './member-form-dialog.html',
})
export class MemberFormDialog {
  readonly dialogRef = inject(MatDialogRef<MemberFormDialog>);
  readonly data = inject<MemberFormData>(MAT_DIALOG_DATA);
  private readonly memberService = inject(MemberService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly roles = Object.entries(LAB_ROLE_LABELS).map(([value, label]) => ({
    value: value as LabRole,
    label,
  }));

  protected readonly compensationTypes = [
    { value: CompensationType.PROJECT_SALARY, label: 'Project Salary' },
    { value: CompensationType.RESEARCH_GRANT, label: 'Research Grant' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    member_id: [0, [Validators.required, Validators.min(1)]],
    role: [LabRole.STAFF as string, Validators.required],
    compensation_type: ['' as string],
    compensation_value: [null as number | null],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { member_id, role, compensation_type, compensation_value } =
      this.form.getRawValue();
    this.memberService
      .addMember(this.data.labId, {
        member_id,
        role,
        ...(compensation_type && { compensation_type }),
        ...(compensation_value != null && { compensation_value }),
      })
      .subscribe({
        next: membership => this.dialogRef.close(membership),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.message ?? 'Failed to add member.');
          this.loading.set(false);
        },
      });
  }
}
