@echo off
chcp 65001 >nul
title CORRIGINDO TUDO E TESTANDO
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO TUDO E TESTANDO APLICACAO
echo ======================================================================
echo.

echo [1/6] Parando todos os processos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK]

echo.
echo [2/6] Limpando TODOS os caches...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo [OK] Cache limpo completamente

echo.
echo [3/6] Verificando Node.js e npm...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
echo [OK] Node.js e npm encontrados

echo.
echo [4/6] Verificando dependencias...
if not exist "node_modules\next" (
    echo [AVISO] Dependencias nao encontradas. Instalando...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao!
        pause
        exit /b 1
    )
)
echo [OK] Dependencias OK

echo.
echo [5/6] Verificando arquivos essenciais...
if not exist "app\layout.tsx" (echo [ERRO] app\layout.tsx nao encontrado! & pause & exit /b 1)
if not exist "app\page.tsx" (echo [ERRO] app\page.tsx nao encontrado! & pause & exit /b 1)
if not exist "components\providers.tsx" (echo [ERRO] components\providers.tsx nao encontrado! & pause & exit /b 1)
echo [OK] Arquivos essenciais encontrados

echo.
echo [6/6] Iniciando servidor de teste...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO - MODO WEBPACK (MAIS ESTAVEL)
echo ======================================================================
echo.
echo IMPORTANTE:
echo   - Mantenha esta janela ABERTA
echo   - Aguarde aparecer "Ready" ou "Ready in X.Xs"
echo   - Depois acesse: http://localhost:3000
echo   - Se funcionar, acesse: http://localhost:3000/test-page
echo.
echo ======================================================================
echo.

start "Servidor Next.js" cmd /k "title Servidor Next.js && color 0A && echo Iniciando servidor em modo webpack... && echo. && npm run dev:safe"

echo.
echo Aguardando 35 segundos para servidor iniciar...
timeout /t 35 /nobreak >nul

echo.
echo Verificando se servidor esta rodando...
netstat -ano | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor ainda nao esta na porta 3000
    echo Aguarde mais alguns segundos e verifique a janela do servidor
) else (
    echo [OK] Servidor detectado na porta 3000
    echo.
    echo Abrindo navegador...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    echo.
    echo Aguarde 5 segundos e abrindo pagina de teste...
    timeout /t 5 /nobreak >nul
    start http://localhost:3000/test-page
)

echo.
echo ======================================================================
echo   PROCESSO CONCLUIDO
echo ======================================================================
echo.
echo Se a pagina nao abrir:
echo   1. Verifique a janela do servidor para ver erros
echo   2. Aguarde mais 10-15 segundos
echo   3. Tente acessar manualmente: http://localhost:3000
echo.
echo Se aparecer algum erro na janela do servidor, copie e compartilhe!
echo.
pause

