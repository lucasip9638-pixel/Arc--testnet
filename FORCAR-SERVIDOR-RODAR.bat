@echo off
chcp 65001 >nul
title FORCANDO SERVIDOR A RODAR - LOCALHOST:3000
color 0C
cls

echo.
echo ======================================================================
echo   FORCANDO SERVIDOR A RODAR E MOSTRAR INTERFACE
echo ======================================================================
echo.

echo [1/5] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/5] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [3/5] Limpando cache COMPLETO...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo OK!

echo.
echo [4/5] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps >nul 2>&1
)
echo OK!

echo.
echo [5/5] INICIANDO SERVIDOR FORCADO...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO - MANTENHA ESTA JANELA ABERTA!
echo ======================================================================
echo.
echo Servidor: http://localhost:3000
echo.
echo Aguarde a mensagem "Ready in X.Xs"
echo.
echo O navegador sera aberto automaticamente em 25 segundos
echo.
echo ======================================================================
echo.

REM Iniciar servidor
start /B npm run dev >nul 2>&1

REM Aguardar servidor iniciar
echo Aguardando servidor compilar e iniciar (25 segundos)...
timeout /t 25 /nobreak >nul

echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR RODANDO - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 10-15 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5)
echo   3. Verifique esta janela para ver se ha erros
echo.
echo Para parar o servidor: Pressione Ctrl+C ou feche esta janela
echo.
echo ======================================================================
echo.

REM Mostrar logs do servidor
npm run dev

pause

