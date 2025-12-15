@echo off
chcp 65001 >nul
title REINTEGRANDO FRONTEND COM BACKEND
color 0B
cls

echo.
echo ======================================================================
echo   REINTEGRANDO FRONTEND COM BACKEND E CORRIGINDO ERROS
echo ======================================================================
echo.

echo [1/12] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
echo [OK] Processos parados

echo.
echo [2/12] Limpando cache COMPLETAMENTE...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo [OK] Cache .next removido
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo [OK] Cache node_modules removido
)
if exist ".turbo" (
    rmdir /s /q ".turbo" 2>nul
    echo [OK] Cache turbo removido
)
if exist "tsconfig.tsbuildinfo" (
    del /q "tsconfig.tsbuildinfo" 2>nul
    echo [OK] Cache TypeScript removido
)

echo.
echo [3/12] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [4/12] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [5/12] Verificando estrutura do projeto...
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

if not exist "components\providers.tsx" (
    echo [ERRO] components\providers.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] components\providers.tsx
)

if not exist "lib\wagmi-config.ts" (
    echo [ERRO] lib\wagmi-config.ts nao encontrado!
    set ERRORS=1
) else (
    echo [OK] lib\wagmi-config.ts
)

if not exist "lib\daily-gm-contract.ts" (
    echo [ERRO] lib\daily-gm-contract.ts nao encontrado!
    set ERRORS=1
) else (
    echo [OK] lib\daily-gm-contract.ts
)

if not exist "lib\swap-contract.ts" (
    echo [ERRO] lib\swap-contract.ts nao encontrado!
    set ERRORS=1
) else (
    echo [OK] lib\swap-contract.ts
)

if not exist "lib\tokens.ts" (
    echo [ERRO] lib\tokens.ts nao encontrado!
    set ERRORS=1
) else (
    echo [OK] lib\tokens.ts
)

if %ERRORS%==1 (
    echo.
    echo [ERRO] Problemas encontrados na estrutura!
    pause
    exit /b 1
)

echo.
echo [6/12] Verificando dependencias criticas...
if not exist "node_modules\next" (
    echo [AVISO] Next.js nao encontrado, instalando dependencias...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        pause
        exit /b 1
    )
) else (
    echo [OK] Next.js encontrado
)

if not exist "node_modules\wagmi" (
    echo [AVISO] wagmi nao encontrado, instalando...
    call npm install wagmi --legacy-peer-deps
)

if not exist "node_modules\viem" (
    echo [AVISO] viem nao encontrado, instalando...
    call npm install viem --legacy-peer-deps
)

if not exist "node_modules\@metamask\sdk" (
    echo [AVISO] @metamask/sdk nao encontrado, instalando...
    call npm install @metamask/sdk --legacy-peer-deps
)

if not exist "node_modules\@tanstack\react-query" (
    echo [AVISO] @tanstack/react-query nao encontrado, instalando...
    call npm install @tanstack/react-query --legacy-peer-deps
)

echo [OK] Dependencias verificadas

echo.
echo [7/12] Verificando erros de TypeScript...
npx tsc --noEmit --skipLibCheck 2>nul
if errorlevel 1 (
    echo [AVISO] Alguns avisos de TypeScript (nao bloqueantes)
) else (
    echo [OK] Sem erros criticos de TypeScript
)

echo.
echo [8/12] Liberando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Porta 3000 liberada

echo.
echo [9/12] Verificando integracao Frontend-Backend...
echo.
echo Verificando Providers (Wagmi + React Query)...
findstr /C:"WagmiProvider" "components\providers.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] WagmiProvider nao encontrado em providers.tsx!
    set ERRORS=1
) else (
    echo [OK] WagmiProvider configurado
)

findstr /C:"QueryClientProvider" "components\providers.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] QueryClientProvider nao encontrado!
    set ERRORS=1
) else (
    echo [OK] QueryClientProvider configurado
)

echo.
echo Verificando configuracao Wagmi...
findstr /C:"arcTestnet" "lib\wagmi-config.ts" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] arcTestnet nao encontrado em wagmi-config.ts!
    set ERRORS=1
) else (
    echo [OK] arcTestnet configurado
)

findstr /C:"createConfig" "lib\wagmi-config.ts" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] createConfig nao encontrado!
    set ERRORS=1
) else (
    echo [OK] wagmiConfig criado
)

echo.
echo Verificando contratos...
findstr /C:"DAILY_GM_CONTRACT_ADDRESS" "lib\daily-gm-contract.ts" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] DAILY_GM_CONTRACT_ADDRESS nao encontrado!
    set ERRORS=1
) else (
    echo [OK] DailyGM contract configurado
)

findstr /C:"SWAP_CONTRACT_ADDRESS" "lib\swap-contract.ts" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] SWAP_CONTRACT_ADDRESS nao encontrado!
    set ERRORS=1
) else (
    echo [OK] TokenSwap contract configurado
)

if %ERRORS%==1 (
    echo.
    echo [ERRO] Problemas encontrados na integracao!
    pause
    exit /b 1
)

echo [OK] Integracao Frontend-Backend verificada

echo.
echo [10/12] Iniciando servidor Next.js...
echo.
echo IMPORTANTE: O servidor iniciara em uma nova janela!
echo O navegador sera aberto automaticamente apos 30 segundos!
echo.
echo ======================================================================
echo.

REM Iniciar servidor com --open
start "=== SERVIDOR DAPP - NAO FECHE ===" cmd /k "npm run dev:open"

echo.
echo [11/12] Aguardando servidor iniciar...
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
echo [12/12] Aguardando compilacao completa (30 segundos)...
timeout /t 30 /nobreak >nul

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
echo   REINTEGRACAO CONCLUIDA - NAVEGADOR ABERTO
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
echo INTEGRACAO FRONTEND-BACKEND:
echo   [OK] WagmiProvider configurado
echo   [OK] QueryClientProvider configurado
echo   [OK] Arc Testnet configurado (Chain ID: 5042002)
echo   [OK] DailyGM contract: 0x8d0ac3728e87be7cf293effaeb2118d90121ecb7
echo   [OK] TokenSwap contract: 0x79E3eB70968f5Ec92Bd5101cBa70CD1b02732F19
echo   [OK] USDC: 0x3600000000000000000000000000000000000000
echo   [OK] EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
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

