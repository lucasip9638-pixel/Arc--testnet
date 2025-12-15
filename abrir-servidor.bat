@echo off
title Iniciando Servidor Next.js e Abrindo Navegador
color 0A
echo.
echo ========================================
echo   INICIANDO SERVIDOR E ABRINDO NAVEGADOR
echo ========================================
echo.

REM Parar processos Node antigos
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Limpando porta 3000...
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo Porta 3000 em uso, liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo.
echo Iniciando servidor Next.js...
echo Aguarde a mensagem "Ready"...
echo.

REM Iniciar servidor em nova janela
start "Servidor Next.js" cmd /c "npm run dev"

REM Aguardar servidor iniciar
echo Aguardando servidor iniciar (15 segundos)...
timeout /t 15 /nobreak >nul

REM Abrir navegador
echo.
echo Abrindo navegador em http://localhost:3000
start http://localhost:3000

echo.
echo ========================================
echo   SERVIDOR INICIADO!
echo ========================================
echo.
echo O navegador foi aberto automaticamente.
echo Mantenha a janela "Servidor Next.js" aberta.
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul

