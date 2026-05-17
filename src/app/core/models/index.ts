// ─── Enums ───────────────────────────────────────────────────────────────────

export enum LabRole {
  CEO = 'ceo',
  ENGINEERING_MANAGER = 'engineering_manager',
  PROJECT_MANAGER = 'project_manager',
  CHIEF_SCIENTIST = 'chief_scientist',
  TECH_LEAD = 'tech_lead',
  ENGINEER = 'engineer',
  RESEARCHER = 'researcher',
  RESEARCH_FELLOW = 'research_fellow',
  STAFF = 'staff',
}

export enum CompensationType {
  PROJECT_SALARY = 'project_salary',
  RESEARCH_GRANT = 'research_grant',
  VOLUNTEER = 'volunteer',
}

export enum ProjectStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export const MANAGER_ROLES: LabRole[] = [
  LabRole.CEO,
  LabRole.ENGINEERING_MANAGER,
  LabRole.PROJECT_MANAGER,
  LabRole.CHIEF_SCIENTIST,
];

export const TECH_LEAD_AND_ABOVE: LabRole[] = [
  ...MANAGER_ROLES,
  LabRole.TECH_LEAD,
];

export const RESEARCHER_AND_ABOVE: LabRole[] = [
  ...TECH_LEAD_AND_ABOVE,
  LabRole.ENGINEER,
  LabRole.RESEARCHER,
  LabRole.RESEARCH_FELLOW,
];

export const LAB_ROLE_LABELS: Record<LabRole, string> = {
  [LabRole.CEO]: 'CEO',
  [LabRole.ENGINEERING_MANAGER]: 'Engineering Manager',
  [LabRole.PROJECT_MANAGER]: 'Project Manager',
  [LabRole.CHIEF_SCIENTIST]: 'Chief Scientist',
  [LabRole.TECH_LEAD]: 'Tech Lead',
  [LabRole.ENGINEER]: 'Engineer',
  [LabRole.RESEARCHER]: 'Researcher',
  [LabRole.RESEARCH_FELLOW]: 'Research Fellow',
  [LabRole.STAFF]: 'Staff',
};

export const ROLE_LEVEL: Record<LabRole, number> = {
  [LabRole.CEO]: 0,
  [LabRole.ENGINEERING_MANAGER]: 1,
  [LabRole.PROJECT_MANAGER]: 1,
  [LabRole.CHIEF_SCIENTIST]: 1,
  [LabRole.TECH_LEAD]: 2,
  [LabRole.ENGINEER]: 3,
  [LabRole.RESEARCHER]: 3,
  [LabRole.RESEARCH_FELLOW]: 3,
  [LabRole.STAFF]: 4,
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface RoleDefinition {
  id: number;
  key: string;
  name: string;
  level: number;
  is_system: boolean;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cpf?: string | null;
  is_super_admin: boolean;
  is_professor: boolean;
  is_approved: boolean;
  is_active: boolean;
  desired_lab_id?: number | null;
  created_at: string;
  lab_memberships?: LabMembership[];
}

export interface Laboratory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface LabMembership {
  member_id: number;
  lab_id: number;
  roles: LabRole[];
  specialization?: string | null;
  joined_at: string;
  compensation_type: CompensationType | null;
  compensation_value: number | null;
  reports_to_id?: number | null;
  member?: Member;
  laboratory?: Laboratory;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  lab_id: number;
  research_id: number | null;
  tech_lead_id?: number | null;
  created_at: string;
  tech_lead?: Member;
  members?: Member[];
  laboratory?: Laboratory;
}

export interface Research {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  lab_id: number;
  manager_id?: number | null;
  created_at: string;
  manager?: Member;
  members?: Member[];
  projects?: Project[];
  laboratory?: Laboratory;
}

export interface Article {
  id: number;
  title: string;
  abstract: string | null;
  journal: string | null;
  doi: string | null;
  published_at: string | null;
  is_active: boolean;
  lab_id: number;
  created_at: string;
  authors?: Member[];
  laboratory?: Laboratory;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  member: Member;
  access_token?: string;
  refresh_token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  cpf?: string;
  password: string;
  is_professor?: boolean;
  desired_lab_id?: number;
}

