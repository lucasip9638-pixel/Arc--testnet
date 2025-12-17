@echo off
chcp 65001 >nul
title CORRIGINDO TODOS OS ERROS - VERSÃO FINAL
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO TODOS OS ERROS - VERSÃO FINAL
echo ======================================================================
echo.

echo [1/8] Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/8] Limpando TODOS os caches...
if exist ".next" (
    echo Removendo .next...
    rmdir /s /q ".next" >nul 2>&1
)
if exist ".turbo" (
    echo Removendo .turbo...
    rmdir /s /q ".turbo" >nul 2>&1
)
if exist "node_modules\.cache" (
    echo Removendo cache node_modules...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
)
if exist "tsconfig.tsbuildinfo" (
    echo Removendo tsconfig.tsbuildinfo...
    del "tsconfig.tsbuildinfo" >nul 2>&1
)
echo [OK] Caches limpos

echo.
echo [3/8] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [4/8] Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [5/8] Verificando e instalando dependencias...
if not exist "node_modules" (
    echo [AVISO] node_modules nao encontrado. Instalando...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias encontradas
    echo Verificando dependencias criticas...
    if not exist "node_modules\next" (
        echo [AVISO] Next.js nao encontrado. Reinstalando...
        call npm install --legacy-peer-deps
    )
    if not exist "node_modules\wagmi" (
        echo [AVISO] wagmi nao encontrado. Reinstalando...
        call npm install wagmi viem --legacy-peer-deps
    )
    if not exist "node_modules\@tanstack\react-query" (
        echo [AVISO] @tanstack/react-query nao encontrado. Reinstalando...
        call npm install @tanstack/react-query --legacy-peer-deps
    )
)

echo.
echo [6/8] Verificando arquivos essenciais...
set ERRORS=0
if not exist "package.json" (echo [ERRO] package.json nao encontrado! & set ERRORS=1)
if not exist "next.config.mjs" (echo [ERRO] next.config.mjs nao encontrado! & set ERRORS=1)
if not exist "tsconfig.json" (echo [ERRO] tsconfig.json nao encontrado! & set ERRORS=1)
if not exist "app\layout.tsx" (echo [ERRO] app\layout.tsx nao encontrado! & set ERRORS=1)
if not exist "app\page.tsx" (echo [ERRO] app\page.tsx nao encontrado! & set ERRORS=1)
if not exist "components\providers.tsx" (echo [ERRO] components\providers.tsx nao encontrado! & set ERRORS=1)
if not exist "components\defi-app.tsx" (echo [ERRO] components\defi-app.tsx nao encontrado! & set ERRORS=1)
if not exist "lib\wagmi-config.ts" (echo [ERRO] lib\wagmi-config.ts nao encontrado! & set ERRORS=1)

if %ERRORS%==1 (
    echo [ERRO] Arquivos essenciais faltando!
    pause
    exit /b 1
)
echo [OK] Todos os arquivos essenciais encontrados

echo.
echo [7/8] Verificando erros de TypeScript...
npx tsc --noEmit --skipLibCheck >erros-ts.txt 2>&1
if errorlevel 1 (
    echo [AVISO] Erros de TypeScript encontrados (ver erros-ts.txt)
    type erros-ts.txt | findstr /C:"error TS" | more
) else (
    echo [OK] Sem erros de TypeScript
    del erros-ts.txt >nul 2>&1
)

echo.
echo [8/8] Liberando porta 3000 e iniciando servidor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Encerrando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo.
echo ======================================================================
echo   INICIANDO SERVIDOR
echo ======================================================================
echo.
echo IMPORTANTE:
echo   - Mantenha a janela do servidor ABERTA
echo   - Aguarde aparecer "Ready" ou "Ready in X.Xs"
echo   - URL: http://localhost:3000
echo   - Teste: http://localhost:3000/test
echo.
echo ======================================================================
echo.

start "Servidor Next.js - http://localhost:3000" cmd /k "title Servidor Next.js && color 0A && echo. && echo ======================================== && echo   SERVIDOR NEXT.JS && echo ======================================== && echo. && echo Modo: Webpack (estavel) && echo URL: http://localhost:3000 && echo. && echo Aguarde 'Ready'... && echo. && echo ======================================== && echo. && npm run dev:safe"

echo.
echo Aguardando servidor iniciar (40 segundos)...
echo (A primeira compilacao pode demorar mais)
timeout /t 40 /nobreak >nul

echo.
echo Verificando se servidor esta rodando...
netstat -ano | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor ainda nao esta na porta 3000
    echo Aguarde mais alguns segundos e verifique a janela do servidor
) else (
    echo [OK] Servidor detectado na porta 3000
)

echo.
echo Abrindo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Aguardando 5 segundos e abrindo pagina de teste...
timeout /t 5 /nobreak >nul
start http://localhost:3000/test

echo.
echo ======================================================================
echo   PROCESSO CONCLUIDO
echo ======================================================================
echo.
echo Se a pagina nao abrir:
echo   1. Verifique a janela do servidor para ver erros
echo   2. Aguarde mais 10-15 segundos (compilacao inicial)
echo   3. Recarregue a pagina (F5)
echo   4. Tente acessar manualmente: http://localhost:3000
echo.
echo Se aparecer algum erro na janela do servidor:
echo   - Copie o erro completo
echo   - Compartilhe para que eu possa corrigir
echo.
pause

