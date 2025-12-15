@echo off
title SERVIDOR NEXT.JS - MANTER ABERTO
color 0A
cls
echo.
echo ========================================
echo   INICIANDO SERVIDOR NEXT.JS
echo ========================================
echo.
echo IMPORTANTE: Esta janela DEVE permanecer aberta!
echo.
echo O servidor estara disponivel em:
echo   http://localhost:3000
echo.
echo Aguarde a mensagem "Ready in X.Xs"
echo Depois abra seu navegador e acesse o link acima
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.
echo ========================================
echo.

REM Parar processos antigos
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Iniciar servidor (esta janela ficara aberta)
npm run dev

pause

