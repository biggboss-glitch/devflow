#!/bin/bash

# DevFlow Deployment Script
# Automates the deployment process

set -e  # Exit on error

echo "🚀 DevFlow Deployment Script"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print step
step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running in project root
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: Must run from project root directory"
    exit 1
fi

# Deployment mode
MODE=${1:-docker}

if [ "$MODE" == "docker" ]; then
    echo "Deployment Mode: Docker"
    echo ""
    
    # Step 1: Check Docker
    step "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null; then
        echo "Error: docker-compose is not installed"
        exit 1
    fi
    success "Docker and docker-compose are installed"
    
    # Step 2: Stop existing containers
    step "Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    success "Existing containers stopped"
    
    # Step 3: Build images
    step "Building Docker images..."
    docker-compose build
    success "Docker images built"
    
    # Step 4: Start services
    step "Starting services..."
    docker-compose up -d
    success "Services started"
    
    # Step 5: Wait for services to be ready
    step "Waiting for services to be ready..."
    sleep 10
    
    # Step 6: Check service health
    step "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        success "PostgreSQL is ready"
    else
        warn "PostgreSQL may not be ready yet"
    fi
    
    # Check backend
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        success "Backend is ready"
    else
        warn "Backend may not be ready yet (this is normal on first start)"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend is ready"
    else
        warn "Frontend may not be ready yet"
    fi
    
    echo ""
    echo "=================================="
    echo "✅ Deployment Complete!"
    echo "=================================="
    echo ""
    echo "Access your application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo "  Health:   http://localhost:5000/health"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo ""
    
elif [ "$MODE" == "local" ]; then
    echo "Deployment Mode: Local Development"
    echo ""
    
    # Step 1: Check Node.js
    step "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js is not installed"
        exit 1
    fi
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "Error: Node.js 18+ is required"
        exit 1
    fi
    success "Node.js $(node --version) is installed"
    
    # Step 2: Install backend dependencies
    step "Installing backend dependencies..."
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
        success "Backend dependencies installed"
    else
        success "Backend dependencies already installed"
    fi
    cd ..
    
    # Step 3: Install frontend dependencies
    step "Installing frontend dependencies..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
        success "Frontend dependencies installed"
    else
        success "Frontend dependencies already installed"
    fi
    cd ..
    
    # Step 4: Check environment files
    step "Checking environment files..."
    if [ ! -f "backend/.env" ]; then
        warn "backend/.env not found. Copying from .env.example"
        cp backend/.env.example backend/.env
        echo "⚠ Please edit backend/.env with your configuration"
    else
        success "backend/.env exists"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        warn "frontend/.env not found. Copying from .env.example"
        cp frontend/.env.example frontend/.env
    else
        success "frontend/.env exists"
    fi
    
    # Step 5: Check PostgreSQL
    step "Checking PostgreSQL..."
    if command -v psql &> /dev/null; then
        success "PostgreSQL is installed"
        echo ""
        echo "Next steps:"
        echo "1. Create database: createdb devflow"
        echo "2. Run migrations: cd backend && npm run migrate"
        echo "3. Start backend: cd backend && npm run dev"
        echo "4. Start frontend: cd frontend && npm run dev"
    else
        warn "PostgreSQL not found. Please install PostgreSQL or use Docker"
    fi
    
    echo ""
    echo "=================================="
    echo "✅ Setup Complete!"
    echo "=================================="
    echo ""
    
else
    echo "Usage: ./deploy.sh [docker|local]"
    echo ""
    echo "  docker - Deploy using Docker Compose (recommended)"
    echo "  local  - Set up for local development"
    exit 1
fi
