# 🚀 Guia Completo de Deploy do Contrato TokenSwap

## ✅ O que já foi feito:

1. ✅ **Carteira gerada** - Chave privada criada e salva em `.env.deployer`
2. ✅ **Hardhat configurado** - Pronto para compilar e fazer deploy
3. ✅ **Scripts criados** - Automação completa disponível

## 📋 Próximos Passos:

### Opção 1: Deploy Automático com Hardhat (Recomendado)

1. **Importe a carteira no MetaMask:**
   - Abra MetaMask
   - Clique em "Importar conta"
   - Cole a chave privada do arquivo `.env.deployer`
   - Anote o endereço da carteira

2. **Adicione Arc Testnet ao MetaMask:**
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Currency Symbol: `USDC`
   - Block Explorer: `https://testnet.arcscan.app`

3. **Financie a carteira:**
   - Acesse: https://faucet.circle.com
   - Conecte MetaMask
   - Solicite USDC de teste
   - Aguarde confirmação

4. **Configure o .env:**
   ```bash
   # Copie a chave privada de .env.deployer para .env
   DEPLOYER_PRIVATE_KEY=0x... (do arquivo .env.deployer)
   ```

5. **Execute o deploy:**
   ```bash
   # Compilar contrato
   npm run compile

   # Fazer deploy
   npm run deploy:swap
   ```

   OU execute tudo de uma vez:
   ```bash
   scripts\deploy-tudo.bat
   ```

6. **Após o deploy:**
   - O script atualizará automaticamente `lib/swap-contract.ts`
   - Financie o contrato com USDC e EURC (o contrato precisa ter tokens para permitir swaps)
   - Teste a aplicação: `npm run dev`

### Opção 2: Deploy via Remix IDE (Mais Fácil)

1. **Acesse Remix IDE:**
   - Vá para: https://remix.ethereum.org

2. **Crie o arquivo:**
   - Na pasta `contracts`, crie: `TokenSwap.sol`
   - Cole o conteúdo de `contracts/TokenSwap.sol`

3. **Compile:**
   - Vá para aba "Solidity Compiler"
   - Versão: `0.8.20`
   - Clique em "Compile TokenSwap.sol"

4. **Deploy:**
   - Vá para aba "Deploy & Run Transactions"
   - Environment: "Injected Provider - MetaMask"
   - Certifique-se de estar na Arc Testnet
   - No campo "Deploy", insira:
     ```
     _usdc: 0x3600000000000000000000000000000000000000
     _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
     ```
   - Clique em "Deploy"
   - Confirme no MetaMask

5. **Atualize o frontend:**
   - Copie o endereço do contrato deployado
   - Atualize `lib/swap-contract.ts`:
     ```typescript
     export const SWAP_CONTRACT_ADDRESS = "0x..." as `0x${string}`
     ```

6. **Financie o contrato:**
   - Transfira USDC para o endereço do contrato
   - Transfira EURC para o endereço do contrato

## 📝 Informações Importantes:

### Endereços dos Tokens (Arc Testnet):
- **USDC**: `0x3600000000000000000000000000000000000000`
- **EURC**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

### Chave Privada:
- Está salva em `.env.deployer`
- **NUNCA** compartilhe ou commite esta chave!
- Use apenas para deploy na testnet

### Após o Deploy:

1. **Financie o contrato:**
   - O contrato precisa ter USDC e EURC para permitir swaps
   - Transfira tokens para o endereço do contrato

2. **Teste a aplicação:**
   ```bash
   npm run dev
   ```
   - Acesse: http://localhost:3000
   - Conecte MetaMask
   - Vá para aba "Swap"
   - Teste um swap!

## 🔧 Troubleshooting:

- **Erro "insufficient funds"**: Financie a carteira com USDC
- **Erro "contract not found"**: Verifique se o endereço está correto em `lib/swap-contract.ts`
- **Swap falha**: O contrato precisa ter tokens (USDC e EURC)
- **Hardhat não compila**: Verifique se todas as dependências estão instaladas

## 📚 Arquivos Úteis:

- `scripts/deploy-remix-guide.md` - Guia detalhado para Remix
- `scripts/deploy-swap-hardhat.ts` - Script de deploy Hardhat
- `scripts/deploy-completo-automatico.js` - Gera carteira
- `.env.deployer` - Chave privada gerada

## ✅ Checklist Final:

- [ ] Carteira importada no MetaMask
- [ ] Arc Testnet adicionada ao MetaMask
- [ ] Carteira financiada com USDC
- [ ] Contrato deployado
- [ ] `lib/swap-contract.ts` atualizado
- [ ] Contrato financiado com USDC e EURC
- [ ] Aplicação testada

---

**Pronto!** Após completar estes passos, sua aplicação estará totalmente funcional! 🎉

