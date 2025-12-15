const { ethers } = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY DO CONTRATO DAILYGM PARA ARC TESTNET")
  console.log("=".repeat(70))
  console.log()

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deployando com a conta:", deployer.address)
  
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("Saldo da conta:", ethers.formatEther(balance), "USDC")
  console.log()

  if (balance === 0n) {
    console.log("⚠️  AVISO: Conta sem saldo!")
    console.log("Por favor, financie a conta com USDC para taxas de gas.")
    console.log("Endereço:", deployer.address)
    console.log("Faucet: https://faucet.circle.com")
    process.exit(1)
  }

  console.log("Deployando contrato DailyGM...")
  const DailyGM = await ethers.getContractFactory("DailyGM")
  const dailyGM = await DailyGM.deploy()

  console.log("Aguardando confirmação...")
  await dailyGM.waitForDeployment()

  const address = await dailyGM.getAddress()
  console.log()
  console.log("=".repeat(70))
  console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
  console.log("=".repeat(70))
  console.log()
  console.log("Endereço do Contrato:", address)
  console.log("Endereço do Deployer:", deployer.address)
  console.log("Rede: Arc Testnet")
  console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`)
  console.log()

  // Update lib/daily-gm-contract.ts automatically
  console.log("📝 Atualizando lib/daily-gm-contract.ts...")
  try {
    const dailyGMContractPath = path.join(process.cwd(), "lib", "daily-gm-contract.ts")
    let content = fs.readFileSync(dailyGMContractPath, "utf8")
    content = content.replace(
      /export const DAILY_GM_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
      `export const DAILY_GM_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``
    )
    fs.writeFileSync(dailyGMContractPath, content)
    console.log("✅ lib/daily-gm-contract.ts atualizado automaticamente!")
    console.log()
  } catch (error) {
    console.log("⚠️  Não foi possível atualizar automaticamente.")
    console.log("Atualize manualmente lib/daily-gm-contract.ts:")
    console.log(`   export const DAILY_GM_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``)
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


