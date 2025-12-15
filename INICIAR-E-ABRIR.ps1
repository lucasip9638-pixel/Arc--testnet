Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SERVIDOR E ABRINDO NAVEGADOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node.js existentes
Write-Host "[1/5] Parando processos Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK!" -ForegroundColor Green

# Limpar cache
Write-Host ""
Write-Host "[2/5] Limpando cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "Cache .next removido" -ForegroundColor Green
}
Write-Host "OK!" -ForegroundColor Green

# Verificar porta 3000
Write-Host ""
Write-Host "[3/5] Verificando porta 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "Porta 3000 em uso, liberando..." -ForegroundColor Yellow
    foreach ($conn in $port3000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "OK!" -ForegroundColor Green

# Iniciar servidor
Write-Host ""
Write-Host "[4/5] Iniciando servidor Next.js..." -ForegroundColor Yellow
Write-Host "Servidor iniciando em nova janela..." -ForegroundColor Cyan
Write-Host "Aguarde a mensagem 'Ready in X.Xs'`n" -ForegroundColor Yellow

$scriptPath = (Get-Location).Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; Write-Host 'Servidor Next.js - http://localhost:3000' -ForegroundColor Green; Write-Host ''; npm run dev"

# Aguardar servidor iniciar
Write-Host "[5/5] Aguardando servidor iniciar..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $response = Invoke-WebRequest -Uri http://localhost:3000 -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        $serverReady = $true
        Write-Host "Servidor pronto! Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ""

if ($serverReady) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ABRINDO NAVEGADOR" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Start-Process "http://localhost:3000"
    Write-Host "Navegador aberto em: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Se o navegador nao abrir automaticamente," -ForegroundColor Yellow
    Write-Host "acesse manualmente: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  SERVIDOR AINDA INICIANDO" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O servidor pode estar ainda compilando." -ForegroundColor Yellow
    Write-Host "Aguarde mais alguns segundos e acesse:" -ForegroundColor Yellow
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Start-Process "http://localhost:3000"
}

Write-Host ""
