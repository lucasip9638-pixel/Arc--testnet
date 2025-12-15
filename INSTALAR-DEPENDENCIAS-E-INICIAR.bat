@echo off
chcp 65001 >nul
title INSTALANDO DEPENDENCIAS E INICIANDO SERVIDOR
color 0B
cls

echo.
echo ======================================================================
echo   INSTALANDO DEPENDENCIAS E INICIANDO SERVIDOR
echo ======================================================================
echo.

echo [1/7] Parando processos Node.js existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/7] Limpando cache do Next.js...
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules removido
)
echo OK!

echo.
echo [3/7] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado! Instale Node.js primeiro.
    pause
    exit /b 1
)
echo OK!

echo.
echo [4/7] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado! Instale npm primeiro.
    pause
    exit /b 1
)
echo OK!

echo.
echo [5/7] Instalando dependencias principais...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo AVISO: Alguns avisos nas dependencias, mas continuando...
) else (
    echo OK!
)

echo.
echo [6/7] Instalando dependencias de compatibilidade...
call npm install --legacy-peer-deps --save-dev open cross-env
echo OK!

echo.
echo [7/7] Verificando porta 3000...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 0 (
    echo Porta 3000 em uso, liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo OK!

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "Next.js Server" cmd /k "npm run dev"

echo.
echo Aguardando servidor iniciar...
echo.

REM Aguardar servidor iniciar (verificar porta)
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo Aguardando servidor iniciar...
    goto wait_loop
)

echo Servidor iniciado! Aguardando 5 segundos para estabilizar...
timeout /t 5 /nobreak >nul

echo.
echo Abrindo navegador em http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR RODANDO - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo Dependencias instaladas e servidor iniciado!
echo Navegador aberto em: http://localhost:3000
echo.
echo Para parar o servidor:
echo   1. Feche a janela "Next.js Server"
echo   2. Ou execute: taskkill /F /IM node.exe
echo.
echo ======================================================================
echo.

pause


