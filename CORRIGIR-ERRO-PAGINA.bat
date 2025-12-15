@echo off
chcp 65001 >nul
echo ======================================================================
echo   CORRIGINDO ERRO DE CARREGAMENTO DA PÁGINA
echo ======================================================================
echo.

echo [1/3] Parando servidor existente...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Limpando cache do Next.js...
if exist ".next" rmdir /s /q ".next"
echo Cache limpo!

echo [3/3] Reiniciando servidor...
start cmd /k "npm run dev"

echo.
echo ======================================================================
echo   SERVIDOR REINICIADO
echo ======================================================================
echo.
echo Aguarde alguns segundos e acesse: http://localhost:3000
echo.
echo Se ainda houver erro, verifique o console do navegador (F12)
echo.
pause

