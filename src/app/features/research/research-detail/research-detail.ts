import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
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
import { MatTooltip } from '@angular/material/tooltip';

import { Member, Research } from '../../../core/models';
import { ResearchService } from '../../../core/services/research.service';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-research-detail',
  imports: [
    RouterLink,
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
    MatTooltip,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  templateUrl: './research-detail.html',
  styleUrl: './research-detail.scss',
})
export class ResearchDetail implements OnInit {
  protected readonly research = signal<Research | null>(null);
  protected readonly loading = signal(true);
  protected readonly addMemberId = signal('');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly researchService = inject(ResearchService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected labId = 0;
  protected researchId = 0;

  readonly memberColumns = ['name', 'email', 'actions'];

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('labId'));
    this.researchId = Number(this.route.snapshot.paramMap.get('researchId'));
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.researchService.getById(this.labId, this.researchId).subscribe({
      next: r => {
        this.research.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Research group not found', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/labs', this.labId]);
      },
    });
  }

  protected addMember(): void {
    const id = Number(this.addMemberId());
    if (!id) return;
    this.researchService.addMember(this.labId, this.researchId, id).subscribe({
      next: r => {
        this.research.set(r);
        this.addMemberId.set('');
        this.snackBar.open('Member added', 'Dismiss', { duration: 2000 });
      },
      error: err =>
        this.snackBar.open(err.error?.message ?? 'Failed to add member', 'Dismiss', {
          duration: 3000,
        }),
    });
  }

  protected removeMember(member: Member): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Remove Member',
        message: `Remove ${member.first_name} ${member.last_name} from this research group?`,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.researchService.removeMember(this.labId, this.researchId, member.id).subscribe({
        next: () =>
          this.research.update(r =>
            r ? { ...r, members: r.members?.filter(m => m.id !== member.id) } : r,
          ),
      });
    });
  }
}
