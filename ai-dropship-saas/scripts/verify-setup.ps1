#!/usr/bin/env powershell
# Quick verification script for Docker setup

Write-Host "🔍 Docker Environment Verification" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Check files exist
Write-Host "📋 Checking files..." -ForegroundColor Yellow
$files = @(
    "docker-compose.yml",
    ".env",
    ".dockerignore",
    "DOCKER_SETUP.md",
    "DOCKER_QUICK_START.md",
    "apps/backend/Dockerfile.dev",
    "apps/frontend/Dockerfile.dev",
    "apps/ai-engine/Dockerfile.dev",
    "apps/scraper-service/Dockerfile.dev",
    "apps/orchestrator/Dockerfile.dev"
)

$allExists = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING)" -ForegroundColor Red
        $allExists = $false
    }
}

Write-Host ""

# Check docker compose syntax
Write-Host "🐳 Checking docker-compose.yml syntax..." -ForegroundColor Yellow
$output = docker compose config 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Syntax valid" -ForegroundColor Green
} else {
    Write-Host "  ❌ Syntax error:" -ForegroundColor Red
    Write-Host "  $output" -ForegroundColor Red
}

Write-Host ""

# Check Docker daemon
Write-Host "💻 Checking Docker daemon..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Docker daemon running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Docker daemon not responding" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop" -ForegroundColor Yellow
}

Write-Host ""

# Check ports availability
Write-Host "🔌 Checking port availability..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 5432, 6379)
foreach ($port in $ports) {
    $conn = New-Object System.Net.Sockets.TcpClient
    $result = $conn.BeginConnect("127.0.0.1", $port, $null, $null)
    $success = $result.AsyncWaitHandle.WaitOne(100, $false)
    
    if ($success) {
        Write-Host "  ⚠️  Port $port - IN USE" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Port $port - Available" -ForegroundColor Green
    }
}

Write-Host ""

# Summary
Write-Host "=" * 50 -ForegroundColor Cyan
if ($allExists) {
    Write-Host "✅ Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. cd C:\Users\Hp\Tuktuk\ai-dropship-saas" -ForegroundColor White
    Write-Host "  2. .\scripts\docker-start.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Some files are missing" -ForegroundColor Red
}

Write-Host "Services will be available at:" -ForegroundColor Cyan
Write-Host "  • Storefront: http://localhost:3000" -ForegroundColor White
Write-Host "  • Admin: http://localhost:3002" -ForegroundColor White
Write-Host "  • Backend: http://localhost:3001" -ForegroundColor White
Write-Host ""
