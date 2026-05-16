import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/auth/auth.service';
import { MemberService } from '../../../core/services/member.service';

@Component({
  selector: 'app-member-profile',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatProgressSpinner,
  ],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.scss',
})
export class MemberProfile implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly memberService = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    password: [''],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    this.loading.set(true);
    const { first_name, last_name, password } = this.form.getRawValue();
    this.memberService
      .updateProfile(userId, {
        first_name,
        last_name,
        ...(password && { password }),
      })
      .subscribe({
        next: updated => {
          this.authService.currentUser.set(updated);
          this.form.patchValue({ password: '' });
          this.snackBar.open('Profile updated', 'Dismiss', { duration: 2000 });
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.snackBar.open(err.error?.message ?? 'Update failed', 'Dismiss', {
            duration: 3000,
          });
          this.loading.set(false);
        },
      });
  }
}
