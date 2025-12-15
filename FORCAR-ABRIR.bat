@echo off
title FORCAR ABERTURA DO SERVIDOR
color 0C
echo.
echo ========================================
echo   FORCANDO INICIO DO SERVIDOR
echo ========================================
echo.

REM Matar todos os processos Node
echo Parando processos Node antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Liberar porta 3000
echo Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
    timeout /t 3 /nobreak >nul
)

echo.
echo Iniciando servidor em nova janela...
start "=== SERVIDOR NEXT.JS - NAO FECHE ===" cmd /k "npm run dev"

echo.
echo Aguardando servidor iniciar (20 segundos)...
timeout /t 20 /nobreak

echo.
echo ========================================
echo   ABRINDO NAVEGADOR
echo ========================================
echo.

REM Tentar abrir em diferentes navegadores
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000
timeout /t 1 /nobreak >nul
start chrome http://localhost:3000

echo.
echo ========================================
echo   SERVIDOR DEVE ESTAR RODANDO!
echo ========================================
echo.
echo Verifique a janela "=== SERVIDOR NEXT.JS - NAO FECHE ==="
echo Se nao abriu, acesse manualmente: http://localhost:3000
echo.
pause

