# DevFlow - Quick Reference Guide

## 🚀 Quick Start

```bash
# Using Docker (Easiest)
docker-compose up -d

# Local Development
cd backend && npm install && npm run migrate && npm run dev
cd frontend && npm install && npm run dev
```

## 📍 Access Points

- **Frontend**: http://localhost:3000 (Docker) or http://localhost:5173 (local)
- **Backend**: http://localhost:5000
- **Health**: http://localhost:5000/health
- **Database**: localhost:5432

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devflow
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_ENV=development
```

## 📡 API Endpoints

### Auth
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
```

### Organizations (Admin)
```
POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
```

### Teams
```
POST   /api/teams
GET    /api/teams
GET    /api/teams/:id
PATCH  /api/teams/:id
DELETE /api/teams/:id
POST   /api/teams/:id/members
DELETE /api/teams/:id/members/:userId
GET    /api/teams/:id/members
```

### Projects
```
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

### Sprints
```
POST   /api/sprints
GET    /api/sprints
GET    /api/sprints/:id
PATCH  /api/sprints/:id
DELETE /api/sprints/:id
```

### Tasks
```
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status
POST   /api/tasks/:id/assign
```

### Comments
```
POST   /api/tasks/:taskId/comments
GET    /api/tasks/:taskId/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
```

### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

### Analytics
```
GET    /api/analytics/sprints/:sprintId/analytics
GET    /api/analytics/team/:teamId/velocity
GET    /api/analytics/tasks/distribution
```

## 🗄️ Database Tables

1. **users** - User accounts
2. **organizations** - Organizations
3. **teams** - Teams
4. **team_members** - Team membership
5. **projects** - Projects
6. **sprints** - Sprints
7. **tasks** - Tasks
8. **comments** - Comments
9. **notifications** - Notifications
10. **task_status_history** - Status history

## 🔐 User Roles

- **admin** - Full access
- **team_lead** - Team and project management
- **developer** - Task management

## 📝 Common Commands

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm start            # Start production
npm test             # Run tests
npm run migrate      # Run migrations
npm run lint         # Lint code
npm run format       # Format code
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose ps                 # List services
docker-compose down -v            # Remove volumes
docker-compose restart backend    # Restart service
```

## 🐛 Troubleshooting

### Port in use
```bash
# Find process
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps
psql -h localhost -U postgres -d devflow

# Reset database
docker-compose down -v
docker-compose up -d
cd backend && npm run migrate
```

### Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Files

- **README.md** - Project overview
- **SETUP.md** - Setup instructions
- **PROJECT_SUMMARY.md** - Implementation details
- **DEPLOYMENT.md** - Deployment guide
- **GIT_GUIDE.md** - Git workflow
- **CONTRIBUTING.md** - Contribution guidelines
- **CHANGELOG.md** - Version history
- **COMPLETION_REPORT.md** - Project completion summary
- **QUICK_REFERENCE.md** - This file

## 🧪 Testing API

### Using curl
```bash
# Health check
curl http://localhost:5000/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"developer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get tasks (with auth)
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Import collection (create one from API endpoints)
2. Set environment variables
3. Test endpoints

## 🔄 Git Workflow

```bash
# Initial setup
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/YOUR_USERNAME/devflow.git
git push -u origin main

# Feature branch
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Update from main
git checkout main
git pull origin main
git checkout feature/new-feature
git merge main
```

## 📊 Project Structure

```
devflow/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   └── package.json
│
├── frontend/         # React app
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── test/
│   └── package.json
│
├── docker-compose.yml
└── Documentation files
```

## 🎯 Next Steps

1. **Install dependencies**: `npm install` in both directories
2. **Set up database**: Create PostgreSQL database
3. **Run migrations**: `cd backend && npm run migrate`
4. **Start servers**: Use Docker or local development
5. **Test API**: Use curl or Postman
6. **Implement frontend**: Build React components
7. **Write tests**: Add comprehensive tests
8. **Deploy**: Follow DEPLOYMENT.md

## 💡 Tips

- Use Docker for easiest setup
- Check logs for debugging
- Use Postman for API testing
- Read documentation files
- Follow Git workflow
- Write tests as you go
- Keep dependencies updated

## 📞 Help

- Check documentation files
- Review error logs
- Search GitHub issues
- Read code comments
- Use debugger

---

**Quick Reference for DevFlow Development** 🚀
