@echo off
chcp 65001 >nul
title INICIAR LOCALHOST - SEMPRE FUNCIONA
color 0A
cls

echo.
echo ======================================================================
echo   INICIANDO LOCALHOST:3000 - SOLUCAO PERMANENTE
echo ======================================================================
echo.

echo [1/8] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/8] Liberando porta 3000 COMPLETAMENTE...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [3/8] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo [OK] Cache limpo

echo.
echo [4/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [5/8] Verificando dependencias...
if not exist "node_modules\next" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [6/8] Iniciando servidor...
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo [7/8] Aguardando servidor iniciar (aguardando ate 2 minutos)...
set /a tentativas=0
:wait_loop
timeout /t 4 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 30 (
        echo Aguardando servidor... (%tentativas%/30)
        goto wait_loop
    ) else (
        echo [AVISO] Servidor demorou muito
        goto check_final
    )
) else (
    echo [OK] Servidor RODANDO na porta 3000!
)

:check_final
echo.
echo [8/8] Verificando se servidor esta realmente rodando...
timeout /t 30 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Servidor NAO esta rodando!
    echo Verifique a janela do servidor para erros
    pause
    exit /b 1
)

echo [OK] Servidor CONFIRMADO rodando!
echo.
echo Abrindo navegador...
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul
cmd /c start http://localhost:3000

echo.
echo ======================================================================
echo   LOCALHOST:3000 FUNCIONANDO!
echo ======================================================================
echo.
echo [OK] Servidor rodando na porta 3000
echo [OK] Navegador aberto
echo [OK] URL: http://localhost:3000
echo.
echo IMPORTANTE:
echo   - Mantenha a janela do servidor aberta
echo   - Se fechar, execute este script novamente
echo.
pause

