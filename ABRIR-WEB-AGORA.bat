@echo off
chcp 65001 >nul
title ABRINDO WEB - CORRIGIDO E OTIMIZADO
color 0B
cls

echo.
echo ======================================================================
echo   ABRINDO APLICACAO NA WEB - VERSÃO CORRIGIDA
echo ======================================================================
echo.

echo [1/7] Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/7] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache .turbo removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] Cache node_modules removido
)

echo.
echo [3/7] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] Node.js nao encontrado!
    echo Por favor, instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js instalado: %%v

echo.
echo [4/7] Verificando dependencias...
if not exist "node_modules" (
    echo [AVISO] node_modules nao encontrado. Instalando dependencias...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [5/7] Verificando arquivos essenciais...
set ERRORS=0
if not exist "app\layout.tsx" (echo [ERRO] app\layout.tsx nao encontrado! & set ERRORS=1)
if not exist "app\page.tsx" (echo [ERRO] app\page.tsx nao encontrado! & set ERRORS=1)
if not exist "components\providers.tsx" (echo [ERRO] components\providers.tsx nao encontrado! & set ERRORS=1)
if not exist "next.config.mjs" (echo [ERRO] next.config.mjs nao encontrado! & set ERRORS=1)

if %ERRORS%==1 (
    echo [ERRO] Arquivos essenciais faltando!
    pause
    exit /b 1
)
echo [OK] Todos os arquivos essenciais encontrados

echo.
echo [6/7] Verificando porta 3000...
netstat -ano | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo [AVISO] Porta 3000 esta em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [OK] Porta 3000 liberada
) else (
    echo [OK] Porta 3000 disponivel
)

echo.
echo [7/7] Iniciando servidor Next.js...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO...
echo ======================================================================
echo.
echo IMPORTANTE:
echo   - Mantenha a janela do servidor ABERTA
echo   - Aguarde a mensagem "Ready" antes de acessar
echo   - URL: http://localhost:3000
echo.
echo ======================================================================
echo.

start "Servidor Next.js - http://localhost:3000" cmd /k "title Servidor Next.js && color 0A && echo Iniciando servidor... && echo. && npm run dev"

echo Aguardando servidor iniciar (25 segundos)...
timeout /t 25 /nobreak >nul

echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000

echo.
echo ======================================================================
echo   APLICACAO INICIADA COM SUCESSO!
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 10-15 segundos (compilacao inicial pode demorar)
echo   2. Recarregue a pagina (F5 ou Ctrl+R)
echo   3. Verifique a janela do servidor para ver se ha erros
echo   4. Tente usar: npm run dev:safe (modo webpack)
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul

