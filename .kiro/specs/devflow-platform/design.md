# Design Document

## Overview

DevFlow is a full-stack developer collaboration platform built with a modern tech stack optimized for scalability, maintainability, and recruiter appeal. The application follows clean architecture principles with clear separation of concerns across frontend, backend, and data layers.

### Tech Stack Justification

**Frontend: React + TypeScript**
- React provides component reusability and a rich ecosystem
- TypeScript adds type safety, reducing runtime errors and improving developer experience
- Industry standard at FAANG companies

**Backend: Node.js + Express**
- JavaScript/TypeScript across the stack reduces context switching
- Express is lightweight, flexible, and widely adopted
- Non-blocking I/O ideal for real-time features (WebSockets)

**Database: PostgreSQL**
- ACID compliance for transactional integrity (critical for task assignments, sprint data)
- Rich relational model supports complex queries (analytics, filtering)
- JSON support for flexible data when needed
- Excellent performance with proper indexing

**Authentication: JWT + bcrypt**
- Stateless authentication scales horizontally
- JWT payload carries user role for authorization
- bcrypt provides industry-standard password hashing

**Real-time: WebSockets (Socket.io)**
- Bi-directional communication for notifications
- Automatic reconnection and fallback mechanisms

**Deployment**
- Vercel for frontend (zero-config, CDN, automatic HTTPS)
- Railway/Render for backend (easy PostgreSQL provisioning, environment management)
- Docker for consistent development and production environments

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React + TypeScript (Vercel)                           │ │
│  │  - Components (UI)                                     │ │
│  │  - Hooks (State Management)                            │ │
│  │  - Services (API Client)                               │ │
│  │  - Context (Auth, Theme)                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Server (Railway/Render)                       │ │
│  │  - Middleware (Auth, CORS, Rate Limiting)              │ │
│  │  - Routes                                              │ │
│  │  - WebSocket Server (Socket.io)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │  Services    │  │ Repositories │      │
│  │              │  │              │  │              │      │
│  │ - Validation │  │ - Business   │  │ - Data       │      │
│  │ - Request    │  │   Logic      │  │   Access     │      │
│  │   Handling   │  │ - Analytics  │  │ - Queries    │      │
│  │ - Response   │  │ - GitHub API │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                   │ │
│  │  - Users, Organizations, Teams                         │ │
│  │  - Projects, Sprints, Tasks                            │ │
│  │  - Comments, Notifications                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  GitHub API  │  │  Email       │                         │
│  │  (PR Status) │  │  Service     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Architecture

### Clean Architecture Principles

The backend follows a three-layer architecture:

1. **Controller Layer**: Handles HTTP requests/responses, validation, and error formatting
2. **Service Layer**: Contains business logic, orchestrates operations, interacts with external APIs
3. **Repository Layer**: Manages data access, database queries, and ORM interactions

