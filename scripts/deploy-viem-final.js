/**
 * Deploy usando viem diretamente (sem Hardhat)
 * Requer: bytecode compilado do contrato
 */

const { createWalletClient, http } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")
const fs = require("fs")
const path = require("path")

// Arc Testnet
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
}

// Token addresses
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

// Contract ABI (constructor only)
const CONSTRUCTOR_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdc", type: "address" },
      { internalType: "address", name: "_eurc", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
]

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY DO CONTRATO TOKENSWAP (VIEM DIRETO)")
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
      process.exit(1)
    }
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo")
  }

  console.log()
  console.log("=".repeat(70))
  console.log("  ⚠️  DEPLOY VIA Viem REQUER BYTECODE COMPILADO")
  console.log("=".repeat(70))
  console.log()
  console.log("Para fazer deploy, você precisa do bytecode do contrato.")
  console.log()
  console.log("OPÇÃO RECOMENDADA: Use Remix IDE")
  console.log("1. Acesse: https://remix.ethereum.org")
  console.log("2. Crie arquivo TokenSwap.sol")
  console.log("3. Cole o código de contracts/TokenSwap.sol")
  console.log("4. Compile (Solidity 0.8.20)")
  console.log("5. Deploy com MetaMask na Arc Testnet")
  console.log("6. Parâmetros do construtor:")
  console.log(`   _usdc: ${USDC_ADDRESS}`)
  console.log(`   _eurc: ${EURC_ADDRESS}`)
  console.log()
  console.log("OU compile localmente e execute este script novamente")
  console.log()
}

main().catch(console.error)

