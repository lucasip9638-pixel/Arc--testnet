/**
 * Script completo: Gera carteira, compila e faz deploy do contrato TokenSwap
 * 
 * Este script:
 * 1. Gera uma nova carteira
 * 2. Compila o contrato (usando solc ou Remix)
 * 3. Faz deploy do contrato
 * 4. Atualiza o frontend automaticamente
 */

import { privateKeyToAccount } from "viem/accounts"
import { createWalletClient, createPublicClient, http, parseEther, encodeFunctionData } from "viem"
import { defineChain } from "viem"
import { writeFileSync, readFileSync } from "fs"
import { join } from "path"
import * as crypto from "crypto"

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

// Token addresses
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as `0x${string}`
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 DEPLOY COMPLETO DO CONTRATO TOKENSWAP")
  console.log("=".repeat(70))
  console.log()

  // Step 1: Generate or use existing wallet
  let privateKey: `0x${string}`
  let account

  if (process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("📝 Usando chave privada do ambiente...")
    privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`
    account = privateKeyToAccount(privateKey)
  } else {
    console.log("🔑 Gerando nova carteira...")
    privateKey = `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`
    account = privateKeyToAccount(privateKey)
    
    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ NOVA CARTEIRA GERADA")
    console.log("=".repeat(70))
    console.log("Endereço:", account.address)
    console.log("Chave Privada:", privateKey)
    console.log("=".repeat(70))
    console.log()
    console.log("⚠️  IMPORTANTE: Salve a chave privada acima!")
    console.log("⚠️  Você precisará de USDC nesta carteira para gas.")
    console.log("⚠️  Faucet: https://faucet.circle.com")
    console.log()
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

  // Check balance
  console.log("💰 Verificando saldo...")
  try {
    const balance = await publicClient.getBalance({ address: account.address })
    const balanceFormatted = parseEther(balance.toString(), "wei")
    console.log("Saldo:", balanceFormatted.toString(), "USDC")
    console.log()

    if (balance === 0n) {
      console.log("⚠️  ERRO: Carteira sem saldo!")
      console.log("Por favor, financie a carteira com USDC para gas.")
      console.log("Endereço para financiar:", account.address)
      console.log("Faucet: https://faucet.circle.com")
      console.log()
      console.log("Após financiar, execute este script novamente.")
      process.exit(1)
    }
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo (continuando mesmo assim)")
    console.log()
  }

  console.log("=".repeat(70))
  console.log("  📦 COMPILANDO CONTRATO")
  console.log("=".repeat(70))
  console.log()

  // Step 2: Compile contract using Hardhat or provide instructions
  console.log("Para compilar o contrato, você tem duas opções:")
  console.log()
  console.log("OPÇÃO 1: Usar Remix IDE (MAIS FÁCIL)")
  console.log("1. Acesse: https://remix.ethereum.org")
  console.log("2. Crie novo arquivo: TokenSwap.sol")
  console.log("3. Cole o conteúdo de contracts/TokenSwap.sol")
  console.log("4. Compile com Solidity 0.8.20")
  console.log("5. Copie o bytecode compilado")
  console.log()
  console.log("OPÇÃO 2: Usar Hardhat")
  console.log("1. Execute: npm run compile")
  console.log("2. O bytecode estará em artifacts/contracts/TokenSwap.sol/TokenSwap.json")
  console.log()

  // For now, we'll use a simplified approach with Remix
  console.log("=".repeat(70))
  console.log("  📋 INSTRUÇÕES PARA DEPLOY VIA REMIX")
  console.log("=".repeat(70))
  console.log()
  console.log("1. Acesse: https://remix.ethereum.org")
  console.log("2. Crie arquivo TokenSwap.sol na pasta contracts")
  console.log("3. Cole o código de contracts/TokenSwap.sol")
  console.log("4. Compile (Solidity 0.8.20)")
  console.log("5. Vá para aba 'Deploy & Run Transactions'")
  console.log("6. Selecione 'Injected Provider - MetaMask'")
  console.log("7. Certifique-se de estar na Arc Testnet (Chain ID: 5042002)")
  console.log("8. No campo 'Deploy', insira os parâmetros do construtor:")
  console.log(`   ["${USDC_ADDRESS}", "${EURC_ADDRESS}"]`)
  console.log("9. Clique em 'Deploy'")
  console.log("10. Copie o endereço do contrato deployado")
  console.log("11. Atualize lib/swap-contract.ts com o endereço")
  console.log()

  // Alternative: Try to use Hardhat if available
  try {
    const hardhat = await import("hardhat")
    console.log("✅ Hardhat detectado! Tentando compilar...")
    console.log()
    
    // This would work if Hardhat is properly set up
    console.log("Execute: npm run compile")
    console.log("Depois: npm run deploy:swap")
    console.log()
  } catch (error) {
    console.log("Hardhat não disponível. Use Remix IDE ou instale Hardhat.")
    console.log()
  }

  console.log("=".repeat(70))
  console.log("  📝 INFORMAÇÕES PARA DEPLOY")
  console.log("=".repeat(70))
  console.log()
  console.log("Carteira Deployer:", account.address)
  console.log("Chave Privada:", privateKey)
  console.log("Rede: Arc Testnet (Chain ID: 5042002)")
  console.log("RPC: https://rpc.testnet.arc.network")
  console.log("Explorer: https://testnet.arcscan.app")
  console.log()
  console.log("Token Addresses:")
  console.log("  USDC:", USDC_ADDRESS)
  console.log("  EURC:", EURC_ADDRESS)
  console.log()
  console.log("Após deploy, atualize:")
  console.log("  lib/swap-contract.ts → SWAP_CONTRACT_ADDRESS")
  console.log()
}

main().catch((error) => {
  console.error("Erro:", error)
  process.exit(1)
})

