# Git & Development Guide for DevFlow

Complete guide for Git operations, GitHub workflows, and project development commands.

## 📚 Table of Contents

1. [Git Basics](#git-basics)
2. [Pushing to GitHub](#pushing-to-github)
3. [Project Development Commands](#project-development-commands)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## 🔧 Git Basics

### Initial Setup

```bash
# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check current configuration
git config --list
```

### Repository Status

```bash
# Check current status
git status

# View changes in files
git diff

# View staged changes
git diff --staged

# View commit history
git log --oneline
git log --graph --oneline --all
```

### Basic Git Commands

```bash
# Add files to staging
git add <filename>              # Add specific file
git add .                       # Add all changes
git add *.ts                    # Add all TypeScript files
git add frontend/               # Add entire directory

# Commit changes
git commit -m "Your commit message"
git commit -m "Fix: authentication error handling"
git commit -m "Feat: add dashboard stats endpoint"

# View commit history
git log
git log --oneline              # Compact view
git log --graph --all          # Visual branch history
git log -5                     # Last 5 commits

# Undo changes
git restore <filename>         # Discard changes in working directory
git restore --staged <filename> # Unstage file
git reset HEAD~1               # Undo last commit (keep changes)
git reset --hard HEAD~1        # Undo last commit (discard changes)
```

---

## 🚀 Pushing to GitHub

### First Time Setup

```bash
# Clone existing repository
git clone https://github.com/yourusername/devflow.git
cd devflow

# Or initialize new repository
git init
git remote add origin https://github.com/yourusername/devflow.git
```

### Standard Push Workflow

```bash
# 1. Check current status
git status

# 2. Add your changes
git add .

# 3. Commit with descriptive message
git commit -m "Fix: resolve notifications filter error"

# 4. Push to GitHub
git push origin main

# Or push to specific branch
git push origin feature-branch
```

### Push with Authentication

```bash
# Using HTTPS (will prompt for credentials)
git push origin main

# Using SSH (if configured)
git push git@github.com:yourusername/devflow.git main

# Using Personal Access Token (recommended)
# 1. Generate token in GitHub Settings > Developer settings > Personal access tokens
# 2. Use token as password when prompted
git push origin main
```

### Force Push (Use with Caution!)

```bash
# Force push (overwrites remote history)
git push --force origin main

# Safer force push (only if no one else has pushed)
git push --force-with-lease origin main
```

---

## 📦 Project Development Commands

### Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Check status
docker compose ps

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server (if not using Docker)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run development server (if not using Docker)
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

### Database Commands

```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d devflow

# Run SQL query
docker compose exec -T postgres psql -U postgres -d devflow -c "SELECT * FROM users;"

# Create database backup
docker compose exec -T postgres pg_dump -U postgres devflow > backup.sql

# Restore from backup
docker compose exec -T postgres psql -U postgres -d devflow < backup.sql
```

---

## 🔄 Common Workflows

### Daily Development Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes and test
# ... make code changes ...
docker compose up -d --build

# 4. Stage and commit
git add .
git commit -m "Feat: add new feature"

# 5. Push branch
git push origin feature/new-feature

# 6. Create Pull Request on GitHub
# (Go to GitHub and create PR)
```

### Fixing Issues Workflow

```bash
# 1. Check current branch
git branch

# 2. Create hotfix branch
git checkout -b hotfix/fix-bug-name

# 3. Make fixes
# ... fix the bug ...

# 4. Test the fix
docker compose up -d --build
# Test in browser

# 5. Commit fix
git add .
git commit -m "Fix: resolve bug description"

# 6. Push and create PR
git push origin hotfix/fix-bug-name
```

### Updating After Remote Changes

```bash
# Fetch latest changes
git fetch origin

# View what changed
git log HEAD..origin/main

# Merge remote changes
git pull origin main

# Or rebase (cleaner history)
git pull --rebase origin main
```

### Working with Branches

```bash
# List all branches
git branch                    # Local branches
git branch -a                 # All branches (local + remote)
git branch -r                 # Remote branches only

# Create new branch
git checkout -b feature-name
git branch feature-name       # Create without switching

# Switch branches
git checkout main
git checkout feature-name

# Delete branch
git branch -d feature-name   # Safe delete (only if merged)
git branch -D feature-name    # Force delete

# Push branch to remote
git push -u origin feature-name

# Delete remote branch
git push origin --delete feature-name
```

---

## 🐛 Troubleshooting

### Common Git Issues

#### Issue: "Your branch is behind 'origin/main'"

```bash
# Pull latest changes
git pull origin main

# If you have local commits, rebase
git pull --rebase origin main
```

#### Issue: Merge Conflicts

```bash
# 1. See conflicted files
git status

# 2. Open files and resolve conflicts
# Look for <<<<<<< HEAD markers

# 3. After resolving, stage files
git add <resolved-file>

# 4. Complete merge
git commit
```

#### Issue: Accidentally Committed Wrong Files

```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Or amend last commit
git add <correct-files>
git commit --amend --no-edit
```

#### Issue: Need to Change Last Commit Message

```bash
git commit --amend -m "New commit message"
```

#### Issue: Lost Changes

```bash
# View reflog (history of all actions)
git reflog

# Recover lost commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

### Docker Issues

#### Issue: Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

#### Issue: Container Won't Start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Rebuild without cache
docker compose build --no-cache
docker compose up -d

# Remove and recreate
docker compose down -v
docker compose up -d --build
```

#### Issue: Database Connection Errors

```bash
# Check database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Verify connection
docker compose exec postgres psql -U postgres -d devflow -c "SELECT 1;"
```

---

## ✅ Best Practices

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Fix: resolve authentication token validation error"
git commit -m "Feat: add dashboard statistics endpoint"
git commit -m "Refactor: improve error handling in API client"
git commit -m "Docs: update authentication guide"
git commit -m "Style: format code with prettier"

# Bad commit messages (avoid these)
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

**Commit Message Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `Fix:` - Bug fixes
- `Feat:` - New features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Style:` - Formatting, missing semicolons, etc.
- `Test:` - Adding tests
- `Chore:` - Build process, auxiliary tools

### Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/dashboard-stats

# Bug fix branches
fix/auth-token-error
fix/notifications-filter

# Hotfix branches
hotfix/critical-security-patch

# Release branches
release/v1.0.0
```

### Before Pushing

```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Run tests (if available)
npm test

# 4. Build to check for errors
npm run build

# 5. Commit with good message
git commit -m "Descriptive message"

# 6. Pull latest changes
git pull origin main

# 7. Push
git push origin main
```

### Git Ignore

Make sure `.gitignore` includes:

```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## 🔐 GitHub Authentication

### Using Personal Access Token (Recommended)

1. **Generate Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token"
   - Select scopes: `repo` (full control)
   - Copy the token

2. **Use Token:**
   ```bash
   # When prompted for password, use the token
   git push origin main
   # Username: your-github-username
   # Password: <paste-token>
   ```

3. **Store Credentials (Windows):**
   ```bash
   # Use Git Credential Manager
   git config --global credential.helper manager-core
   ```

### Using SSH Keys

```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# 2. Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copy public key
cat ~/.ssh/id_ed25519.pub

# 4. Add to GitHub
# Go to GitHub → Settings → SSH and GPG keys → New SSH key
# Paste the public key

# 5. Test connection
ssh -T git@github.com

# 6. Update remote URL
git remote set-url origin git@github.com:yourusername/devflow.git
```

---

## 📝 Quick Reference

### Most Used Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Message"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main

# View logs
git log --oneline

# View changes
git diff
```

### Project-Specific Commands

```bash
# Start development
docker compose up -d

# Rebuild after changes
docker compose up -d --build

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build
```

---

## 🎯 Development Checklist

Before pushing code:

- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] Tests pass (if available)
- [ ] Code is formatted properly
- [ ] Commit message is descriptive
- [ ] No sensitive data in commits (tokens, passwords)
- [ ] `.gitignore` is up to date
- [ ] Pulled latest changes (`git pull`)
- [ ] Tested locally with Docker
- [ ] Documentation updated (if needed)

---

## 📚 Additional Resources

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Docker Documentation:** https://docs.docker.com/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices

---

## 🆘 Getting Help

### Git Help

```bash
# Get help for any command
git help <command>
git help commit
git help push

# View Git documentation
git help
```

### Project Issues

1. Check Docker logs: `docker compose logs`
2. Check browser console for frontend errors
3. Check backend logs: `docker compose logs backend`
4. Verify environment variables are set
5. Check database connection

### Common Solutions

- **"Permission denied"** → Check SSH keys or use HTTPS with token
- **"Branch not found"** → Run `git fetch origin` first
- **"Merge conflict"** → Resolve conflicts manually
- **"Container won't start"** → Check logs and rebuild
- **"Port in use"** → Change ports or kill process

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Project:** DevFlow - Full Stack Application
**Repository:** https://github.com/yourusername/devflow

