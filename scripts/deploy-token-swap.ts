/**
 * Deploy TokenSwap Contract to Arc Testnet
 * 
 * IMPORTANT: This script generates a new wallet and deploys the contract.
 * The private key will be displayed - KEEP IT SECURE!
 * 
 * Prerequisites:
 * - Node.js installed
 * - USDC for gas fees in the deployer wallet
 * - Token addresses configured in lib/tokens.ts
 */

import { createWalletClient, createPublicClient, http, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { arcTestnet } from "@/lib/wagmi-config"
import { TOKENS } from "@/lib/tokens"
import { readFileSync } from "fs"
import { join } from "path"

// Import contract ABI (we'll compile it or use the interface)
const TOKEN_SWAP_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdc", type: "address" },
      { internalType: "address", name: "_eurc", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const

// Contract bytecode (will be generated from compilation)
// For now, we'll use a placeholder - you'll need to compile the contract first
const TOKEN_SWAP_BYTECODE: `0x${string}` = "0x" as `0x${string}` // Placeholder - needs actual compiled bytecode

async function main() {
  console.log("=".repeat(60))
  console.log("  DEPLOY TOKEN SWAP CONTRACT TO ARC TESTNET")
  console.log("=".repeat(60))
  console.log()

  // Generate new wallet or use provided private key
  const useExistingKey = process.env.DEPLOYER_PRIVATE_KEY
  
  let account
  let privateKey: `0x${string}`
  
  if (useExistingKey) {
    console.log("Using provided private key from environment...")
    privateKey = useExistingKey as `0x${string}`
    account = privateKeyToAccount(privateKey)
  } else {
    console.log("⚠️  Generating new wallet for deployment...")
    console.log("⚠️  IMPORTANT: Save the private key shown below!")
    console.log()
    
    // Generate random private key
    const crypto = await import("crypto")
    privateKey = `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`
    account = privateKeyToAccount(privateKey)
    
    console.log("=".repeat(60))
    console.log("  NEW WALLET GENERATED")
    console.log("=".repeat(60))
    console.log("Address:", account.address)
    console.log("Private Key:", privateKey)
    console.log("=".repeat(60))
    console.log()
    console.log("⚠️  SAVE THIS PRIVATE KEY SECURELY!")
    console.log("⚠️  You'll need USDC in this wallet for gas fees.")
    console.log("⚠️  Get testnet USDC from: https://faucet.circle.com")
    console.log()
  }

  console.log("Deployer Address:", account.address)
  console.log("Network: Arc Testnet (Chain ID: 5042002)")
  console.log("RPC:", "https://rpc.testnet.arc.network")
  console.log()

  // Token addresses
  const USDC_ADDRESS = TOKENS.USDC.address
  const EURC_ADDRESS = TOKENS.EURC.address

  console.log("Token Addresses:")
  console.log("  USDC:", USDC_ADDRESS)
  console.log("  EURC:", EURC_ADDRESS)
  console.log()

  if (USDC_ADDRESS === "0x0000000000000000000000000000000000000000" || 
      EURC_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Token addresses not configured!")
    console.error("Please update lib/tokens.ts with actual token addresses.")
    process.exit(1)
  }

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  // Create wallet client for transactions
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })

  console.log("Checking balance...")
  try {
    const balance = await publicClient.getBalance({ address: account.address })
    console.log("Balance:", parseEther(balance.toString(), "wei"), "USDC")
    console.log()
    
    if (balance === 0n) {
      console.log("⚠️  WARNING: Wallet has no balance!")
      console.log("Please fund the wallet with USDC for gas fees.")
      console.log("Address to fund:", account.address)
      console.log("Faucet: https://faucet.circle.com")
      console.log()
      console.log("After funding, run this script again.")
      process.exit(1)
    }
  } catch (error) {
    console.error("Error checking balance:", error)
    console.log("Continuing anyway...")
  }

  console.log("=".repeat(60))
  console.log("  DEPLOYING CONTRACT")
  console.log("=".repeat(60))
  console.log()

  // NOTE: This requires the contract to be compiled first
  // For now, we'll show instructions
  console.log("⚠️  IMPORTANT: Contract needs to be compiled first!")
  console.log()
  console.log("To deploy, you need to:")
  console.log("1. Compile the contract (using Hardhat, Foundry, or Remix)")
  console.log("2. Get the bytecode from compilation")
  console.log("3. Update this script with the bytecode")
  console.log("4. Run the deploy script")
  console.log()
  console.log("Alternatively, use Remix IDE:")
  console.log("1. Go to https://remix.ethereum.org")
  console.log("2. Paste contracts/TokenSwap.sol")
  console.log("3. Compile with Solidity 0.8.20")
  console.log("4. Deploy to Arc Testnet with:")
  console.log("   - USDC:", USDC_ADDRESS)
  console.log("   - EURC:", EURC_ADDRESS)
  console.log()
  console.log("Or use the Hardhat setup (see DEPLOY-CONTRACT.md)")
  console.log()

  // If bytecode is available, deploy
  if (TOKEN_SWAP_BYTECODE !== "0x" && TOKEN_SWAP_BYTECODE.length > 2) {
    try {
      console.log("Deploying contract...")
      const hash = await walletClient.deployContract({
        abi: TOKEN_SWAP_ABI,
        bytecode: TOKEN_SWAP_BYTECODE,
        args: [USDC_ADDRESS, EURC_ADDRESS],
      })

      console.log("Transaction Hash:", hash)
      console.log("Waiting for confirmation...")

      // Wait for transaction
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      console.log()
      console.log("=".repeat(60))
      console.log("  ✅ CONTRACT DEPLOYED SUCCESSFULLY!")
      console.log("=".repeat(60))
      console.log()
      console.log("Contract Address:", receipt.contractAddress)
      console.log("Transaction:", `https://testnet.arcscan.app/tx/${hash}`)
      console.log()
      console.log("Next steps:")
      console.log("1. Update lib/swap-contract.ts with the contract address")
      console.log("2. Fund the contract with USDC and EURC for swaps")
      console.log("3. Test the swap functionality in the frontend")
      console.log()
    } catch (error) {
      console.error("Deployment failed:", error)
      process.exit(1)
    }
  } else {
    console.log("Deployment script ready. Waiting for contract compilation...")
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

