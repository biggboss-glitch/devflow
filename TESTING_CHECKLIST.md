# DevFlow Full Stack Testing Checklist

## Test Credentials
- **Admin Account:** arnoldswamy09@gmail.com / password123
- **Developer Account:** test@devflow.com / test123
- **Team Lead Account:** manager@devflow.com / manager123

---

## 1. AUTHENTICATION TESTING

### Sign In
- [ ] Sign in with valid credentials (arnoldswamy09@gmail.com / password123)
- [ ] Verify successful login and redirect to dashboard
- [ ] Check JWT token is stored in localStorage
- [ ] Sign out successfully
- [ ] Test invalid credentials - should show error
- [ ] Test empty email/password - should show validation error

### Sign Up
- [ ] Navigate to sign up page
- [ ] Create new account with unique email
- [ ] Verify user account is created
- [ ] Sign in with newly created account
- [ ] Test duplicate email - should show error
- [ ] Test password validation (empty/short password)

---

## 2. ORGANIZATION TESTING

### Create Organization
- [ ] Sign in with admin account
- [ ] Navigate to Organizations
- [ ] Click "Create Organization"
- [ ] Fill organization details (name, description)
- [ ] Submit form
- [ ] Verify organization appears in list
- [ ] Check organization is saved in database (pgAdmin)

### View Organizations
- [ ] View all organizations
- [ ] Click on organization to view details
- [ ] Verify organization members list
- [ ] Check organization projects

### Update Organization
- [ ] Edit organization details
- [ ] Change organization name/description
- [ ] Save changes
- [ ] Verify updates are reflected

### Delete Organization
- [ ] Delete organization
- [ ] Verify it no longer appears in list
- [ ] Confirm deletion in database

---

## 3. TEAM TESTING

### Create Team
- [ ] Navigate to Teams
- [ ] Select an organization
- [ ] Click "Create Team"
- [ ] Fill team details (name, description)
- [ ] Assign team lead
- [ ] Submit form
- [ ] Verify team appears in list

### Manage Team Members
- [ ] Add members to team (from existing users)
- [ ] Assign different roles to members
- [ ] Remove member from team
- [ ] Verify member list updates

### Edit Team
- [ ] Edit team name/description
- [ ] Change team lead
- [ ] Save changes

### Delete Team
- [ ] Delete team
- [ ] Verify it's removed from list

---

## 4. PROJECT TESTING

### Create Project
- [ ] Navigate to Projects
- [ ] Select an organization and team
- [ ] Click "Create Project"
- [ ] Fill project details (name, description, status)
- [ ] Assign project manager
- [ ] Submit form
- [ ] Verify project appears in list

### View Projects
- [ ] View all projects
- [ ] Filter projects by team
- [ ] Filter projects by status
- [ ] Click project to see details

### Update Project
- [ ] Edit project details
- [ ] Change project status
- [ ] Update assigned team members
- [ ] Save changes

### Delete Project
- [ ] Delete project
- [ ] Verify removal from list

---

## 5. SPRINT TESTING

### Create Sprint
- [ ] Navigate to Sprints (within a project)
- [ ] Click "Create Sprint"
- [ ] Fill sprint details (name, start date, end date, goal)
- [ ] Submit form
- [ ] Verify sprint appears in list

### View Sprint Details
- [ ] Click on sprint
- [ ] View sprint duration
- [ ] View tasks within sprint
- [ ] Check sprint progress/metrics

### Start/End Sprint
- [ ] Change sprint status (Active, Completed)
- [ ] Verify status updates
- [ ] Check date validations

### Edit Sprint
- [ ] Edit sprint details
- [ ] Extend sprint dates if needed
- [ ] Update goals

---

## 6. TASK TESTING

### Create Task
- [ ] Navigate to Tasks (within a sprint/project)
- [ ] Click "Create Task"
- [ ] Fill task details:
  - [ ] Title
  - [ ] Description
  - [ ] Priority (High, Medium, Low)
  - [ ] Status (To Do, In Progress, Review, Done)
  - [ ] Assign to team member
  - [ ] Due date
- [ ] Submit form
- [ ] Verify task appears in board/list

### View Tasks
- [ ] View all tasks in sprint
- [ ] View tasks on Kanban board (To Do, In Progress, Review, Done)
- [ ] View task details by clicking on task
- [ ] Check task metadata (assignee, due date, priority)

### Update Task
- [ ] Edit task details
- [ ] Change task status (drag on Kanban or update via form)
- [ ] Reassign task to different member
- [ ] Update due date
- [ ] Change priority
- [ ] Save changes
- [ ] Verify task status history is recorded

### Task Status History
- [ ] Check task status history
- [ ] Verify all status changes are logged with timestamps
- [ ] View who made the changes

### Delete Task
- [ ] Delete a task
- [ ] Verify removal from board/list

---

## 7. COMMENT TESTING

### Add Comments
- [ ] Open a task
- [ ] Click "Add Comment"
- [ ] Write comment text
- [ ] Submit comment
- [ ] Verify comment appears below task

### View Comments
- [ ] View all comments on task
- [ ] Check comment author name
- [ ] Check comment timestamp

### Edit Comment
- [ ] Edit your own comment
- [ ] Save changes
- [ ] Verify update is reflected

