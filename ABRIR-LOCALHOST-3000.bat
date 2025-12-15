@echo off
chcp 65001 >nul
title ABRINDO LOCALHOST:3000 NA WEB
color 0A
cls

echo.
echo ======================================================================
echo   ABRINDO http://localhost:3000 NA WEB
echo ======================================================================
echo.

echo [1/8] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/8] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Encontrado processo na porta 3000, finalizando PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/8] Limpando cache...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)

echo.
echo [4/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [5/8] Verificando dependencias...
if not exist "node_modules\next" (
    echo [AVISO] Dependencias nao encontradas, instalando...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [6/8] Iniciando servidor Next.js na porta 3000...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo URL: http://localhost:3000
echo.
echo Aguarde ver "Ready in X.Xs" na janela do servidor
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ===" cmd /k "npm run dev"

echo.
echo [7/8] Aguardando servidor iniciar (aguardando ate 60 segundos)...
echo.

REM Aguardar servidor iniciar
set /a tentativas=0
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 20 (
        echo Aguardando servidor iniciar... (%tentativas%/20)
        goto wait_loop
    ) else (
        echo [AVISO] Servidor demorou para iniciar...
        echo Verifique a janela do servidor para ver erros
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
    goto server_ready
)

:server_ready
echo.
echo [8/8] Aguardando compilacao completa (15 segundos)...
timeout /t 15 /nobreak >nul

echo.
echo ======================================================================
echo   ABRINDO NAVEGADOR EM MULTIPLAS FORMAS
echo ======================================================================
echo.

REM Tentar abrir em TODAS as formas possiveis
echo Tentando abrir no navegador padrao...
start http://localhost:3000
timeout /t 2 /nobreak >nul

echo Tentando abrir no Microsoft Edge...
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir no Google Chrome...
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir via cmd start...
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul

echo Tentando abrir via rundll32...
rundll32 url.dll,FileProtocolHandler http://localhost:3000
timeout /t 1 /nobreak >nul

echo Tentando abrir via PowerShell...
powershell -Command "Start-Process 'http://localhost:3000'" 2>nul
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   VERIFICACAO FINAL
echo ======================================================================
echo.

netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor pode nao estar rodando ainda
    echo.
    echo SOLUCOES:
    echo   1. Verifique a janela "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ==="
    echo   2. Aguarde mais 20-30 segundos
    echo   3. Verifique se ha erros na janela do servidor
    echo   4. Tente abrir manualmente: http://localhost:3000
) else (
    echo [OK] Servidor confirmado rodando na porta 3000
    echo [OK] Navegador deve ter sido aberto
    echo.
    echo Se o navegador nao abriu automaticamente:
    echo   1. Abra manualmente seu navegador
    echo   2. Digite na barra de endereco: http://localhost:3000
    echo   3. Pressione Enter
)

echo.
echo ======================================================================
echo   URL: http://localhost:3000
echo ======================================================================
echo.
echo Se ainda nao funcionar:
echo   1. Aguarde mais 30 segundos (compilacao inicial pode demorar)
echo   2. Recarregue a pagina (F5)
echo   3. Verifique a janela do servidor para erros
echo   4. Pressione F12 no navegador para ver erros no console
echo   5. Tente abrir manualmente: http://localhost:3000
echo.
echo ======================================================================
echo.

pause

