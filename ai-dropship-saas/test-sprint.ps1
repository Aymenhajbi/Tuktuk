# test-sprint.ps1
# Script pour tester Sprint 1 + 2 sur un PC local

Write-Host "=== Début du test Sprint 1+2 ===" -ForegroundColor Cyan

# 1️⃣ Installer toutes les dépendances
Write-Host "`n[1] Installation des dépendances npm..." -ForegroundColor Yellow
Get-ChildItem -Directory | ForEach-Object {
    if (Test-Path "$($_.FullName)\package.json") {
        Write-Host "-> npm install dans $($_.Name)"
        Push-Location $_.FullName
        npm install
        Pop-Location
    }
}

# 2️⃣ Lancer les migrations Prisma (backend)
Write-Host "`n[2] Lancer les migrations Prisma..." -ForegroundColor Yellow
Push-Location "apps/backend"
npx prisma migrate deploy
Write-Host "Migrations terminées"
Pop-Location

# 3️⃣ Lancer le seed idempotent (backend)
Write-Host "`n[3] Exécuter le seed idempotent..." -ForegroundColor Yellow
Push-Location "apps/backend"
npx prisma db seed
Pop-Location
Write-Host "Seed terminé"

# 4️⃣ Vérifier la syntaxe des workers (sans les exécuter)
Write-Host "`n[4] Vérification syntaxe workers..." -ForegroundColor Yellow
$workers = @(
    "apps/ai-engine/src/workers/ai-scoring.worker.ts",
    "apps/scraper-service/src/workers/scraper.worker.ts",
    "apps/orchestrator/src/workers/orchestrator.worker.ts"
)
foreach ($w in $workers) {
    Write-Host "-> Vérification $w"
    node --check $w
}

# 5️⃣ Lancer les tests unitaires et intégration backend
Write-Host "`n[5] Lancer les tests backend..." -ForegroundColor Yellow
Push-Location "apps/backend"
if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx jest --config jest.config.js --runInBand
} else {
    Write-Host "⚠️ npx/ jest non installé, tests non exécutés" -ForegroundColor Red
}
Pop-Location

Write-Host "`n=== Test Sprint 1+2 terminé ===" -ForegroundColor Cyan
