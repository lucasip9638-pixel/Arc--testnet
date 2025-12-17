@echo off
chcp 65001 >nul
title INICIANDO LOCALHOST - VERSÃO DEFINITIVA
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR LOCALHOST - VERSÃO DEFINITIVA
echo ======================================================================
echo.

echo [PASSO 1/8] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos Node.js parados

echo.
echo [PASSO 2/8] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Encerrando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [PASSO 3/8] Limpando TODOS os caches...
if exist ".next" (
    echo Removendo cache .next...
    rmdir /s /q ".next" >nul 2>&1
)
if exist ".turbo" (
    echo Removendo cache .turbo...
    rmdir /s /q ".turbo" >nul 2>&1
)
if exist "node_modules\.cache" (
    echo Removendo cache node_modules...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
)
echo [OK] Caches limpos

echo.
echo [PASSO 4/8] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] Node.js nao encontrado!
    echo Por favor, instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [PASSO 5/8] Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [PASSO 6/8] Verificando dependencias...
if not exist "node_modules" (
    echo [AVISO] node_modules nao encontrado!
    echo Instalando dependencias (isso pode demorar alguns minutos)...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        echo Tente executar manualmente: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [PASSO 7/8] Verificando arquivos essenciais...
set ERRORS=0
if not exist "app\layout.tsx" (echo [ERRO] app\layout.tsx nao encontrado! & set ERRORS=1)
if not exist "app\page.tsx" (echo [ERRO] app\page.tsx nao encontrado! & set ERRORS=1)
if not exist "components\providers.tsx" (echo [ERRO] components\providers.tsx nao encontrado! & set ERRORS=1)
if not exist "next.config.mjs" (echo [ERRO] next.config.mjs nao encontrado! & set ERRORS=1)
if not exist "package.json" (echo [ERRO] package.json nao encontrado! & set ERRORS=1)

if %ERRORS%==1 (
    echo [ERRO] Arquivos essenciais faltando!
    pause
    exit /b 1
)
echo [OK] Todos os arquivos essenciais encontrados

echo.
echo [PASSO 8/8] Iniciando servidor Next.js...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO...
echo ======================================================================
echo.
echo IMPORTANTE:
echo   - Mantenha a janela do servidor ABERTA
echo   - Aguarde a mensagem "Ready" ou "Ready in X.Xs"
echo   - URL: http://localhost:3000
echo   - Se nao abrir automaticamente, acesse manualmente
echo.
echo ======================================================================
echo.

REM Tentar primeiro com modo seguro (sem turbo)
echo Tentando iniciar com modo seguro (webpack)...
start "Servidor Next.js - http://localhost:3000" cmd /k "title Servidor Next.js && color 0A && echo. && echo ======================================== && echo   SERVIDOR NEXT.JS INICIANDO && echo ======================================== && echo. && echo Modo: Webpack (mais estavel) && echo URL: http://localhost:3000 && echo. && echo Aguarde a mensagem 'Ready'... && echo. && echo ======================================== && echo. && npm run dev:safe"

echo.
echo Aguardando servidor iniciar (30 segundos)...
echo (A primeira vez pode demorar mais para compilar)
timeout /t 30 /nobreak >nul

echo.
echo Verificando se servidor esta rodando...
netstat -ano | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor ainda nao esta na porta 3000
    echo Aguarde mais alguns segundos...
    timeout /t 10 /nobreak >nul
) else (
    echo [OK] Servidor detectado na porta 3000
)

echo.
echo Abrindo navegador automaticamente...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ======================================================================
echo   PROCESSO CONCLUIDO!
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 15-20 segundos (compilacao inicial)
echo   2. Verifique a janela do servidor para ver se ha erros
echo   3. Recarregue a pagina (F5)
echo   4. Tente acessar manualmente: http://localhost:3000
echo.
echo Se ainda nao funcionar:
echo   - Verifique a janela do servidor para ver erros
echo   - Tente executar manualmente: npm run dev:safe
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul

