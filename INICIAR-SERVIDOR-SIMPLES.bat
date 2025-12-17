@echo off
chcp 65001 >nul
title INICIAR SERVIDOR - MODO SIMPLES
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR - MODO SIMPLES E DIRETO
echo ======================================================================
echo.

echo Parando processos antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1

echo.
echo Iniciando servidor Next.js...
echo.
echo IMPORTANTE:
echo   - Mantenha esta janela ABERTA
echo   - Aguarde aparecer "Ready" ou "Ready in X.Xs"
echo   - Depois acesse: http://localhost:3000
echo.
echo ======================================================================
echo.

npm run dev:safe

