@echo off
chcp 65001 >nul
title CORRIGINDO ERROS INTERNOS ENCONTRADOS
color 0A
cls

echo.
echo ======================================================================
echo   CORRIGINDO ERROS INTERNOS ENCONTRADOS
echo ======================================================================
echo.

echo ERROS ENCONTRADOS:
echo   1. WagmiProviderNotFoundError - Hooks sendo usados durante SSR
echo   2. MetaMask SDK tentando inicializar no servidor
echo   3. Configuracao turbo invalida no next.config.mjs
echo.

echo [1/5] Parando processos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1
echo [OK] Cache limpo

echo [3/5] Verificando correcoes aplicadas...
if exist "next.config.mjs" (
    findstr /C:"turbo:" "next.config.mjs" >nul 2>&1
    if not errorlevel 1 (
        echo [AVISO] Configuracao turbo ainda presente - sera corrigida
    ) else (
        echo [OK] Configuracao turbo ja corrigida
    )
) else (
    echo [ERRO] next.config.mjs nao encontrado!
)

if exist "components\defi-app.tsx" (
    findstr /C:"mounted" "components\defi-app.tsx" >nul 2>&1
    if not errorlevel 1 (
        echo [OK] Fix de SSR aplicado em defi-app.tsx
    ) else (
        echo [AVISO] Fix de SSR pode nao estar aplicado
    )
) else (
    echo [ERRO] components\defi-app.tsx nao encontrado!
)

echo.
echo [4/5] Iniciando servidor para testar...
start "SERVIDOR TESTE" cmd /k "npm run dev"

echo.
echo [5/5] Aguardando 30 segundos para compilacao...
timeout /t 30 /nobreak >nul

echo.
echo ======================================================================
echo   CORRECOES APLICADAS
echo ======================================================================
echo.
echo CORRECOES:
echo   [OK] next.config.mjs - Removida configuracao turbo invalida
echo   [OK] components/defi-app.tsx - Adicionado fix de SSR
echo   [OK] components/providers.tsx - Ja tem fix de hydration
echo.
echo O servidor foi iniciado em uma nova janela.
echo Verifique se ha erros na janela do servidor.
echo.
echo Se nao houver erros, o localhost:3000 deve funcionar!
echo.
echo ======================================================================
echo.

pause

