@echo off
chcp 65001 >nul
echo ======================================================================
echo   DEPLOY COMPLETO DO CONTRATO TOKENSWAP
echo ======================================================================
echo.

echo [1/5] Verificando carteira...
if not exist ".env.deployer" (
    echo Gerando nova carteira...
    call node scripts/deploy-completo-automatico.js
    echo.
    echo IMPORTANTE: Importe a chave privada no MetaMask e financie a carteira!
    echo Pressione qualquer tecla após fazer isso...
    pause >nul
)

echo.
echo [2/5] Verificando Hardhat...
call npm list hardhat >nul 2>&1
if errorlevel 1 (
    echo Instalando Hardhat...
    call npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
)

echo.
echo [3/5] Compilando contrato...
call npm run compile
if errorlevel 1 (
    echo.
    echo ERRO na compilação. Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo [4/5] Configurando .env...
if not exist ".env" (
    echo Criando .env a partir de .env.deployer...
    copy ".env.deployer" ".env" >nul
    echo .env criado!
)

echo.
echo [5/5] Fazendo deploy...
call npm run deploy:swap
if errorlevel 1 (
    echo.
    echo ERRO no deploy. Verifique:
    echo 1. Carteira tem saldo suficiente (USDC para gas)
    echo 2. Chave privada está correta no .env
    echo 3. Rede Arc Testnet está acessível
    echo.
    echo Alternativa: Use Remix IDE (veja scripts/deploy-remix-guide.md)
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo   ✅ DEPLOY CONCLUÍDO!
echo ======================================================================
echo.
echo Próximos passos:
echo 1. Financie o contrato com USDC e EURC
echo 2. Teste a aplicação: npm run dev
echo.
pause

