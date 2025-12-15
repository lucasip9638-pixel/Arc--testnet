@echo off
chcp 65001 >nul
echo ======================================================================
echo   CORRIGINDO TODOS OS PROBLEMAS E INICIANDO SERVIDOR
echo ======================================================================
echo.

echo [1/6] Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo OK!

echo.
echo [2/6] Limpando cache completamente...
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
echo [3/6] Verificando e instalando dependencias...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERRO na instalacao de dependencias!
    pause
    exit /b 1
)
echo OK!

echo.
echo [4/6] Verificando configuracoes...
echo Verificando next.config.mjs...
if not exist "next.config.mjs" (
    echo ERRO: next.config.mjs nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo [5/6] Verificando arquivos principais...
if not exist "app\layout.tsx" (
    echo ERRO: app\layout.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "app\page.tsx" (
    echo ERRO: app\page.tsx nao encontrado!
    pause
    exit /b 1
)
if not exist "components\providers.tsx" (
    echo ERRO: components\providers.tsx nao encontrado!
    pause
    exit /b 1
)
echo OK!

echo.
echo [6/6] Iniciando servidor de desenvolvimento...
start cmd /k "title Servidor Next.js - http://localhost:3000 && npm run dev"

echo.
echo ======================================================================
echo   SERVIDOR INICIADO COM SUCESSO!
echo ======================================================================
echo.
echo O servidor esta iniciando em uma nova janela.
echo.
echo Aguarde 15-20 segundos para o servidor compilar completamente.
echo.
echo Depois acesse: http://localhost:3000
echo.
echo Pressione qualquer tecla para abrir automaticamente no navegador...
pause >nul

echo.
echo Aguardando servidor iniciar...
timeout /t 15 /nobreak >nul

echo.
echo Abrindo navegador...
start http://localhost:3000

echo.
echo ======================================================================
echo   NAVEGADOR ABERTO!
echo ======================================================================
echo.
echo Se a pagina nao carregar:
echo 1. Aguarde mais alguns segundos
echo 2. Verifique a janela do servidor para erros
echo 3. Tente recarregar a pagina (F5)
echo.
pause

