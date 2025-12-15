const { ethers } = require("ethers")
const fs = require("fs")
const path = require("path")

const TX_HASH = "0x269019010d8d72f8e976637a06a9790e62ccc343e5547b8ef95ff4186d456f80"

async function verificar() {
  console.log("Verificando transação...")
  console.log("Hash:", TX_HASH)
  console.log()

  const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network")
  
  try {
    const receipt = await provider.getTransactionReceipt(TX_HASH)
    
    if (!receipt) {
      console.log("⏳ Transação ainda não confirmada. Aguarde alguns segundos...")
      return
    }

    if (receipt.status === 1) {
      console.log("✅ Transação confirmada!")
      console.log()
      
      // Get contract address from receipt
      const contractAddress = receipt.contractAddress
      
      if (contractAddress) {
        console.log("=".repeat(70))
        console.log("  ✅ CONTRATO DEPLOYADO COM SUCESSO!")
        console.log("=".repeat(70))
        console.log()
        console.log("Endereço do Contrato:", contractAddress)
        console.log("Explorer:", `https://testnet.arcscan.app/address/${contractAddress}`)
        console.log()

        // Update frontend
        console.log("📝 Atualizando frontend...")
        const swapContractPath = path.join(process.cwd(), "lib", "swap-contract.ts")
        let content = fs.readFileSync(swapContractPath, "utf8")
        content = content.replace(
          /export const SWAP_CONTRACT_ADDRESS = "0x[^"]+" as `0x\${string}`/,
          `export const SWAP_CONTRACT_ADDRESS = "${contractAddress}" as \`0x\${string}\``
        )
        fs.writeFileSync(swapContractPath, content)
        console.log("✅ Frontend atualizado!")
        console.log()
        console.log("Próximos passos:")
        console.log("1. Financie o contrato com USDC e EURC")
        console.log("2. Teste: npm run dev")
      }
    } else {
      console.log("❌ Transação falhou")
    }
  } catch (error) {
    console.log("⏳ Aguardando confirmação...", error.message)
  }
}

verificar()

