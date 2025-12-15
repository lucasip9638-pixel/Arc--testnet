# 🚀 Deploy Rápido - Remix IDE

Como o Hardhat requer configuração ESM e sua carteira já tem USDC, a forma mais rápida é usar **Remix IDE**:

## Passo a Passo:

### 1. Acesse Remix IDE
- Vá para: https://remix.ethereum.org

### 2. Crie o Arquivo
- Na pasta `contracts`, clique em "New File"
- Nome: `TokenSwap.sol`
- Cole o conteúdo completo de `contracts/TokenSwap.sol`

### 3. Compile
- Vá para aba "Solidity Compiler" (ícone de compilador)
- Selecione versão: `0.8.20` ou superior
- Clique em "Compile TokenSwap.sol"
- Verifique se aparece "✓ compilation successful"

### 4. Configure MetaMask
- Certifique-se de estar na **Arc Testnet**:
  - Network Name: `Arc Testnet`
  - RPC URL: `https://rpc.testnet.arc.network`
  - Chain ID: `5042002`
  - Currency Symbol: `USDC`
  - Block Explorer: `https://testnet.arcscan.app`

### 5. Importe sua Carteira no MetaMask
- Abra MetaMask
- Clique em "Importar conta"
- Cole a chave privada do arquivo `.env.deployer`
- Certifique-se de que a carteira tem USDC

### 6. Deploy
- Vá para aba "Deploy & Run Transactions"
- Em "Environment", selecione: **"Injected Provider - MetaMask"**
- Certifique-se de estar na Arc Testnet
- No campo "Deploy", você verá o construtor do contrato
- Preencha os parâmetros:
  ```
  _usdc: 0x3600000000000000000000000000000000000000
  _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
  ```
- Clique em **"Deploy"**
- Confirme a transação no MetaMask
- Aguarde a confirmação

### 7. Copie o Endereço do Contrato
- Após o deploy, o contrato aparecerá em "Deployed Contracts"
- Clique para expandir
- **Copie o endereço do contrato** (aparece acima das funções)

### 8. Atualize o Frontend
- Abra `lib/swap-contract.ts`
- Substitua:
  ```typescript
  export const SWAP_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`
  ```
- Por:
  ```typescript
  export const SWAP_CONTRACT_ADDRESS = "0x..." as `0x${string}` // Cole o endereço aqui
  ```

### 9. Financie o Contrato
- O contrato precisa ter USDC e EURC para permitir swaps
- Transfira tokens para o endereço do contrato:
  - Use MetaMask para enviar USDC
  - Use MetaMask para enviar EURC
  - Ou use o frontend após conectar a carteira

### 10. Teste!
- Execute: `npm run dev`
- Acesse: http://localhost:3000
- Conecte MetaMask
- Vá para aba "Swap"
- Teste um swap!

---

**Tempo estimado: 5-10 minutos** ⚡

