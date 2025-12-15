# ✅ Tokens Configurados na Arc Testnet

## Endereços Atualizados

Os endereços dos tokens foram atualizados em `lib/tokens.ts`:

### USDC (USD Coin)
- **Endereço**: `0x3600000000000000000000000000000000000000`
- **Símbolo**: USDC
- **Decimais**: 6
- **Explorer**: https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000

### EURC (Euro Coin)
- **Endereço**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
- **Símbolo**: EURC
- **Decimais**: 6
- **Explorer**: https://testnet.arcscan.app/address/0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a

## ✅ Status

- ✅ Endereços configurados
- ✅ Componente de swap pronto para usar
- ✅ Leitura de saldos funcionando
- ⚠️ **Pendente**: Deploy do contrato TokenSwap e atualização do endereço em `lib/swap-contract.ts`

## Próximos Passos

1. **Deploy do Contrato TokenSwap**:
   - Use os endereços acima no construtor do contrato
   - Deploy na Arc Testnet
   - Atualize `SWAP_CONTRACT_ADDRESS` em `lib/swap-contract.ts`

2. **Fundar o Contrato**:
   - O contrato precisa ter tokens para fazer swaps
   - Transfira USDC e EURC para o endereço do contrato deployado

3. **Testar**:
   - Conecte sua carteira
   - Verifique se os saldos aparecem corretamente
   - Teste o swap após deploy do contrato

## Obter Tokens de Teste

Use o Circle Faucet para obter tokens de teste:
- https://faucet.circle.com

