# Docker development environment startup script for Windows

Write-Host "🚀 Starting AI Dropship SaaS Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
  Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
  Copy-Item ".env.example" ".env"
}

# Stop existing containers if running
$existingContainers = docker ps -q --filter "name=tuktuk-" 2>$null
if ($existingContainers) {
  Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
  docker compose down 2>$null
}

# Build images
Write-Host "🏗️  Building Docker images..." -ForegroundColor Yellow
docker compose build --no-cache

# Start services
Write-Host "🔧 Starting services..." -ForegroundColor Yellow
docker compose up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Display service status
Write-Host ""
Write-Host "✅ Services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "  - Storefront Marketplace: http://localhost:3000" -ForegroundColor White
Write-Host "  - Admin Dashboard: http://localhost:3002" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "  - Swagger Docs: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  - View logs: docker compose logs -f <service>" -ForegroundColor White
Write-Host "  - Stop all: docker compose down" -ForegroundColor White
Write-Host "  - Restart service: docker compose restart <service>" -ForegroundColor White
Write-Host "  - Shell access: docker compose exec <service> sh" -ForegroundColor White
Write-Host ""
