@echo off
chcp 65001 >nul
echo ======================================================================
echo   VERIFICANDO STATUS DO SERVIDOR
echo ======================================================================
echo.

echo Verificando se o servidor esta rodando na porta 3000...
netstat -ano | findstr :3000
if errorlevel 1 (
    echo.
    echo SERVIDOR NAO ESTA RODANDO!
    echo.
    echo Iniciando servidor...
    start cmd /k "npm run dev"
    echo.
    echo Aguarde 10-15 segundos e execute este script novamente.
) else (
    echo.
    echo SERVIDOR ESTA RODANDO!
    echo.
    echo Abrindo navegador...
    start http://localhost:3000
    echo.
    echo Acesse: http://localhost:3000
)

echo.
pause

