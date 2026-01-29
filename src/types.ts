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
  nom: string;
  prenom: string;
  type_user: "student" | "teacher" | "admin";
  profile_picture?: string;
  // Computed full name often useful
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
