@echo off
chcp 65001 >nul
title DIAGNOSTICO COMPLETO - APLICACAO
color 0E
cls

echo.
echo ======================================================================
echo   DIAGNOSTICO COMPLETO DA APLICACAO
echo ======================================================================
echo.

echo [1/10] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [2/10] Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

echo.
echo [3/10] Verificando processos Node.js...
tasklist | findstr /i "node.exe" >nul 2>&1
if errorlevel 1 (
    echo [OK] Nenhum processo Node.js rodando
) else (
    echo [AVISO] Processos Node.js encontrados:
    tasklist | findstr /i "node.exe"
    echo.
    echo Deseja parar todos os processos? (S/N)
    set /p resposta=
    if /i "%resposta%"=="S" (
        taskkill /F /IM node.exe >nul 2>&1
        echo [OK] Processos parados
    )
)

echo.
echo [4/10] Verificando porta 3000...
netstat -ano | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo [OK] Porta 3000 livre
) else (
    echo [AVISO] Porta 3000 em uso:
    netstat -ano | findstr ":3000"
)

echo.
echo [5/10] Verificando estrutura de arquivos...
set ERRORS=0
if not exist "package.json" (echo [ERRO] package.json nao encontrado! & set ERRORS=1)
if not exist "next.config.mjs" (echo [ERRO] next.config.mjs nao encontrado! & set ERRORS=1)
if not exist "tsconfig.json" (echo [ERRO] tsconfig.json nao encontrado! & set ERRORS=1)
if not exist "app\layout.tsx" (echo [ERRO] app\layout.tsx nao encontrado! & set ERRORS=1)
if not exist "app\page.tsx" (echo [ERRO] app\page.tsx nao encontrado! & set ERRORS=1)
if not exist "components\providers.tsx" (echo [ERRO] components\providers.tsx nao encontrado! & set ERRORS=1)
if not exist "components\defi-app.tsx" (echo [ERRO] components\defi-app.tsx nao encontrado! & set ERRORS=1)
if not exist "lib\wagmi-config.ts" (echo [ERRO] lib\wagmi-config.ts nao encontrado! & set ERRORS=1)

if %ERRORS%==1 (
    echo [ERRO] Arquivos essenciais faltando!
    pause
    exit /b 1
)
echo [OK] Todos os arquivos essenciais encontrados

echo.
echo [6/10] Verificando dependencias...
if not exist "node_modules" (
    echo [ERRO] node_modules nao encontrado!
    echo Execute: npm install --legacy-peer-deps
    pause
    exit /b 1
)

if not exist "node_modules\next" (
    echo [ERRO] Next.js nao instalado!
    echo Execute: npm install --legacy-peer-deps
    pause
    exit /b 1
)
echo [OK] Dependencias encontradas

echo.
echo [7/10] Verificando imports criticos...
findstr /C:"use client" "components\providers.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] "use client" nao encontrado em providers.tsx!
    set ERRORS=1
) else (
    echo [OK] providers.tsx tem "use client"
)

findstr /C:"export default" "app\layout.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] app\layout.tsx nao exporta default!
    set ERRORS=1
) else (
    echo [OK] app\layout.tsx exporta default
)

findstr /C:"export default" "app\page.tsx" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] app\page.tsx nao exporta default!
    set ERRORS=1
) else (
    echo [OK] app\page.tsx exporta default
)

if %ERRORS%==1 (
    echo [ERRO] Problemas encontrados nos arquivos!
    pause
    exit /b 1
)

echo.
echo [8/10] Limpando cache...
if exist ".next" (
    echo Removendo .next...
    rmdir /s /q ".next" >nul 2>&1
)
if exist ".turbo" (
    echo Removendo .turbo...
    rmdir /s /q ".turbo" >nul 2>&1
)
echo [OK] Cache limpo

echo.
echo [9/10] Testando compilacao TypeScript...
npx tsc --noEmit --skipLibCheck >erros-ts.txt 2>&1
if errorlevel 1 (
    echo [AVISO] Erros de TypeScript encontrados (ver erros-ts.txt)
    type erros-ts.txt | findstr /C:"error TS" | more
) else (
    echo [OK] Sem erros de TypeScript
    del erros-ts.txt >nul 2>&1
)

echo.
echo [10/10] Tentando iniciar servidor em modo teste...
echo.
echo Iniciando servidor (modo webpack - mais estavel)...
echo Aguarde a mensagem "Ready"...
echo.
echo Se aparecer algum erro, copie e compartilhe!
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
echo ======================================================================
echo.

start "Servidor Teste" cmd /k "title Servidor Teste && color 0A && npm run dev:safe"

echo.
echo Servidor iniciado em nova janela.
echo Aguarde 30 segundos e verifique se apareceu "Ready"...
timeout /t 30 /nobreak >nul

echo.
echo Verificando se servidor esta respondendo...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Servidor nao esta respondendo ainda
    echo Verifique a janela do servidor para ver erros
) else (
    echo [OK] Servidor esta respondendo!
    echo.
    echo Abrindo navegador...
    start http://localhost:3000
)

echo.
echo ======================================================================
echo   DIAGNOSTICO CONCLUIDO
echo ======================================================================
echo.
echo Se o servidor nao iniciou, verifique:
echo   1. A janela do servidor para ver erros
echo   2. Se todas as dependencias estao instaladas
echo   3. Se ha conflitos de porta
echo.
pause

