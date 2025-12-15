@echo off
chcp 65001 >nul
title INICIANDO LOCALHOST - CORRIGIDO
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO E INICIANDO LOCALHOST
echo ======================================================================
echo.

echo [1/6] Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 0 (
    echo [OK] Processos Node.js parados
) else (
    echo [OK] Nenhum processo Node.js encontrado
)
timeout /t 2 /nobreak >nul

echo.
echo [2/6] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/6] Limpando cache do Next.js...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
) else (
    echo [OK] Nenhum cache encontrado
)

echo.
echo [4/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js %%v

echo.
echo [5/6] Verificando dependencias...
if not exist "node_modules" (
    echo [AVISO] node_modules nao encontrado, instalando...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [6/6] Iniciando servidor Next.js...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO
echo ======================================================================
echo.
echo IMPORTANTE:
echo - Mantenha esta janela ABERTA
echo - Aguarde a mensagem "Ready in X.Xs"
echo - O navegador sera aberto automaticamente
echo.
echo URL: http://localhost:3000
echo.
echo ======================================================================
echo.

REM Aguardar um pouco antes de iniciar
timeout /t 2 /nobreak >nul

REM Iniciar servidor e aguardar
start /B npm run dev >nul 2>&1

REM Aguardar servidor iniciar
echo Aguardando servidor iniciar...
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo . Aguardando...
    goto wait_loop
)

echo.
echo [OK] Servidor detectado na porta 3000!
echo.
echo Aguardando compilacao (10 segundos)...
timeout /t 10 /nobreak >nul

echo.
echo Abrindo navegador em http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR RODANDO!
echo ======================================================================
echo.
echo [OK] Servidor iniciado com sucesso!
echo [OK] Navegador aberto automaticamente
echo.
echo URL: http://localhost:3000
echo.
echo IMPORTANTE: Mantenha esta janela aberta!
echo Para parar o servidor, feche esta janela ou pressione Ctrl+C
echo.
echo ======================================================================
echo.

REM Manter janela aberta mostrando o servidor
npm run dev

