#!/bin/bash

# Integration Tests Runner Script
# This script automates the setup and execution of integration tests

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MindConnect Integration Tests Runner${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Check if Docker is running
echo -e "${YELLOW}[1/5] Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Step 2: Start MySQL container
echo -e "${YELLOW}[2/5] Starting MySQL container...${NC}"
docker-compose up -d mysql
echo -e "${GREEN}✓ MySQL container started${NC}"
echo ""

# Step 3: Wait for MySQL to be ready
echo -e "${YELLOW}[3/5] Waiting for MySQL to be ready...${NC}"
echo "This may take 10-15 seconds..."

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost -u user -ppassword_change_me --silent 2>/dev/null; then
        echo -e "${GREEN}✓ MySQL is ready${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}Error: MySQL failed to start within timeout${NC}"
    echo "Check logs with: docker-compose logs mysql"
    exit 1
fi
echo ""

# Step 4: Setup database schema
echo -e "${YELLOW}[4/5] Setting up database schema...${NC}"
npx prisma migrate deploy 2>/dev/null || npx prisma db push --skip-generate
echo -e "${GREEN}✓ Database schema ready${NC}"
echo ""

# Step 5: Run integration tests
echo -e "${YELLOW}[5/5] Running integration tests...${NC}"
echo ""

# Check if coverage flag is provided
if [ "$1" == "--coverage" ] || [ "$1" == "-c" ]; then
    npm run test:coverage -- tests/integration/centers.test.js
else
    npm test -- tests/integration/centers.test.js
fi

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Some tests failed. Check output above.${NC}"
    echo -e "${RED}========================================${NC}"
fi

echo ""
echo "Useful commands:"
echo "  - View MySQL logs: docker-compose logs mysql"
echo "  - Stop MySQL: docker-compose stop mysql"
echo "  - Clean database: docker-compose down -v"
echo ""

exit $TEST_EXIT_CODE
