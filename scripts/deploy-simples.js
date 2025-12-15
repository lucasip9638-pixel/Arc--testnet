console.log("Iniciando deploy...")

const { ethers } = require("ethers")
const fs = require("fs")
const path = require("path")

async function deploy() {
  try {
    console.log("=".repeat(70))
    console.log("  🚀 DEPLOY AUTOMÁTICO DO CONTRATO TOKENSWAP")
    console.log("=".repeat(70))
    console.log()

    // Load private key
    console.log("📝 Carregando chave privada...")
    const deployerPath = path.join(process.cwd(), ".env.deployer")
    const content = fs.readFileSync(deployerPath, "utf8")
    const match = content.match(/DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]+)/)
    if (!match) {
      throw new Error("Chave privada não encontrada")
    }
    const privateKey = match[1]
    console.log("✅ Chave privada carregada")
    console.log()

    // Connect to network
    console.log("🔗 Conectando à Arc Testnet...")
    const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network")
    const wallet = new ethers.Wallet(privateKey, provider)
    console.log("Carteira:", wallet.address)
    console.log()

    // Check balance
    console.log("💰 Verificando saldo...")
    const balance = await provider.getBalance(wallet.address)
    console.log("Saldo:", ethers.formatEther(balance), "USDC")
    if (balance === 0n) {
      throw new Error("Carteira sem saldo! Financie com USDC primeiro.")
    }
    console.log("✅ Saldo suficiente")
    console.log()

    // Read contract
    console.log("📄 Lendo contrato...")
    const contractPath = path.join(process.cwd(), "contracts", "TokenSwap.sol")
    const contractSource = fs.readFileSync(contractPath, "utf8")
    console.log("✅ Contrato lido")
    console.log()

    // Compile (using solc)
    console.log("📦 Compilando contrato...")
    const solc = require("solc")
    const input = {
      language: "Solidity",
      sources: {
        "TokenSwap.sol": { content: contractSource }
      },
      settings: {
        outputSelection: {
          "*": { "*": ["abi", "evm.bytecode"] }
        },
        optimizer: { enabled: true, runs: 200 }
      }
    }

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

    if (!bytecode || bytecode === "0x") {
      throw new Error("Bytecode vazio")
    }

    console.log("✅ Contrato compilado")
    console.log()

    // Deploy
    console.log("🚀 Fazendo deploy...")
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

    const factory = new ethers.ContractFactory(abi, bytecode, wallet)
    const contractInstance = await factory.deploy(USDC_ADDRESS, EURC_ADDRESS)
    
    console.log("Transaction Hash:", contractInstance.deploymentTransaction().hash)
    console.log("Aguardando confirmação...")

    await contractInstance.waitForDeployment()
    const address = await contractInstance.getAddress()

    console.log()
    console.log("=".repeat(70))
    console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
    console.log("=".repeat(70))
    console.log()
    console.log("Endereço do Contrato:", address)
    console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`)
    console.log()

    // Update frontend
    console.log("📝 Atualizando frontend...")
    const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
    let fileContent = fs.readFileSync(swapContractPath, "utf8")
    fileContent = fileContent.replace(
      /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
      `export const SWAP_CONTRACT_ADDRESS = "${address}" as \`0x\${string}\``
    )
    fs.writeFileSync(swapContractPath, fileContent)
    console.log("✅ Frontend atualizado!")
    console.log()

    console.log("Próximos passos:")
    console.log("1. Financie o contrato com USDC e EURC")
    console.log("2. Teste: npm run dev")
    console.log()

  } catch (error) {
    console.error()
    console.error("❌ Erro:", error.message)
    if (error.stack) {
      console.error("Stack:", error.stack)
    }
    process.exit(1)
  }
}

deploy()

