# Comprehensive System Test Script for DevFlow
Write-Host "=== DevFlow System Health Check ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Docker Containers
Write-Host "[1/8] Checking Docker Containers..." -ForegroundColor Yellow
$containers = docker compose ps --format json | ConvertFrom-Json
$allHealthy = $true
foreach ($container in $containers) {
    $status = $container.State
    $health = if ($container.Health) { $container.Health } else { "N/A" }
    if ($status -eq "running" -and ($health -eq "healthy" -or $health -eq "N/A")) {
        Write-Host "  ✓ $($container.Service): $status ($health)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($container.Service): $status ($health)" -ForegroundColor Red
        $allHealthy = $false
    }
}
Write-Host ""

# Test 2: Backend Health Endpoint
Write-Host "[2/8] Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    if ($health.status -eq "ok" -and $health.database -eq "connected") {
        Write-Host "  ✓ Backend is healthy" -ForegroundColor Green
        Write-Host "    Status: $($health.status)" -ForegroundColor Gray
        Write-Host "    Database: $($health.database)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Backend health check failed" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "  ✗ Backend is not responding: $_" -ForegroundColor Red
    $allHealthy = $false
}
Write-Host ""

# Test 3: Frontend Accessibility
Write-Host "[3/8] Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Frontend returned status: $($response.StatusCode)" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "  ✗ Frontend is not responding: $_" -ForegroundColor Red
    $allHealthy = $false
}
Write-Host ""

# Test 4: Database Connection
Write-Host "[4/8] Testing Database..." -ForegroundColor Yellow
try {
    $result = docker compose exec -T postgres psql -U postgres -d devflow -c "SELECT version();" 2>&1
    if ($result -match "PostgreSQL") {
        Write-Host "  ✓ Database is connected" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Database connection failed" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "  ✗ Database test failed: $_" -ForegroundColor Red
    $allHealthy = $false
}
Write-Host ""

# Test 5: API Routes (Unauthenticated)
Write-Host "[5/8] Testing API Routes..." -ForegroundColor Yellow
$routes = @(
    "/api/auth/signup",
    "/api/auth/login"
)
foreach ($route in $routes) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000$route" -Method POST -Body (@{} | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "  ✓ $route is accessible" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400 -or $statusCode -eq 422) {
            Write-Host "  ✓ $route is accessible (validation error expected)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $route returned: $statusCode" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Test 6: Swagger Documentation
Write-Host "[6/8] Testing API Documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api-docs.json" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Swagger documentation is available" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Swagger documentation not available" -ForegroundColor Red
    }
} catch {
    Write-Host "  ⚠ Swagger documentation not accessible (may be disabled)" -ForegroundColor Yellow
}
Write-Host ""

# Test 7: Check for Errors in Logs
Write-Host "[7/8] Checking Recent Logs for Errors..." -ForegroundColor Yellow
$backendLogs = docker compose logs backend --tail 20 2>&1
$errorCount = ($backendLogs | Select-String -Pattern "error|Error|ERROR|fail|Fail|FAIL" -CaseSensitive:$false).Count
if ($errorCount -eq 0) {
    Write-Host "  ✓ No errors in recent backend logs" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Found $errorCount potential errors in logs" -ForegroundColor Yellow
}
Write-Host ""

# Test 8: Port Availability
Write-Host "[8/8] Checking Port Availability..." -ForegroundColor Yellow
$ports = @(3000, 5000, 5433)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "  ✓ Port $port is open" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Port $port is not accessible" -ForegroundColor Red
        $allHealthy = $false
    }
}
Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
if ($allHealthy) {
    Write-Host "✓ All critical systems are operational!" -ForegroundColor Green
} else {
    Write-Host "⚠ Some issues were detected. Please review the output above." -ForegroundColor Yellow
}
Write-Host ""

