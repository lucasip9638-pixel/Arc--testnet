@echo off
chcp 65001 >nul
title CONFIGURANDO E ABRINDO FRONTEND NA WEB
color 0B
cls

echo.
echo ======================================================================
echo   CONFIGURANDO FRONTEND PARA ABRIR NA WEB
echo ======================================================================
echo.

echo [1/8] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/8] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo Cache turbo removido
)
echo OK!

echo.
echo [3/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
echo OK!

echo.
echo [4/8] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo [5/8] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias (pode demorar alguns minutos)...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo AVISO: Alguns avisos nas dependencias, mas continuando...
    )
) else (
    echo Dependencias encontradas, verificando atualizacoes...
    call npm install --legacy-peer-deps >nul 2>&1
)
echo OK!

echo.
echo [6/8] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [7/8] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela COM --open (abre navegador automaticamente)
start "=== SERVIDOR DAPP - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo [8/8] Aguardando servidor iniciar e abrindo navegador...
echo.

REM Aguardar servidor iniciar (verificar porta)
set /a tentativas=0
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 40 (
        echo Aguardando servidor iniciar... (%tentativas%/40)
        goto wait_loop
    ) else (
        echo AVISO: Servidor demorou para iniciar, mas tentando abrir navegador...
    )
) else (
    echo Servidor detectado na porta 3000!
)

echo.
echo Aguardando 12 segundos para servidor compilar completamente...
timeout /t 12 /nobreak >nul

echo.
echo Abrindo navegador em http://localhost:3000...
echo (Tentando multiplas formas para garantir abertura...)
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
rundll32 url.dll,FileProtocolHandler http://localhost:3000
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   FRONTEND CONFIGURADO E ABERTO NA WEB
echo ======================================================================
echo.
echo Servidor: http://localhost:3000
echo.
echo Status:
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Servidor pode nao estar rodando ainda
    echo   Aguarde mais 10-15 segundos e recarregue a pagina (F5)
) else (
    echo   [OK] Servidor confirmado rodando na porta 3000
    echo   [OK] Navegador aberto automaticamente
    echo   [OK] Frontend deve estar carregando agora!
)
echo.
echo Se a pagina nao aparecer:
echo   1. Aguarde mais 15-20 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5 ou Ctrl+R)
echo   3. Verifique a janela "=== SERVIDOR DAPP - NAO FECHE ==="
echo   4. Pressione F12 no navegador para ver erros no console
echo.
echo ======================================================================
echo.

pause

