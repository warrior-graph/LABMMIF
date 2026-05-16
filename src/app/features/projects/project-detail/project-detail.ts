import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCellDef,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
  MatHeaderCell,
  MatCell,
  MatHeaderRow,
  MatRow,
} from '@angular/material/table';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { Member, Project } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-project-detail',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatNoDataRow,
    MatChipSet,
    MatChip,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnInit {
  protected readonly project = signal<Project | null>(null);
  protected readonly loading = signal(true);
  protected readonly addMemberId = signal('');

  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected labId = 0;
  protected projectId = 0;

  readonly memberColumns = ['name', 'email', 'actions'];

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('labId'));
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.projectService.getById(this.labId, this.projectId).subscribe({
      next: p => {
        this.project.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Project not found', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/labs', this.labId]);
      },
    });
  }

  protected addMember(): void {
    const id = Number(this.addMemberId());
    if (!id) return;
    this.projectService.addMember(this.labId, this.projectId, id).subscribe({
      next: p => {
        this.project.set(p);
        this.addMemberId.set('');
        this.snackBar.open('Member added', 'Dismiss', { duration: 2000 });
      },
      error: (err) =>
        this.snackBar.open(err.error?.message ?? 'Failed to add member', 'Dismiss', {
          duration: 3000,
        }),
    });
  }

  protected removeMember(member: Member): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Remove Member',
        message: `Remove ${member.first_name} ${member.last_name} from this project?`,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.projectService.removeMember(this.labId, this.projectId, member.id).subscribe({
        next: () => {
          this.project.update(p =>
            p ? { ...p, members: p.members?.filter(m => m.id !== member.id) } : p,
          );
          this.snackBar.open('Member removed', 'Dismiss', { duration: 2000 });
        },
      });
    });
  }
}
