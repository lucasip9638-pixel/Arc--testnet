/**
 * Gera uma nova carteira Ethereum (versão simples)
 * Execute: node scripts/gerar-carteira-simples.js
 */

const crypto = require("crypto")
const { ethers } = require("ethers")

async function main() {
  console.log("=".repeat(70))
  console.log("  🔑 GERANDO NOVA CARTEIRA PARA DEPLOY")
  console.log("=".repeat(70))
  console.log()

  // Generate random wallet
  const wallet = ethers.Wallet.createRandom()

  console.log("✅ Nova carteira gerada!")
  console.log()
  console.log("Endereço:", wallet.address)
  console.log("Chave Privada:", wallet.privateKey)
  console.log("Mnemonic (12 palavras):", wallet.mnemonic.phrase)
  console.log()

  console.log("=".repeat(70))
  console.log("  ⚠️  IMPORTANTE - SALVE ESTAS INFORMAÇÕES")
  console.log("=".repeat(70))
  console.log()
  console.log("1. Salve a chave privada de forma segura")
  console.log("2. OU salve o mnemonic (12 palavras) de forma segura")
  console.log("3. Financie esta carteira com USDC para gas")
  console.log("4. Use esta chave privada no arquivo .env:")
  console.log()
  console.log("   DEPLOYER_PRIVATE_KEY=" + wallet.privateKey)
  console.log()
  console.log("5. Obtenha USDC de teste em: https://faucet.circle.com")
  console.log("   Envie para o endereço:", wallet.address)
  console.log()

  // Save to file
  const fs = require("fs")
  const path = require("path")
  
  const envContent = `# Deployer Private Key
# IMPORTANTE: Nunca commite este arquivo com chaves privadas reais!
DEPLOYER_PRIVATE_KEY=${wallet.privateKey}

# Deployer Address
DEPLOYER_ADDRESS=${wallet.address}

# Mnemonic (opcional, para importar no MetaMask)
MNEMONIC=${wallet.mnemonic.phrase}
`

  try {
    fs.writeFileSync(path.join(process.cwd(), ".env.deployer"), envContent)
    console.log("✅ Informações salvas em .env.deployer")
    console.log("⚠️  Lembre-se de criar .env com sua chave privada real")
    console.log()
  } catch (error) {
    console.log("⚠️  Não foi possível salvar em arquivo:", error.message)
  }

  console.log("=".repeat(70))
  console.log()
  console.log("Próximos passos:")
  console.log("1. Financie a carteira com USDC (faucet: https://faucet.circle.com)")
  console.log("2. Faça o deploy do contrato usando Remix IDE ou Hardhat")
  console.log("3. Atualize lib/swap-contract.ts com o endereço do contrato")
  console.log("4. Financie o contrato com USDC e EURC para permitir swaps")
  console.log("5. Teste a aplicação!")
  console.log()
  console.log("Para deploy via Remix:")
  console.log("- Acesse: https://remix.ethereum.org")
  console.log("- Veja: scripts/deploy-remix-guide.md")
  console.log()
}

main().catch((error) => {
  console.error("Erro:", error)
  process.exit(1)
})

