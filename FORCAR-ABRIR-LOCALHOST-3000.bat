@echo off
chcp 65001 >nul
title FORCANDO ABERTURA DE LOCALHOST:3000
color 0C
cls

echo.
echo ======================================================================
echo   FORCANDO ABERTURA DE http://localhost:3000
echo ======================================================================
echo.

echo [PASSO 1] Matando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Todos os processos Node.js finalizados

echo.
echo [PASSO 2] Liberando porta 3000 FORCADAMENTE...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Finalizando processo PID: %%a na porta 3000
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul

REM Verificar novamente
netstat -ano | findstr :3000 >nul 2>&1
if not errorlevel 1 (
    echo [AVISO] Ainda ha processo na porta 3000, tentando novamente...
    timeout /t 2 /nobreak >nul
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo [OK] Porta 3000 completamente liberada

echo.
echo [PASSO 3] Limpando TODOS os caches...
if exist ".next" (
    echo Removendo cache .next...
    rmdir /s /q ".next" >nul 2>&1
)
if exist ".turbo" (
    echo Removendo cache turbo...
    rmdir /s /q ".turbo" >nul 2>&1
)
if exist "node_modules\.cache" (
    echo Removendo cache node_modules...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
)
if exist "tsconfig.tsbuildinfo" (
    echo Removendo cache TypeScript...
    del /q "tsconfig.tsbuildinfo" >nul 2>&1
)
echo [OK] Todos os caches limpos

echo.
echo [PASSO 4] Verificando ambiente...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [PASSO 5] Verificando estrutura do projeto...
if not exist "app\page.tsx" (
    echo [ERRO] app\page.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "app\layout.tsx" (
    echo [ERRO] app\layout.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    pause
    exit /b 1
)
echo [OK] Estrutura do projeto verificada

echo.
echo [PASSO 6] Iniciando servidor Next.js...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO EM NOVA JANELA
echo ======================================================================
echo   URL: http://localhost:3000
echo   Aguarde ver "Ready in X.Xs" na janela do servidor
echo ======================================================================
echo.

REM Iniciar servidor
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ESTA JANELA ===" cmd /k "npm run dev"

echo.
echo [PASSO 7] Aguardando servidor iniciar (maximo 90 segundos)...
echo.

set /a tentativas=0
:wait_server
timeout /t 4 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 22 (
        echo Aguardando servidor... (%tentativas%/22)
        goto wait_server
    ) else (
        echo [AVISO] Servidor demorou muito para iniciar
        echo Verifique a janela do servidor para erros
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
)

echo.
echo [PASSO 8] Aguardando compilacao (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo ======================================================================
echo   FORCANDO ABERTURA DO NAVEGADOR
echo ======================================================================
echo.

echo Tentativa 1: Navegador padrao...
start http://localhost:3000
timeout /t 2 /nobreak >nul

echo Tentativa 2: Microsoft Edge...
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 3: Google Chrome...
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 4: Firefox...
start firefox http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 5: cmd start...
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul

echo Tentativa 6: rundll32...
rundll32 url.dll,FileProtocolHandler http://localhost:3000
timeout /t 1 /nobreak >nul

echo Tentativa 7: PowerShell...
powershell -Command "Start-Process 'http://localhost:3000'" 2>nul
timeout /t 1 /nobreak >nul

echo Tentativa 8: Invoke-Item...
powershell -Command "Invoke-Item 'http://localhost:3000'" 2>nul
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   VERIFICACAO FINAL
echo ======================================================================
echo.

netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [PROBLEMA] Servidor nao esta rodando na porta 3000
    echo.
    echo ACOES NECESSARIAS:
    echo   1. Verifique a janela do servidor para erros
    echo   2. Aguarde mais 30 segundos
    echo   3. Execute novamente este script
) else (
    echo [OK] Servidor esta rodando na porta 3000
    echo [OK] Tentativas de abrir navegador concluidas
    echo.
    echo Se o navegador ainda nao abriu:
    echo   1. Abra MANUALMENTE seu navegador
    echo   2. Digite na barra de endereco: http://localhost:3000
    echo   3. Pressione Enter
)

echo.
echo ======================================================================
echo   URL: http://localhost:3000
echo ======================================================================
echo.
echo STATUS:
for /f "tokens=*" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do echo   %%a
echo.
echo Se ainda nao funcionar:
echo   1. Aguarde mais 30-60 segundos
echo   2. Abra manualmente: http://localhost:3000
echo   3. Verifique a janela do servidor
echo   4. Pressione F12 no navegador para ver erros
echo.
echo ======================================================================
echo.

pause

