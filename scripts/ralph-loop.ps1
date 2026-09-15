# RALPH Autonomous Loop (PowerShell)
# Stages: Read -> Act -> Learn/Test -> Patch -> Halt
param(
    [int]$MaxIterations = 5
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting RALPH Autonomous Agent Verification Loop       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$iteration = 1
$allPassed = $false

New-Item -ItemType Directory -Force -Path ".ralph/logs" | Out-Null

while ($iteration -le $MaxIterations -and -not $allPassed) {
    Write-Host "`n[RALPH Loop] === Iteration $iteration of $MaxIterations ===" -ForegroundColor Yellow
    $stageFailed = $false

    # Stage 1: TypeScript
    Write-Host "[RALPH Stage 1] Running TypeScript Verification..." -ForegroundColor Magenta
    npx tsc --noEmit 2>&1 | Tee-Object -FilePath ".ralph/logs/tsc.log"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[RALPH] ❌ TypeScript check failed. Review .ralph/logs/tsc.log" -ForegroundColor Red
        $stageFailed = $true
    } else {
        Write-Host "[RALPH]  TypeScript check passed!" -ForegroundColor Green
    }

    # Stage 2: Linting & Autofix
    if (-not $stageFailed) {
        Write-Host "[RALPH Stage 2] Running ESLint Check & Autofix..." -ForegroundColor Magenta
        npm run lint -- --fix 2>&1 | Tee-Object -FilePath ".ralph/logs/lint.log"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[RALPH] ⚠️ ESLint warnings/errors logged." -ForegroundColor Yellow
        } else {
            Write-Host "[RALPH]  ESLint check passed!" -ForegroundColor Green
        }
    }

    # Stage 3: Build
    if (-not $stageFailed) {
        Write-Host "[RALPH Stage 3] Running Next.js Build..." -ForegroundColor Magenta
        npm run build 2>&1 | Tee-Object -FilePath ".ralph/logs/build.log"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[RALPH] ❌ Build failed. Review .ralph/logs/build.log" -ForegroundColor Red
            $stageFailed = $true
        } else {
            Write-Host "[RALPH]  Next.js Build passed!" -ForegroundColor Green
            $allPassed = $true
            break
        }
    }

    $iteration++
}

if ($allPassed) {
    Write-Host "`n🎉 [RALPH Loop HALT] All verification stages passed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ [RALPH Loop HALT] Max iterations reached with pending errors. See logs in .ralph/logs/" -ForegroundColor Red
    exit 1
}
