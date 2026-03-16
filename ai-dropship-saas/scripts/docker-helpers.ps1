# Docker Helper Functions for AI Dropship SaaS Development
# Add these to your PowerShell profile or run directly

# Colors for output
$script:Green = 'Green'
$script:Yellow = 'Yellow'
$script:Red = 'Red'
$script:Cyan = 'Cyan'

# 🚀 Start all services
function Start-Tuktuk {
    Write-Host "🚀 Starting Tuktuk services..." -ForegroundColor $Green
    docker compose up -d
    Write-Host "✅ Services started" -ForegroundColor $Green
    Start-Sleep -Seconds 3
    docker compose ps
}

# 🛑 Stop all services
function Stop-Tuktuk {
    Write-Host "🛑 Stopping Tuktuk services..." -ForegroundColor $Yellow
    docker compose down
    Write-Host "✅ Services stopped" -ForegroundColor $Green
}

# 🔄 Restart a service
function Restart-TuktukService {
    param([string]$Service)
    if (-not $Service) {
        Write-Host "Usage: Restart-TuktukService <service-name>" -ForegroundColor $Red
        Write-Host "Services: backend, admin, storefront, postgres, redis, ai-engine, scraper, orchestrator" -ForegroundColor $Cyan
        return
    }
    Write-Host "🔄 Restarting tuktuk-$Service..." -ForegroundColor $Yellow
    docker compose restart "tuktuk-$Service"
    Write-Host "✅ Restarted" -ForegroundColor $Green
}

# 📋 View logs
function Get-TuktukLogs {
    param([string]$Service, [int]$Lines = 50)
    if ($Service) {
        Write-Host "📋 Logs for tuktuk-$Service (last $Lines lines):" -ForegroundColor $Cyan
        docker compose logs --tail=$Lines "tuktuk-$Service"
    }
    else {
        Write-Host "📋 Logs for all services (last $Lines lines):" -ForegroundColor $Cyan
        docker compose logs --tail=$Lines
    }
}

# Follow logs (streaming)
function Watch-TuktukLogs {
    param([string]$Service)
    if ($Service) {
        Write-Host "📋 Following tuktuk-$Service logs (Ctrl+C to exit)..." -ForegroundColor $Cyan
        docker compose logs -f "tuktuk-$Service"
    }
    else {
        Write-Host "📋 Following all logs (Ctrl+C to exit)..." -ForegroundColor $Cyan
        docker compose logs -f
    }
}

# 📊 Show service status
function Get-TuktukStatus {
    Write-Host "📊 Service Status:" -ForegroundColor $Cyan
    docker compose ps
    Write-Host ""
    Write-Host "🌐 Access Points:" -ForegroundColor $Cyan
    Write-Host "  • Storefront: http://localhost:3000" -ForegroundColor $Green
    Write-Host "  • Admin: http://localhost:3002" -ForegroundColor $Green
    Write-Host "  • Backend: http://localhost:3001" -ForegroundColor $Green
    Write-Host "  • API Docs: http://localhost:3001/api/docs" -ForegroundColor $Green
}

# 🐚 Access service shell
function Enter-TuktukService {
    param([string]$Service)
    if (-not $Service) {
        Write-Host "Usage: Enter-TuktukService <service-name>" -ForegroundColor $Red
        Write-Host "Services: backend, admin, storefront, postgres, redis, ai-engine, scraper, orchestrator" -ForegroundColor $Cyan
        return
    }
    Write-Host "🐚 Entering tuktuk-$Service shell..." -ForegroundColor $Yellow
    docker compose exec "tuktuk-$Service" sh
}

# 🗄️ Access PostgreSQL
function Enter-TuktukDB {
    Write-Host "🗄️  Entering PostgreSQL..." -ForegroundColor $Yellow
    docker compose exec tuktuk-postgres psql -U postgres -d dropship
}

# 🔴 Access Redis
function Enter-TuktukRedis {
    Write-Host "🔴 Entering Redis CLI..." -ForegroundColor $Yellow
    docker compose exec tuktuk-redis redis-cli
}

# 🔧 Rebuild services
function Rebuild-Tuktuk {
    param([switch]$NoCache)
    $args = @("build")
    if ($NoCache) {
        $args += "--no-cache"
    }
    Write-Host "🔧 Rebuilding images..." -ForegroundColor $Yellow
    docker compose @args
    Write-Host "✅ Build complete" -ForegroundColor $Green
}

# 🔄 Full reset
function Reset-Tuktuk {
    Write-Host "⚠️  WARNING: This will delete all volumes!" -ForegroundColor $Red
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Cancelled" -ForegroundColor $Yellow
        return
    }
    Write-Host "🔄 Resetting environment..." -ForegroundColor $Yellow
    docker compose down -v
    Write-Host "🏗️  Rebuilding..." -ForegroundColor $Yellow
    docker compose build --no-cache
    Write-Host "🚀 Starting services..." -ForegroundColor $Yellow
    docker compose up -d
    Write-Host "✅ Reset complete" -ForegroundColor $Green
    Start-Sleep -Seconds 3
    docker compose ps
}

# 📊 Show resource usage
function Get-TuktukResources {
    Write-Host "📊 Docker Disk Usage:" -ForegroundColor $Cyan
    docker system df
    Write-Host ""
    Write-Host "💾 Container Stats:" -ForegroundColor $Cyan
    docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
}

