@echo off
title Servidor Next.js - Arc DeFi Hub
color 0A
echo.
echo ========================================
echo   INICIANDO SERVIDOR NEXT.JS
echo ========================================
echo.
echo Servidor sera iniciado em:
echo   http://localhost:3000
echo.
echo Mantenha esta janela aberta!
echo Pressione Ctrl+C para parar o servidor
echo.
echo ========================================
echo.
cd /d "%~dp0"
call npm run dev
pause