This separation ensures:
- Testability (each layer can be tested independently)
- Maintainability (changes in one layer don't cascade)
- Scalability (layers can be optimized independently)

### Request Flow Example

```
User creates a task:
1. POST /api/tasks → Controller validates request
2. Controller calls TaskService.createTask()
3. Service validates business rules (sprint exists, user has permission)
4. Service calls TaskRepository.create()
5. Repository executes SQL INSERT
6. Service triggers NotificationService.notifyTaskAssignment()
7. NotificationService emits WebSocket event
8. Controller returns 201 Created with task data
```


## Components and Interfaces

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection
│   │   ├── env.ts               # Environment variables
│   │   └── constants.ts         # App constants
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   └── validator.ts        # Request validation
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── organizationController.ts
│   │   ├── teamController.ts
│   │   ├── projectController.ts
│   │   ├── sprintController.ts
│   │   ├── taskController.ts
│   │   ├── commentController.ts
│   │   └── notificationController.ts
│   ├── services/
│   │   ├── authService.ts       # JWT, password hashing
│   │   ├── userService.ts
│   │   ├── organizationService.ts
│   │   ├── teamService.ts
│   │   ├── projectService.ts
│   │   ├── sprintService.ts
│   │   ├── taskService.ts
│   │   ├── commentService.ts
│   │   ├── notificationService.ts
│   │   ├── analyticsService.ts  # Sprint velocity, burndown
│   │   └── githubService.ts     # GitHub API integration
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── organizationRepository.ts
│   │   ├── teamRepository.ts
│   │   ├── projectRepository.ts
│   │   ├── sprintRepository.ts
│   │   ├── taskRepository.ts
│   │   ├── commentRepository.ts
│   │   └── notificationRepository.ts
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── organizationRoutes.ts
│   │   ├── teamRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── sprintRoutes.ts
│   │   ├── taskRoutes.ts
│   │   ├── commentRoutes.ts
│   │   └── notificationRoutes.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── websocket/
│   │   └── socketHandler.ts     # Socket.io setup
│   ├── migrations/
│   │   └── *.sql                # Database migrations
│   └── server.ts                # Express app entry
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardOverview.tsx
│   │   │   └── SprintVelocityChart.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskFilters.tsx
│   │   ├── sprints/
│   │   │   ├── SprintList.tsx
│   │   │   ├── SprintBoard.tsx
│   │   │   ├── SprintForm.tsx
│   │   │   └── BurndownChart.tsx
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx
│   │   │   └── ProjectForm.tsx
│   │   ├── teams/
│   │   │   ├── TeamList.tsx
│   │   │   ├── TeamMembers.tsx
│   │   │   └── TeamForm.tsx
│   │   └── notifications/
│   │       ├── NotificationDropdown.tsx
│   │       └── NotificationItem.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useSprints.ts
│   │   ├── useNotifications.ts
│   │   └── useWebSocket.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/
│   │   ├── api.ts               # Axios instance
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── sprintService.ts
│   │   ├── projectService.ts
│   │   └── websocketService.ts
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── Sprints.tsx
│   │   ├── Projects.tsx
│   │   └── Teams.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```


### Key Interfaces

#### Backend TypeScript Interfaces

```typescript
// User & Auth
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'team_lead' | 'developer';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Organization & Team
interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: Date;
}

interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'team_lead' | 'developer';
  joined_at: Date;
}

// Project & Sprint
interface Project {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  github_repo_url?: string;
  created_at: Date;
}

interface Sprint {
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
interface Task {
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
interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'sprint_started';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
}

// Analytics
interface SprintAnalytics {
  sprint_id: string;
  total_story_points: number;
  completed_story_points: number;
  progress_percentage: number;
  task_completion_rate: number;
  burndown_data: { date: string; remaining_points: number }[];
}

interface TeamVelocity {
  team_id: string;
  average_velocity: number;
  sprint_velocities: { sprint_name: string; velocity: number }[];
}
```

#### API Response Formats

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Error Response
interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

// Paginated Response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```


## Data Models

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'team_lead', 'developer')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_organization ON teams(organization_id);

