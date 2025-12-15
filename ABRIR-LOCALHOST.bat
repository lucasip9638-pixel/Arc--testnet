@echo off
chcp 65001 >nul
echo Aguardando servidor iniciar...
timeout /t 10 /nobreak >nul
start http://localhost:3000
echo Navegador aberto em http://localhost:3000

