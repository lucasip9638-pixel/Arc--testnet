@echo off
chcp 65001 >nul
title TESTANDO E ABRINDO LOCALHOST
color 0B
cls

echo.
echo ======================================================================
echo   TESTANDO E ABRINDO LOCALHOST:3000
echo ======================================================================
echo.

echo [TESTE 1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [FALHOU] Node.js nao encontrado!
    pause
    exit /b 1
) else (
    echo [OK] Node.js encontrado!
)

echo.
echo [TESTE 2/5] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [FALHOU] npm nao encontrado!
    pause
    exit /b 1
) else (
    echo [OK] npm encontrado!
)

echo.
echo [TESTE 3/5] Verificando porta 3000...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 0 (
    echo [AVISO] Porta 3000 em uso, liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [OK] Porta liberada!
) else (
    echo [OK] Porta 3000 livre!
)

echo.
echo [TESTE 4/5] Parando processos Node.js antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos parados!

echo.
echo [TESTE 5/5] Iniciando servidor...
start "=== SERVIDOR NEXT.JS ===" cmd /k "npm run dev"
echo [OK] Servidor iniciado em nova janela!

echo.
echo ======================================================================
echo   AGUARDANDO SERVIDOR INICIAR
echo ======================================================================
echo.

set /a tentativas=0
:wait_loop
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 20 (
        echo Aguardando servidor... (%tentativas%/20)
        goto wait_loop
    ) else (
        echo AVISO: Servidor demorou para iniciar, mas continuando...
    )
) else (
    echo [SUCESSO] Servidor detectado na porta 3000!
)

echo.
echo Aguardando 8 segundos para estabilizar...
timeout /t 8 /nobreak >nul

echo.
echo ======================================================================
echo   ABRINDO NAVEGADOR
echo ======================================================================
echo.

echo Tentando abrir navegador padrao...
start http://localhost:3000
timeout /t 2 /nobreak >nul

echo Tentando abrir no Edge...
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo Tentando abrir no Chrome...
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   TESTE CONCLUIDO
echo ======================================================================
echo.
echo Servidor: http://localhost:3000
echo.
echo Verificando se servidor esta rodando...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor pode nao estar rodando ainda!
    echo Aguarde mais 10-15 segundos e tente novamente.
) else (
    echo [SUCESSO] Servidor confirmado rodando na porta 3000!
    echo Navegador deve ter aberto automaticamente!
)
echo.
echo ======================================================================
echo.

pause


