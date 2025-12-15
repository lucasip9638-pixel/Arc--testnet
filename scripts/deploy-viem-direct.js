/**
 * Deploy direto usando viem (sem Hardhat)
 * Requer: contrato compilado ou bytecode
 */

const { createWalletClient, http, parseEther } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")
const fs = require("fs")
const path = require("path")

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

// Token addresses
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY DO CONTRATO TOKENSWAP (VIEM DIRETO)")
  console.log("=".repeat(70))
  console.log()

  // Load private key from .env.deployer
  let privateKey
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), ".env.deployer"), "utf8")
    const match = envContent.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
    if (match) {
      privateKey = match[1]
    } else {
      throw new Error("Chave privada não encontrada em .env.deployer")
    }
  } catch (error) {
    console.error("❌ Erro ao ler .env.deployer:", error.message)
    console.log()
    console.log("Execute primeiro: node scripts/deploy-completo-automatico.js")
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log("Carteira Deployer:", account.address)
  console.log()

  // Create wallet client
  const client = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  // Check balance
  console.log("💰 Verificando saldo...")
  try {
    const balance = await client.getBalance({ address: account.address })
    console.log("Saldo:", balance.toString(), "wei")
    console.log()

    if (balance === 0n) {
      console.log("⚠️  ERRO: Carteira sem saldo!")
      console.log("Por favor, financie a carteira com USDC para gas.")
      console.log("Endereço:", account.address)
      console.log("Faucet: https://faucet.circle.com")
      process.exit(1)
    }
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo:", error.message)
    console.log("Continuando mesmo assim...")
    console.log()
  }

  console.log("=".repeat(70))
  console.log("  ⚠️  DEPLOY VIA Viem REQUER BYTECODE COMPILADO")
  console.log("=".repeat(70))
  console.log()
  console.log("Para fazer deploy, você precisa do bytecode compilado do contrato.")
  console.log()
  console.log("OPÇÃO RECOMENDADA: Use Remix IDE")
  console.log("1. Acesse: https://remix.ethereum.org")
  console.log("2. Veja instruções em: scripts/deploy-remix-guide.md")
  console.log()
  console.log("OU compile com Hardhat:")
  console.log("1. Execute: npm run compile")
  console.log("2. O bytecode estará em: artifacts/contracts/TokenSwap.sol/TokenSwap.json")
  console.log("3. Depois execute este script novamente")
  console.log()

  // Try to load compiled bytecode if available
  let bytecode = null
  try {
    const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "TokenSwap.sol", "TokenSwap.json")
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
      bytecode = artifact.bytecode
      console.log("✅ Bytecode encontrado! Fazendo deploy...")
      console.log()
    }
  } catch (error) {
    // Bytecode not found, that's ok
  }

  if (!bytecode || bytecode === "0x") {
    console.log("Bytecode não encontrado. Use Remix IDE ou compile primeiro.")
    console.log()
    console.log("Token Addresses para usar no Remix:")
    console.log("  USDC:", USDC_ADDRESS)
    console.log("  EURC:", EURC_ADDRESS)
    console.log()
    process.exit(0)
  }

  // Deploy contract
  console.log("📦 Fazendo deploy do contrato...")
  try {
    const hash = await client.deployContract({
      abi: [
        {
          inputs: [
            { internalType: "address", name: "_usdc", type: "address" },
            { internalType: "address", name: "_eurc", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
      bytecode: bytecode,
      args: [USDC_ADDRESS, EURC_ADDRESS],
    })

    console.log("Transaction Hash:", hash)
    console.log("Aguardando confirmação...")

    // Wait for transaction
    const receipt = await client.waitForTransactionReceipt({ hash })

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", receipt.contractAddress)
    console.log("Transaction:", `https://testnet.arcscan.app/tx/${hash}`)
    console.log()

    // Update swap-contract.ts
    console.log("📝 Atualizando lib/swap-contract.ts...")
    try {
      const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
      let content = fs.readFileSync(swapContractPath, "utf8")
      content = content.replace(
        /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
        `export const SWAP_CONTRACT_ADDRESS = "${receipt.contractAddress}" as \`0x\${string}\``
      )
      fs.writeFileSync(swapContractPath, content)
      console.log("✅ lib/swap-contract.ts atualizado!")
      console.log()
    } catch (error) {
      console.log("⚠️  Não foi possível atualizar automaticamente.")
      console.log("Atualize manualmente lib/swap-contract.ts:")
      console.log(`   SWAP_CONTRACT_ADDRESS = "${receipt.contractAddress}"`)
      console.log()
    }

    console.log("Próximos passos:")
    console.log("1. Financie o contrato com USDC e EURC")
    console.log("2. Teste a aplicação: npm run dev")
    console.log()
  } catch (error) {
    console.error("❌ Erro no deploy:", error.message)
    console.log()
    console.log("Tente usar Remix IDE como alternativa.")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Erro:", error)
  process.exit(1)
})

