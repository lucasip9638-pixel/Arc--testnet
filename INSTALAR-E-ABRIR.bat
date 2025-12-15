@echo off
chcp 65001 >nul
echo ======================================================================
echo   INSTALANDO DEPENDENCIAS E INICIANDO SERVIDOR
echo ======================================================================
echo.

echo [1/4] Parando servidores existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/4] Limpando cache...
if exist ".next" rmdir /s /q ".next"
echo OK!

echo.
echo [3/4] Instalando dependencias...
call npm install @base-org/account
if errorlevel 1 (
    echo ERRO na instalacao!
    pause
    exit /b 1
)
echo OK!

echo.
echo [4/4] Iniciando servidor...
start cmd /k "npm run dev"

echo.
echo ======================================================================
echo   SERVIDOR INICIADO
echo ======================================================================
echo.
echo Aguarde 10-15 segundos para o servidor iniciar...
echo.
echo Depois acesse: http://localhost:3000
echo.
echo Pressione qualquer tecla para abrir no navegador...
pause >nul

start http://localhost:3000

echo.
echo Navegador aberto!
echo.

