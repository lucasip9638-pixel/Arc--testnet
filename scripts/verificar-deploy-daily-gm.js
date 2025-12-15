/**
 * Verifica uma transação de deploy e obtém o endereço do contrato
 * Uso: node scripts/verificar-deploy-daily-gm.js 0x[TRANSACTION_HASH]
 */

const { createPublicClient, http, defineChain } = require("viem")
const fs = require("fs")
const path = require("path")

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
})

const txHash = process.argv[2] || "0xd03e20addc8d983c262f65c38f235220146d9b653d6f763282f08015c579aaf6"

if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
  console.error("❌ Hash de transação inválido!")
  console.log()
  console.log("Uso: node scripts/verificar-deploy-daily-gm.js 0x[TRANSACTION_HASH]")
  process.exit(1)
}

async function main() {
  console.log("=".repeat(70))
  console.log("  🔍 VERIFICANDO DEPLOY DO CONTRATO DAILYGM")
  console.log("=".repeat(70))
  console.log()
  console.log("Transaction Hash:", txHash)
  console.log()

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  try {
    console.log("Aguardando confirmação da transação...")
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    
    const contractAddress = receipt.contractAddress

    if (!contractAddress) {
      console.error("❌ Esta transação não é um deploy de contrato!")
      process.exit(1)
    }

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO ENCONTRADO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", contractAddress)
    console.log("Explorer:", `https://testnet.arcscan.app/address/${contractAddress}`)
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

  } catch (error) {
    console.error("❌ Erro ao verificar transação:", error.message)
    console.log()
    console.log("A transação pode ainda estar sendo processada.")
    console.log("Aguarde alguns segundos e tente novamente.")
    process.exit(1)
  }
}

main().catch(console.error)


