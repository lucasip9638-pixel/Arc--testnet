/**
 * Script para executar deploy completo
 * Lê .env.deployer e configura .env, depois executa deploy
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("=".repeat(70))
console.log("  🚀 EXECUTANDO DEPLOY DO CONTRATO TOKENSWAP")
console.log("=".repeat(70))
console.log()

// Step 1: Ler chave privada de .env.deployer
let privateKey
try {
  const deployerPath = path.join(process.cwd(), ".env.deployer")
  if (!fs.existsSync(deployerPath)) {
    console.error("❌ Arquivo .env.deployer não encontrado!")
    console.log("Execute primeiro: node scripts/deploy-completo-automatico.js")
    process.exit(1)
  }

  const content = fs.readFileSync(deployerPath, "utf8")
  const match = content.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
  if (!match) {
    console.error("❌ Chave privada não encontrada em .env.deployer")
    process.exit(1)
  }

  privateKey = match[1]
  console.log("✅ Chave privada carregada de .env.deployer")
  console.log()
} catch (error) {
  console.error("❌ Erro ao ler .env.deployer:", error.message)
  process.exit(1)
}

// Step 2: Criar/atualizar .env
const envPath = path.join(process.cwd(), ".env")
const envContent = `DEPLOYER_PRIVATE_KEY=${privateKey}
`

try {
  fs.writeFileSync(envPath, envContent)
  console.log("✅ Arquivo .env configurado")
  console.log()
} catch (error) {
  console.error("❌ Erro ao criar .env:", error.message)
  process.exit(1)
}

// Step 3: Compilar contrato
console.log("📦 Compilando contrato...")
try {
  execSync("npm run compile", { stdio: "inherit", cwd: process.cwd() })
  console.log("✅ Contrato compilado com sucesso!")
  console.log()
} catch (error) {
  console.error("❌ Erro na compilação")
  process.exit(1)
}

// Step 4: Fazer deploy
console.log("🚀 Fazendo deploy do contrato...")
console.log()
try {
  execSync("npm run deploy:swap", { stdio: "inherit", cwd: process.cwd() })
  console.log()
  console.log("=".repeat(70))
  console.log("  ✅ DEPLOY CONCLUÍDO COM SUCESSO!")
  console.log("=".repeat(70))
  console.log()
  console.log("Próximos passos:")
  console.log("1. Financie o contrato com USDC e EURC")
  console.log("2. Teste a aplicação: npm run dev")
  console.log()
} catch (error) {
  console.error("❌ Erro no deploy")
  console.log()
  console.log("Verifique:")
  console.log("- Carteira tem saldo suficiente (USDC para gas)")
  console.log("- Rede Arc Testnet está acessível")
  console.log("- Chave privada está correta")
  process.exit(1)
}

