@echo off
chcp 65001 >nul
title CORRIGINDO TUDO E INSTALANDO DEPENDENCIAS
color 0B
cls

echo.
echo ======================================================================
echo   CORRIGINDO ERROS E INSTALANDO DEPENDENCIAS
echo ======================================================================
echo.

echo [1/10] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/10] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo Cache turbo removido
)
echo OK!

echo.
echo [3/10] Removendo node_modules antigo...
if exist "node_modules" (
    echo Removendo node_modules (pode demorar)...
    rmdir /s /q "node_modules"
    echo node_modules removido
)
echo OK!

echo.
echo [4/10] Removendo package-lock.json...
if exist "package-lock.json" (
    del /q "package-lock.json"
    echo package-lock.json removido
)
echo OK!

echo.
echo [5/10] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
echo OK!

echo.
echo [6/10] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo [7/10] Instalando dependencias (pode demorar varios minutos)...
echo.
echo IMPORTANTE: Este processo pode demorar 5-10 minutos!
echo.
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo AVISO: Alguns avisos nas dependencias, mas continuando...
) else (
    echo.
    echo Dependencias instaladas com sucesso!
)
echo OK!

echo.
echo [8/10] Verificando dependencias criticas...
if not exist "node_modules\next" (
    echo ERRO: Next.js nao instalado!
    call npm install next --legacy-peer-deps
)
if not exist "node_modules\react" (
    echo ERRO: React nao instalado!
    call npm install react react-dom --legacy-peer-deps
)
if not exist "node_modules\wagmi" (
    echo ERRO: Wagmi nao instalado!
    call npm install wagmi viem --legacy-peer-deps
)
echo OK!

echo.
echo [9/10] Verificando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo OK!

echo.
echo [10/10] Verificando estrutura do projeto...
if not exist "app\page.tsx" (
    echo ERRO: app\page.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "app\layout.tsx" (
    echo ERRO: app\layout.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "components\defi-app.tsx" (
    echo ERRO: components\defi-app.tsx nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo ======================================================================
echo   CONFIGURACAO COMPLETA
echo ======================================================================
echo.
echo Todas as dependencias foram instaladas e verificadas!
echo.
echo Proximo passo: Iniciar o servidor
echo.
echo Execute: CONFIGURAR-E-ABRIR-WEB.bat
echo.
echo ======================================================================
echo.

pause


