@echo off
chcp 65001 >nul
title INICIANDO DAPP E ABRINDO NAVEGADOR
color 0B
cls

echo.
echo ======================================================================
echo   INICIANDO DAPP E ABRINDO NAVEGADOR
echo ======================================================================
echo.

echo [1/6] Parando processos Node.js existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/6] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules removido
)
echo OK!

echo.
echo [3/6] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias (pode demorar)...
    call npm install --legacy-peer-deps
) else (
    echo Dependencias OK!
)
echo OK!

echo.
echo [4/6] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [5/6] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "=== SERVIDOR DAPP - NAO FECHE ===" cmd /k "npm run dev"

echo.
echo [6/6] Aguardando servidor iniciar e abrindo navegador...
echo.

REM Aguardar servidor iniciar (verificar porta)
set /a tentativas=0
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 30 (
        echo Aguardando servidor iniciar... (%tentativas%/30)
        goto wait_loop
    ) else (
        echo AVISO: Servidor demorou para iniciar, mas tentando abrir navegador...
    )
) else (
    echo Servidor detectado na porta 3000!
)

echo.
echo Aguardando 10 segundos para servidor compilar completamente...
timeout /t 10 /nobreak >nul

echo.
echo Abrindo navegador em http://localhost:3000...
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul

echo.
echo ======================================================================
echo   DAPP INICIADO - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo Servidor: http://localhost:3000
echo.
echo Se a pagina nao aparecer:
echo   1. Aguarde mais 10-15 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5 ou Ctrl+R)
echo   3. Verifique a janela "=== SERVIDOR DAPP - NAO FECHE ==="
echo   4. Pressione F12 no navegador para ver erros no console
echo.
echo ======================================================================
echo.

REM Verificar se servidor esta rodando
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo AVISO: Servidor pode nao estar rodando ainda!
    echo Aguarde mais alguns segundos...
) else (
    echo SERVIDOR CONFIRMADO: Rodando na porta 3000!
    echo O dApp deve estar carregando agora!
)

echo.
pause


