import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { LAB_ROLE_LABELS, LabMembership, LabRole, ROLE_LEVEL } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { MemberService } from '../../../core/services/member.service';

@Component({
  selector: 'app-org-chart',
  imports: [RouterLink, MatIconButton, MatIcon, MatProgressSpinner],
  templateUrl: './org-chart.html',
  styleUrl: './org-chart.scss',
})
export class OrgChart implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(MemberService);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly memberships = signal<LabMembership[]>([]);
  protected readonly labId = signal(0);

  protected readonly levels = computed(() => {
    const ms = this.memberships();
    const byLevel = new Map<number, LabMembership[]>();
    for (const m of ms) {
      const lvl = ROLE_LEVEL[m.role as LabRole] ?? 99;
      if (!byLevel.has(lvl)) byLevel.set(lvl, []);
      byLevel.get(lvl)!.push(m);
    }
    return Array.from(byLevel.entries())
      .sort(([a], [b]) => a - b)
      .map(([, members]) => members);
  });

  protected roleLabel(role: LabRole | string): string {
    return LAB_ROLE_LABELS[role as LabRole] ?? role;
  }

  protected initials(m: LabMembership): string {
    const first = m.member?.first_name?.[0] ?? '';
    const last = m.member?.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  }

  protected isCurrentUser(m: LabMembership): boolean {
    return m.member_id === this.authService.currentUser()?.id;
  }

  ngOnInit(): void {
    const labId = Number(this.route.snapshot.paramMap.get('labId'));
    this.labId.set(labId);
    this.memberService.getLabMembers(labId).subscribe({
      next: ms => {
        this.memberships.set(ms);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
