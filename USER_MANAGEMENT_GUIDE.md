# User Management & Role Assignment Guide

Complete guide on how user roles work, how admins manage users, and how team leads and developers are assigned.

## 📚 Table of Contents

1. [How User Roles Work](#how-user-roles-work)
2. [Initial Setup (First Admin)](#initial-setup-first-admin)
3. [Admin User Management](#admin-user-management)
4. [Creating Team Leads](#creating-team-leads)
5. [Creating Developers](#creating-developers)
6. [Role Hierarchy & Permissions](#role-hierarchy--permissions)
7. [API Endpoints](#api-endpoints)
8. [Frontend Integration](#frontend-integration)
9. [Workflow Examples](#workflow-examples)

---

## 🎭 How User Roles Work

### Role Types

DevFlow has **three user roles**:

1. **Admin** (`admin`)
   - Full system access
   - Can create/manage all users
   - Can create organizations
   - Can manage all teams and projects
   - Can promote/demote users

2. **Team Lead** (`team_lead`)
   - Can create/manage teams
   - Can create/manage projects
   - Can create/manage sprints
   - Can assign tasks
   - Cannot create other users
   - Cannot create organizations

3. **Developer** (`developer`)
   - Basic access
   - Can view assigned tasks
   - Can update task status
   - Can add comments
   - Cannot create teams/projects
   - Cannot manage users

### Role Hierarchy

```
Admin (Highest)
    ↓
Team Lead
    ↓
Developer (Lowest)
```

---

## 🚀 Initial Setup (First Admin)

### Step 1: Create First Admin User

**Option A: Using Database Seed Script**

```bash
# Run the seed script
cd backend
npm run seed

# This creates:
# - Admin: arnoldswamy09@gmail.com / password123
# - Developer: test@devflow.com / test123
# - Team Lead: manager@devflow.com / manager123
```

**Option B: Direct Database Insert**

```sql
-- Connect to database
docker compose exec postgres psql -U postgres -d devflow

-- Insert admin user (password: admin123)
-- Note: You need to hash the password first using bcrypt
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
  'admin@devflow.com',
  '$2b$10$...', -- bcrypt hash of password
  'Admin User',
  'admin',
  NOW(),
  NOW()
);
```

**Option C: Using API (One-time)**

For the very first admin, you can temporarily allow admin creation in signup:

1. Temporarily modify `authController.ts` signup method
2. Create admin account
3. Revert the change

---

## 👨‍💼 Admin User Management

### How Admins Create Users

Once you're logged in as an admin, you can create users through the **Admin API endpoints**.

### API Endpoints (Admin Only)

All user management endpoints require:
- Authentication (valid JWT token)
- Admin role

#### 1. **Get All Users**

```http
GET /api/users
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "developer",
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. **Create User (Team Lead or Developer)**

```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "teamlead@devflow.com",
  "password": "securepassword123",
  "name": "Team Lead Name",
  "role": "team_lead",  // or "developer"
  "avatar_url": "https://..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "teamlead@devflow.com",
    "name": "Team Lead Name",
    "role": "team_lead",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "User created successfully as team_lead"
}
```

**Important:**
- Admin can **only** create `team_lead` or `developer` roles
- Cannot create another `admin` via API (must be done manually in database)
- Password is automatically hashed with bcrypt

#### 3. **Update User**

```http
PATCH /api/users/{userId}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@devflow.com",
  "role": "team_lead",
  "avatar_url": "https://..."
}
```

#### 4. **Promote Developer to Team Lead**

```http
POST /api/users/{userId}/promote
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "team_lead"
  },
  "message": "User promoted to team lead"
}
```

#### 5. **Demote Team Lead to Developer**

```http
POST /api/users/{userId}/demote
Authorization: Bearer <admin-token>
```

#### 6. **Delete User**

```http
DELETE /api/users/{userId}
Authorization: Bearer <admin-token>
```

**Note:** Admin cannot delete their own account

---

## 👔 Creating Team Leads

### Method 1: Admin Creates Team Lead via API

```bash
# Using curl
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teamlead@devflow.com",
    "password": "securepassword123",
    "name": "John Team Lead",
    "role": "team_lead"
  }'
```

### Method 2: Promote Existing Developer

```bash
# Promote developer to team lead
curl -X POST http://localhost:5000/api/users/{developerId}/promote \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### What Team Leads Can Do

Once created, team leads can:
- ✅ Create teams
- ✅ Create projects
- ✅ Create sprints
- ✅ Assign tasks to developers
- ✅ Manage team members
- ❌ Cannot create other users
- ❌ Cannot create organizations
- ❌ Cannot promote/demote users

---

## 👨‍💻 Creating Developers

### Method 1: Public Signup (Default: Developer)

Anyone can sign up, and they'll automatically be created as a **developer**:

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "developer@devflow.com",
  "password": "password123",
  "name": "Developer Name"
}
```

**Note:** The `role` field in signup is ignored for security. All public signups are `developer`.

### Method 2: Admin Creates Developer

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@devflow.com",
    "password": "password123",
    "name": "Developer Name",
    "role": "developer"
  }'
```

### What Developers Can Do

- ✅ View assigned tasks
- ✅ Update task status
- ✅ Add comments
- ✅ View projects and teams (read-only)
- ❌ Cannot create teams/projects
- ❌ Cannot assign tasks
- ❌ Cannot manage users

---

## 🔐 Role Hierarchy & Permissions

### Permission Matrix

| Action | Admin | Team Lead | Developer |
|--------|-------|-----------|-----------|
| Create Organization | ✅ | ❌ | ❌ |
| Create Team | ✅ | ✅ | ❌ |
| Create Project | ✅ | ✅ | ❌ |
| Create Sprint | ✅ | ✅ | ❌ |
| Create Task | ✅ | ✅ | ❌ |
| Assign Task | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ |
| Create User | ✅ | ❌ | ❌ |
| Promote User | ✅ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ |

### Middleware Protection

Routes are protected by middleware:

```typescript
// Admin only
router.post('/organizations', authenticate, requireAdmin, ...)

// Admin or Team Lead
router.post('/teams', authenticate, requireTeamLead, ...)

// All authenticated users
router.get('/tasks', authenticate, ...)
```

---

## 📡 API Endpoints Summary

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user (team_lead or developer) |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/promote` | Promote to team lead |
| POST | `/api/users/:id/demote` | Demote to developer |

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Sign up (creates developer) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh token |

---

## 🎨 Frontend Integration

### Creating Users from Frontend

You'll need to create a user management page for admins. Here's an example:

```typescript
// frontend/src/pages/Users.tsx
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

export const Users: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'developer',
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.post('/users', formData);
      console.log('User created:', response.data);
      // Refresh user list
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <form onSubmit={handleCreateUser}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="developer">Developer</option>
        <option value="team_lead">Team Lead</option>
      </select>
      <button type="submit">Create User</button>
    </form>
  );
};
```

---

## 📋 Workflow Examples

### Scenario 1: Setting Up a New Organization

1. **Admin logs in**
   ```bash
   POST /api/auth/login
   # Returns admin token
   ```

2. **Admin creates organization**
   ```bash
   POST /api/organizations
   Authorization: Bearer <admin-token>
   ```

3. **Admin creates team lead**
   ```bash
   POST /api/users
   Authorization: Bearer <admin-token>
   {
     "email": "teamlead@company.com",
     "password": "secure123",
     "name": "Team Lead",
     "role": "team_lead"
   }
   ```

4. **Team lead logs in and creates team**
   ```bash
   POST /api/auth/login
   # Team lead gets token
   
   POST /api/teams
   Authorization: Bearer <team-lead-token>
   ```

5. **Admin creates developers**
   ```bash
   POST /api/users
   Authorization: Bearer <admin-token>
   {
     "email": "dev1@company.com",
     "password": "dev123",
     "name": "Developer 1",
     "role": "developer"
   }
   ```

6. **Team lead adds developers to team**
   ```bash
   POST /api/teams/{teamId}/members
   Authorization: Bearer <team-lead-token>
   {
     "user_id": "<developer-id>",
     "role": "developer"
   }
   ```

### Scenario 2: Promoting a Developer

1. **Admin views all users**
   ```bash
   GET /api/users
   Authorization: Bearer <admin-token>
   ```

2. **Admin promotes developer**
   ```bash
   POST /api/users/{developerId}/promote
   Authorization: Bearer <admin-token>
   ```

3. **Developer is now team lead**
   - Can create teams/projects
   - Can assign tasks
   - Still cannot create users

### Scenario 3: Public Developer Signup

1. **Developer signs up**
   ```bash
   POST /api/auth/signup
   {
     "email": "newdev@company.com",
     "password": "password123",
     "name": "New Developer"
   }
   ```
   - Automatically created as `developer` role
   - Receives login token

2. **Developer logs in**
   ```bash
   POST /api/auth/login
   ```

3. **Admin assigns developer to team**
   - Admin or team lead adds developer to team
   - Developer can now see team tasks

---

## 🔒 Security Features

### Public Signup Protection

- ✅ Public signup **only** creates `developer` role
- ✅ Role field in signup is ignored (security)
- ✅ Cannot create `admin` or `team_lead` via public signup

### Admin Protection

- ✅ Only admins can create users
- ✅ Only admins can change user roles
- ✅ Admin cannot delete their own account
- ✅ Admin cannot change their own role

### Role Validation

- ✅ All roles validated against allowed values
- ✅ Database constraint: `CHECK (role IN ('admin', 'team_lead', 'developer'))`
- ✅ Middleware enforces role requirements

---

## 📝 Database Schema

### Users Table

```sql
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
```

### Role Storage

Roles are stored as strings in the database:
- `'admin'`
- `'team_lead'`
- `'developer'`

---

## 🎯 Best Practices

### 1. **Initial Admin Setup**
- Create first admin via database seed script
- Change default password immediately
- Use strong passwords

### 2. **User Creation**
- Admins should create team leads first
- Team leads can then create teams
- Add developers to teams as needed

### 3. **Role Management**
- Start developers as `developer`
- Promote to `team_lead` when needed
- Only create admins when absolutely necessary

### 4. **Password Security**
- Use strong passwords (8+ characters, mixed case, numbers, symbols)
- Never share passwords
- Consider password reset functionality

---

## 🐛 Troubleshooting

### Issue: "Cannot create admin via API"

**Solution:** This is by design for security. Create admin via:
- Database seed script
- Direct database insert
- Temporary code modification (one-time only)

### Issue: "Public signup creates wrong role"

**Solution:** Public signup always creates `developer`. Use admin API to create other roles.

### Issue: "Cannot promote user"

**Solution:** 
- Verify you're logged in as admin
- Check user exists
- Verify user is not already the target role
- Check token is valid

---

## 📚 Quick Reference

### Create Team Lead (Admin)
```bash
POST /api/users
{
  "email": "lead@company.com",
  "password": "secure123",
  "name": "Team Lead",
  "role": "team_lead"
}
```

### Create Developer (Admin)
```bash
POST /api/users
{
  "email": "dev@company.com",
  "password": "dev123",
  "name": "Developer",
  "role": "developer"
}
```

### Promote Developer
```bash
POST /api/users/{id}/promote
```

### Demote Team Lead
```bash
POST /api/users/{id}/demote
```

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Version:** 1.0.0

