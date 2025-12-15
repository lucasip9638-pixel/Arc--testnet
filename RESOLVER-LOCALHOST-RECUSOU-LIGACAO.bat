@echo off
chcp 65001 >nul
title RESOLVENDO "LOCALHOST RECUSOU ESTABELECER LIGACAO"
color 0C
cls

echo.
echo ======================================================================
echo   RESOLVENDO: "LOCALHOST RECUSOU ESTABELECER LIGACAO"
echo ======================================================================
echo.

echo PROBLEMA:
echo   "localhost recusou estabelecer ligacao" significa que o servidor
echo   nao esta rodando na porta 3000.
echo.

echo [1/7] Parando TODOS os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Todos os processos Node.js finalizados

echo.
echo [2/7] Liberando porta 3000 FORCADAMENTE...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo Finalizando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul

REM Verificar novamente
netstat -ano | findstr :3000 >nul 2>&1
if not errorlevel 1 (
    echo [AVISO] Ainda ha processo na porta 3000, tentando novamente...
    timeout /t 2 /nobreak >nul
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo [OK] Porta 3000 completamente liberada

echo.
echo [3/7] Limpando TODOS os caches...
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
if exist "node_modules\.cache" (
    echo Removendo cache node_modules...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] Cache node_modules removido
)
if exist "tsconfig.tsbuildinfo" (
    echo Removendo cache TypeScript...
    del /q "tsconfig.tsbuildinfo" >nul 2>&1
    echo [OK] Cache TypeScript removido
)

echo.
echo [4/7] Verificando Node.js e dependencias...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO CRITICO] npm nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do echo [OK] npm: %%v

if not exist "node_modules\next" (
    echo [AVISO] Next.js nao encontrado, instalando dependencias...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao de dependencias!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias encontradas
)

echo.
echo [5/7] Verificando estrutura do projeto...
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
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    pause
    exit /b 1
)
echo [OK] Estrutura do projeto verificada

echo.
echo [6/7] Iniciando servidor Next.js CORRETAMENTE...
echo.
echo ======================================================================
echo   SERVIDOR INICIANDO EM NOVA JANELA
echo ======================================================================
echo   URL: http://localhost:3000
echo   Aguarde ver "Ready in X.Xs" na janela do servidor
echo   NAO FECHE a janela do servidor!
echo ======================================================================
echo.

REM Iniciar servidor em nova janela
start "=== SERVIDOR LOCALHOST:3000 - NAO FECHE ESTA JANELA ===" cmd /k "npm run dev"

echo.
echo [7/7] Aguardando servidor iniciar COMPLETAMENTE...
echo.

REM Aguardar servidor iniciar - mais tempo
set /a tentativas=0
:wait_server
timeout /t 5 /nobreak >nul
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    set /a tentativas+=1
    if %tentativas% LSS 30 (
        echo Aguardando servidor iniciar... (%tentativas%/30)
        goto wait_server
    ) else (
        echo [AVISO] Servidor demorou muito para iniciar
        echo Verifique a janela do servidor para erros
        echo.
        echo TENTANDO ABRIR NAVEGADOR MESMO ASSIM...
        goto open_browser
    )
) else (
    echo [OK] Servidor detectado na porta 3000!
    echo [OK] Servidor esta RODANDO!
)

:open_browser
echo.
echo Aguardando compilacao completa (40 segundos)...
timeout /t 40 /nobreak >nul

echo.
echo ======================================================================
echo   VERIFICANDO SE SERVIDOR ESTA RODANDO
echo ======================================================================
echo.

netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Servidor NAO esta rodando na porta 3000!
    echo.
    echo PROBLEMAS POSSIVEIS:
    echo   1. Erro de compilacao - Verifique a janela do servidor
    echo   2. Porta bloqueada - Tente reiniciar o PC
    echo   3. Dependencias faltando - Execute: npm install --legacy-peer-deps
    echo.
    echo SOLUCAO:
    echo   1. Verifique a janela "=== SERVIDOR LOCALHOST:3000 ==="
    echo   2. Veja se ha erros em vermelho
    echo   3. Aguarde mais 60 segundos
    echo   4. Tente executar este script novamente
    echo.
) else (
    echo [OK] Servidor CONFIRMADO rodando na porta 3000!
    echo [OK] Abrindo navegador agora...
    echo.
    
    REM Abrir navegador em multiplas formas
    start http://localhost:3000
    timeout /t 2 /nobreak >nul
    start msedge http://localhost:3000 2>nul
    timeout /t 1 /nobreak >nul
    start chrome http://localhost:3000 2>nul
    timeout /t 1 /nobreak >nul
    cmd /c start http://localhost:3000
    timeout /t 1 /nobreak >nul
    rundll32 url.dll,FileProtocolHandler http://localhost:3000
    
    echo [OK] Navegador aberto!
    echo.
    echo Se ainda aparecer "recusou estabelecer ligacao":
    echo   1. Aguarde mais 30 segundos (compilacao pode estar em andamento)
    echo   2. Recarregue a pagina (F5)
    echo   3. Verifique a janela do servidor para ver se compilou
)

echo.
echo ======================================================================
echo   STATUS FINAL
echo ======================================================================
echo.
echo Verificando porta 3000:
netstat -ano | findstr :3000
echo.
echo Se aparecer uma linha acima, o servidor esta rodando!
echo Se nao aparecer nada, o servidor nao esta rodando.
echo.
echo URL: http://localhost:3000
echo.
echo IMPORTANTE:
echo   - Mantenha a janela do servidor aberta
echo   - Aguarde ver "Ready in X.Xs" na janela do servidor
echo   - Depois tente acessar http://localhost:3000
echo.
echo ======================================================================
echo.

pause

