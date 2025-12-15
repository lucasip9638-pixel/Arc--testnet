/**
 * Generate a new wallet for deployment
 * 
 * This script generates a new Ethereum wallet with private key.
 * IMPORTANT: Keep the private key secure!
 */

import { privateKeyToAccount } from "viem/accounts"
import { createPublicClient, http } from "viem"
import { defineChain } from "viem"
import { writeFileSync } from "fs"
import { join } from "path"
import * as crypto from "crypto"

// Define Arc Testnet (same as wagmi-config)
const arcTestnet = defineChain({
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
})

async function main() {
  console.log("=".repeat(60))
  console.log("  GENERATING NEW WALLET FOR DEPLOYMENT")
  console.log("=".repeat(60))
  console.log()

  // Generate random private key
  const privateKey = `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`
  const account = privateKeyToAccount(privateKey)

  console.log("✅ New wallet generated!")
  console.log()
  console.log("Address:", account.address)
  console.log("Private Key:", privateKey)
  console.log()

  // Create public client to check balance
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  try {
    const balance = await publicClient.getBalance({ address: account.address })
    console.log("Current Balance:", balance.toString(), "wei")
    console.log()
  } catch (error) {
    console.log("Could not check balance (network may be unreachable)")
    console.log()
  }

  console.log("=".repeat(60))
  console.log("  ⚠️  IMPORTANT - SAVE THIS INFORMATION")
  console.log("=".repeat(60))
  console.log()
  console.log("1. Save the private key securely")
  console.log("2. Fund this wallet with USDC for gas fees")
  console.log("3. Use this private key in .env file:")
  console.log()
  console.log("   DEPLOYER_PRIVATE_KEY=" + privateKey)
  console.log()
  console.log("4. Get testnet USDC from: https://faucet.circle.com")
  console.log("   Send to address:", account.address)
  console.log()

  // Save to .env.example (not .env for security)
  const envExample = `# Deployer Private Key
# IMPORTANT: Never commit this file with real private keys!
DEPLOYER_PRIVATE_KEY=${privateKey}

# Deployer Address
DEPLOYER_ADDRESS=${account.address}
`

  try {
    writeFileSync(join(process.cwd(), ".env.example"), envExample)
    console.log("✅ Saved to .env.example (for reference)")
    console.log("⚠️  Remember to create .env with your actual private key")
    console.log()
  } catch (error) {
    console.log("Could not save to .env.example")
  }

  console.log("=".repeat(60))
  console.log()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

