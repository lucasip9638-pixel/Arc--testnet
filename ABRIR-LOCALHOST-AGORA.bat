@echo off
chcp 65001 >nul
title ABRIR LOCALHOST AGORA
color 0A
cls

echo.
echo ======================================================================
echo   ABRINDO LOCALHOST:3000
echo ======================================================================
echo.

REM Verificar se servidor está rodando
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor nao esta rodando!
    echo.
    echo Iniciando servidor...
    echo.
    start "Next.js Server" cmd /k "npm run dev"
    echo.
    echo Aguardando servidor iniciar (15 segundos)...
    timeout /t 15 /nobreak >nul
) else (
    echo [OK] Servidor ja esta rodando!
)

echo.
echo Abrindo navegador em http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo   NAVEGADOR ABERTO!
echo ======================================================================
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao carregar:
echo 1. Aguarde mais alguns segundos (servidor pode estar compilando)
echo 2. Recarregue a pagina (F5)
echo 3. Verifique se o servidor esta rodando em outra janela
echo.
echo ======================================================================
echo.
timeout /t 5 /nobreak >nul
