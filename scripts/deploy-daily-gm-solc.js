/**
 * Deploy do contrato DailyGM usando solc diretamente
 * Compila o contrato e faz deploy via viem
 */

const { createWalletClient, http, defineChain } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")
const solc = require("solc")
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
    console.log("7. Copie o endereço e execute: node scripts/atualizar-daily-gm.js [ENDERECO]")
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
    const balanceFormatted = (Number(balance) / 1e6).toFixed(6)
    console.log("Saldo:", balanceFormatted, "USDC")
    if (balance === 0n) {
      console.error("❌ Carteira sem saldo!")
      console.log("Financie a carteira com USDC: https://faucet.circle.com")
      process.exit(1)
    }
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo")
  }

  console.log()
  console.log("Compilando contrato DailyGM...")
  
  try {
    // Read contract source
    const contractPath = path.join(process.cwd(), "contracts", "DailyGM.sol")
    const source = fs.readFileSync(contractPath, "utf8")

    // Compile
    const input = {
      language: "Solidity",
      sources: {
        "DailyGM.sol": {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input)))
    
    if (output.errors && output.errors.length > 0) {
      const errors = output.errors.filter(e => e.severity === "error")
      if (errors.length > 0) {
        console.error("❌ Erros de compilação:")
        errors.forEach(err => console.error("  ", err.message))
        process.exit(1)
      }
    }

    const contract = output.contracts["DailyGM.sol"]["DailyGM"]
    const bytecode = contract.evm.bytecode.object
    const abi = contract.abi

    console.log("✅ Contrato compilado com sucesso!")
    console.log()

    console.log("Fazendo deploy...")
    
    // Deploy contract
    const hash = await client.deployContract({
      abi,
      bytecode: `0x${bytecode}`,
      args: [], // DailyGM não tem parâmetros no construtor
    })

    console.log("Transação enviada:", hash)
    console.log("Aguardando confirmação...")

    // Wait for transaction using public client
    const { createPublicClient } = require("viem")
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http("https://rpc.testnet.arc.network"),
    })
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    const contractAddress = receipt.contractAddress

    if (!contractAddress) {
      throw new Error("Contrato não foi deployado")
    }

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", contractAddress)
    console.log("Endereço do Deployer:", account.address)
    console.log("Rede: Arc Testnet")
    console.log("Explorer:", `https://testnet.arcscan.app/address/${contractAddress}`)
    console.log("Transaction Hash:", hash)
    console.log()

    // Update lib/daily-gm-contract.ts automatically
    console.log("📝 Atualizando lib/daily-gm-contract.ts...")
    try {
      const dailyGMContractPath = path.join(process.cwd(), "lib", "daily-gm-contract.ts")
      let content = fs.readFileSync(dailyGMContractPath, "utf8")
      content = content.replace(
        /export const DAILY_GM_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
        `export const DAILY_GM_CONTRACT_ADDRESS = "${contractAddress}" as \`0x\${string}\``
      )
      fs.writeFileSync(dailyGMContractPath, content)
      console.log("✅ lib/daily-gm-contract.ts atualizado automaticamente!")
      console.log()
    } catch (error) {
      console.log("⚠️  Não foi possível atualizar automaticamente.")
      console.log("Atualize manualmente lib/daily-gm-contract.ts:")
      console.log(`   export const DAILY_GM_CONTRACT_ADDRESS = "${contractAddress}" as \`0x\${string}\``)
      console.log()
    }

    console.log("Próximos passos:")
    console.log("1. ✅ Frontend atualizado automaticamente!")
    console.log()
    console.log("2. Teste a funcionalidade GM:")
    console.log("   Execute: npm run dev")
    console.log("   Depois teste GM em: http://localhost:3000")
    console.log()
    console.log("3. O contrato está pronto para uso!")
    console.log("   - Usuários podem enviar GM diariamente")
    console.log("   - Streaks são rastreados automaticamente")
    console.log("   - Todas as transações aparecem no ArcScan")
    console.log()

  } catch (error) {
    console.error("❌ Erro durante deploy:", error.message)
    console.log()
    console.log("Tente usar Remix IDE (mais fácil):")
    console.log("1. Acesse: https://remix.ethereum.org")
    console.log("2. Crie arquivo DailyGM.sol")
    console.log("3. Cole o código de contracts/DailyGM.sol")
    console.log("4. Compile (Solidity 0.8.20)")
    console.log("5. Deploy com MetaMask na Arc Testnet")
    console.log("6. Copie o endereço e execute: node scripts/atualizar-daily-gm.js [ENDERECO]")
    console.log()
    process.exit(1)
  }
}

main().catch(console.error)

