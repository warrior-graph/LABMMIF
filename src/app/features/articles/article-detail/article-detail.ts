import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

import { Article, Member } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-article-detail',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    MatDivider,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatInput,
    MatChipSet,
    MatChip,
  ],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.scss',
})
export class ArticleDetail implements OnInit {
  protected readonly article = signal<Article | null>(null);
  protected readonly loading = signal(true);
  protected readonly addAuthorId = signal('');

  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected labId = 0;
  protected articleId = 0;

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('labId'));
    this.articleId = Number(this.route.snapshot.paramMap.get('articleId'));
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.articleService.getById(this.labId, this.articleId).subscribe({
      next: a => {
        this.article.set(a);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Article not found', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/labs', this.labId]);
      },
    });
  }

  protected addAuthor(): void {
    const id = Number(this.addAuthorId());
    if (!id) return;
    this.articleService.addAuthor(this.labId, this.articleId, id).subscribe({
      next: a => {
        this.article.set(a);
        this.addAuthorId.set('');
        this.snackBar.open('Author added', 'Dismiss', { duration: 2000 });
      },
      error: err =>
        this.snackBar.open(err.error?.message ?? 'Failed to add author', 'Dismiss', {
          duration: 3000,
        }),
    });
  }

  protected removeAuthor(author: Member): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Remove Author',
        message: `Remove ${author.first_name} ${author.last_name} as author?`,
        confirmLabel: 'Remove',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.article.update(a =>
        a ? { ...a, authors: a.authors?.filter(m => m.id !== author.id) } : a,
      );
    });
  }
}
