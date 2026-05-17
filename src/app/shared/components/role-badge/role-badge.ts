import { Component, input } from '@angular/core';
import { MatChip, MatChipSet } from '@angular/material/chips';

import { LAB_ROLE_LABELS, LabRole, ROLE_LEVEL } from '../../../core/models';

const ROLE_COLOR: Record<LabRole, string> = {
  [LabRole.CEO]: 'role-ceo',
  [LabRole.ENGINEERING_MANAGER]: 'role-manager',
  [LabRole.PROJECT_MANAGER]: 'role-manager',
  [LabRole.CHIEF_SCIENTIST]: 'role-scientist',
  [LabRole.TECH_LEAD]: 'role-lead',
  [LabRole.ENGINEER]: 'role-member',
  [LabRole.RESEARCHER]: 'role-member',
  [LabRole.RESEARCH_FELLOW]: 'role-fellow',
  [LabRole.STAFF]: 'role-staff',
};

@Component({
  selector: 'app-role-badge',
  imports: [MatChipSet, MatChip],
  templateUrl: './role-badge.html',
  styleUrl: './role-badge.scss',
})
export class RoleBadge {
  readonly roles = input.required<LabRole[]>();

  get chips(): { label: string; colorClass: string }[] {
    return (this.roles() ?? []).map(r => ({
      label: LAB_ROLE_LABELS[r] ?? r,
      colorClass: ROLE_COLOR[r] ?? '',
    }));
  }
}
