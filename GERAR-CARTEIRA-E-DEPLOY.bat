@echo off
chcp 65001 >nul
echo ======================================================================
echo   GERAR CARTEIRA E FAZER DEPLOY DO CONTRATO TOKENSWAP
echo ======================================================================
echo.

echo [1/4] Gerando nova carteira...
node scripts/gerar-carteira.js
if errorlevel 1 (
    echo.
    echo ERRO: Falha ao gerar carteira
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando Hardhat...
if exist "node_modules\hardhat" (
    echo Hardhat encontrado!
    echo.
    echo [3/4] Compilando contrato...
    call npm run compile
    if errorlevel 1 (
        echo.
        echo AVISO: Falha na compilação. Use Remix IDE como alternativa.
        echo.
    ) else (
        echo.
        echo [4/4] Fazendo deploy...
        echo.
        echo IMPORTANTE: Configure a chave privada no arquivo .env:
        echo   DEPLOYER_PRIVATE_KEY=0x...
        echo.
        echo Depois execute: npm run deploy:swap
        echo.
    )
) else (
    echo.
    echo Hardhat não encontrado. Use Remix IDE para deploy:
    echo.
    echo 1. Acesse: https://remix.ethereum.org
    echo 2. Crie arquivo TokenSwap.sol
    echo 3. Cole o código de contracts/TokenSwap.sol
    echo 4. Compile com Solidity 0.8.20
    echo 5. Deploy com MetaMask na Arc Testnet
    echo 6. Use os parâmetros:
    echo    - USDC: 0x3600000000000000000000000000000000000000
    echo    - EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
    echo.
)

echo.
echo ======================================================================
echo   PRÓXIMOS PASSOS
echo ======================================================================
echo.
echo 1. Financie a carteira com USDC (faucet: https://faucet.circle.com)
echo 2. Faça o deploy do contrato (Hardhat ou Remix)
echo 3. Atualize lib/swap-contract.ts com o endereço do contrato
echo 4. Financie o contrato com USDC e EURC para permitir swaps
echo 5. Teste a aplicação!
echo.
pause