-- Team Members (Junction Table)
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('team_lead', 'developer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  github_repo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_team ON projects(team_id);

-- Sprints Table
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  story_points INTEGER CHECK (story_points > 0),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_pr_url TEXT,
  github_pr_status VARCHAR(50) CHECK (github_pr_status IN ('open', 'merged', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);

-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('task_assigned', 'task_updated', 'comment_added', 'sprint_started')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Task Status History (for analytics)
CREATE TABLE task_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_history_task ON task_status_history(task_id);
CREATE INDEX idx_task_history_date ON task_status_history(changed_at);
```

### Entity Relationship Diagram

```
┌──────────────┐
│ Organization │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│    Team      │◄──────┐
└──────┬───────┘       │
       │ 1:N           │ N:M
       ▼               │
┌──────────────┐       │
│   Project    │       │
└──────┬───────┘       │
       │ 1:N           │
       ▼               │
┌──────────────┐       │
│    Sprint    │       │
└──────┬───────┘       │
       │ 1:N           │
       ▼               │
┌──────────────┐       │
│     Task     │       │
└──────┬───────┘       │
       │ 1:N           │
       ▼               │
┌──────────────┐       │
│   Comment    │       │
└──────────────┘       │
                       │
┌──────────────┐       │
│     User     │───────┘
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│ Notification │
└──────────────┘
```

### Key Design Decisions

1. **UUID Primary Keys**: Better for distributed systems, no sequential ID leakage
2. **Soft Deletes for Comments**: Preserve conversation context even if comment is deleted
3. **Task Status History**: Enables burndown chart calculation and audit trail
4. **Indexes on Foreign Keys**: Optimizes JOIN operations and filtering
5. **Check Constraints**: Database-level validation for data integrity
6. **Cascade Deletes**: Automatic cleanup of related records (e.g., delete project → delete sprints → delete tasks)


## API Endpoints

### Authentication

```
POST   /api/auth/signup          # Register new user
POST   /api/auth/login           # Login and get JWT
POST   /api/auth/refresh         # Refresh JWT token
GET    /api/auth/me              # Get current user info
```

### Users

```
GET    /api/users                # List users (admin only)
GET    /api/users/:id            # Get user by ID
PATCH  /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user (admin only)
```

### Organizations

```
POST   /api/organizations        # Create organization (admin)
GET    /api/organizations        # List organizations
GET    /api/organizations/:id    # Get organization
PATCH  /api/organizations/:id    # Update organization (admin)
DELETE /api/organizations/:id    # Delete organization (admin)
```

### Teams

```
POST   /api/teams                # Create team
GET    /api/teams                # List teams (filtered by org)
GET    /api/teams/:id            # Get team details
PATCH  /api/teams/:id            # Update team
DELETE /api/teams/:id            # Delete team
POST   /api/teams/:id/members    # Add team member
DELETE /api/teams/:id/members/:userId  # Remove team member
GET    /api/teams/:id/members    # List team members
```

### Projects

```
POST   /api/projects             # Create project
GET    /api/projects             # List projects (filtered by team)
GET    /api/projects/:id         # Get project details
PATCH  /api/projects/:id         # Update project
DELETE /api/projects/:id         # Delete project
```

### Sprints

```
POST   /api/sprints              # Create sprint
GET    /api/sprints              # List sprints (filtered by project)
GET    /api/sprints/:id          # Get sprint details
PATCH  /api/sprints/:id          # Update sprint
DELETE /api/sprints/:id          # Delete sprint
GET    /api/sprints/:id/analytics  # Get sprint analytics
```

### Tasks

```
POST   /api/tasks                # Create task
GET    /api/tasks                # List tasks (with filters, pagination)
GET    /api/tasks/:id            # Get task details
PATCH  /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task
PATCH  /api/tasks/:id/status     # Update task status
POST   /api/tasks/:id/assign     # Assign task to user
```

### Comments

```
POST   /api/tasks/:taskId/comments     # Add comment
GET    /api/tasks/:taskId/comments     # List comments
PATCH  /api/comments/:id               # Edit comment
DELETE /api/comments/:id               # Delete comment
```

### Notifications

```
GET    /api/notifications        # List notifications (paginated)
PATCH  /api/notifications/:id/read  # Mark as read
PATCH  /api/notifications/read-all  # Mark all as read
DELETE /api/notifications/:id    # Delete notification
```

### Analytics

```
GET    /api/analytics/team/:teamId/velocity     # Team velocity over time
GET    /api/analytics/sprint/:sprintId/burndown # Sprint burndown data
GET    /api/analytics/tasks/distribution        # Task distribution by status/priority
```

### Example API Request/Response

**POST /api/tasks**

Request:
```json
{
  "sprint_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with login and signup",
  "priority": "high",
  "story_points": 5,
  "assignee_id": "987fcdeb-51a2-43f1-b456-426614174111"
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174222",
    "sprint_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with login and signup",
    "status": "todo",
    "priority": "high",
    "story_points": 5,
    "assignee_id": "987fcdeb-51a2-43f1-b456-426614174111",
    "creator_id": "111fcdeb-51a2-43f1-b456-426614174333",
    "github_pr_url": null,
    "github_pr_status": null,
    "created_at": "2025-12-25T10:30:00Z",
    "updated_at": "2025-12-25T10:30:00Z"
  },
  "message": "Task created successfully"
}
```

**GET /api/tasks?sprint_id=123&status=in_progress&page=1&limit=20**

Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174222",
      "title": "Implement user authentication",
      "status": "in_progress",
      "priority": "high",
      "story_points": 5,
      "assignee": {
        "id": "987fcdeb-51a2-43f1-b456-426614174111",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2025-12-25T10:30:00Z",
      "updated_at": "2025-12-25T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```


## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field_name": ["Validation error message"]
    }
  }
}
```

### HTTP Status Codes

- **200 OK**: Successful GET, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server errors

### Error Handling Strategy

1. **Validation Errors**: Caught at controller level using validation middleware (Joi/Zod)
2. **Business Logic Errors**: Thrown from service layer with custom error classes
3. **Database Errors**: Caught and transformed into user-friendly messages
4. **External API Errors**: Wrapped with fallback behavior (e.g., cached GitHub data)
5. **Unhandled Errors**: Caught by global error handler, logged, and returned as 500

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
```

