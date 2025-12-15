# Guia de Deploy via Remix IDE

## Passo a Passo Completo

### 1. Preparação
- Tenha MetaMask instalado
- Adicione a Arc Testnet ao MetaMask:
  - Network Name: Arc Testnet
  - RPC URL: https://rpc.testnet.arc.network
  - Chain ID: 5042002
  - Currency Symbol: USDC
  - Block Explorer: https://testnet.arcscan.app

### 2. Obter USDC de Teste
- Acesse: https://faucet.circle.com
- Conecte sua carteira MetaMask
- Solicite USDC de teste
- Aguarde a confirmação

### 3. Deploy no Remix

1. **Acesse Remix IDE**
   - Vá para: https://remix.ethereum.org

2. **Criar Arquivo**
   - Na pasta `contracts`, crie novo arquivo: `TokenSwap.sol`
   - Cole o conteúdo completo de `contracts/TokenSwap.sol`

3. **Compilar**
   - Vá para a aba "Solidity Compiler"
   - Selecione versão: `0.8.20` ou superior
   - Clique em "Compile TokenSwap.sol"
   - Verifique se não há erros

4. **Conectar MetaMask**
   - Vá para a aba "Deploy & Run Transactions"
   - Em "Environment", selecione: "Injected Provider - MetaMask"
   - Certifique-se de estar na Arc Testnet (Chain ID: 5042002)

5. **Deploy**
   - No campo "Deploy", você verá o construtor do contrato
   - Preencha os parâmetros:
     ```
     _usdc: 0x3600000000000000000000000000000000000000
     _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
     ```
   - Clique em "Deploy"
   - Confirme a transação no MetaMask

6. **Copiar Endereço**
   - Após o deploy, o contrato aparecerá na seção "Deployed Contracts"
   - Clique no contrato para expandir
   - Copie o endereço do contrato (aparece acima das funções)

### 4. Atualizar Frontend

1. **Atualizar lib/swap-contract.ts**
   ```typescript
   export const SWAP_CONTRACT_ADDRESS = "0x..." as `0x${string}` // Cole o endereço aqui
   ```

2. **Financiar o Contrato**
   - O contrato precisa ter USDC e EURC para permitir swaps
   - Transfira tokens para o endereço do contrato:
     - USDC: Envie para o endereço do contrato
     - EURC: Envie para o endereço do contrato
   - Você pode usar MetaMask ou o frontend para fazer as transferências

### 5. Testar

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000
3. Conecte sua carteira MetaMask
4. Vá para a aba "Swap"
5. Teste um swap de USDC para EURC

## Troubleshooting

- **Erro "insufficient funds"**: Você precisa de USDC para gas
- **Erro "contract not found"**: Verifique se o endereço está correto
- **Swap falha**: O contrato precisa ter tokens (USDC e EURC) para funcionar

