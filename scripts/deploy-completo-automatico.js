/**
 * Script completo automático: Gera carteira e prepara deploy
 */

const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

function generateWallet() {
  console.log("=".repeat(70))
  console.log("  🔑 GERANDO NOVA CARTEIRA PARA DEPLOY")
  console.log("=".repeat(70))
  console.log()

  // Generate random private key
  const privateKey = "0x" + crypto.randomBytes(32).toString("hex")
  
  // Derive address from private key (simplified - in production use proper library)
  // For now, we'll use a placeholder and recommend using MetaMask or Remix
  const addressPlaceholder = "0x" + crypto.createHash("sha256").update(privateKey).digest("hex").slice(0, 40)

  console.log("✅ Nova carteira gerada!")
  console.log()
  console.log("⚠️  IMPORTANTE: Esta é uma chave privada gerada localmente.")
  console.log("⚠️  Para obter o endereço correto, use MetaMask ou Remix IDE.")
  console.log()
  console.log("Chave Privada:", privateKey)
  console.log()
  console.log("Para obter o endereço:")
  console.log("1. Abra MetaMask")
  console.log("2. Importe conta usando chave privada")
  console.log("3. O endereço será exibido")
  console.log()

  // Save to file
  const envContent = `# Deployer Private Key
# IMPORTANTE: Nunca commite este arquivo com chaves privadas reais!
DEPLOYER_PRIVATE_KEY=${privateKey}

# Token Addresses (Arc Testnet)
USDC_ADDRESS=0x3600000000000000000000000000000000000000
EURC_ADDRESS=0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a

# Network
NETWORK_NAME=Arc Testnet
RPC_URL=https://rpc.testnet.arc.network
CHAIN_ID=5042002
EXPLORER_URL=https://testnet.arcscan.app
`

  try {
    fs.writeFileSync(path.join(process.cwd(), ".env.deployer"), envContent)
    console.log("✅ Informações salvas em .env.deployer")
    console.log()
  } catch (error) {
    console.log("⚠️  Erro ao salvar:", error.message)
  }

  console.log("=".repeat(70))
  console.log("  📋 PRÓXIMOS PASSOS")
  console.log("=".repeat(70))
  console.log()
  console.log("1. IMPORTE A CHAVE PRIVADA NO METAMASK:")
  console.log("   - Abra MetaMask")
  console.log("   - Clique em 'Importar conta'")
  console.log("   - Cole a chave privada acima")
  console.log("   - Anote o endereço da carteira")
  console.log()
  console.log("2. ADICIONE ARC TESTNET AO METAMASK:")
  console.log("   - Network Name: Arc Testnet")
  console.log("   - RPC URL: https://rpc.testnet.arc.network")
  console.log("   - Chain ID: 5042002")
  console.log("   - Currency Symbol: USDC")
  console.log("   - Block Explorer: https://testnet.arcscan.app")
  console.log()
  console.log("3. FINANCIE A CARTEIRA:")
  console.log("   - Acesse: https://faucet.circle.com")
  console.log("   - Conecte MetaMask")
  console.log("   - Solicite USDC de teste")
  console.log()
  console.log("4. FAÇA O DEPLOY DO CONTRATO:")
  console.log("   - Opção A: Use Remix IDE (MAIS FÁCIL)")
  console.log("     * Acesse: https://remix.ethereum.org")
  console.log("     * Veja: scripts/deploy-remix-guide.md")
  console.log()
  console.log("   - Opção B: Use Hardhat")
  console.log("     * Configure .env com DEPLOYER_PRIVATE_KEY")
  console.log("     * Execute: npm run compile")
  console.log("     * Execute: npm run deploy:swap")
  console.log()
  console.log("5. ATUALIZE O FRONTEND:")
  console.log("   - Após deploy, copie o endereço do contrato")
  console.log("   - Atualize: lib/swap-contract.ts")
  console.log("   - Defina: SWAP_CONTRACT_ADDRESS = '0x...'")
  console.log()
  console.log("6. FINANCIE O CONTRATO:")
  console.log("   - O contrato precisa de USDC e EURC para swaps")
  console.log("   - Transfira tokens para o endereço do contrato")
  console.log()
  console.log("7. TESTE A APLICAÇÃO:")
  console.log("   - Execute: npm run dev")
  console.log("   - Acesse: http://localhost:3000")
  console.log("   - Conecte MetaMask")
  console.log("   - Teste o swap!")
  console.log()
  console.log("=".repeat(70))
  console.log()
}

// Run
try {
  generateWallet()
} catch (error) {
  console.error("Erro:", error)
  process.exit(1)
}

