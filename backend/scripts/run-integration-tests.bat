@echo off
REM Integration Tests Runner Script for Windows
REM This script automates the setup and execution of integration tests

setlocal enabledelayedexpansion

echo ========================================
echo MindConnect Integration Tests Runner
echo ========================================
echo.

REM Step 1: Check if Docker is running
echo [1/5] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop.
    exit /b 1
)
echo √ Docker is running
echo.

REM Step 2: Start MySQL container
echo [2/5] Starting MySQL container...
docker-compose up -d mysql
if errorlevel 1 (
    echo Error: Failed to start MySQL container
    exit /b 1
)
echo √ MySQL container started
echo.

REM Step 3: Wait for MySQL to be ready
echo [3/5] Waiting for MySQL to be ready...
echo This may take 10-15 seconds...

set MAX_ATTEMPTS=30
set ATTEMPT=0

:wait_loop
if !ATTEMPT! geq !MAX_ATTEMPTS! goto timeout

docker-compose exec -T mysql mysqladmin ping -h localhost -u user -ppassword_change_me --silent >nul 2>&1
if errorlevel 1 (
    set /a ATTEMPT+=1
    echo|set /p=.
    timeout /t 1 /nobreak >nul
    goto wait_loop
)

echo.
echo √ MySQL is ready
echo.
goto mysql_ready

:timeout
echo.
echo Error: MySQL failed to start within timeout
echo Check logs with: docker-compose logs mysql
exit /b 1

:mysql_ready

REM Step 4: Setup database schema
echo [4/5] Setting up database schema...
npx prisma migrate deploy 2>nul
if errorlevel 1 (
    npx prisma db push --skip-generate
)
echo √ Database schema ready
echo.

REM Step 5: Run integration tests
echo [5/5] Running integration tests...
echo.

REM Check if coverage flag is provided
if "%1"=="--coverage" (
    call npm run test:coverage -- tests/integration/centers.test.js
) else if "%1"=="-c" (
    call npm run test:coverage -- tests/integration/centers.test.js
) else (
    call npm test -- tests/integration/centers.test.js
)

set TEST_EXIT_CODE=%errorlevel%

echo.
if %TEST_EXIT_CODE%==0 (
    echo ========================================
    echo √ All integration tests passed!
    echo ========================================
) else (
    echo ========================================
    echo × Some tests failed. Check output above.
    echo ========================================
)

echo.
echo Useful commands:
echo   - View MySQL logs: docker-compose logs mysql
echo   - Stop MySQL: docker-compose stop mysql
echo   - Clean database: docker-compose down -v
echo.

exit /b %TEST_EXIT_CODE%