# 🧹 Clean up unused resources
function Clean-TuktukResources {
    Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor $Yellow
    docker system prune -f
    Write-Host "✅ Cleanup complete" -ForegroundColor $Green
}

# 🔍 Check service health
function Test-TuktukHealth {
    Write-Host "🔍 Checking service health..." -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "🗄️  PostgreSQL" -ForegroundColor $Cyan
    docker compose exec tuktuk-postgres pg_isready -U postgres | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Healthy" -ForegroundColor $Green
    } else {
        Write-Host "  ❌ Unhealthy" -ForegroundColor $Red
    }
    
    Write-Host "🔴 Redis" -ForegroundColor $Cyan
    docker compose exec tuktuk-redis redis-cli ping | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Healthy" -ForegroundColor $Green
    } else {
        Write-Host "  ❌ Unhealthy" -ForegroundColor $Red
    }
    
    Write-Host "🌐 Backend" -ForegroundColor $Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Healthy" -ForegroundColor $Green
    } else {
        Write-Host "  ⚠️  Check manually" -ForegroundColor $Yellow
    }
}

# 📈 View queue stats
function Get-TuktukQueues {
    Write-Host "📈 Queue Status:" -ForegroundColor $Cyan
    Write-Host ""
    
    $redis = "docker compose exec tuktuk-redis redis-cli"
    
    Write-Host "AI Scoring Queue:" -ForegroundColor $Yellow
    Invoke-Expression "$redis LLEN bull:ai-scoring-queue:wait" | ForEach-Object { Write-Host "  Wait: $_" }
    
    Write-Host "Scraper Jobs Queue:" -ForegroundColor $Yellow
    Invoke-Expression "$redis LLEN bull:scraper-jobs-queue:wait" | ForEach-Object { Write-Host "  Wait: $_" }
    
    Write-Host "Campaign Simulation Queue:" -ForegroundColor $Yellow
    Invoke-Expression "$redis LLEN bull:campaign-simulation-queue:wait" | ForEach-Object { Write-Host "  Wait: $_" }
}

# 📝 Show help
function Get-TuktukHelp {
    Write-Host "🐳 Tuktuk Docker Helpers" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "Service Management:" -ForegroundColor $Green
    Write-Host "  Start-Tuktuk                  - Start all services"
    Write-Host "  Stop-Tuktuk                   - Stop all services"
    Write-Host "  Restart-TuktukService <svc>  - Restart a service"
    Write-Host "  Rebuild-Tuktuk [-NoCache]    - Rebuild images"
    Write-Host "  Reset-Tuktuk                  - Full environment reset"
    Write-Host ""
    Write-Host "Monitoring & Info:" -ForegroundColor $Green
    Write-Host "  Get-TuktukStatus              - Show service status and URLs"
    Write-Host "  Get-TuktukLogs [svc] [lines] - View logs"
    Write-Host "  Watch-TuktukLogs [svc]       - Follow logs (streaming)"
    Write-Host "  Test-TuktukHealth            - Check service health"
    Write-Host "  Get-TuktukQueues             - View BullMQ queue stats"
    Write-Host "  Get-TuktukResources          - Show resource usage"
    Write-Host ""
    Write-Host "Access:" -ForegroundColor $Green
    Write-Host "  Enter-TuktukService <svc>    - Shell into a service"
    Write-Host "  Enter-TuktukDB               - PostgreSQL shell"
    Write-Host "  Enter-TuktukRedis            - Redis CLI"
    Write-Host ""
    Write-Host "Maintenance:" -ForegroundColor $Green
    Write-Host "  Clean-TuktukResources        - Clean Docker resources"
    Write-Host "  Get-TuktukHelp               - Show this help"
    Write-Host ""
    Write-Host "Services:" -ForegroundColor $Cyan
    Write-Host "  backend, admin, storefront, postgres, redis, ai-engine, scraper, orchestrator"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Yellow
    Write-Host "  Start-Tuktuk                     # Start all"
    Write-Host "  Get-TuktukStatus                 # Check status"
    Write-Host "  Get-TuktukLogs backend           # View backend logs"
    Write-Host "  Watch-TuktukLogs backend         # Follow backend logs"
    Write-Host "  Restart-TuktukService backend    # Restart backend"
    Write-Host "  Enter-TuktukService backend      # Access backend shell"
    Write-Host "  Enter-TuktukDB                   # Access database"
}

# Alias shortcuts
Set-Alias -Name tstart -Value Start-Tuktuk -Scope Global
Set-Alias -Name tstop -Value Stop-Tuktuk -Scope Global
Set-Alias -Name tstatus -Value Get-TuktukStatus -Scope Global
Set-Alias -Name tlogs -Value Get-TuktukLogs -Scope Global
Set-Alias -Name twatch -Value Watch-TuktukLogs -Scope Global
Set-Alias -Name trestart -Value Restart-TuktukService -Scope Global
Set-Alias -Name tshell -Value Enter-TuktukService -Scope Global
Set-Alias -Name tdb -Value Enter-TuktukDB -Scope Global
Set-Alias -Name tredis -Value Enter-TuktukRedis -Scope Global
Set-Alias -Name thelp -Value Get-TuktukHelp -Scope Global
Set-Alias -Name thealth -Value Test-TuktukHealth -Scope Global
Set-Alias -Name tqueues -Value Get-TuktukQueues -Scope Global

Write-Host "✅ Tuktuk Docker helpers loaded!" -ForegroundColor $Green
Write-Host "   Run: Get-TuktukHelp or thelp" -ForegroundColor $Cyan
