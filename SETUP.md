# DevFlow Setup Guide

This guide will help you set up the DevFlow project for local development.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devflow
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devflow
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration (generate secure random strings)
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_secure_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# GitHub API (optional for now)
GITHUB_TOKEN=

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Set Up PostgreSQL Database

1. Start PostgreSQL service
2. Create the database:

```bash
psql -U postgres
CREATE DATABASE devflow;
\q
```

#### Run Database Migrations

Once migrations are created in future tasks:

```bash
npm run migrate
```

#### Start Backend Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

The default values should work for local development:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_ENV=development
```

#### Start Frontend Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Verification

### Backend Health Check

Visit `http://localhost:5000/health` in your browser or use curl:

```bash
curl http://localhost:5000/health
```

You should see:
```json
{"status":"ok","message":"DevFlow API is running"}
```

### Frontend

Visit `http://localhost:5173` in your browser. You should see the DevFlow welcome page.

## Development Workflow

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Linting and Formatting

**Backend:**
```bash
cd backend
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
```

**Frontend:**
```bash
cd frontend
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

**Backend:** Change `PORT` in `backend/.env`
**Frontend:** Change port in `frontend/vite.config.ts`

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check database credentials in `backend/.env`
3. Ensure the database exists: `psql -U postgres -l`

### Module Not Found Errors

Run `npm install` in the respective directory (backend or frontend)

### TypeScript Errors

Ensure you're using Node.js v18+ and TypeScript is installed:
```bash
node --version
npm list typescript
```

## Next Steps

After completing the initial setup:

1. Review the requirements document: `.kiro/specs/devflow-platform/requirements.md`
2. Review the design document: `.kiro/specs/devflow-platform/design.md`
3. Follow the implementation tasks: `.kiro/specs/devflow-platform/tasks.md`

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
