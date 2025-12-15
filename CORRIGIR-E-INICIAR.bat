@echo off
chcp 65001 >nul
title CORRIGINDO ERROS E INICIANDO SERVIDOR
color 0A
cls
echo.
echo ======================================================================
echo   CORRIGINDO ERROS E INICIANDO SERVIDOR
echo ======================================================================
echo.

echo [1/4] Parando processos Node.js existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [2/4] Limpando cache do Next.js...
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
echo [3/4] Verificando porta 3000...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 0 (
    echo Porta 3000 em uso, liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo OK!

echo.
echo [4/4] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: Mantenha esta janela aberta!
echo.
echo O servidor estara disponivel em: http://localhost:3000
echo.
echo Aguarde a mensagem "Ready in X.Xs"
echo Depois abra seu navegador e acesse o link acima
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.
echo ======================================================================
echo.

npm run dev

pause