### Delete Comment
- [ ] Delete your own comment
- [ ] Verify removal from comment list

---

## 8. NOTIFICATIONS TESTING

### Receive Notifications
- [ ] Perform action in one browser/account
- [ ] Have another user assigned to task
- [ ] Check if second user receives notification
- [ ] Verify notification details

### Notification Types
- [ ] Task assigned to you
- [ ] Comment added to your task
- [ ] Task status changed
- [ ] Team/project updates

### Mark as Read
- [ ] Click notification
- [ ] Verify it's marked as read
- [ ] Check unread count updates

---

## 9. ANALYTICS TESTING

### Dashboard Analytics
- [ ] Navigate to Analytics/Dashboard
- [ ] Check total tasks count
- [ ] Check task status breakdown (pie/bar chart)
- [ ] Check tasks by priority
- [ ] Check team productivity metrics

### Project Analytics
- [ ] View analytics for specific project
- [ ] Check sprint progress
- [ ] Check team member workload
- [ ] Check task completion rates

### Reports
- [ ] Generate sprint report
- [ ] Check project summary report
- [ ] Verify data accuracy

---

## 10. AUTHORIZATION TESTING

### Role-Based Access
- [ ] Sign in as Admin
  - [ ] Verify access to all features
  - [ ] Verify ability to delete organizations
  - [ ] Check organization management access

- [ ] Sign in as Team Lead
  - [ ] Verify team management access
  - [ ] Check ability to assign tasks
  - [ ] Verify cannot delete organizations

- [ ] Sign in as Developer
  - [ ] Verify can view assigned tasks
  - [ ] Verify can update own tasks
  - [ ] Verify cannot manage teams/organizations

### Task Permissions
- [ ] Assigned user can edit task
- [ ] Non-assigned user cannot edit task
- [ ] Can add comments to assigned tasks
- [ ] Cannot view private tasks you're not assigned to

---

## 11. DATA PERSISTENCE TESTING

### Database Verification
- [ ] Open pgAdmin
- [ ] Connect to devspacedb
- [ ] Check `users` table - verify test users exist
- [ ] Check `organizations` table - verify created organizations
- [ ] Check `teams` table - verify created teams
- [ ] Check `projects` table - verify created projects
- [ ] Check `sprints` table - verify created sprints
- [ ] Check `tasks` table - verify created tasks
- [ ] Check `comments` table - verify comments saved
- [ ] Check `notifications` table - verify notifications recorded
- [ ] Check `task_status_history` table - verify all status changes logged

---

## 12. ERROR HANDLING TESTING

### Network Errors
- [ ] Stop backend server
- [ ] Try to perform action in frontend
- [ ] Verify error message is displayed
- [ ] Restart server and verify recovery

### Validation Errors
- [ ] Submit empty form fields
- [ ] Submit invalid email format
- [ ] Submit dates in wrong order
- [ ] Verify validation messages appear

### Edge Cases
- [ ] Create task with very long description
- [ ] Try to create duplicate team name
- [ ] Assign task with past due date
- [ ] Delete team with active projects

---

## 13. UI/UX TESTING

### Navigation
- [ ] Navigate between all main pages
- [ ] Sidebar/menu navigation works
- [ ] Breadcrumbs show correct path
- [ ] Back buttons work correctly

### Responsive Design
- [ ] Test on desktop (full width)
- [ ] Test on tablet (medium width)
- [ ] Test on mobile (narrow width)
- [ ] Verify all features accessible on mobile

### Form Validation
- [ ] Visual feedback for invalid fields
- [ ] Error messages are clear
- [ ] Success messages appear after actions
- [ ] Loading states show during processing

---

## 14. PERFORMANCE TESTING

### Load Times
- [ ] Page load time < 3 seconds
- [ ] API responses < 1 second
- [ ] Large lists load without lag (50+ items)

### Data Loading
- [ ] Load 100+ tasks in sprint
- [ ] Load 50+ organizations
- [ ] Pagination/infinite scroll works smoothly

---

## 15. SECURITY TESTING

### Authentication
- [ ] JWT token expires properly
- [ ] Cannot access protected routes without token
- [ ] Token refresh works if implemented
- [ ] Logout clears token from localStorage

### Authorization
- [ ] Cannot modify other user's tasks
- [ ] Cannot delete other user's comments
- [ ] Cannot access other organization's data

### Data Protection
- [ ] Passwords are hashed in database
- [ ] Sensitive data not exposed in API responses
- [ ] CORS properly configured

---

## Test Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | [ ] | |
| Organizations | [ ] | |
| Teams | [ ] | |
| Projects | [ ] | |
| Sprints | [ ] | |
| Tasks | [ ] | |
| Comments | [ ] | |
| Notifications | [ ] | |
| Analytics | [ ] | |
| Authorization | [ ] | |
| Data Persistence | [ ] | |
| Error Handling | [ ] | |
| UI/UX | [ ] | |
| Performance | [ ] | |
| Security | [ ] | |

---

## Known Issues / Bugs Found
(Record any issues discovered during testing)

1. 
2. 
3. 

---

## Recommendations for Improvement
(Note any areas that could be enhanced)

1. 
2. 
3. 

