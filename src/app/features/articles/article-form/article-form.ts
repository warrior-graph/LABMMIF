import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ArticleService } from '../../../core/services/article.service';

@Component({
  selector: 'app-article-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButton,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: './article-form.html',
  styleUrl: './article-form.scss',
})
export class ArticleForm implements OnInit {
  private readonly articleService = inject(ArticleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected labId = 0;

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    abstract: [''],
    journal: [''],
    doi: [''],
    published_at: [''],
  });

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('labId'));
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { title, abstract, journal, doi, published_at } = this.form.getRawValue();
    this.articleService
      .create(this.labId, {
        title,
        ...(abstract && { abstract }),
        ...(journal && { journal }),
        ...(doi && { doi }),
        ...(published_at && { published_at }),
      })
      .subscribe({
        next: article => {
          this.snackBar.open('Article created', 'Dismiss', { duration: 2000 });
          this.router.navigate(['/labs', this.labId, 'articles', article.id]);
        },
        error: (err: HttpErrorResponse) => {
          this.snackBar.open(err.error?.message ?? 'Failed to create article', 'Dismiss', {
            duration: 3000,
          });
          this.loading.set(false);
        },
      });
  }
}
