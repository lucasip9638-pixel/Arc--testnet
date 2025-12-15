@echo off
chcp 65001 >nul
title DEPLOY COMPLETO - ARC TESTNET
color 0E
cls

echo.
echo ======================================================================
echo   DEPLOY COMPLETO DOS CONTRATOS PARA ARC TESTNET
echo ======================================================================
echo.

echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

echo.
echo [2/7] Verificando Hardhat...
if not exist "node_modules\hardhat" (
    echo Instalando Hardhat...
    call npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox --legacy-peer-deps
) else (
    echo [OK] Hardhat instalado
)

echo.
echo [3/7] Verificando chave privada...
if not exist ".env" (
    if not exist ".env.deployer" (
        echo.
        echo ======================================================================
        echo   CHAVE PRIVADA NAO ENCONTRADA
        echo ======================================================================
        echo.
        echo Voce precisa configurar sua chave privada para fazer deploy.
        echo.
        echo OPCAO 1: Criar arquivo .env
        echo   Crie um arquivo .env na raiz do projeto com:
        echo   DEPLOYER_PRIVATE_KEY=0xSUA_CHAVE_PRIVADA_AQUI
        echo.
        echo OPCAO 2: Gerar nova carteira
        echo   Execute: npm run generate:wallet
        echo   Isso criara uma nova carteira e mostrara a chave privada
        echo.
        echo IMPORTANTE:
        echo   - Importe a chave privada no MetaMask
        echo   - Financie a carteira com USDC (gas fees)
        echo   - Faucet: https://faucet.circle.com
        echo.
        pause
        exit /b 1
    ) else (
        echo [OK] .env.deployer encontrado
    )
) else (
    echo [OK] .env encontrado
)

echo.
echo [4/7] Compilando contratos...
call npm run compile
if errorlevel 1 (
    echo.
    echo ERRO na compilacao!
    pause
    exit /b 1
)
echo [OK] Contratos compilados!

echo.
echo [5/7] Verificando saldo da carteira...
echo (Verificando se a carteira tem USDC para gas fees...)
echo.

echo.
echo [6/7] Fazendo deploy do TokenSwap...
echo.
echo ======================================================================
echo   DEPLOY DO TOKENSWAP
echo ======================================================================
echo.
call npm run deploy:swap
if errorlevel 1 (
    echo.
    echo ERRO no deploy do TokenSwap!
    echo.
    echo Verifique:
    echo   1. Carteira tem saldo suficiente (USDC para gas)
    echo   2. Chave privada esta correta no .env
    echo   3. Rede Arc Testnet esta acessivel
    echo.
    echo Alternativa: Use Remix IDE
    echo   Veja: scripts/deploy-remix-guide.md
    echo.
    pause
    exit /b 1
)

echo.
echo [7/7] Deploy concluido!
echo.

echo.
echo ======================================================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ======================================================================
echo.
echo Proximos passos:
echo   1. O endereco do contrato foi atualizado automaticamente
echo   2. Financie o contrato com tokens:
echo      - Transfira USDC para o endereco do contrato
echo      - Transfira EURC para o endereco do contrato
echo   3. Teste a aplicacao:
echo      Execute: CONFIGURAR-E-ABRIR-WEB.bat
echo.
echo ======================================================================
echo.

pause


