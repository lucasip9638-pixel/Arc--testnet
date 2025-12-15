# 🚀 Deploy do Contrato DailyGM - Guia Rápido

## ⚡ Método Rápido: Remix IDE (5 minutos)

### 1. Abra Remix IDE
👉 https://remix.ethereum.org

### 2. Crie o Arquivo
- Clique em "New File"
- Nome: `DailyGM.sol`
- Cole TODO o conteúdo de `contracts/DailyGM.sol`

### 3. Compile
- Aba "Solidity Compiler" (ícone de compilador à esquerda)
- Versão: `0.8.20`
- Clique em **"Compile DailyGM.sol"**
- Deve aparecer: ✓ compilation successful

### 4. Configure MetaMask
- Abra MetaMask
- Certifique-se de estar na Arc Testnet:
  - Network Name: `Arc Testnet`
  - RPC URL: `https://rpc.testnet.arc.network`
  - Chain ID: `5042002`
  - Currency Symbol: `USDC`
  - Block Explorer: `https://testnet.arcscan.app`
- Certifique-se de ter USDC para gas fees

### 5. Deploy
- Remix → Aba "Deploy & Run Transactions"
- Environment: **"Injected Provider - MetaMask"**
- Certifique-se de estar na Arc Testnet
- **IMPORTANTE**: O contrato DailyGM NÃO precisa de parâmetros no construtor
- Clique em **"Deploy"**
- Confirme no MetaMask
- Aguarde confirmação

### 6. Copie o Endereço
- Após deploy, o contrato aparece em "Deployed Contracts"
- **Copie o endereço** (aparece acima das funções)

### 7. Atualize Frontend Automaticamente
Execute no terminal:
```bash
node scripts/atualizar-daily-gm.js 0x[SEU_ENDERECO_AQUI]
```

Ou atualize manualmente em `lib/daily-gm-contract.ts`:
```typescript
export const DAILY_GM_CONTRACT_ADDRESS = "0x..." as `0x${string}` // Cole o endereço aqui
```

### 8. Pronto!
```bash
npm run dev
```
Acesse: http://localhost:3000 → Aba "Daily GM" → Teste!

---

**Pronto!** 🎉 Seu contrato está deployado e pronto para uso!


