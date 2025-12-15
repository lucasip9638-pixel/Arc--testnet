import * as hre from "hardhat"
import { writeFileSync, readFileSync } from "fs"
import { join } from "path"

async function main() {
  // @ts-ignore - Hardhat toolbox provides ethers
  const { ethers } = await import("hardhat")
  console.log("=".repeat(60))
  console.log("  DEPLOY TOKEN SWAP CONTRACT TO ARC TESTNET")
  console.log("=".repeat(60))
  console.log()

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.formatEther(balance), "USDC")
  console.log()

  if (balance === 0n) {
    console.log("⚠️  WARNING: Account has no balance!")
    console.log("Please fund the account with USDC for gas fees.")
    console.log("Address:", deployer.address)
    console.log("Faucet: https://faucet.circle.com")
    process.exit(1)
  }

  // Token addresses from lib/tokens.ts
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
  const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

  console.log("Token Addresses:")
  console.log("  USDC:", USDC_ADDRESS)
  console.log("  EURC:", EURC_ADDRESS)
  console.log()

  console.log("Deploying TokenSwap contract...")
  const TokenSwap = await ethers.getContractFactory("TokenSwap")
  const tokenSwap = await TokenSwap.deploy(USDC_ADDRESS, EURC_ADDRESS)

  await tokenSwap.waitForDeployment()

  const address = await tokenSwap.getAddress()
  console.log()
  console.log("=".repeat(60))
  console.log("  ✅ CONTRACT DEPLOYED SUCCESSFULLY!")
  console.log("=".repeat(60))
  console.log()
  console.log("Contract Address:", address)
  console.log("Deployer Address:", deployer.address)
  console.log("Network: Arc Testnet")
  console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`)
  console.log()
  // Update lib/swap-contract.ts automatically
  console.log("📝 Atualizando lib/swap-contract.ts...")
  try {
    const swapContractPath = join(process.cwd(), "lib", "swap-contract.ts")
    let content = readFileSync(swapContractPath, "utf8")
    content = content.replace(
      /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
      `export const SWAP_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``
    )
    writeFileSync(swapContractPath, content)
    console.log("✅ lib/swap-contract.ts atualizado automaticamente!")
    console.log()
  } catch (error) {
    console.log("⚠️  Não foi possível atualizar automaticamente.")
    console.log("Atualize manualmente lib/swap-contract.ts:")
    console.log(`   export const SWAP_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``)
    console.log()
  }

  console.log("Next steps:")
  console.log("1. ✅ Frontend atualizado automaticamente!")
  console.log()
  console.log("2. Fund the contract with tokens:")
  console.log("   - Transfer USDC to:", address)
  console.log("   - Transfer EURC to:", address)
  console.log("   (The contract needs tokens to perform swaps)")
  console.log()
  console.log("3. Test the swap in the frontend!")
  console.log("   Run: npm run dev")
  console.log("   Then test swaps at: http://localhost:3000")
  console.log()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

