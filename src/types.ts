export interface User {
  user_id: number;
  user_lastname: string;
  user_firstname: string;
  user_role: string;
  user_profilepicture: string;
  user_email: string;
  user_active?: boolean;
}

export interface UserSheet {
  id: number;
  user_id: number;
  last_name: string;
  first_name: string;
  type_user: "student" | "teacher" | "admin";
  profile_picture?: string;
  active?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  course_id: number;
}

export interface Step {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  step_order: number;
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  year?: number;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  year: number;
}

export interface Validation {
  user_id: number;
  skill_id: number;
  status: "pending" | "validated" | "rejected";
  comment?: string;
  validated_by?: number;
  validated_at?: string;
}

// Composite type for UI
export interface StepWithSkills extends Step {
  skills: Skill[];
}

// Extended types for Skills UI
export interface StepWithProject extends Step {
  projectName?: string;
}

export interface SkillWithSteps extends Skill {
  linkedSteps?: StepWithProject[];
}

export interface CourseWithSkills extends Course {
  skills?: SkillWithSteps[];
  skillsLoaded?: boolean;
}

export interface SkillValidation {
  skill_id: number;
  status: string;
  comment?: string;
  validated_at?: string;
}
