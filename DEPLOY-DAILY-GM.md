# 🚀 Deploy do Contrato DailyGM

## Guia Rápido para Deploy

### Opção 1: Remix IDE (Mais Fácil)

1. **Acesse Remix IDE:**
   - Vá para: https://remix.ethereum.org

2. **Crie o arquivo:**
   - Na pasta `contracts`, crie: `DailyGM.sol`
   - Cole o conteúdo de `contracts/DailyGM.sol`

3. **Compile:**
   - Vá para aba "Solidity Compiler"
   - Versão: `0.8.20`
   - Clique em "Compile DailyGM.sol"

4. **Configure MetaMask:**
   - Certifique-se de estar na Arc Testnet:
     - Network Name: `Arc Testnet`
     - RPC URL: `https://rpc.testnet.arc.network`
     - Chain ID: `5042002`
     - Currency Symbol: `USDC`
     - Block Explorer: `https://testnet.arcscan.app`

5. **Deploy:**
   - Vá para aba "Deploy & Run Transactions"
   - Environment: **"Injected Provider - MetaMask"**
   - Certifique-se de estar na Arc Testnet
   - Clique em **"Deploy"** (não precisa de parâmetros)
   - Confirme no MetaMask

6. **Copie o endereço:**
   - Após deploy, o contrato aparece em "Deployed Contracts"
   - **Copie o endereço** (aparece acima das funções)

7. **Atualize o Frontend:**
   - Abra `lib/daily-gm-contract.ts`
   - Substitua:
     ```typescript
     export const DAILY_GM_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"
     ```
   - Por:
     ```typescript
     export const DAILY_GM_CONTRACT_ADDRESS = "0x..." // Cole o endereço aqui
     ```

8. **Pronto!**
   - Reinicie o servidor: `npm run dev`
   - A funcionalidade GM agora está conectada à blockchain!

### Opção 2: Hardhat

1. **Compile o contrato:**
   ```bash
   npx hardhat compile
   ```

2. **Crie um script de deploy:**
   ```javascript
   // scripts/deploy-daily-gm.js
   const hre = require("hardhat");

   async function main() {
     const DailyGM = await hre.ethers.getContractFactory("DailyGM");
     const dailyGM = await DailyGM.deploy();
     await dailyGM.waitForDeployment();
     const address = await dailyGM.getAddress();
     console.log("DailyGM deployed to:", address);
   }

   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   ```

3. **Execute o deploy:**
   ```bash
   npx hardhat run scripts/deploy-daily-gm.js --network arcTestnet
   ```

4. **Atualize o frontend** (mesmo processo da Opção 1, passo 7)

## ✅ Verificação

Após o deploy:

1. Acesse: https://testnet.arcscan.app/address/[ENDEREÇO_DO_CONTRATO]
2. Você deve ver o contrato deployado
3. No dApp, a funcionalidade GM deve funcionar e mostrar transações reais

## 📝 Notas

- O contrato DailyGM não precisa de parâmetros no construtor
- Você precisa de USDC na carteira para pagar gas fees
- Cada GM custa apenas o gas fee (muito baixo na Arc Testnet)


