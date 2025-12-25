#!/bin/bash

# DevFlow Deployment Verification Script
# This script verifies that the deployment is ready

echo "🚀 DevFlow Deployment Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check status
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

# 1. Check Node.js version
echo "1. Checking Node.js version..."
node --version | grep -E "v(18|19|20|21)" > /dev/null
check "Node.js 18+ installed"

# 2. Check npm
echo "2. Checking npm..."
npm --version > /dev/null
check "npm installed"

# 3. Check PostgreSQL (if running locally)
echo "3. Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    psql --version > /dev/null
    check "PostgreSQL installed"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: PostgreSQL not found (may be using Docker)"
fi

# 4. Check Docker
echo "4. Checking Docker..."
if command -v docker &> /dev/null; then
    docker --version > /dev/null
    check "Docker installed"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Docker not installed"
fi

# 5. Check docker-compose
echo "5. Checking docker-compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose --version > /dev/null
    check "docker-compose installed"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: docker-compose not installed"
fi

# 6. Check backend files
echo "6. Checking backend files..."
[ -f "backend/package.json" ] && [ -f "backend/tsconfig.json" ] && [ -f "backend/src/server.ts" ]
check "Backend files present"

# 7. Check frontend files
echo "7. Checking frontend files..."
[ -f "frontend/package.json" ] && [ -f "frontend/tsconfig.json" ] && [ -f "frontend/src/main.tsx" ]
check "Frontend files present"

# 8. Check Docker files
echo "8. Checking Docker configuration..."
[ -f "docker-compose.yml" ] && [ -f "backend/Dockerfile" ] && [ -f "frontend/Dockerfile" ]
check "Docker configuration present"

# 9. Check environment templates
echo "9. Checking environment templates..."
[ -f "backend/.env.example" ] && [ -f "frontend/.env.example" ]
check "Environment templates present"

# 10. Check migrations
echo "10. Checking database migrations..."
MIGRATION_COUNT=$(ls backend/src/migrations/*.sql 2>/dev/null | wc -l)
[ "$MIGRATION_COUNT" -eq 10 ]
check "All 10 migration files present"

# 11. Check documentation
echo "11. Checking documentation..."
[ -f "README.md" ] && [ -f "SETUP.md" ] && [ -f "DEPLOYMENT.md" ]
check "Documentation files present"

# 12. Check backend dependencies (if node_modules exists)
echo "12. Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    [ -d "backend/node_modules/express" ] && [ -d "backend/node_modules/pg" ]
    check "Backend dependencies installed"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Backend dependencies not installed yet"
fi

# 13. Check frontend dependencies (if node_modules exists)
echo "13. Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    [ -d "frontend/node_modules/react" ] && [ -d "frontend/node_modules/vite" ]
    check "Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Frontend dependencies not installed yet"
fi

# 14. Check Git repository
echo "14. Checking Git repository..."
if [ -d ".git" ]; then
    git status > /dev/null 2>&1
    check "Git repository initialized"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Git not initialized"
fi

# 15. Check for .env files (should not exist in repo)
echo "15. Checking for .env files..."
if [ ! -f "backend/.env" ] && [ ! -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ PASS${NC}: No .env files in repository (good!)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARN${NC}: .env files found (should not be committed)"
fi

echo ""
echo "=================================="
echo "Verification Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies: cd backend && npm install"
    echo "2. Set up environment: cp backend/.env.example backend/.env"
    echo "3. Configure database in backend/.env"
    echo "4. Run migrations: cd backend && npm run migrate"
    echo "5. Start development: npm run dev"
    echo ""
    echo "Or use Docker:"
    echo "docker-compose up -d"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
