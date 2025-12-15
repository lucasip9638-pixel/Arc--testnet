/**
 * Deploy automático do contrato TokenSwap
 * Compila e faz deploy automaticamente usando viem
 */

const solc = require("solc")
const fs = require("fs")
const path = require("path")
const { createWalletClient, http, encodeAbiParameters } = require("viem")
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
  try {
    console.log("=".repeat(70))
    console.log("  🚀 DEPLOY AUTOMÁTICO DO CONTRATO TOKENSWAP")
    console.log("=".repeat(70))
    console.log()
  } catch (error) {
    console.error("Erro inicial:", error)
    process.exit(1)
  }

  // Step 1: Load private key
  console.log("📝 Carregando chave privada...")
  let privateKey
  try {
    const deployerPath = path.join(process.cwd(), ".env.deployer")
    if (!fs.existsSync(deployerPath)) {
      throw new Error(".env.deployer não encontrado")
    }
    const content = fs.readFileSync(deployerPath, "utf8")
    const match = content.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
    if (!match) throw new Error("Chave privada não encontrada")
    privateKey = match[1]
    console.log("✅ Chave privada carregada")
  } catch (error) {
    console.error("❌ Erro ao ler chave privada:", error.message)
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log("Carteira:", account.address)
  console.log()

  // Step 2: Read contract
  console.log("📄 Lendo contrato...")
  const contractPath = path.join(process.cwd(), "contracts", "TokenSwap.sol")
  if (!fs.existsSync(contractPath)) {
    console.error("❌ Arquivo contracts/TokenSwap.sol não encontrado")
    process.exit(1)
  }
  const source = fs.readFileSync(contractPath, "utf8")
  console.log("✅ Contrato lido")
  console.log()

  // Step 3: Compile
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

  let bytecode, abi
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

    if (!output.contracts || !output.contracts["TokenSwap.sol"] || !output.contracts["TokenSwap.sol"]["TokenSwap"]) {
      console.error("❌ Contrato não encontrado na compilação")
      process.exit(1)
    }

    const contract = output.contracts["TokenSwap.sol"]["TokenSwap"]
    bytecode = contract.evm.bytecode.object
    abi = contract.abi

    if (!bytecode || bytecode === "0x") {
      console.error("❌ Bytecode vazio")
      process.exit(1)
    }

    console.log("✅ Contrato compilado com sucesso!")
    console.log("   Bytecode length:", bytecode.length, "chars")
    console.log()
  } catch (error) {
    console.error("❌ Erro na compilação:", error.message)
    process.exit(1)
  }

  // Step 4: Create wallet client
  console.log("🔗 Conectando à rede...")
  const client = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  })
  console.log("✅ Conectado à Arc Testnet")
  console.log()

  // Step 5: Check balance
  console.log("💰 Verificando saldo...")
  try {
    const balance = await client.getBalance({ address: account.address })
    console.log("Saldo:", balance.toString(), "wei")
    if (balance === 0n) {
      console.error("❌ Carteira sem saldo!")
      console.log("Por favor, financie a carteira com USDC para gas.")
      console.log("Faucet: https://faucet.circle.com")
      process.exit(1)
    }
    console.log("✅ Saldo suficiente")
    console.log()
  } catch (error) {
    console.log("⚠️  Não foi possível verificar saldo:", error.message)
    console.log("Continuando mesmo assim...")
    console.log()
  }

  // Step 6: Encode constructor parameters
  console.log("🔧 Preparando parâmetros do construtor...")
  const encodedArgs = encodeAbiParameters(
    [
      { type: "address", name: "_usdc" },
      { type: "address", name: "_eurc" },
    ],
    [USDC_ADDRESS, EURC_ADDRESS]
  )
  console.log("✅ Parâmetros codificados")
  console.log("   USDC:", USDC_ADDRESS)
  console.log("   EURC:", EURC_ADDRESS)
  console.log()

  // Step 7: Deploy
  console.log("🚀 Fazendo deploy do contrato...")
  console.log("   (Isso pode levar alguns segundos...)")
  console.log()

  try {
    const deployBytecode = bytecode + encodedArgs.slice(2) // Remove 0x prefix and append

    const hash = await client.sendTransaction({
      to: null, // Contract creation
      data: deployBytecode,
    })

    console.log("Transaction Hash:", hash)
    console.log("Aguardando confirmação...")
    console.log("   (Pode levar 10-30 segundos...)")

    // Wait for receipt
    let receipt
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      try {
        receipt = await client.waitForTransactionReceipt({ hash, timeout: 10000 })
        if (receipt && receipt.contractAddress) {
          break
        }
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error("Timeout aguardando confirmação")
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
        process.stdout.write(".")
      }
    }

    if (!receipt || !receipt.contractAddress) {
      console.error("❌ Contrato não foi deployado!")
      console.log("Transaction Hash:", hash)
      console.log("Verifique no explorer: https://testnet.arcscan.app/tx/" + hash)
      process.exit(1)
    }

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", receipt.contractAddress)
    console.log("Transaction Hash:", hash)
    console.log("Explorer:", `https://testnet.arcscan.app/address/${receipt.contractAddress}`)
    console.log()

    // Step 8: Update frontend
    console.log("📝 Atualizando frontend...")
    try {
      const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
      let content = fs.readFileSync(swapContractPath, "utf8")
      content = content.replace(
        /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
        `export const SWAP_CONTRACT_ADDRESS = "${receipt.contractAddress}" as \`0x\${string}\``
      )
      fs.writeFileSync(swapContractPath, content)
      console.log("✅ lib/swap-contract.ts atualizado automaticamente!")
      console.log()
    } catch (error) {
      console.log("⚠️  Não foi possível atualizar automaticamente.")
      console.log("Atualize manualmente lib/swap-contract.ts:")
      console.log(`   export const SWAP_CONTRACT_ADDRESS = "${receipt.contractAddress}" as \`0x\${string}\``)
      console.log()
    }

    console.log("=".repeat(70))
    console.log("  🎉 DEPLOY CONCLUÍDO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Próximos passos:")
    console.log("1. ✅ Frontend atualizado automaticamente!")
    console.log()
    console.log("2. Financie o contrato com tokens:")
    console.log("   - Transfira USDC para:", receipt.contractAddress)
    console.log("   - Transfira EURC para:", receipt.contractAddress)
    console.log("   (O contrato precisa ter tokens para permitir swaps)")
    console.log()
    console.log("3. Teste a aplicação:")
    console.log("   npm run dev")
    console.log("   Acesse: http://localhost:3000")
    console.log("   Vá para aba 'Swap' e teste!")
    console.log()

  } catch (error) {
    console.error()
    console.error("❌ Erro no deploy:", error.message)
    if (error.cause) {
      console.error("   Detalhes:", error.cause.message || error.cause)
    }
    console.log()
    console.log("Verifique:")
    console.log("- Carteira tem saldo suficiente (USDC para gas)")
    console.log("- Rede Arc Testnet está acessível")
    console.log("- Chave privada está correta")
    process.exit(1)
  }
}

// Execute main
if (require.main === module) {
  main().catch((error) => {
    console.error("Erro fatal:", error)
    if (error.stack) {
      console.error("Stack:", error.stack)
    }
    process.exit(1)
  })
} else {
  module.exports = main
}

