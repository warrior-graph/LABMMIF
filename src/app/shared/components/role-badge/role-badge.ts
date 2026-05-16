import { Component, input } from '@angular/core';
import { MatChip, MatChipSet } from '@angular/material/chips';

import { LAB_ROLE_LABELS, LabRole } from '../../../core/models';

const ROLE_COLOR: Record<LabRole, string> = {
  [LabRole.CEO]: 'role-ceo',
  [LabRole.ENGINEERING_MANAGER]: 'role-manager',
  [LabRole.PROJECT_MANAGER]: 'role-manager',
  [LabRole.RESEARCH_MANAGER]: 'role-manager',
  [LabRole.TECH_LEAD]: 'role-lead',
  [LabRole.ENGINEER]: 'role-member',
  [LabRole.RESEARCHER]: 'role-member',
  [LabRole.STAFF]: 'role-staff',
};

@Component({
  selector: 'app-role-badge',
  imports: [MatChipSet, MatChip],
  templateUrl: './role-badge.html',
  styleUrl: './role-badge.scss',
})
export class RoleBadge {
  readonly role = input.required<LabRole>();

  get label(): string {
    return LAB_ROLE_LABELS[this.role()] ?? this.role();
  }

  get colorClass(): string {
    return ROLE_COLOR[this.role()] ?? '';
  }
}
