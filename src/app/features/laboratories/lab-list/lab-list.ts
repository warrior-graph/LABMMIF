import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Laboratory } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { LabFormDialog } from './lab-form-dialog';

@Component({
  selector: 'app-lab-list',
  imports: [
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: './lab-list.html',
  styleUrl: './lab-list.scss',
})
export class LabList implements OnInit {
  protected readonly labs = signal<Laboratory[]>([]);
  protected readonly loading = signal(true);

  protected readonly authService = inject(AuthService);
  private readonly labService = inject(LaboratoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.labService.getAll().subscribe({
      next: labs => {
        this.labs.set(labs);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load laboratories', 'Dismiss', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    const ref = this.dialog.open(LabFormDialog, { width: '480px' });
    ref.afterClosed().subscribe(created => {
      if (created) this.load();
    });
  }
}
