const { ethers } = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY DO CONTRATO TOKENSWAP PARA ARC TESTNET")
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

  // Token addresses
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
  const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

  console.log("Endereços dos Tokens:")
  console.log("  USDC:", USDC_ADDRESS)
  console.log("  EURC:", EURC_ADDRESS)
  console.log()

  console.log("Deployando contrato TokenSwap...")
  const TokenSwap = await ethers.getContractFactory("TokenSwap")
  const tokenSwap = await TokenSwap.deploy(USDC_ADDRESS, EURC_ADDRESS)

  console.log("Aguardando confirmação...")
  await tokenSwap.waitForDeployment()

  const address = await tokenSwap.getAddress()
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

  // Update lib/swap-contract.ts automatically
  console.log("📝 Atualizando lib/swap-contract.ts...")
  try {
    const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
    let content = fs.readFileSync(swapContractPath, "utf8")
    content = content.replace(
      /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
      `export const SWAP_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``
    )
    fs.writeFileSync(swapContractPath, content)
    console.log("✅ lib/swap-contract.ts atualizado automaticamente!")
    console.log()
  } catch (error) {
    console.log("⚠️  Não foi possível atualizar automaticamente.")
    console.log("Atualize manualmente lib/swap-contract.ts:")
    console.log(`   export const SWAP_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``)
    console.log()
  }

  console.log("Próximos passos:")
  console.log("1. ✅ Frontend atualizado automaticamente!")
  console.log()
  console.log("2. Financie o contrato com tokens:")
  console.log("   - Transfira USDC para:", address)
  console.log("   - Transfira EURC para:", address)
  console.log("   (O contrato precisa ter tokens para permitir swaps)")
  console.log()
  console.log("3. Teste a aplicação!")
  console.log("   Execute: npm run dev")
  console.log("   Depois teste swaps em: http://localhost:3000")
  console.log()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

