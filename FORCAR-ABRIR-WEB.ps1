Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FORCANDO ABERTURA DO LINK NA WEB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node.js
Write-Host "[1/8] Parando processos Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "OK!" -ForegroundColor Green

# Limpar cache
Write-Host ""
Write-Host "[2/8] Limpando cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
}
Write-Host "OK!" -ForegroundColor Green

# Liberar porta 3000
Write-Host ""
Write-Host "[3/8] Liberando porta 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    foreach ($conn in $port3000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "OK!" -ForegroundColor Green

# Verificar Node.js
Write-Host ""
Write-Host "[4/8] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "OK! Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado!" -ForegroundColor Red
    pause
    exit 1
}

# Verificar dependencias
Write-Host ""
Write-Host "[5/8] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\next")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install --legacy-peer-deps | Out-Null
}
Write-Host "OK!" -ForegroundColor Green

# Iniciar servidor
Write-Host ""
Write-Host "[6/8] Iniciando servidor Next.js com --open..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: O servidor iniciara em uma nova janela!" -ForegroundColor Cyan
Write-Host "O navegador sera aberto automaticamente pelo Next.js!" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = (Get-Location).Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; Write-Host '=== SERVIDOR DAPP - NAO FECHE ===' -ForegroundColor Green; Write-Host ''; npm run dev:open"

# Aguardar servidor iniciar
Write-Host ""
Write-Host "[7/8] Aguardando servidor iniciar..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portCheck) {
        $serverReady = $true
        Write-Host "Servidor detectado na porta 3000!" -ForegroundColor Green
    } else {
        Write-Host "Aguardando servidor iniciar... ($waited/$maxWait segundos)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[8/8] Aguardando compilacao completa (20 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Forçar abertura do navegador em múltiplas formas
Write-Host ""
Write-Host "Forcando abertura do navegador em MULTIPLAS formas..." -ForegroundColor Yellow
Write-Host ""

$url = "http://localhost:3000"

# Tentativa 1: Start-Process
Write-Host "Tentativa 1: Start-Process..." -ForegroundColor Cyan
try {
    Start-Process $url
    Start-Sleep -Seconds 2
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 2: Invoke-Item
Write-Host "Tentativa 2: Invoke-Item..." -ForegroundColor Cyan
try {
    Invoke-Item $url
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 3: msedge
Write-Host "Tentativa 3: Microsoft Edge..." -ForegroundColor Cyan
try {
    Start-Process "msedge" -ArgumentList $url -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 4: chrome
Write-Host "Tentativa 4: Google Chrome..." -ForegroundColor Cyan
try {
    Start-Process "chrome" -ArgumentList $url -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 5: firefox
Write-Host "Tentativa 5: Firefox..." -ForegroundColor Cyan
try {
    Start-Process "firefox" -ArgumentList $url -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 6: cmd start
Write-Host "Tentativa 6: cmd start..." -ForegroundColor Cyan
try {
    cmd /c start $url
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

# Tentativa 7: rundll32
Write-Host "Tentativa 7: rundll32..." -ForegroundColor Cyan
try {
    rundll32 url.dll,FileProtocolHandler $url
    Start-Sleep -Seconds 1
} catch {
    Write-Host "  Falhou" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  NAVEGADOR FORCADO A ABRIR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar status do servidor
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "[OK] Servidor confirmado rodando na porta 3000" -ForegroundColor Green
} else {
    Write-Host "[AVISO] Servidor pode nao estar rodando ainda" -ForegroundColor Yellow
    Write-Host "Aguarde mais 15-20 segundos na janela do servidor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se o navegador nao abriu automaticamente:" -ForegroundColor Yellow
Write-Host "  1. Abra manualmente: $url" -ForegroundColor White
Write-Host "  2. Verifique a janela '=== SERVIDOR DAPP - NAO FECHE ==='" -ForegroundColor White
Write-Host "  3. Aguarde a mensagem 'Ready' no servidor" -ForegroundColor White
Write-Host "  4. Recarregue a pagina (F5)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

pause


