# Development Guide

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher
- **Docker**: 20.x or higher (optional, for containerized development)
- **Git**: Latest version

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstackapp
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (Husky, lint-staged)
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Using Docker
   docker-compose up -d postgres
   
   # Or use local PostgreSQL
   # Create database: createdb devflow
   ```

5. **Run migrations**
   ```bash
   cd backend
   npm run build
   npm run migrate
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the style guide
   - Add tests for new features
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Pre-commit hooks will automatically:
   - Run ESLint
   - Format code with Prettier
   - Run tests (if configured)

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Create a pull request on GitHub.

### Code Style

#### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type

#### Naming Conventions

- **Files**: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Classes/Interfaces**: `PascalCase`
- **Functions**: `camelCase`

#### Code Organization

- One component per file
- Group related functionality
- Use barrel exports (`index.ts`) for clean imports
- Keep functions small and focused

### Testing

#### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

#### Frontend Tests

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

#### Writing Tests

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test API endpoints
- **Test Coverage**: Aim for >80% coverage

### Linting and Formatting

#### Run Linters

```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

#### Format Code

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Express middleware
│   ├── migrations/       # Database migrations
│   ├── models/          # TypeScript types
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.ts        # Express app
├── Dockerfile
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities and API clients
│   ├── pages/           # Page components
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── Dockerfile
└── package.json
```

## API Development

### Adding a New Endpoint

1. **Define the route** in `src/routes/`
2. **Create controller** in `src/controllers/`
3. **Add service logic** in `src/services/`
4. **Add repository methods** in `src/repositories/`
5. **Add validation schemas** in `src/utils/validators.ts`
6. **Add Swagger documentation** in route file
7. **Write tests** in `__tests__/`

### Example: Adding a New Endpoint

```typescript
// routes/exampleRoutes.ts
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Get example data
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, (req, res) => 
  exampleController.getAll(req, res)
);
```

## Database Migrations

### Creating a Migration

1. Create SQL file in `src/migrations/`
2. Follow naming convention: `XXX_description.sql`
3. Update migration runner if needed

### Running Migrations

```bash
cd backend
npm run build
npm run migrate
```

## Debugging

### Backend Debugging

- Use `console.log` for quick debugging
- Use Winston logger for production logging
- Use VS Code debugger with launch.json

### Frontend Debugging

- Use React DevTools
- Use browser DevTools
- Use `console.log` for quick debugging
- Use Error Boundary for error catching

## Common Tasks

### Adding a New Dependency

```bash
# Backend
cd backend
npm install <package-name>

# Frontend
cd frontend
npm install <package-name>
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions (careful!)
npm install <package>@latest
```

### Database Reset

```bash
# Drop and recreate database
dropdb devflow
createdb devflow

# Run migrations
cd backend
npm run migrate
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in `.env`
   - Kill process using port: `lsof -ti:5000 | xargs kill`

2. **Database connection errors**
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Check database exists

3. **Module not found errors**
   - Delete `node_modules` and reinstall
   - Check TypeScript path aliases

4. **Pre-commit hooks not working**
   - Run `npm install` in root
   - Check Husky is installed: `ls .husky`

## Performance Tips

### Backend

- Use database indexes
- Optimize SQL queries
- Use connection pooling
- Cache frequently accessed data

### Frontend

- Use React.memo for expensive components
- Lazy load routes
- Optimize images
- Use code splitting

## Security Checklist

- [ ] Environment variables not committed
- [ ] Secrets in `.env` files
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] Authentication on protected routes
- [ ] Authorization checks in place

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Happy Coding!** 🚀

