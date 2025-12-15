# Guia de Deploy do Contrato TokenSwap

## 📋 Pré-requisitos

1. **Hardhat ou Foundry** instalado
2. **Carteira** com USDC para gas na Arc Testnet
3. **Endereços dos tokens** USDC e EURC na Arc Testnet

## 🚀 Deploy com Hardhat

### 1. Instalar dependências

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Criar `hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: [process.env.PRIVATE_KEY], // Sua chave privada
    },
  },
};
```

### 3. Script de Deploy

Crie `scripts/deploy-swap.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Substitua pelos endereços reais dos tokens
  const USDC_ADDRESS = "0x..."; // Endereço do USDC na Arc Testnet
  const EURC_ADDRESS = "0x..."; // Endereço do EURC na Arc Testnet

  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(USDC_ADDRESS, EURC_ADDRESS);

  await tokenSwap.waitForDeployment();

  const address = await tokenSwap.getAddress();
  console.log("TokenSwap deployed to:", address);
  console.log("USDC address:", USDC_ADDRESS);
  console.log("EURC address:", EURC_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Executar Deploy

```bash
npx hardhat run scripts/deploy-swap.js --network arcTestnet
```

### 5. Atualizar Frontend

Após o deploy, atualize:

1. **`lib/swap-contract.ts`**:
   ```typescript
   export const SWAP_CONTRACT_ADDRESS = "0x..." as `0x${string}` // Endereço do contrato deployado
   ```

2. **`lib/tokens.ts`**:
   ```typescript
   export const TOKENS = {
     USDC: {
       address: "0x..." as `0x${string}`, // Endereço real do USDC
       // ...
     },
     EURC: {
       address: "0x..." as `0x${string}`, // Endereço real do EURC
       // ...
     },
   }
   ```

## 🚀 Deploy com Foundry

### 1. Instalar Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Criar projeto (se necessário)

```bash
forge init
```

### 3. Copiar contrato

Copie `contracts/TokenSwap.sol` para `src/TokenSwap.sol`

### 4. Script de Deploy

Crie `script/DeploySwap.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {TokenSwap} from "../src/TokenSwap.sol";

contract DeploySwap is Script {
    function run() external {
        address usdc = vm.envAddress("USDC_ADDRESS");
        address eurc = vm.envAddress("EURC_ADDRESS");
        
        vm.startBroadcast();
        TokenSwap swap = new TokenSwap(usdc, eurc);
        vm.stopBroadcast();
        
        console.log("TokenSwap deployed at:", address(swap));
    }
}
```

### 5. Executar Deploy

```bash
forge script script/DeploySwap.s.sol:DeploySwap \
  --rpc-url https://rpc.testnet.arc.network \
  --broadcast \
  --verify \
  --chain-id 5042002 \
  --private-key $PRIVATE_KEY
```

## ✅ Verificação

Após o deploy:

1. Verifique o contrato no explorer: https://testnet.arcscan.app
2. Confirme que o contrato foi deployado corretamente
3. Verifique os endereços de USDC e EURC no contrato
4. Teste uma transação pequena primeiro

## 🔧 Configuração Pós-Deploy

### Fundar o Contrato

O contrato precisa ter tokens para fazer swaps:

1. **Para swap USDC → EURC**: O contrato precisa ter EURC
2. **Para swap EURC → USDC**: O contrato precisa ter USDC

Você pode transferir tokens diretamente para o endereço do contrato ou usar a função `withdrawTokens` (apenas owner) para gerenciar.

### Configurar Taxa de Câmbio (Opcional)

Como owner, você pode atualizar a taxa de câmbio:

```javascript
await tokenSwap.setExchangeRate(1000000); // 1:1 (com 6 decimais)
```

### Configurar Taxa de Swap (Opcional)

```javascript
await tokenSwap.setSwapFee(30); // 0.3% (30 basis points)
```

## 📝 Notas Importantes

- ⚠️ **Segurança**: Nunca compartilhe sua chave privada
- ⚠️ **Testnet**: Este contrato é para testnet apenas
- ⚠️ **Fundos**: O contrato precisa ter liquidez (tokens) para funcionar
- ✅ **Verificação**: Sempre verifique o contrato no explorer após deploy

