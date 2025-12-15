/**
 * Script para atualizar o endereço do contrato DailyGM
 * Uso: node scripts/atualizar-daily-gm.js 0x...
 */

const fs = require("fs")
const path = require("path")

const address = process.argv[2]

if (!address || !address.startsWith("0x") || address.length !== 42) {
  console.error("❌ Endereço inválido!")
  console.log()
  console.log("Uso: node scripts/atualizar-daily-gm.js 0x...")
  console.log()
  console.log("Exemplo:")
  console.log("  node scripts/atualizar-daily-gm.js 0x1234567890123456789012345678901234567890")
  process.exit(1)
}

try {
  const dailyGMContractPath = path.join(process.cwd(), "lib", "daily-gm-contract.ts")
  let content = fs.readFileSync(dailyGMContractPath, "utf8")
  
  content = content.replace(
    /export const DAILY_GM_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
    `export const DAILY_GM_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``
  )
  
  fs.writeFileSync(dailyGMContractPath, content)
  
  console.log("=".repeat(70))
  console.log("  ✅ ENDEREÇO ATUALIZADO COM SUCESSO!")
  console.log("=".repeat(70))
  console.log()
  console.log("Endereço do Contrato:", address)
  console.log("Arquivo atualizado: lib/daily-gm-contract.ts")
  console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`)
  console.log()
  console.log("Próximos passos:")
  console.log("1. ✅ Frontend atualizado!")
  console.log("2. Reinicie o servidor: npm run dev")
  console.log("3. Teste a funcionalidade GM em: http://localhost:3000")
  console.log()
} catch (error) {
  console.error("❌ Erro ao atualizar:", error.message)
  process.exit(1)
}


