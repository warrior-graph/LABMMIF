import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { LAB_ROLE_LABELS, LabMembership, LabRole, ROLE_LEVEL } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { MemberService } from '../../../core/services/member.service';

interface TreeNode {
  membership: LabMembership;
  children: TreeNode[];
  parent: TreeNode | null;
}

@Component({
  selector: 'app-org-chart',
  imports: [RouterLink, NgTemplateOutlet, MatButton, MatIconButton, MatIcon, MatProgressSpinner],
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

  /** null = full tree view; a member_id = focus view centred on that person */
  protected readonly focusedMemberId = signal<number | null>(null);

  protected readonly memberMap = computed(() =>
    new Map(this.memberships().map(m => [m.member_id, m]))
  );

  protected readonly treeRoots = computed(() => this.buildTree(this.memberships()));

  protected readonly focusedNode = computed((): TreeNode | null => {
    const id = this.focusedMemberId();
    if (id === null) return null;
    return this.findNode(this.treeRoots(), id);
  });

  protected readonly focusedManager = computed((): LabMembership | null =>
    this.focusedNode()?.parent?.membership ?? null
  );

  protected readonly focusedPeers = computed((): TreeNode[] => {
    const node = this.focusedNode();
    if (!node) return [];
    const siblings = node.parent ? node.parent.children : this.treeRoots();
    return siblings.filter(s => s.membership.member_id !== node.membership.member_id);
  });

  protected readonly focusedReports = computed((): TreeNode[] =>
    this.focusedNode()?.children ?? []
  );

  protected focus(id: number | null): void {
    this.focusedMemberId.set(id);
  }

  protected roleLabel(role: string): string {
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

  protected managerName(m: LabMembership): string | null {
    if (m.reports_to_id == null) return null;
    const mgr = this.memberMap().get(m.reports_to_id);
    return mgr ? `${mgr.member?.first_name} ${mgr.member?.last_name}` : null;
  }

  private buildTree(memberships: LabMembership[]): TreeNode[] {
    const nodes = new Map<number, TreeNode>();
    for (const m of memberships) {
      nodes.set(m.member_id, { membership: m, children: [], parent: null });
    }

    for (const node of nodes.values()) {
      const m = node.membership;
      const myLevel = ROLE_LEVEL[m.role as LabRole] ?? 99;
      let parentNode: TreeNode | null = null;

      if (m.reports_to_id != null && nodes.has(m.reports_to_id)) {
        parentNode = nodes.get(m.reports_to_id)!;
      } else if (myLevel > 0) {
        const parentsAbove = memberships.filter(
          p => (ROLE_LEVEL[p.role as LabRole] ?? 99) === myLevel - 1
        );
        if (parentsAbove.length === 1) {
          parentNode = nodes.get(parentsAbove[0].member_id)!;
        }
      }

      if (parentNode) {
        parentNode.children.push(node);
        node.parent = parentNode;
      }
    }

    const sortNodes = (a: TreeNode, b: TreeNode): number => {
      const la = ROLE_LEVEL[a.membership.role as LabRole] ?? 99;
      const lb = ROLE_LEVEL[b.membership.role as LabRole] ?? 99;
      return la !== lb
        ? la - lb
        : (a.membership.member?.last_name ?? '').localeCompare(
            b.membership.member?.last_name ?? ''
          );
    };

    for (const node of nodes.values()) {
      node.children.sort(sortNodes);
    }

    return Array.from(nodes.values()).filter(n => n.parent === null).sort(sortNodes);
  }

  private findNode(nodes: TreeNode[], id: number): TreeNode | null {
    for (const node of nodes) {
      if (node.membership.member_id === id) return node;
      const found = this.findNode(node.children, id);
      if (found) return found;
    }
    return null;
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
