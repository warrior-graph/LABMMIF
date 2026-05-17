import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
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

import {
  Article,
  LabMembership,
  LabRole,
  MANAGER_ROLES,
  Project,
  Research,
  RESEARCHER_AND_ABOVE,
  ROLE_LEVEL,
  TECH_LEAD_AND_ABOVE,
} from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { MemberService } from '../../../core/services/member.service';
import { ProjectService } from '../../../core/services/project.service';
import { ResearchService } from '../../../core/services/research.service';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { RoleBadge } from '../../../shared/components/role-badge/role-badge';
import { EditMemberDialog, EditMemberData } from './edit-member-dialog';
import { MemberFormDialog } from './member-form-dialog';
import { ProjectFormDialog } from './project-form-dialog';
import { ResearchFormDialog } from './research-form-dialog';
import { Laboratory } from '../../../core/models';

@Component({
  selector: 'app-lab-detail',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    MatTabGroup,
    MatTab,
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
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    RoleBadge,
  ],
  templateUrl: './lab-detail.html',
  styleUrl: './lab-detail.scss',
})
export class LabDetail implements OnInit {
  protected readonly lab = signal<Laboratory | null>(null);
  protected readonly members = signal<LabMembership[]>([]);
  protected readonly projects = signal<Project[]>([]);
  protected readonly research = signal<Research[]>([]);
  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly labService = inject(LaboratoryService);
  private readonly memberService = inject(MemberService);
  private readonly projectService = inject(ProjectService);
  private readonly researchService = inject(ResearchService);
  private readonly articleService = inject(ArticleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected labId = 0;

  protected readonly isSuperAdmin = computed(
    () => this.authService.currentUser()?.is_super_admin ?? false,
  );

  protected readonly currentMembership = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return null;
    return this.members().find(m => m.member_id === userId) ?? null;
  });

  protected readonly isCeo = computed(() => {
    if (this.isSuperAdmin()) return true;
    const m = this.currentMembership();
    return m?.roles?.includes(LabRole.CEO) ?? false;
  });

  protected readonly isChiefScientist = computed(() => {
    if (this.isSuperAdmin()) return true;
    const m = this.currentMembership();
    return m ? (m.roles?.includes(LabRole.CEO) || m.roles?.includes(LabRole.CHIEF_SCIENTIST)) : false;
  });

  protected readonly isManager = computed(() => {
    if (this.isSuperAdmin()) return true;
    const m = this.currentMembership();
    return m ? m.roles?.some(r => MANAGER_ROLES.includes(r as LabRole)) : false;
  });

  protected readonly isTechLead = computed(() => {
    if (this.isSuperAdmin()) return true;
    const m = this.currentMembership();
    return m ? m.roles?.some(r => TECH_LEAD_AND_ABOVE.includes(r as LabRole)) : false;
  });

  protected readonly isResearcher = computed(() => {
    if (this.isSuperAdmin()) return true;
    const m = this.currentMembership();
    return m ? m.roles?.some(r => RESEARCHER_AND_ABOVE.includes(r as LabRole)) : false;
  });

  protected readonly currentLevel = computed(() => {
    const roles = this.currentMembership()?.roles;
    if (!roles?.length) return 99;
    return Math.min(...roles.map(r => ROLE_LEVEL[r as LabRole] ?? 99));
  });

  protected canManage(m: LabMembership): boolean {
    if (this.isSuperAdmin()) return true;
    const myLevel = this.currentLevel();
    const targetLevel = m.roles?.length
      ? Math.min(...m.roles.map(r => ROLE_LEVEL[r as LabRole] ?? 99))
      : 99;
    return myLevel < targetLevel;
  }

  protected readonly canAddMember = computed(() =>
    this.isSuperAdmin() || this.currentLevel() < 4
  );

  readonly memberColumns = ['name', 'email', 'role', 'specialization', 'compensation', 'actions'];
  readonly projectColumns = ['name', 'status', 'start_date', 'end_date', 'actions'];
  readonly researchColumns = ['name', 'description', 'members', 'actions'];
  readonly articleColumns = ['title', 'journal', 'doi', 'published_at', 'authors', 'actions'];

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('labId'));
    this.loadAll();
  }

  protected loadAll(): void {
    this.loading.set(true);
    this.labService.getById(this.labId).subscribe({
      next: lab => {
        this.lab.set(lab);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load laboratory', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/labs']);
      },
    });

    this.memberService.getLabMembers(this.labId).subscribe({
      next: members => {
        this.members.set(members);
      },
    });

    this.projectService.getAll(this.labId).subscribe({
      next: projects => this.projects.set(projects),
    });

    this.researchService.getAll(this.labId).subscribe({
      next: research => this.research.set(research),
    });

    this.articleService.getAll(this.labId).subscribe({
      next: articles => this.articles.set(articles),
    });
  }

  // ─── Members ───────────────────────────────────────────────────────────────

  protected openAddMember(): void {
    const ref = this.dialog.open(MemberFormDialog, {
      width: '520px',
      data: { labId: this.labId, requesterRoleLevel: this.isSuperAdmin() ? -1 : this.currentLevel() },
    });
    ref.afterClosed().subscribe(added => {
      if (added) {
        this.memberService.getLabMembers(this.labId).subscribe(m => this.members.set(m));
      }
    });
  }

  protected openEditMember(m: LabMembership): void {
    const ref = this.dialog.open<EditMemberDialog, EditMemberData, LabMembership>(EditMemberDialog, {
      width: '480px',
      data: {
        labId: this.labId,
        membership: m,
        requesterRoleLevel: this.isSuperAdmin() ? -1 : this.currentLevel(),
        labMembers: this.members().filter(x => x.member_id !== m.member_id),
      },
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        this.members.update(ms => ms.map(x =>
          x.member_id === updated.member_id ? { ...x, ...updated } : x
        ));
        this.snackBar.open('Member updated', 'Dismiss', { duration: 2000 });
      }
    });
  }

  protected removeMember(memberId: number, name: string): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Remove Member', message: `Remove ${name} from this lab?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.memberService.removeMember(this.labId, memberId).subscribe({
        next: () => {
          this.members.update(ms => ms.filter(m => m.member_id !== memberId));
          this.snackBar.open('Member removed', 'Dismiss', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to remove member', 'Dismiss', { duration: 3000 }),
      });
    });
  }

  // ─── Projects ──────────────────────────────────────────────────────────────

  protected openAddProject(): void {
    const techLeads = this.members().filter(m => m.roles?.includes(LabRole.TECH_LEAD));
    const ref = this.dialog.open(ProjectFormDialog, {
      width: '520px',
      data: { labId: this.labId, research: this.research(), techLeads },
    });
    ref.afterClosed().subscribe(created => {
      if (created) {
        this.projectService.getAll(this.labId).subscribe(p => this.projects.set(p));
      }
    });
  }

  protected deleteProject(projectId: number, name: string): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete Project', message: `Delete project "${name}"?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.projectService.delete(this.labId, projectId).subscribe({
        next: () => {
          this.projects.update(ps => ps.filter(p => p.id !== projectId));
          this.snackBar.open('Project deleted', 'Dismiss', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to delete project', 'Dismiss', { duration: 3000 }),
      });
    });
  }

  protected toggleProject(project: Project): void {
    const call = project.is_active
      ? this.projectService.deactivate(this.labId, project.id)
      : this.projectService.activate(this.labId, project.id);
    call.subscribe({
      next: updated => {
        this.projects.update(ps => ps.map(p => p.id === project.id ? updated : p));
        this.snackBar.open(`Project ${updated.is_active ? 'activated' : 'deactivated'}.`, 'Dismiss', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update project status.', 'Dismiss', { duration: 3000 }),
    });
  }

  // ─── Research ──────────────────────────────────────────────────────────────

  protected openAddResearch(): void {
    const chiefScientists = this.members().filter(
      m => m.roles?.some(r => r === LabRole.CHIEF_SCIENTIST || r === LabRole.CEO)
    );
    const ref = this.dialog.open(ResearchFormDialog, {
      width: '480px',
      data: { labId: this.labId, labMembers: chiefScientists },
    });
    ref.afterClosed().subscribe(created => {
      if (created) {
        this.researchService.getAll(this.labId).subscribe(r => this.research.set(r));
      }
    });
  }

  protected deleteResearch(researchId: number, name: string): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete Research Group', message: `Delete "${name}"?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.researchService.delete(this.labId, researchId).subscribe({
        next: () => {
          this.research.update(rs => rs.filter(r => r.id !== researchId));
          this.snackBar.open('Research group deleted', 'Dismiss', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to delete research group', 'Dismiss', { duration: 3000 }),
      });
    });
  }

  protected toggleResearch(group: Research): void {
    const call = group.is_active
      ? this.researchService.deactivate(this.labId, group.id)
      : this.researchService.activate(this.labId, group.id);
    call.subscribe({
      next: updated => {
        this.research.update(rs => rs.map(r => r.id === group.id ? updated : r));
        this.snackBar.open(`Research group ${updated.is_active ? 'activated' : 'deactivated'}.`, 'Dismiss', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update research group status.', 'Dismiss', { duration: 3000 }),
    });
  }

  // ─── Articles ──────────────────────────────────────────────────────────────

  protected deleteArticle(articleId: number, title: string): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete Article', message: `Delete "${title}"?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.articleService.delete(this.labId, articleId).subscribe({
        next: () => {
          this.articles.update(as => as.filter(a => a.id !== articleId));
          this.snackBar.open('Article deleted', 'Dismiss', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to delete article', 'Dismiss', { duration: 3000 }),
      });
    });
  }

  protected toggleArticle(article: Article): void {
    const call = article.is_active
      ? this.articleService.deactivate(this.labId, article.id)
      : this.articleService.activate(this.labId, article.id);
    call.subscribe({
      next: updated => {
        this.articles.update(as => as.map(a => a.id === article.id ? updated : a));
        this.snackBar.open(`Article ${updated.is_active ? 'activated' : 'deactivated'}.`, 'Dismiss', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update article status.', 'Dismiss', { duration: 3000 }),
    });
  }

  // ─── Lab management ────────────────────────────────────────────────────────

  protected deleteLab(): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Delete Laboratory',
        message: `Permanently delete "${this.lab()?.name}"? This cannot be undone.`,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.labService.delete(this.labId).subscribe({
        next: () => this.router.navigate(['/labs']),
        error: () => this.snackBar.open('Failed to delete laboratory', 'Dismiss', { duration: 3000 }),
      });
    });
  }
}
