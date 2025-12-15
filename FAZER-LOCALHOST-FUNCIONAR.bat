@echo off
chcp 65001 >nul
title FAZENDO LOCALHOST FUNCIONAR NA WEB
color 0A
cls

echo.
echo ======================================================================
echo   FAZENDO LOCALHOST:3000 FUNCIONAR NA WEB
echo ======================================================================
echo.

echo [1/6] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/6] Liberando porta 3000 completamente...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Finalizando processo: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/6] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] Cache node_modules removido
)

echo.
echo [4/6] Verificando ambiente...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

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
echo [5/6] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo URL: http://localhost:3000
echo.
echo Aguarde ver "Ready in X.Xs" na janela do servidor
echo O navegador abrira automaticamente apos 30 segundos
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open (abre navegador automaticamente)
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ESTA JANELA ===" cmd /k "npm run dev:open"

echo.
echo [6/6] Aguardando servidor iniciar e abrir navegador...
echo.

REM Aguardar servidor iniciar
set /a tentativas=0
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 25 (
        echo Aguardando servidor iniciar... (%tentativas%/25)
        goto wait_loop
    ) else (
        echo [AVISO] Servidor demorou para iniciar...
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
)

echo.
echo Aguardando compilacao completa (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo Forcando abertura do navegador...
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul
rundll32 url.dll,FileProtocolHandler http://localhost:3000

echo.
echo ======================================================================
echo   LOCALHOST DEVE ESTAR FUNCIONANDO AGORA!
echo ======================================================================
echo.
echo Status:
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Servidor pode nao estar rodando ainda
    echo   Aguarde mais 20-30 segundos
    echo   Verifique a janela "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ==="
) else (
    echo   [OK] Servidor confirmado rodando na porta 3000
    echo   [OK] Navegador deve ter aberto
    echo   [OK] Localhost deve estar funcionando!
)
echo.
echo URL: http://localhost:3000
echo.
echo Se ainda nao funcionar:
echo   1. Aguarde mais 30-60 segundos (compilacao inicial pode demorar)
echo   2. Recarregue a pagina no navegador (F5)
echo   3. Verifique a janela do servidor para ver erros
echo   4. Tente abrir manualmente: http://localhost:3000
echo.
echo ======================================================================
echo.

pause

