@echo off
chcp 65001 >nul
title ENVIANDO PROJETO PARA GITHUB
color 0B
cls

echo.
echo ======================================================================
echo   ENVIANDO PROJETO PARA GITHUB
echo ======================================================================
echo.

echo [1/7] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git nao encontrado!
    echo Instale Git de: https://git-scm.com/download/win
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('git --version') do echo [OK] %%v

echo.
echo [2/7] Verificando se Git esta inicializado...
if not exist ".git" (
    echo [AVISO] Git nao inicializado, inicializando...
    call git init
    if errorlevel 1 (
        echo [ERRO] Falha ao inicializar Git!
        pause
        exit /b 1
    )
    echo [OK] Git inicializado
) else (
    echo [OK] Git ja inicializado
)

echo.
echo [3/7] Verificando .gitignore...
if not exist ".gitignore" (
    echo [AVISO] .gitignore nao encontrado, criando...
    (
        echo node_modules/
        echo .next/
        echo .turbo/
        echo .env
        echo .env.local
        echo .env*.local
        echo dist/
        echo build/
        echo *.log
        echo .DS_Store
        echo *.tsbuildinfo
        echo coverage/
        echo .cache/
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo *~
        echo .vercel
        echo .netlify
    ) > .gitignore
    echo [OK] .gitignore criado
) else (
    echo [OK] .gitignore encontrado
)

echo.
echo [4/7] Adicionando arquivos ao Git...
call git add .
if errorlevel 1 (
    echo [ERRO] Falha ao adicionar arquivos!
    pause
    exit /b 1
)
echo [OK] Arquivos adicionados

echo.
echo [5/7] Verificando status...
git status --short
echo.

echo [6/7] Fazendo commit inicial...
set /p commit_message="Digite a mensagem do commit (ou pressione Enter para usar padrao): "
if "!commit_message!"=="" set commit_message="Initial commit: Arc DeFi Hub - GM and Swap dApp"

call git commit -m "%commit_message%"
if errorlevel 1 (
    echo [AVISO] Nenhum arquivo novo para commitar ou commit ja existe
) else (
    echo [OK] Commit realizado
)

echo.
echo [7/7] Configurando GitHub...
echo.
echo ======================================================================
echo   PROXIMOS PASSOS
echo ======================================================================
echo.
echo 1. Crie um repositorio no GitHub:
echo    - Acesse: https://github.com/new
echo    - Escolha um nome para o repositorio
echo    - NAO marque "Initialize with README"
echo    - Clique em "Create repository"
echo.
echo 2. Copie a URL do repositorio (exemplo):
echo    https://github.com/seu-usuario/nome-do-repositorio.git
echo.
echo 3. Execute os comandos abaixo (substitua pela URL do seu repositorio):
echo.
echo    git remote add origin https://github.com/seu-usuario/nome-do-repositorio.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo OU execute o script: CONFIGURAR-GITHUB-REMOTE.bat
echo.
echo ======================================================================
echo.

pause

