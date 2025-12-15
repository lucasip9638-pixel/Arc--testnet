@echo off
chcp 65001 >nul
title FORCANDO ABERTURA DO LOCALHOST
color 0C
cls

echo.
echo ======================================================================
echo   FORCANDO ABERTURA DO LOCALHOST:3000
echo ======================================================================
echo.

echo [1/8] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/8] Liberando porta 3000 completamente...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [3/8] Limpando cache completamente...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo OK!

echo.
echo [4/8] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
) else (
    echo Dependencias OK!
)
echo OK!

echo.
echo [5/8] Iniciando servidor em nova janela...
start "=== SERVIDOR NEXT.JS - NAO FECHE ===" cmd /k "npm run dev"
echo OK!

echo.
echo [6/8] Aguardando servidor iniciar (verificando porta 3000)...
set /a tentativas=0
:wait_loop
timeout /t 2 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 30 (
        echo Aguardando servidor... (tentativa %tentativas%/30)
        goto wait_loop
    ) else (
        echo AVISO: Servidor demorou muito para iniciar, mas tentando abrir navegador...
    )
) else (
    echo Servidor detectado na porta 3000!
)

echo.
echo [7/8] Aguardando estabilizacao (10 segundos)...
timeout /t 10 /nobreak >nul
echo OK!

echo.
echo [8/8] FORCANDO ABERTURA DO NAVEGADOR...
echo.

REM Tentar abrir em TODOS os navegadores possiveis
echo Tentando abrir no navegador padrao...
start http://localhost:3000
timeout /t 2 /nobreak >nul

echo Tentando abrir no Microsoft Edge...
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir no Google Chrome...
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir no Firefox...
start firefox http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir via cmd...
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   NAVEGADOR FORCADO A ABRIR
echo ======================================================================
echo.
echo Servidor: http://localhost:3000
echo.
echo Se o navegador nao abriu automaticamente:
echo   1. Abra manualmente: http://localhost:3000
echo   2. Verifique a janela "=== SERVIDOR NEXT.JS - NAO FECHE ==="
echo   3. Aguarde mais 10-15 segundos e recarregue (F5)
echo.
echo ======================================================================
echo.

REM Verificar se servidor esta rodando
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo AVISO: Servidor pode nao estar rodando ainda!
    echo Aguarde mais alguns segundos...
) else (
    echo SERVIDOR CONFIRMADO: Rodando na porta 3000!
)

echo.
pause


