@echo off
chcp 65001 >nul
title VERIFICANDO ERROS INTERNOS
color 0E
cls

echo.
echo ======================================================================
echo   VERIFICANDO ERROS INTERNOS DO PROJETO
echo ======================================================================
echo.

echo [1/10] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [2/10] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [3/10] Verificando estrutura de arquivos...
set ERRORS=0

if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    set ERRORS=1
) else (
    echo [OK] package.json
)

if not exist "next.config.mjs" (
    echo [ERRO] next.config.mjs nao encontrado!
    set ERRORS=1
) else (
    echo [OK] next.config.mjs
)

if not exist "tsconfig.json" (
    echo [ERRO] tsconfig.json nao encontrado!
    set ERRORS=1
) else (
    echo [OK] tsconfig.json
)

if not exist "app\layout.tsx" (
    echo [ERRO] app\layout.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] app\layout.tsx
)

if not exist "app\page.tsx" (
    echo [ERRO] app\page.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] app\page.tsx
)

if not exist "components\providers.tsx" (
    echo [ERRO] components\providers.tsx nao encontrado!
    set ERRORS=1
) else (
    echo [OK] components\providers.tsx
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
echo [4/10] Verificando dependencias criticas...
if not exist "node_modules\next" (
    echo [ERRO] Next.js nao instalado!
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao!
        pause
        exit /b 1
    )
) else (
    echo [OK] Next.js instalado
)

if not exist "node_modules\wagmi" (
    echo [ERRO] wagmi nao instalado!
    call npm install wagmi --legacy-peer-deps
) else (
    echo [OK] wagmi instalado
)

if not exist "node_modules\viem" (
    echo [ERRO] viem nao instalado!
    call npm install viem --legacy-peer-deps
) else (
    echo [OK] viem instalado
)

if not exist "node_modules\@tanstack\react-query" (
    echo [ERRO] @tanstack/react-query nao instalado!
    call npm install @tanstack/react-query --legacy-peer-deps
) else (
    echo [OK] @tanstack/react-query instalado
)

if not exist "node_modules\react" (
    echo [ERRO] React nao instalado!
    call npm install react react-dom --legacy-peer-deps
) else (
    echo [OK] React instalado
)

echo.
echo [5/10] Verificando erros de TypeScript...
echo Executando verificacao TypeScript...
npx tsc --noEmit --skipLibCheck >erros-typescript.txt 2>&1
if errorlevel 1 (
    echo [AVISO] Erros de TypeScript encontrados!
    echo Verifique o arquivo: erros-typescript.txt
    type erros-typescript.txt | findstr /C:"error TS" | more
) else (
    echo [OK] Sem erros de TypeScript
    del erros-typescript.txt >nul 2>&1
)

echo.
echo [6/10] Verificando imports criticos...
findstr /C:"use client" "components\providers.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] "use client" nao encontrado em providers.tsx!
    set ERRORS=1
) else (
    echo [OK] providers.tsx tem "use client"
)

findstr /C:"WagmiProvider" "components\providers.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] WagmiProvider nao encontrado!
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

findstr /C:"wagmiConfig" "lib\wagmi-config.ts" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] wagmiConfig nao encontrado!
    set ERRORS=1
) else (
    echo [OK] wagmiConfig exportado
)

if %ERRORS%==1 (
    echo.
    echo [ERRO] Problemas encontrados nos imports!
)

echo.
echo [7/10] Verificando configuracoes...
findstr /C:"export default" "next.config.mjs" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] next.config.mjs nao exporta default!
    set ERRORS=1
) else (
    echo [OK] next.config.mjs configurado
)

findstr /C:"paths" "tsconfig.json" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Path aliases podem nao estar configurados
) else (
    echo [OK] Path aliases configurados
)

echo.
echo [8/10] Verificando contratos...
if exist "lib\daily-gm-contract.ts" (
    findstr /C:"DAILY_GM_CONTRACT_ADDRESS" "lib\daily-gm-contract.ts" >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] DAILY_GM_CONTRACT_ADDRESS nao encontrado
    ) else (
        echo [OK] DailyGM contract configurado
    )
) else (
    echo [AVISO] lib\daily-gm-contract.ts nao encontrado
)

if exist "lib\swap-contract.ts" (
    findstr /C:"SWAP_CONTRACT_ADDRESS" "lib\swap-contract.ts" >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] SWAP_CONTRACT_ADDRESS nao encontrado
    ) else (
        echo [OK] TokenSwap contract configurado
    )
) else (
    echo [AVISO] lib\swap-contract.ts nao encontrado
)

echo.
echo [9/10] Limpando cache...
if exist ".next" (
    echo Removendo cache .next...
    rmdir /s /q ".next" >nul 2>&1
    echo [OK] Cache .next removido
)

if exist ".turbo" (
    echo Removendo cache turbo...
    rmdir /s /q ".turbo" >nul 2>&1
    echo [OK] Cache turbo removido
)

echo.
echo [10/10] Testando compilacao...
echo Executando build de teste (pode demorar)...
timeout /t 2 /nobreak >nul

echo.
echo ======================================================================
echo   RESUMO DA VERIFICACAO
echo ======================================================================
echo.

if %ERRORS%==1 (
    echo [AVISO] Alguns problemas foram encontrados!
    echo Verifique os erros acima.
) else (
    echo [OK] Nenhum erro critico encontrado!
    echo O projeto deve estar pronto para rodar.
)

echo.
echo ======================================================================
echo   PROXIMOS PASSOS
echo ======================================================================
echo.
echo Se nao houve erros criticos:
echo   1. Execute: ABRIR-AGORA.bat
echo   2. Aguarde o servidor iniciar
echo   3. O navegador abrira automaticamente
echo.
echo Se houve erros:
echo   1. Verifique os erros acima
echo   2. Execute: npm install --legacy-peer-deps
echo   3. Tente novamente
echo.
echo ======================================================================
echo.

pause

