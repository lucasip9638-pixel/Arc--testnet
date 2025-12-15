@echo off
chcp 65001 >nul
title CONFIGURAR REMOTE DO GITHUB
color 0B
cls

echo.
echo ======================================================================
echo   CONFIGURAR REMOTE DO GITHUB
echo ======================================================================
echo.

echo Este script configura o remote do GitHub e envia o codigo.
echo.

set /p github_url="Cole a URL do seu repositorio GitHub (ex: https://github.com/usuario/repo.git): "

if "%github_url%"=="" (
    echo [ERRO] URL nao fornecida!
    pause
    exit /b 1
)

echo.
echo [1/4] Verificando remote existente...
git remote -v >nul 2>&1
if not errorlevel 1 (
    echo [AVISO] Remote ja existe. Deseja substituir? (S/N)
    set /p replace="> "
    if /i "%replace%"=="S" (
        call git remote remove origin
        echo [OK] Remote removido
    ) else (
        echo Operacao cancelada.
        pause
        exit /b 0
    )
)

echo.
echo [2/4] Adicionando remote...
call git remote add origin "%github_url%"
if errorlevel 1 (
    echo [ERRO] Falha ao adicionar remote!
    pause
    exit /b 1
)
echo [OK] Remote adicionado: %github_url%

echo.
echo [3/4] Configurando branch principal...
call git branch -M main
if errorlevel 1 (
    echo [AVISO] Falha ao renomear branch (pode ja estar como main)
)

echo.
echo [4/4] Enviando codigo para GitHub...
echo.
echo IMPORTANTE: Voce precisara autenticar no GitHub!
echo - Se usar HTTPS, precisara de um Personal Access Token
echo - Se usar SSH, precisa ter chave SSH configurada
echo.
echo Tentando enviar...
call git push -u origin main
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao enviar para GitHub!
    echo.
    echo POSSIVEIS SOLUCOES:
    echo 1. Verifique se a URL esta correta
    echo 2. Verifique suas credenciais do GitHub
    echo 3. Se usar HTTPS, crie um Personal Access Token:
    echo    https://github.com/settings/tokens
    echo 4. Ou configure SSH:
    echo    https://docs.github.com/en/authentication/connecting-to-github-with-ssh
    echo.
) else (
    echo.
    echo ======================================================================
    echo   CODIGO ENVIADO COM SUCESSO PARA GITHUB!
    echo ======================================================================
    echo.
    echo Repositorio: %github_url%
    echo Branch: main
    echo.
    echo Para atualizar no futuro, use:
    echo   git add .
    echo   git commit -m "Sua mensagem"
    echo   git push
    echo.
)

pause

