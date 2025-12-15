/**
 * Gera uma nova carteira Ethereum para deploy
 * Execute: node scripts/gerar-carteira.js
 */

const crypto = require("crypto")
const { privateKeyToAccount } = require("viem/accounts")
const { createWalletClient, http } = require("viem")

// Arc Testnet config
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
}

async function main() {
  console.log("=".repeat(70))
  console.log("  🔑 GERANDO NOVA CARTEIRA PARA DEPLOY")
  console.log("=".repeat(70))
  console.log()

  // Generate random private key
  const privateKey = `0x${crypto.randomBytes(32).toString("hex")}`
  const account = privateKeyToAccount(privateKey)

  console.log("✅ Nova carteira gerada!")
  console.log()
  console.log("Endereço:", account.address)
  console.log("Chave Privada:", privateKey)
  console.log()

  // Create wallet client to check balance
  const client = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  try {
    const balance = await client.getBalance({ address: account.address })
    console.log("Saldo Atual:", balance.toString(), "wei")
    console.log()
  } catch (error) {
    console.log("Não foi possível verificar saldo (rede pode estar inacessível)")
    console.log()
  }

  console.log("=".repeat(70))
  console.log("  ⚠️  IMPORTANTE - SALVE ESTAS INFORMAÇÕES")
  console.log("=".repeat(70))
  console.log()
  console.log("1. Salve a chave privada de forma segura")
  console.log("2. Financie esta carteira com USDC para gas")
  console.log("3. Use esta chave privada no arquivo .env:")
  console.log()
  console.log("   DEPLOYER_PRIVATE_KEY=" + privateKey)
  console.log()
  console.log("4. Obtenha USDC de teste em: https://faucet.circle.com")
  console.log("   Envie para o endereço:", account.address)
  console.log()

  // Save to file
  const fs = require("fs")
  const path = require("path")
  
  const envContent = `# Deployer Private Key
# IMPORTANTE: Nunca commite este arquivo com chaves privadas reais!
DEPLOYER_PRIVATE_KEY=${privateKey}

# Deployer Address
DEPLOYER_ADDRESS=${account.address}
`

  try {
    fs.writeFileSync(path.join(process.cwd(), ".env.deployer"), envContent)
    console.log("✅ Salvo em .env.deployer")
    console.log("⚠️  Lembre-se de criar .env com sua chave privada real")
    console.log()
  } catch (error) {
    console.log("Não foi possível salvar em arquivo")
  }

  console.log("=".repeat(70))
  console.log()
  console.log("Próximos passos:")
  console.log("1. Financie a carteira com USDC")
  console.log("2. Execute o deploy do contrato")
  console.log("3. Atualize lib/swap-contract.ts com o endereço do contrato")
  console.log()
}

main().catch((error) => {
  console.error("Erro:", error)
  process.exit(1)
})

