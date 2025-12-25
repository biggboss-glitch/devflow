# Contributing to DevFlow

Thank you for your interest in contributing to DevFlow! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git
- Basic knowledge of TypeScript, React, and Express

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
```bash
git clone https://github.com/YOUR_USERNAME/devflow.git
cd devflow
```

3. **Add upstream remote**:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/devflow.git
```

4. **Install dependencies**:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

5. **Set up environment variables**:
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
```

6. **Run database migrations**:
```bash
cd backend
npm run migrate
```

7. **Start development servers**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues to avoid duplicates
- Collect information about the bug
- Test with the latest version

**Bug Report Template**:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]

**Additional context**
Any other context about the problem.
```

### Suggesting Features

**Feature Request Template**:
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

### Pull Requests

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**:
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Lint
npm run lint
```

4. **Commit your changes**:
```bash
git add .
git commit -m "feat: add amazing feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

5. **Push to your fork**:
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why
   - Add screenshots if applicable

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Use meaningful variable and function names
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Add JSDoc comments for public APIs
- Keep functions small and focused

**Example**:
```typescript
/**
 * Creates a new task in the database
 * @param data - Task creation data
 * @returns Created task object
 */
async createTask(data: CreateTaskDto): Promise<Task> {
  // Validate input
  if (!data.title) {
    throw new ValidationError('Title is required');
  }

  // Create task
  const task = await this.taskRepo.create(data);
  
  // Send notification
  if (data.assignee_id) {
    await this.notificationService.notifyTaskAssignment(task);
  }

  return task;
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks
- Use meaningful component names

**Example**:
```typescript
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <StatusBadge status={task.status} />
      <button onClick={() => handleStatusChange('in_progress')}>
        Start Task
      </button>
    </div>
  );
};
```

### Database Queries

- Use parameterized queries (never string concatenation)
- Add appropriate indexes
- Use transactions for multi-step operations
- Handle errors gracefully

**Example**:
```typescript
async findByEmail(email: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}
```

## 🧪 Testing Guidelines

### Backend Tests

```typescript
describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepo: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    taskService = new TaskService(mockTaskRepo);
  });

  it('should create a task', async () => {
    const taskData = {
      title: 'Test Task',
      sprint_id: '123',
      creator_id: '456',
    };

    mockTaskRepo.create.mockResolvedValue({ id: '789', ...taskData } as Task);

    const result = await taskService.createTask(taskData);

    expect(result.id).toBe('789');
    expect(mockTaskRepo.create).toHaveBeenCalledWith(taskData);
  });
});
```

### Frontend Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} onStatusChange={jest.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onStatusChange when button clicked', () => {
    const handleStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={handleStatusChange} />);
    
    fireEvent.click(screen.getByText('Start Task'));
    
    expect(handleStatusChange).toHaveBeenCalledWith('1', 'in_progress');
  });
});
```

## 📚 Documentation

- Update README.md if you add new features
- Add JSDoc comments for public APIs
- Update API documentation for new endpoints
- Add inline comments for complex logic
- Update CHANGELOG.md

## 🔍 Code Review Process

All submissions require review. We use GitHub pull requests for this purpose.

**Reviewers will check for**:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations
- Breaking changes

**As a contributor**:
- Be open to feedback
- Respond to review comments
- Make requested changes promptly
- Ask questions if unclear

## 🏗️ Project Structure

```
devflow/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # TypeScript interfaces
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── tests/               # Tests
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── types/           # TypeScript types
    └── tests/               # Tests
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Frontend component implementation
- [ ] GitHub API integration for PR status
- [ ] Analytics calculations
- [ ] Comprehensive test coverage
- [ ] API documentation (Swagger/OpenAPI)

### Medium Priority
- [ ] Email notification service
- [ ] File upload for avatars
- [ ] Advanced search functionality
- [ ] Export functionality (CSV, PDF)
- [ ] Mobile responsive design

### Low Priority
- [ ] Dark mode
- [ ] Internationalization (i18n)
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimizations

## 📞 Getting Help

- **Documentation**: Check README.md, SETUP.md, and other docs
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: [Join our Discord server] (if available)

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DevFlow! 🚀**
