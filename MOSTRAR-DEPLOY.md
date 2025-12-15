# 🚀 GUIA DE DEPLOY - ARC TESTNET

## 📋 Scripts de Deploy Disponíveis

### 1. **TokenSwap Contract**

#### Opção A: Deploy via Hardhat (Recomendado)
```bash
npm run deploy:swap
```
**Script:** `scripts/deploy-swap-hardhat.js`

**O que faz:**
- Compila o contrato TokenSwap
- Faz deploy na Arc Testnet
- Atualiza automaticamente `lib/swap-contract.ts` com o endereço
- Mostra o endereço do contrato e link do explorer

**Requisitos:**
- Arquivo `.env` com `DEPLOYER_PRIVATE_KEY=0x...`
- Carteira com saldo de USDC para gas fees

#### Opção B: Deploy via Script Batch
```bash
DEPLOY-COMPLETO.bat
```
**Script:** `DEPLOY-COMPLETO.bat`

**O que faz:**
- Verifica todas as dependências
- Compila os contratos
- Faz deploy do TokenSwap
- Atualiza automaticamente os arquivos de configuração

---

### 2. **DailyGM Contract**

#### Opção A: Deploy via Remix IDE (Mais Fácil)
1. Acesse: https://remix.ethereum.org
2. Crie arquivo `DailyGM.sol`
3. Cole o código de `contracts/DailyGM.sol`
4. Compile (Solidity 0.8.20)
5. Conecte MetaMask na Arc Testnet
6. Deploy (sem parâmetros no construtor)
7. Copie o endereço do contrato
8. Execute: `node scripts/atualizar-daily-gm.js [ENDERECO]`

#### Opção B: Deploy via Script
```bash
node scripts/deploy-daily-gm-viem.js
```
**Script:** `scripts/deploy-daily-gm-viem.js`

**Requisitos:**
- Arquivo `.env.deployer` com `DEPLOYER_PRIVATE_KEY=0x...`
- Carteira com saldo de USDC

---

## 🔧 Configuração Inicial

### 1. Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
DEPLOYER_PRIVATE_KEY=0xSUA_CHAVE_PRIVADA_AQUI
```

**⚠️ IMPORTANTE:**
- Nunca compartilhe sua chave privada
- Não commite o arquivo `.env` no Git
- Use uma carteira de teste apenas

### 2. Gerar Nova Carteira (Opcional)

Se você não tem uma carteira:

```bash
npm run generate:wallet
```

Isso criará uma nova carteira e mostrará:
- Endereço da carteira
- Chave privada
- QR Code (se disponível)

**Próximos passos:**
1. Importe a chave privada no MetaMask
2. Financie a carteira com USDC
3. Faucet: https://faucet.circle.com

---

## 📝 Endereços dos Contratos

### TokenSwap
- **Arquivo:** `lib/swap-contract.ts`
- **Variável:** `SWAP_CONTRACT_ADDRESS`
- **Atualização:** Automática após deploy

### DailyGM
- **Arquivo:** `lib/daily-gm-contract.ts`
- **Variável:** `DAILY_GM_CONTRACT_ADDRESS`
- **Atualização:** Manual ou via script `atualizar-daily-gm.js`

---

## 🌐 Endereços dos Tokens (Arc Testnet)

- **USDC:** `0x3600000000000000000000000000000000000000`
- **EURC:** `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

---

## 📦 Scripts Disponíveis

### Deploy
- `DEPLOY-COMPLETO.bat` - Deploy completo automatizado
- `npm run deploy:swap` - Deploy do TokenSwap via Hardhat
- `scripts/deploy-swap-hardhat.js` - Script Hardhat
- `scripts/deploy-daily-gm-viem.js` - Script DailyGM via Viem

### Utilitários
- `npm run generate:wallet` - Gerar nova carteira
- `npm run compile` - Compilar contratos
- `scripts/atualizar-daily-gm.js` - Atualizar endereço DailyGM

---

## ✅ Checklist de Deploy

Antes de fazer deploy:

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado com `DEPLOYER_PRIVATE_KEY`
- [ ] Carteira importada no MetaMask
- [ ] Carteira financiada com USDC (gas fees)
- [ ] MetaMask conectado na Arc Testnet
- [ ] Contratos compilados (`npm run compile`)

---

## 🚨 Resolução de Problemas

### Erro: "Carteira sem saldo"
**Solução:** Financie a carteira com USDC
- Faucet: https://faucet.circle.com
- Endereço da carteira: Veja no MetaMask

### Erro: "Chave privada não encontrada"
**Solução:** Crie arquivo `.env` com:
```env
DEPLOYER_PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
```

### Erro: "Rede não acessível"
**Solução:** Verifique se a Arc Testnet está configurada no MetaMask
- Chain ID: 5042002
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app

### Erro na compilação
**Solução:** 
1. Limpe o cache: `rm -rf cache artifacts`
2. Recompile: `npm run compile`

---

## 📚 Links Úteis

- **Arc Testnet Explorer:** https://testnet.arcscan.app
- **Remix IDE:** https://remix.ethereum.org
- **Faucet USDC:** https://faucet.circle.com
- **Documentação Hardhat:** https://hardhat.org/docs

---

## 🎯 Próximos Passos Após Deploy

1. **Financiar Contratos:**
   - TokenSwap precisa de USDC e EURC para permitir swaps
   - Transfira tokens para o endereço do contrato

2. **Testar Aplicação:**
   ```bash
   CONFIGURAR-E-ABRIR-WEB.bat
   ```
   - Acesse: http://localhost:3000
   - Conecte MetaMask
   - Teste swaps e DailyGM

3. **Verificar no Explorer:**
   - Acesse: https://testnet.arcscan.app
   - Cole o endereço do contrato
   - Verifique transações e estado

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs de erro
2. Confirme que a carteira tem saldo
3. Verifique a configuração da rede
4. Tente usar Remix IDE como alternativa


