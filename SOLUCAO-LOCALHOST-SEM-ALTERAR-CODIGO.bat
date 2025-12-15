@echo off
chcp 65001 >nul
title SOLUCAO LOCALHOST SEM ALTERAR CODIGO
color 0B
cls

echo.
echo ======================================================================
echo   SOLUCIONANDO LOCALHOST SEM ALTERAR O CODIGO
echo ======================================================================
echo.

echo EXPLICACAO:
echo   O localhost nao funciona porque:
echo   1. Servidor pode nao estar rodando
echo   2. Porta 3000 pode estar ocupada
echo   3. Cache pode estar corrompido
echo   4. Dependencias podem estar faltando
echo.
echo   Esta solucao NAO altera o codigo, apenas:
echo   - Para processos antigos
echo   - Limpa cache
echo   - Inicia servidor corretamente
echo   - Abre navegador
echo.

echo [1/6] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/6] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Finalizando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/6] Limpando cache (sem alterar codigo)...
if exist ".next" (
    echo Removendo cache .next...
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist ".turbo" (
    echo Removendo cache turbo...
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)
if exist "node_modules\.cache" (
    echo Removendo cache node_modules...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] Cache node_modules removido
)

echo.
echo [4/6] Verificando Node.js e dependencias...
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
echo.
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ===" cmd /k "npm run dev"

echo.
echo [6/6] Aguardando servidor iniciar e abrindo navegador...
echo.

REM Aguardar servidor iniciar
set /a tentativas=0
:wait_loop
timeout /t 4 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 20 (
        echo Aguardando servidor iniciar... (%tentativas%/20)
        goto wait_loop
    ) else (
        echo [AVISO] Servidor demorou para iniciar...
        echo Verifique a janela do servidor para erros
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
)

echo.
echo Aguardando compilacao completa (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo Abrindo navegador...
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
start chrome http://localhost:3000 2>nul
cmd /c start http://localhost:3000

echo.
echo ======================================================================
echo   SERVIDOR INICIADO - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo Status:
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Servidor pode nao estar rodando ainda
    echo   Aguarde mais 20-30 segundos
    echo   Verifique a janela do servidor
) else (
    echo   [OK] Servidor rodando na porta 3000
    echo   [OK] Navegador deve ter aberto
)
echo.
echo URL: http://localhost:3000
echo.
echo Se nao abriu:
echo   1. Aguarde mais 30 segundos (compilacao inicial)
echo   2. Abra manualmente: http://localhost:3000
echo   3. Verifique a janela do servidor para erros
echo.
echo ======================================================================
echo.

pause

