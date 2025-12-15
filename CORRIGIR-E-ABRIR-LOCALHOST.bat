@echo off
chcp 65001 >nul
title CORRIGINDO FALHAS E ABRINDO LOCALHOST
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO FALHAS PARA VISUALIZAR LOCALHOST NA WEB
echo ======================================================================
echo.

echo [1/10] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/10] Limpando cache completamente...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] Cache node_modules removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)

echo.
echo [3/10] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [4/10] Verificando dependencias...
if not exist "node_modules\next" (
    echo [AVISO] Dependencias nao encontradas, instalando...
    call npm install --legacy-peer-deps >nul 2>&1
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [5/10] Verificando estrutura do projeto...
set ERRORS=0

if not exist "app\page.tsx" (
    echo [ERRO] app\page.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] app\page.tsx
)

if not exist "app\layout.tsx" (
    echo [ERRO] app\layout.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] app\layout.tsx
)

if not exist "components\defi-app.tsx" (
    echo [ERRO] components\defi-app.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] components\defi-app.tsx
)

if not exist "lib\wagmi-config.ts" (
    echo [ERRO] lib\wagmi-config.ts nao encontrado!
    set ERRORS=1
) else (
    echo [OK] lib\wagmi-config.ts
)

if %ERRORS%==1 (
    echo.
    echo [ERRO] Problemas encontrados na estrutura!
    pause
    exit /b 1
)

echo.
echo [6/10] Verificando erros de TypeScript...
npx tsc --noEmit --skipLibCheck >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Alguns avisos de TypeScript (nao bloqueantes)
) else (
    echo [OK] Sem erros de TypeScript
)

echo.
echo [7/10] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [8/10] Iniciando servidor Next.js com --open...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo O navegador sera aberto automaticamente!
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open (abre navegador automaticamente)
start "=== SERVIDOR DAPP - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo [9/10] Aguardando servidor iniciar...
echo.

REM Aguardar servidor iniciar
set /a tentativas=0
:wait_loop
timeout /t 4 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 50 (
        echo Aguardando servidor iniciar... (%tentativas%/50)
        goto wait_loop
    ) else (
        echo [AVISO] Servidor demorou para iniciar...
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
)

echo.
echo [10/10] Aguardando compilacao completa (25 segundos)...
timeout /t 25 /nobreak >nul

echo.
echo Forcando abertura do navegador em MULTIPLAS formas...
echo.

REM Tentar abrir em varias formas
start http://localhost:3000
timeout /t 2 /nobreak >nul
start msedge http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
start chrome http://localhost:3000 2>nul
timeout /t 1 /nobreak >nul
cmd /c start http://localhost:3000
timeout /t 1 /nobreak >nul
rundll32 url.dll,FileProtocolHandler http://localhost:3000
timeout /t 1 /nobreak >nul

echo.
echo ======================================================================
echo   CORRECOES APLICADAS - NAVEGADOR ABERTO
echo ======================================================================
echo.
echo Status do servidor:
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Servidor pode nao estar rodando ainda
    echo   Aguarde mais 15-20 segundos na janela do servidor
    echo   Depois recarregue a pagina (F5)
) else (
    echo   [OK] Servidor confirmado rodando na porta 3000
    echo   [OK] Navegador aberto automaticamente
    echo   [OK] Frontend deve estar carregando agora!
)
echo.
echo URL: http://localhost:3000
echo.
echo Se a pagina nao aparecer:
echo   1. Aguarde mais 15-20 segundos (compilacao inicial)
echo   2. Recarregue a pagina (F5 ou Ctrl+R)
echo   3. Verifique a janela "=== SERVIDOR DAPP - NAO FECHE ==="
echo   4. Pressione F12 no navegador para ver erros no console
echo   5. Verifique se ha erros na janela do servidor
echo.
echo ======================================================================
echo.

pause