### Frontend Error Handling

1. **API Client Interceptor**: Catches all API errors and transforms them
2. **Toast Notifications**: Display user-friendly error messages
3. **Form Validation**: Real-time validation with inline error messages
4. **Error Boundaries**: Catch React component errors and display fallback UI
5. **Retry Logic**: Automatic retry for transient network errors


## Testing Strategy

### Backend Testing

#### Unit Tests
- **Services**: Test business logic in isolation with mocked repositories
- **Utilities**: Test helper functions, validators, formatters
- **Middleware**: Test auth, validation, error handling

Example:
```typescript
describe('TaskService', () => {
  it('should create task and send notification', async () => {
    const mockTaskRepo = { create: jest.fn().mockResolvedValue(mockTask) };
    const mockNotificationService = { notifyTaskAssignment: jest.fn() };
    
    const taskService = new TaskService(mockTaskRepo, mockNotificationService);
    const result = await taskService.createTask(taskData);
    
    expect(mockTaskRepo.create).toHaveBeenCalledWith(taskData);
    expect(mockNotificationService.notifyTaskAssignment).toHaveBeenCalled();
    expect(result).toEqual(mockTask);
  });
});
```

#### Integration Tests
- **API Endpoints**: Test full request/response cycle with test database
- **Database Operations**: Test repository methods with real database
- **Authentication Flow**: Test JWT generation, validation, protected routes

Example:
```typescript
describe('POST /api/tasks', () => {
  it('should create task when authenticated', async () => {
    const token = generateTestToken({ userId: 'test-user', role: 'developer' });
    
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(taskData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(taskData.title);
  });
  
  it('should return 401 when not authenticated', async () => {
    await request(app)
      .post('/api/tasks')
      .send(taskData)
      .expect(401);
  });
});
```

### Frontend Testing

#### Component Tests
- **UI Components**: Test rendering, user interactions, prop handling
- **Forms**: Test validation, submission, error display
- **Hooks**: Test custom hooks with React Testing Library

Example:
```typescript
describe('TaskCard', () => {
  it('should render task details', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.status)).toBeInTheDocument();
  });
  
  it('should call onStatusChange when status is updated', () => {
    const onStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />);
    
    fireEvent.click(screen.getByText('Mark as Done'));
    
    expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, 'done');
  });
});
```

### Test Coverage Goals

- **Critical Paths**: 80%+ coverage (auth, task management, sprint analytics)
- **Business Logic**: 70%+ coverage (services, repositories)
- **UI Components**: 60%+ coverage (key user flows)

### Testing Tools

- **Backend**: Jest, Supertest, ts-jest
- **Frontend**: Vitest, React Testing Library, @testing-library/user-event
- **E2E** (Optional): Playwright for critical user flows

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:backend
      - run: npm run test:frontend
      - run: npm run test:coverage
