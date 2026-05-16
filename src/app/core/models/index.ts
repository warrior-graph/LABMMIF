// ─── Enums ───────────────────────────────────────────────────────────────────

export enum LabRole {
  CEO = 'ceo',
  ENGINEERING_MANAGER = 'engineering_manager',
  PROJECT_MANAGER = 'project_manager',
  RESEARCH_MANAGER = 'research_manager',
  TECH_LEAD = 'tech_lead',
  ENGINEER = 'engineer',
  RESEARCHER = 'researcher',
  STAFF = 'staff',
}

export enum CompensationType {
  PROJECT_SALARY = 'project_salary',
  RESEARCH_GRANT = 'research_grant',
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
  LabRole.RESEARCH_MANAGER,
];

export const TECH_LEAD_AND_ABOVE: LabRole[] = [
  ...MANAGER_ROLES,
  LabRole.TECH_LEAD,
];

export const RESEARCHER_AND_ABOVE: LabRole[] = [
  ...TECH_LEAD_AND_ABOVE,
  LabRole.ENGINEER,
  LabRole.RESEARCHER,
];

export const LAB_ROLE_LABELS: Record<LabRole, string> = {
  [LabRole.CEO]: 'CEO',
  [LabRole.ENGINEERING_MANAGER]: 'Engineering Manager',
  [LabRole.PROJECT_MANAGER]: 'Project Manager',
  [LabRole.RESEARCH_MANAGER]: 'Research Manager',
  [LabRole.TECH_LEAD]: 'Tech Lead',
  [LabRole.ENGINEER]: 'Engineer',
  [LabRole.RESEARCHER]: 'Researcher',
  [LabRole.STAFF]: 'Staff',
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface Laboratory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface LabMembership {
  member_id: number;
  lab_id: number;
  role: LabRole;
  joined_at: string;
  compensation_type: CompensationType | null;
  compensation_value: number | null;
  member?: Member;
  laboratory?: Laboratory;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  lab_id: number;
  research_id: number | null;
  created_at: string;
  members?: Member[];
  laboratory?: Laboratory;
}

export interface Research {
  id: number;
  name: string;
  description: string | null;
  lab_id: number;
  created_at: string;
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
  lab_id: number;
  created_at: string;
  authors?: Member[];
  laboratory?: Laboratory;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  member: Member;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
