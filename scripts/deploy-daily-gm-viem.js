/**
 * Deploy do contrato DailyGM usando viem
 * Este script compila o contrato e faz o deploy
 */

const { createWalletClient, http, defineChain } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")
const { compileContract } = require("hardhat")
const fs = require("fs")
const path = require("path")

// Arc Testnet
const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
})

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY DO CONTRATO DAILYGM PARA ARC TESTNET")
  console.log("=".repeat(70))
  console.log()

  // Load private key
  let privateKey
  try {
    const deployerPath = path.join(process.cwd(), ".env.deployer")
    if (!fs.existsSync(deployerPath)) {
      throw new Error(".env.deployer não encontrado")
    }
    const content = fs.readFileSync(deployerPath, "utf8")
    const match = content.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
    if (!match) throw new Error("Chave privada não encontrada")
    privateKey = match[1]
  } catch (error) {
    console.error("❌ Erro ao ler chave privada:", error.message)
    console.log()
    console.log("Para fazer deploy, você precisa:")
    console.log("1. Criar arquivo .env.deployer com:")
    console.log("   DEPLOYER_PRIVATE_KEY=0x...")
    console.log()
    console.log("OU use Remix IDE (mais fácil):")
    console.log("1. Acesse: https://remix.ethereum.org")
    console.log("2. Crie arquivo DailyGM.sol")
    console.log("3. Cole o código de contracts/DailyGM.sol")
    console.log("4. Compile (Solidity 0.8.20)")
    console.log("5. Deploy com MetaMask na Arc Testnet")
    console.log("6. Não precisa de parâmetros no construtor")
    console.log()
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log("Carteira:", account.address)
  console.log()

  const client = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  // Check balance
  try {
    const balance = await client.getBalance({ address: account.address })
    console.log("Saldo:", balance.toString(), "wei")
    if (balance === 0n) {
      console.error("❌ Carteira sem saldo!")
      console.log("Financie a carteira com USDC: https://faucet.circle.com")
      process.exit(1)
    }
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo")
  }

  console.log()
  console.log("=".repeat(70))
  console.log("  ⚠️  DEPLOY VIA SCRIPT REQUER COMPILAÇÃO")
  console.log("=".repeat(70))
  console.log()
  console.log("OPÇÃO RECOMENDADA: Use Remix IDE")
  console.log("1. Acesse: https://remix.ethereum.org")
  console.log("2. Crie arquivo DailyGM.sol")
  console.log("3. Cole o código de contracts/DailyGM.sol")
  console.log("4. Compile (Solidity 0.8.20)")
  console.log("5. Deploy com MetaMask na Arc Testnet")
  console.log("6. Não precisa de parâmetros no construtor")
  console.log("7. Copie o endereço do contrato")
  console.log("8. Execute: node scripts/atualizar-daily-gm.js [ENDERECO]")
  console.log()
}

main().catch(console.error)


