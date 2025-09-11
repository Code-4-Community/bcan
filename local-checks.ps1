Write-Host "🔍 Running local pre-merge checks..." -ForegroundColor Blue

# Frontend checks
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend install failed" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Backend checks
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend install failed" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Pre-merge tool checks
Write-Host "📦 Installing pre-merge check dependencies..." -ForegroundColor Yellow
npm install typescript ts-morph

Write-Host "🔍 Running circular dependency check..." -ForegroundColor Yellow
node canIMerge.js --check-circular
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Circular dependency check failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All checks passed!" -ForegroundColor Green