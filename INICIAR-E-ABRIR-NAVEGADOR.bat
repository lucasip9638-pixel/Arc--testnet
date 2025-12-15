@echo off
chcp 65001 >nul
title INICIAR SERVIDOR E ABRIR NAVEGADOR
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR E ABRINDO NAVEGADOR
echo ======================================================================
echo.

echo [1/4] Parando processos Node.js antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/4] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
echo OK!

echo.
echo [3/4] Iniciando servidor Next.js...
echo IMPORTANTE: Mantenha esta janela aberta!
echo.
echo Servidor: http://localhost:3000
echo.
echo Aguarde a mensagem "Ready in X.Xs"
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "Servidor Next.js - http://localhost:3000" cmd /k "npm run dev"

echo.
echo [4/4] Aguardando servidor iniciar (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR INICIADO - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 10-15 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5)
echo   3. Verifique a janela do servidor para ver se ha erros
echo.
echo ======================================================================
echo.

pause
