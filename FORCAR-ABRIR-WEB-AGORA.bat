@echo off
chcp 65001 >nul
title FORCANDO ABERTURA DO LINK NA WEB
color 0C
cls

echo.
echo ======================================================================
echo   FORCANDO ABERTURA DO LINK NA WEB
echo ======================================================================
echo.

echo [1/9] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/9] Limpando cache...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
)
echo OK!

echo.
echo [3/9] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [4/9] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo [5/9] Verificando dependencias...
if not exist "node_modules\next" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps >nul 2>&1
)
echo OK!

echo.
echo [6/9] Iniciando servidor Next.js com --open...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo O navegador sera aberto automaticamente pelo Next.js!
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open flag (abre navegador automaticamente)
start "=== SERVIDOR DAPP - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo [7/9] Aguardando servidor iniciar...
echo.

REM Aguardar servidor iniciar (verificar porta)
set /a tentativas=0
:wait_loop
timeout /t 4 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 50 (
        echo Aguardando servidor iniciar... (%tentativas%/50)
        goto wait_loop
    ) else (
        echo AVISO: Servidor demorou para iniciar...
    )
) else (
    echo Servidor detectado na porta 3000!
)

echo.
echo [8/9] Aguardando compilacao completa (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo [9/9] Forcando abertura do navegador em MULTIPLAS formas...
echo.

REM Tentar abrir em varios navegadores e formas diferentes
echo Tentativa 1: Abrindo com start...
start http://localhost:3000
timeout /t 2 /nobreak >nul

echo Tentativa 2: Abrindo com msedge...
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 3: Abrindo com chrome...
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 4: Abrindo com firefox...
start firefox http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 5: Abrindo com cmd /c start...
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul

echo Tentativa 6: Abrindo com rundll32...
rundll32 url.dll,FileProtocolHandler http://localhost:3000
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   NAVEGADOR FORCADO A ABRIR
echo ======================================================================
echo.
echo Status do servidor:
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Servidor pode nao estar rodando ainda
    echo   Aguarde mais 15-20 segundos na janela do servidor
) else (
    echo   [OK] Servidor confirmado rodando na porta 3000
)

echo.
echo URL: http://localhost:3000
echo.
echo Se o navegador nao abriu automaticamente:
echo   1. Abra manualmente: http://localhost:3000
echo   2. Verifique a janela "=== SERVIDOR DAPP - NAO FECHE ==="
echo   3. Aguarde a mensagem "Ready" no servidor
echo   4. Recarregue a pagina (F5)
echo.
echo ======================================================================
echo.

pause


