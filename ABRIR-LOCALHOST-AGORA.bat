@echo off
chcp 65001 >nul
title ABRINDO LOCALHOST:3000 AGORA
color 0A
cls

echo.
echo ======================================================================
echo   ABRINDO http://localhost:3000
echo ======================================================================
echo.

echo Verificando se servidor esta rodando...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor nao detectado na porta 3000
    echo.
    echo Iniciando servidor...
    start "SERVIDOR" cmd /k "npm run dev:open"
    echo.
    echo Aguardando 30 segundos para servidor iniciar...
    timeout /t 30 /nobreak >nul
) else (
    echo [OK] Servidor detectado na porta 3000
)

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
echo   NAVEGADOR ABERTO
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo   1. Aguarde mais 20-30 segundos
echo   2. Recarregue a pagina (F5)
echo   3. Verifique se ha uma janela do servidor aberta
echo.
pause
