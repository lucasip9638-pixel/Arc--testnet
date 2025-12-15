@echo off
chcp 65001 >nul
title SERVIDOR NEXT.JS - LOCALHOST:3000
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR NEXT.JS COMPLETO
echo ======================================================================
echo.

echo [1/5] Parando processos antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/5] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo OK!

echo.
echo [3/5] Verificando porta 3000...
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
echo [4/5] Iniciando servidor em nova janela...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo.
echo Servidor: http://localhost:3000
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "Next.js Server" cmd /k "npm run dev"

echo.
echo [5/5] Aguardando servidor iniciar e abrindo navegador...
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
echo Servidor iniciado em nova janela "Next.js Server"!
echo Navegador aberto em: http://localhost:3000
echo.
echo Para parar o servidor:
echo   1. Feche a janela "Next.js Server"
echo   2. Ou execute: taskkill /F /IM node.exe
echo.
echo ======================================================================
echo.

pause
