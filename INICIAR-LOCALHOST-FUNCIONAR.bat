@echo off
chcp 65001 >nul
title INICIANDO LOCALHOST PARA FUNCIONAR
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO LOCALHOST:3000
echo ======================================================================
echo.

echo EXPLICACAO:
echo   O localhost nao funciona porque:
echo   - Servidor pode nao estar rodando
echo   - Porta 3000 pode estar ocupada
echo   - Cache pode estar corrompido
echo.
echo   Esta solucao NAO altera o codigo, apenas inicia o servidor!
echo.

echo [1/5] Parando processos Node.js antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/5] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Finalizando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/5] Limpando cache...
if exist ".next" (
    echo Removendo cache .next...
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache removido
)
if exist ".turbo" (
    echo Removendo cache turbo...
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)

echo.
echo [4/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [5/5] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo URL: http://localhost:3000
echo.
echo Aguarde ver "Ready in X.Xs" na janela do servidor
echo Depois o navegador abrira automaticamente
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open para abrir navegador automaticamente
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo Aguardando servidor iniciar (30 segundos)...
timeout /t 30 /nobreak >nul

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
echo   SERVIDOR INICIADO
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

