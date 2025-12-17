@echo off
chcp 65001 >nul
title VERIFICANDO ERROS DE COMPILACAO
color 0E
cls

echo.
echo ======================================================================
echo   VERIFICANDO ERROS DE COMPILACAO
echo ======================================================================
echo.

echo Limpando cache...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist ".turbo" rmdir /s /q ".turbo" >nul 2>&1

echo.
echo Verificando TypeScript...
npx tsc --noEmit --skipLibCheck >erros-typescript.txt 2>&1
if errorlevel 1 (
    echo [ERRO] Erros de TypeScript encontrados!
    echo.
    echo Primeiros erros encontrados:
    type erros-typescript.txt | findstr /C:"error TS" | more
    echo.
    echo Arquivo completo salvo em: erros-typescript.txt
) else (
    echo [OK] Sem erros de TypeScript
    del erros-typescript.txt >nul 2>&1
)

echo.
echo Tentando compilar Next.js...
echo (Isso pode demorar alguns minutos)
echo.
npx next build >erros-build.txt 2>&1
if errorlevel 1 (
    echo [ERRO] Erros de build encontrados!
    echo.
    echo Primeiros erros encontrados:
    type erros-build.txt | findstr /C:"Error" /C:"error" /C:"Failed" | more
    echo.
    echo Arquivo completo salvo em: erros-build.txt
) else (
    echo [OK] Build concluido com sucesso!
    del erros-build.txt >nul 2>&1
)

echo.
echo ======================================================================
echo   VERIFICACAO CONCLUIDA
echo ======================================================================
echo.
echo Se houver erros, verifique os arquivos:
echo   - erros-typescript.txt
echo   - erros-build.txt
echo.
pause

