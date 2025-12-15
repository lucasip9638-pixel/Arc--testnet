@echo off
chcp 65001 >nul
title INSTALANDO DEPENDENCIAS PARA LOCALHOST FUNCIONAR
color 0B
cls

echo.
echo ======================================================================
echo   INSTALANDO DEPENDENCIAS PARA LOCALHOST:3000 FUNCIONAR
echo ======================================================================
echo.

echo [1/8] Parando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [3/8] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [4/8] Verificando dependencias criticas...
set MISSING=0

if not exist "node_modules\next" (
    echo [AVISO] Next.js nao encontrado
    set MISSING=1
) else (
    echo [OK] Next.js
)

if not exist "node_modules\react" (
    echo [AVISO] React nao encontrado
    set MISSING=1
) else (
    echo [OK] React
)

if not exist "node_modules\wagmi" (
    echo [AVISO] wagmi nao encontrado
    set MISSING=1
) else (
    echo [OK] wagmi
)

if not exist "node_modules\viem" (
    echo [AVISO] viem nao encontrado
    set MISSING=1
) else (
    echo [OK] viem
)

if not exist "node_modules\@tanstack\react-query" (
    echo [AVISO] @tanstack/react-query nao encontrado
    set MISSING=1
) else (
    echo [OK] @tanstack/react-query
)

if not exist "node_modules\@metamask\sdk" (
    echo [AVISO] @metamask/sdk nao encontrado
    set MISSING=1
) else (
    echo [OK] @metamask/sdk
)

if not exist "node_modules\@coinbase\wallet-sdk" (
    echo [AVISO] @coinbase/wallet-sdk nao encontrado
    set MISSING=1
) else (
    echo [OK] @coinbase/wallet-sdk
)

if not exist "node_modules\@svgr\webpack" (
    echo [AVISO] @svgr/webpack nao encontrado
    set MISSING=1
) else (
    echo [OK] @svgr/webpack
)

echo.
if %MISSING%==1 (
    echo [5/8] Instalando dependencias faltantes...
    echo.
    echo Isso pode demorar alguns minutos...
    echo.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao!
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [5/8] Todas as dependencias criticas encontradas
    echo [AVISO] Verificando se precisa atualizar...
    call npm install --legacy-peer-deps
)

echo.
echo [6/8] Limpando cache...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)

echo.
echo [7/8] Verificando estrutura do projeto...
if not exist "app\page.tsx" (
    echo [ERRO] app\page.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "app\layout.tsx" (
    echo [ERRO] app\layout.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "components\defi-app.tsx" (
    echo [ERRO] components\defi-app.tsx nao encontrado!
    pause
    exit /b 1
)
echo [OK] Estrutura do projeto verificada

echo.
echo [8/8] Iniciando servidor...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo URL: http://localhost:3000
echo.
echo Aguarde ver "Ready in X.Xs" na janela do servidor
echo O navegador abrira automaticamente
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo Aguardando servidor iniciar (35 segundos)...
timeout /t 35 /nobreak >nul

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
echo   DEPENDENCIAS INSTALADAS - SERVIDOR INICIADO
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
    echo   [OK] Localhost deve estar funcionando!
)
echo.
echo URL: http://localhost:3000
echo.
echo DEPENDENCIAS INSTALADAS:
echo   [OK] Next.js
echo   [OK] React
echo   [OK] wagmi
echo   [OK] viem
echo   [OK] @tanstack/react-query
echo   [OK] @metamask/sdk
echo   [OK] @coinbase/wallet-sdk
echo   [OK] @svgr/webpack
echo.
echo Se ainda nao funcionar:
echo   1. Aguarde mais 30-60 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5)
echo   3. Verifique a janela do servidor para erros
echo   4. Tente abrir manualmente: http://localhost:3000
echo.
echo ======================================================================
echo.

pause

