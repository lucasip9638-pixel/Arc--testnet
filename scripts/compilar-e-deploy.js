/**
 * Compila o contrato e faz deploy usando solc + viem
 */

const solc = require("solc")
const fs = require("fs")
const path = require("path")
const { createWalletClient, http } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")

// Arc Testnet
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
}

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

async function main() {
  console.log("=".repeat(70))
  console.log("  🚀 COMPILAR E DEPLOYAR CONTRATO TOKENSWAP")
  console.log("=".repeat(70))
  console.log()

  // Load private key
  let privateKey
  try {
    const deployerPath = path.join(process.cwd(), ".env.deployer")
    const content = fs.readFileSync(deployerPath, "utf8")
    const match = content.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
    if (!match) throw new Error("Chave privada não encontrada")
    privateKey = match[1]
    console.log("✅ Chave privada carregada")
  } catch (error) {
    console.error("❌ Erro:", error.message)
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log("Carteira:", account.address)
  console.log()

  // Read contract
  const contractPath = path.join(process.cwd(), "contracts", "TokenSwap.sol")
  const source = fs.readFileSync(contractPath, "utf8")

  console.log("📦 Compilando contrato...")
  
  const input = {
    language: "Solidity",
    sources: {
      "TokenSwap.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)))
    
    if (output.errors) {
      const errors = output.errors.filter(e => e.severity === "error")
      if (errors.length > 0) {
        console.error("❌ Erros de compilação:")
        errors.forEach(e => console.error("  -", e.message))
        process.exit(1)
      }
    }

    const contract = output.contracts["TokenSwap.sol"]["TokenSwap"]
    const bytecode = contract.evm.bytecode.object
    const abi = contract.abi

    console.log("✅ Contrato compilado com sucesso!")
    console.log()

    // Deploy
    console.log("🚀 Fazendo deploy...")
    const client = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http("https://rpc.testnet.arc.network"),
    })

    // Check balance
    const balance = await client.getBalance({ address: account.address })
    console.log("Saldo:", balance.toString(), "wei")
    if (balance === 0n) {
      console.error("❌ Carteira sem saldo!")
      process.exit(1)
    }
    console.log()

    // Encode constructor parameters
    const { encodeAbiParameters } = require("viem")
    const encodedArgs = encodeAbiParameters(
      [
        { type: "address", name: "_usdc" },
        { type: "address", name: "_eurc" },
      ],
      [USDC_ADDRESS, EURC_ADDRESS]
    )

    const deployBytecode = bytecode + encodedArgs.slice(2) // Remove 0x prefix

    const hash = await client.sendTransaction({
      to: null, // Contract creation
      data: deployBytecode,
    })

    console.log("Transaction Hash:", hash)
    console.log("Aguardando confirmação...")

    // Wait for receipt
    const receipt = await client.waitForTransactionReceipt({ hash })

    if (!receipt.contractAddress) {
      console.error("❌ Contrato não foi deployado!")
      process.exit(1)
    }

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", receipt.contractAddress)
    console.log("Explorer:", `https://testnet.arcscan.app/address/${receipt.contractAddress}`)
    console.log()

    // Update lib/swap-contract.ts
    console.log("📝 Atualizando lib/swap-contract.ts...")
    const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
    let content = fs.readFileSync(swapContractPath, "utf8")
    content = content.replace(
      /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
      `export const SWAP_CONTRACT_ADDRESS = "${receipt.contractAddress}" as \`0x\${string}\``
    )
    fs.writeFileSync(swapContractPath, content)
    console.log("✅ Frontend atualizado!")
    console.log()

    console.log("Próximos passos:")
    console.log("1. Financie o contrato com USDC e EURC")
    console.log("2. Teste: npm run dev")
    console.log()

  } catch (error) {
    console.error("❌ Erro:", error.message)
    console.log()
    console.log("Tente usar Remix IDE como alternativa (veja DEPLOY-AGORA.md)")
    process.exit(1)
  }
}

main().catch(console.error)

