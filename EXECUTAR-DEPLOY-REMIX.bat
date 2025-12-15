@echo off
chcp 65001 >nul
echo ======================================================================
echo   ABRINDO REMIX IDE PARA DEPLOY
echo ======================================================================
echo.
echo Abrindo Remix IDE no navegador...
echo.
start https://remix.ethereum.org
echo.
echo Aguarde 5 segundos para o Remix carregar...
timeout /t 5 /nobreak >nul
echo.
echo Abrindo guia de deploy...
start ABRIR-REMIX-E-DEPLOY.html
echo.
echo ======================================================================
echo   INSTRUÇÕES
echo ======================================================================
echo.
echo 1. No Remix IDE:
echo    - Crie arquivo TokenSwap.sol
echo    - Cole o código de TOKENSWAP-PARA-REMIX.sol
echo    - Compile (Solidity 0.8.20)
echo.
echo 2. Configure MetaMask:
echo    - Importe sua carteira (chave do .env.deployer)
echo    - Adicione Arc Testnet (Chain ID: 5042002)
echo    - Certifique-se de estar na Arc Testnet
echo.
echo 3. Deploy:
echo    - Remix: Deploy ^& Run Transactions
echo    - Environment: Injected Provider - MetaMask
echo    - Parâmetros:
echo      _usdc: 0x3600000000000000000000000000000000000000
echo      _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
echo    - Clique em Deploy
echo.
echo 4. Após deploy:
echo    - Copie o endereço do contrato
echo    - Atualize lib/swap-contract.ts
echo    - Financie o contrato com USDC e EURC
echo.
echo Veja o guia visual: ABRIR-REMIX-E-DEPLOY.html
echo.
pause

