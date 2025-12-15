/**
 * Atualiza o endereço do contrato no frontend
 * Uso: node scripts/atualizar-contrato.js <endereco>
 */

const fs = require("fs")
const path = require("path")

const contractAddress = process.argv[2]

if (!contractAddress || !contractAddress.startsWith("0x")) {
  console.error("❌ Erro: Forneça um endereço válido (deve começar com 0x)")
  console.log()
  console.log("Uso: node scripts/atualizar-contrato.js 0x...")
  process.exit(1)
}

const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")

try {
  let content = fs.readFileSync(swapContractPath, "utf8")
  content = content.replace(
    /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
    `export const SWAP_CONTRACT_ADDRESS = "${contractAddress}" as \`0x\${string}\``
  )
  fs.writeFileSync(swapContractPath, content)
  
  console.log("=".repeat(70))
  console.log("  ✅ FRONTEND ATUALIZADO COM SUCESSO!")
  console.log("=".repeat(70))
  console.log()
  console.log("Endereço do contrato:", contractAddress)
  console.log("Arquivo atualizado: lib/swap-contract.ts")
  console.log()
  console.log("Próximos passos:")
  console.log("1. Financie o contrato com USDC e EURC")
  console.log("2. Teste a aplicação: npm run dev")
  console.log()
} catch (error) {
  console.error("❌ Erro ao atualizar:", error.message)
  process.exit(1)
}

