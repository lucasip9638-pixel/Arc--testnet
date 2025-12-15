# 🚀 FAZER DEPLOY AGORA - Guia Rápido

Sua carteira já tem USDC! Siga estes passos para fazer o deploy:

## ⚡ Método Rápido: Remix IDE (5 minutos)

### 1. Abra Remix IDE
👉 https://remix.ethereum.org

### 2. Crie o Arquivo
- Clique em "New File"
- Nome: `TokenSwap.sol`
- Cole TODO o conteúdo de `contracts/TokenSwap.sol`

### 3. Compile
- Aba "Solidity Compiler" (ícone de compilador à esquerda)
- Versão: `0.8.20`
- Clique em **"Compile TokenSwap.sol"**
- Deve aparecer: ✓ compilation successful

### 4. Configure MetaMask
- Abra MetaMask
- Importe sua carteira (chave privada do `.env.deployer`)
- Adicione Arc Testnet:
  - Network Name: `Arc Testnet`
  - RPC URL: `https://rpc.testnet.arc.network`
  - Chain ID: `5042002`
  - Currency Symbol: `USDC`
  - Block Explorer: `https://testnet.arcscan.app`
- Certifique-se de estar na Arc Testnet

### 5. Deploy
- Remix → Aba "Deploy & Run Transactions"
- Environment: **"Injected Provider - MetaMask"**
- No campo "Deploy", você verá o construtor
- Preencha:
  ```
  _usdc: 0x3600000000000000000000000000000000000000
  _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
  ```
- Clique em **"Deploy"**
- Confirme no MetaMask
- Aguarde confirmação

### 6. Copie o Endereço
- Após deploy, o contrato aparece em "Deployed Contracts"
- **Copie o endereço** (aparece acima das funções)

### 7. Atualize Frontend
Abra `lib/swap-contract.ts` e substitua:

```typescript
export const SWAP_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`
```

Por:

```typescript
export const SWAP_CONTRACT_ADDRESS = "0x..." as `0x${string}` // Cole o endereço aqui
```

### 8. Financie o Contrato
O contrato precisa ter USDC e EURC para swaps:
- Transfira USDC para o endereço do contrato
- Transfira EURC para o endereço do contrato

### 9. Teste!
```bash
npm run dev
```
Acesse: http://localhost:3000 → Aba "Swap" → Teste!

---

**Pronto!** 🎉 Seu contrato está deployado e pronto para uso!

