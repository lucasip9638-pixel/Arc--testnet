@echo off
chcp 65001 >nul
title CORRIGINDO ERROS E REINICIANDO SERVIDOR
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO ERROS E REINICIANDO SERVIDOR
echo ======================================================================
echo.

echo [1/5] Parando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/5] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo OK!

echo.
echo [3/5] Verificando dependencias...
if not exist "node_modules\@coinbase\wallet-sdk" (
    echo Instalando @coinbase/wallet-sdk...
    call npm install @coinbase/wallet-sdk --legacy-peer-deps >nul 2>&1
)
if not exist "node_modules\@metamask\sdk" (
    echo Instalando @metamask/sdk...
    call npm install @metamask/sdk --legacy-peer-deps >nul 2>&1
)
if not exist "node_modules\@svgr\webpack" (
    echo Instalando @svgr/webpack...
    call npm install @svgr/webpack --save-dev --legacy-peer-deps >nul 2>&1
)
echo OK!

echo.
echo [4/5] Iniciando servidor...
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
echo [5/5] Aguardando servidor iniciar (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR REINICIADO - NAVEGADOR ABERTO
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

