@echo off
chcp 65001 >nul
title ABRINDO NAVEGADOR - LOCALHOST:3000
color 0A
cls

echo.
echo ======================================================================
echo   ABRINDO NAVEGADOR NO LOCALHOST:3000
echo ======================================================================
echo.

echo Verificando se servidor esta rodando...
timeout /t 1 /nobreak >nul

echo.
echo Abrindo navegador...
start http://localhost:3000

echo.
echo ======================================================================
echo   NAVEGADOR ABERTO
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. O servidor pode nao estar rodando
echo   2. Execute: FORCAR-SERVIDOR-RODAR.bat
echo   3. Ou execute: npm run dev
echo.
echo ======================================================================
echo.

timeout /t 5 /nobreak >nul


