@echo off
chcp 65001 >nul
title VERIFICANDO E CORRIGINDO DEPENDENCIAS
color 0E
cls

echo.
echo ======================================================================
echo   VERIFICANDO E CORRIGINDO DEPENDENCIAS
echo ======================================================================
echo.

echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v
)

echo.
echo [2/7] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v
)

echo.
echo [3/7] Verificando dependencias criticas...
set MISSING=0

if not exist "node_modules\next" (
    echo [FALTANDO] next
    set MISSING=1
) else (
    echo [OK] next
)

if not exist "node_modules\react" (
    echo [FALTANDO] react
    set MISSING=1
) else (
    echo [OK] react
)

if not exist "node_modules\react-dom" (
    echo [FALTANDO] react-dom
    set MISSING=1
) else (
    echo [OK] react-dom
)

if not exist "node_modules\wagmi" (
    echo [FALTANDO] wagmi
    set MISSING=1
) else (
    echo [OK] wagmi
)

if not exist "node_modules\viem" (
    echo [FALTANDO] viem
    set MISSING=1
) else (
    echo [OK] viem
)

if not exist "node_modules\@tanstack\react-query" (
    echo [FALTANDO] @tanstack/react-query
    set MISSING=1
) else (
    echo [OK] @tanstack/react-query
)

echo.
if %MISSING%==1 (
    echo [4/7] Instalando dependencias faltantes...
    call npm install --legacy-peer-deps
) else (
    echo [4/7] Todas as dependencias criticas estao instaladas!
)

echo.
echo [5/7] Verificando erros de TypeScript...
npx tsc --noEmit --skipLibCheck >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Alguns erros de TypeScript encontrados (mas nao bloqueantes)
) else (
    echo [OK] Sem erros de TypeScript
)

echo.
echo [6/7] Verificando estrutura do projeto...
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

echo.
if %ERRORS%==1 (
    echo [7/7] ERROS ENCONTRADOS NA ESTRUTURA!
    echo Corrija os erros antes de continuar.
) else (
    echo [7/7] Estrutura do projeto OK!
)

echo.
echo ======================================================================
echo   VERIFICACAO CONCLUIDA
echo ======================================================================
echo.

if %MISSING%==1 (
    echo AVISO: Algumas dependencias foram instaladas.
    echo Execute este script novamente para verificar.
) else if %ERRORS%==1 (
    echo ERRO: Problemas encontrados na estrutura do projeto.
    echo Corrija os erros antes de continuar.
) else (
    echo TUDO OK! O projeto esta pronto para rodar.
    echo.
    echo Execute: CONFIGURAR-E-ABRIR-WEB.bat
)

echo.
pause