```


## Security Considerations

### Authentication & Authorization

1. **Password Security**
   - bcrypt with 10+ salt rounds
   - Minimum password length: 8 characters
   - Password complexity requirements (optional but recommended)

2. **JWT Security**
   - Short expiration time (1 hour for access token)
   - Refresh token with longer expiration (7 days)
   - Store JWT secret in environment variables
   - Include user role in JWT payload for authorization

3. **Role-Based Access Control (RBAC)**
   ```typescript
   // Middleware example
   const requireRole = (roles: string[]) => {
     return (req, res, next) => {
       if (!roles.includes(req.user.role)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
       next();
     };
   };
   
   // Usage
   router.post('/organizations', authenticate, requireRole(['admin']), createOrganization);
   ```

### Input Validation & Sanitization

1. **Request Validation**: Use Zod or Joi for schema validation
2. **SQL Injection Prevention**: Use parameterized queries (pg library handles this)
3. **XSS Prevention**: Sanitize user input, escape HTML in frontend
4. **CSRF Protection**: Use SameSite cookies, CSRF tokens for sensitive operations

### API Security

1. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   
   app.use('/api/', limiter);
   ```

2. **CORS Configuration**
   ```typescript
   const corsOptions = {
     origin: process.env.FRONTEND_URL,
     credentials: true,
     optionsSuccessStatus: 200
   };
   
   app.use(cors(corsOptions));
   ```

3. **Helmet.js**: Security headers (XSS protection, content security policy)

### Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devflow

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# GitHub API (optional)
GITHUB_TOKEN=your-github-personal-access-token

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Data Privacy

1. **Password Hashing**: Never store plain text passwords
2. **Sensitive Data**: Don't log passwords, tokens, or PII
3. **Database Backups**: Encrypt backups, restrict access
4. **GDPR Compliance** (if applicable): User data export, deletion


## Performance Optimization

### Database Optimization

1. **Indexing Strategy**
   - Index all foreign keys
   - Index frequently queried fields (status, priority, dates)
   - Composite indexes for common filter combinations
   ```sql
   CREATE INDEX idx_tasks_sprint_status ON tasks(sprint_id, status);
   CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
   ```

2. **Query Optimization**
   - Use JOINs instead of N+1 queries
   - Select only needed columns
   - Use EXPLAIN ANALYZE to identify slow queries
   ```typescript
   // Good: Single query with JOIN
   const tasks = await db.query(`
     SELECT t.*, u.name as assignee_name, u.avatar_url
     FROM tasks t
     LEFT JOIN users u ON t.assignee_id = u.id
     WHERE t.sprint_id = $1
   `, [sprintId]);
   
   // Bad: N+1 queries
   const tasks = await db.query('SELECT * FROM tasks WHERE sprint_id = $1', [sprintId]);
   for (const task of tasks) {
     task.assignee = await db.query('SELECT * FROM users WHERE id = $1', [task.assignee_id]);
   }
   ```

3. **Connection Pooling**
   ```typescript
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20, // maximum number of clients
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

### Caching Strategy

1. **In-Memory Caching** (Node-cache or Redis)
   ```typescript
   import NodeCache from 'node-cache';
   const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
   
   // Cache sprint analytics
   const getCachedAnalytics = async (sprintId: string) => {
     const cacheKey = `analytics:${sprintId}`;
     const cached = cache.get(cacheKey);
     
     if (cached) return cached;
     
     const analytics = await calculateSprintAnalytics(sprintId);
     cache.set(cacheKey, analytics);
     return analytics;
   };
   ```

2. **HTTP Caching**
   - Cache-Control headers for static assets
   - ETag for conditional requests
   ```typescript
   res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
   ```

3. **GitHub API Caching**
   - Cache PR status for 5 minutes to reduce API calls
   - Implement exponential backoff for rate limiting

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Lazy load routes
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Tasks = lazy(() => import('./pages/Tasks'));
   
   <Suspense fallback={<LoadingSpinner />}>
     <Routes>
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/tasks" element={<Tasks />} />
     </Routes>
   </Suspense>
   ```

2. **Pagination & Infinite Scroll**
   - Load 20-50 items per page
   - Implement virtual scrolling for large lists

3. **Debouncing & Throttling**
   ```typescript
   // Debounce search input
   const debouncedSearch = useMemo(
     () => debounce((query: string) => {
       fetchTasks({ search: query });
     }, 300),
     []
   );
   ```

4. **Image Optimization**
   - Compress avatars to max 500KB
   - Use WebP format with fallback
   - Lazy load images below the fold

### WebSocket Optimization

1. **Connection Management**
   - Reconnect on disconnect with exponential backoff
   - Heartbeat to detect stale connections
   ```typescript
   socket.on('disconnect', () => {
     setTimeout(() => socket.connect(), 1000 * Math.pow(2, retryCount));
   });
   ```

2. **Event Throttling**
   - Batch notifications instead of sending individually
   - Throttle real-time updates to prevent flooding

### Monitoring & Profiling

1. **Performance Metrics**
   - API response times
   - Database query times
   - WebSocket connection count
   - Memory usage

2. **Logging**
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```


## Deployment Architecture

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: devflow
      POSTGRES_USER: devflow_user
      POSTGRES_PASSWORD: devflow_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://devflow_user:devflow_pass@postgres:5432/devflow
      JWT_SECRET: dev-secret-key
      NODE_ENV: development
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Production Deployment

#### Backend (Railway/Render)

**Dockerfile (Backend)**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

**Railway Configuration**
- Connect GitHub repository
- Add PostgreSQL plugin
- Set environment variables
- Deploy automatically on push to main

**Environment Variables (Production)**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=${RAILWAY_POSTGRES_URL}
JWT_SECRET=${RANDOM_SECRET_KEY}
FRONTEND_URL=https://devflow.vercel.app
```

#### Frontend (Vercel)

**Dockerfile (Frontend)**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Vercel Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://devflow-api.railway.app"
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push to main

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          # Vercel auto-deploys on push to main
```

### Health Checks & Monitoring

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});
```

### Scalability Considerations

1. **Horizontal Scaling**
   - Stateless backend allows multiple instances
   - Load balancer distributes traffic
   - WebSocket sticky sessions for connection persistence

2. **Database Scaling**
   - Read replicas for analytics queries
   - Connection pooling to handle concurrent requests
   - Partitioning for large tables (tasks, notifications)

3. **Caching Layer**
   - Redis for distributed caching across instances
   - Cache frequently accessed data (user sessions, sprint analytics)

4. **CDN for Static Assets**
   - Vercel provides global CDN automatically
   - Reduces latency for frontend assets

5. **Background Jobs** (Future Enhancement)
   - Bull/BullMQ for job queue (email notifications, GitHub sync)
   - Separate worker processes for heavy computations

### Backup & Disaster Recovery

1. **Database Backups**
   - Railway/Render provide automatic daily backups
   - Manual backup before major migrations
   - Test restore process regularly

2. **Environment Configuration Backup**
   - Store environment variables in secure vault (1Password, AWS Secrets Manager)
   - Document all configuration in README

3. **Code Repository**
   - GitHub as source of truth
   - Protected main branch with required reviews
   - Tag releases for rollback capability


## Key Engineering Decisions

### 1. Why PostgreSQL over MongoDB?

**Decision**: Use PostgreSQL as the primary database

**Rationale**:
- Strong relational model fits our data (teams → projects → sprints → tasks)
- ACID compliance ensures data integrity for critical operations (task assignments, sprint planning)
- Complex queries for analytics (JOIN operations, aggregations) are more efficient
- Better support for transactions and foreign key constraints
- JSON support available when needed for flexible data

**Trade-off**: Slightly more complex schema design vs. MongoDB's flexibility, but the structure is well-defined and unlikely to change drastically.

---

### 2. Why JWT over Session-Based Auth?

**Decision**: Use JWT tokens for authentication

**Rationale**:
- Stateless authentication scales horizontally (no session store needed)
- Works seamlessly with separate frontend/backend deployments
- JWT payload can carry user role for authorization checks
- Easier to implement with modern frontend frameworks

**Trade-off**: Cannot invalidate tokens before expiration (mitigated with short expiration times and refresh tokens)

---

### 3. Why Clean Architecture (Controller-Service-Repository)?

**Decision**: Implement three-layer architecture

**Rationale**:
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Can test business logic (services) without HTTP layer
- **Maintainability**: Changes in one layer don't cascade to others
- **Scalability**: Can optimize each layer independently
- **Industry Standard**: Familiar pattern to FAANG engineers

**Trade-off**: More boilerplate code, but worth it for maintainability in a portfolio project

---

### 4. Why WebSockets for Notifications?

**Decision**: Use Socket.io for real-time notifications

**Rationale**:
- Instant updates without polling (better UX)
- Demonstrates understanding of real-time systems
- Bi-directional communication enables future features (live collaboration)
- Socket.io handles reconnection and fallbacks automatically

**Trade-off**: Adds complexity (connection management, scaling), but showcases advanced skills

---

### 5. Why TypeScript Everywhere?

**Decision**: Use TypeScript for both frontend and backend

**Rationale**:
- Type safety reduces runtime errors
- Better IDE support (autocomplete, refactoring)
- Shared types between frontend and backend
- Industry standard at FAANG companies
- Demonstrates attention to code quality

**Trade-off**: Slightly slower development initially, but pays off in maintenance

---

### 6. Why Separate Frontend/Backend Repos in Monorepo?

**Decision**: Keep frontend and backend in separate directories but same repo

**Rationale**:
- Easier to share types and interfaces
- Simplified version control (single source of truth)
- Easier for recruiters to review (one repo to clone)
- Can still deploy independently

**Trade-off**: Could use a monorepo tool (Nx, Turborepo) for larger projects, but overkill here

---

### 7. Why Vercel + Railway/Render?

**Decision**: Deploy frontend to Vercel, backend to Railway/Render

**Rationale**:
- **Vercel**: Zero-config deployment, automatic HTTPS, global CDN, perfect for React
- **Railway/Render**: Easy PostgreSQL provisioning, environment management, free tier
- Both have excellent developer experience
- Demonstrates understanding of modern deployment practices

**Trade-off**: Could use AWS/GCP for more control, but these platforms are faster to set up and more recruiter-friendly

---

### 8. Why Sprint Analytics Over Simple Task Lists?

**Decision**: Include velocity tracking, burndown charts, and analytics

**Rationale**:
- Demonstrates understanding of Agile methodologies
- Shows ability to work with aggregated data and time-series
- More impressive than simple CRUD operations
- Relevant to real-world developer workflows

**Trade-off**: More complex queries and calculations, but showcases advanced skills

---

### 9. Why GitHub Integration?

**Decision**: Integrate with GitHub API for PR tracking

**Rationale**:
- Shows ability to work with external APIs
- Demonstrates understanding of OAuth/API authentication
- Relevant to developer workflows
- Adds real-world complexity beyond database operations

**Trade-off**: Requires GitHub token management and error handling for API limits

---

### 10. Why Focus on Testing?

**Decision**: Include unit and integration tests with 70%+ coverage

**Rationale**:
- Critical for FAANG interviews (testing is heavily emphasized)
- Demonstrates professional development practices
- Shows understanding of test-driven development
- Provides confidence in code quality

**Trade-off**: Takes time to write tests, but essential for a portfolio project

---

## Future Enhancements

If this were a real product, here's what we'd add next:

1. **Advanced Features**
   - Drag-and-drop task board (Kanban view)
   - Time tracking and estimation accuracy
   - Custom fields for tasks
   - Task dependencies and blockers
   - Sprint retrospectives and notes

2. **Integrations**
   - Slack notifications
   - Jira import/export
   - Google Calendar sync
   - GitHub Actions integration

3. **Performance**
   - Redis for distributed caching
   - ElasticSearch for advanced search
   - GraphQL for flexible data fetching
   - Server-side rendering (SSR) for SEO

4. **DevOps**
   - Kubernetes for orchestration
   - Prometheus + Grafana for monitoring
   - Sentry for error tracking
   - Automated load testing

5. **User Experience**
   - Mobile app (React Native)
   - Offline support (PWA)
   - Dark mode
   - Keyboard shortcuts
   - Customizable dashboards

6. **Security**
   - Two-factor authentication (2FA)
   - OAuth providers (Google, GitHub)
   - Audit logs
   - IP whitelisting for organizations

7. **Business Features**
   - Multi-organization support
   - Billing and subscriptions
   - Usage analytics
   - Export reports (PDF, CSV)

