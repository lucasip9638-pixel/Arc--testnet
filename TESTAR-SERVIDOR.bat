@echo off
chcp 65001 >nul
title TESTANDO SERVIDOR
color 0E
cls

echo.
echo ======================================================================
echo   TESTANDO SE O SERVIDOR ESTA FUNCIONANDO
echo ======================================================================
echo.

echo Verificando se ha processo Node.js rodando...
tasklist | findstr /i "node.exe" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Nenhum processo Node.js encontrado
    echo O servidor nao esta rodando!
    echo.
    echo Execute: INICIAR-LOCALHOST-FUNCIONAR-AGORA.bat
) else (
    echo [OK] Processo Node.js encontrado
    echo.
    echo Verificando porta 3000...
    netstat -ano | findstr ":3000" >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] Nenhum servidor na porta 3000
    ) else (
        echo [OK] Servidor detectado na porta 3000
        echo.
        echo Tentando abrir navegador...
        start http://localhost:3000
        echo.
        echo Se a pagina nao carregar, verifique a janela do servidor para erros
    )
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul

