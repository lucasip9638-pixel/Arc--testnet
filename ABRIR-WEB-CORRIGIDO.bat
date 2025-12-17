@echo off
chcp 65001 >nul
title ABRINDO WEB - CORRIGIDO
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO E ABRINDO APLICACAO NA WEB
echo ======================================================================
echo.

echo [1/6] Parando processos Node.js antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/6] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1
echo OK!

echo.
echo [3/6] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado! Instale Node.js primeiro.
    pause
    exit /b 1
)
node --version
echo OK!

echo.
echo [4/6] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        pause
        exit /b 1
    )
) else (
    echo Dependencias encontradas
)
echo OK!

echo.
echo [5/6] Iniciando servidor...
echo IMPORTANTE: Mantenha esta janela aberta!
echo.
echo O servidor esta iniciando em uma nova janela...
echo Aguarde a mensagem "Ready" antes de acessar.
echo.
start "Servidor Next.js - http://localhost:3000" cmd /k "title Servidor Next.js && npm run dev"

echo.
echo [6/6] Aguardando servidor iniciar (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000

echo.
echo ======================================================================
echo   APLICACAO INICIADA!
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 10-15 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5)
echo   3. Verifique a janela do servidor para ver se ha erros
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul

