// User & Auth
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'team_lead' | 'developer';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Organization & Team
export interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'team_lead' | 'developer';
  joined_at: Date;
}

// Project & Sprint
export interface Project {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  github_repo_url?: string;
  created_at: Date;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date: Date;
  end_date: Date;
  status: 'planned' | 'active' | 'completed';
  created_at: Date;
}

// Task
export interface Task {
  id: string;
  sprint_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  assignee_id?: string;
  creator_id: string;
  github_pr_url?: string;
  github_pr_status?: 'open' | 'merged' | 'closed';
  created_at: Date;
  updated_at: Date;
}

// Comment & Notification
export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'sprint_started';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
}

// Task Status History
export interface TaskStatusHistory {
  id: string;
  task_id: string;
  from_status?: string;
  to_status: string;
  changed_by: string;
  changed_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
