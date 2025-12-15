@echo off
chcp 65001 >nul
title ABRINDO LOCALHOST:3000 AGORA
color 0A
cls

echo.
echo ========================================
echo   ABRINDO http://localhost:3000
echo ========================================
echo.

echo [1] Parando processos antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1

echo [3] Iniciando servidor...
start "SERVIDOR" cmd /k "npm run dev"

echo [4] Aguardando 25 segundos...
timeout /t 25 /nobreak >nul

echo [5] Abrindo navegador...
start http://localhost:3000
start msedge http://localhost:3000 2>nul
start chrome http://localhost:3000 2>nul
cmd /c start http://localhost:3000

echo.
echo ========================================
echo   PRONTO! Navegador deve ter aberto
echo   URL: http://localhost:3000
echo ========================================
echo.
echo Se nao abriu, abra manualmente:
echo   1. Abra seu navegador
echo   2. Digite: http://localhost:3000
echo   3. Pressione Enter
echo.
pause
