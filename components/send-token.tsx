"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { ERC20_ABI } from "@/lib/erc20"
import { TOKENS, getTokenAddress, getTokenDecimals, parseTokenAmount, formatTokenAmount } from "@/lib/tokens"

interface SendTokenProps {
  account: string | null
}

type SendState = "idle" | "pending" | "success" | "error"

export function SendToken({ account }: SendTokenProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const tokenAddress = getTokenAddress(selectedToken)
  const tokenDecimals = getTokenDecimals(selectedToken)

  // Read token balance
  const { 
    data: tokenBalance, 
    refetch: refetchBalance,
    isLoading: balanceLoading 
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000,
      retry: false,
    },
  })

  // Write contract for transfer
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000,
    query: {
      enabled: !!hash,
      retry: true,
    },
  })

  // Update state based on transaction
  useEffect(() => {
    if (hash) {
      console.log("Transaction hash received:", hash)
      setTxHash(hash)
      setSendState("pending")
    }
  }, [hash])

  // Handle confirmed transactions
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("Transaction confirmed:", hash)
      setSendState("success")
      setAmount("")
      setRecipientAddress("")
      setErrorMessage(null)
      refetchBalance()
      
      // Reset to idle after showing success message
      const timer = setTimeout(() => {
        setSendState("idle")
        setTxHash(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, hash, refetchBalance])

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error)
      setSendState("error")
      
      let errorMsg = error.message || "Falha na transação"
      
      if (error.message) {
        if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
          errorMsg = "Transação cancelada pelo usuário"
        } else if (error.message.includes("insufficient funds") || error.message.includes("Insufficient")) {
          errorMsg = "Saldo insuficiente. Verifique se você tem tokens e USDC para gas."
        } else if (error.message.includes("invalid address") || error.message.includes("Invalid")) {
          errorMsg = "Endereço de destino inválido. Verifique o endereço."
        } else if (error.message.includes("revert") || error.message.includes("execution reverted")) {
          errorMsg = "Transação revertida. Verifique: 1) Saldo suficiente, 2) Endereço válido."
        }
      }
      
      setErrorMessage(errorMsg)
      const timer = setTimeout(() => {
        setSendState("idle")
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSend = async () => {
    if (!isConnected || !address || !amount || !recipientAddress) return

    // Validate recipient address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setErrorMessage("Endereço de destino inválido. Deve ser um endereço Ethereum válido (0x...).")
      setSendState("error")
      return
    }

    // Validate amount
    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage("Valor inválido. O valor deve ser maior que zero.")
      setSendState("error")
      return
    }

    // Check balance
    const balance = tokenBalance as bigint | undefined
    if (!balance || typeof balance !== 'bigint') {
      setErrorMessage("Não foi possível verificar o saldo. Tente novamente.")
      setSendState("error")
      return
    }

    const amountToSend = parseTokenAmount(amount, tokenDecimals)
    if (amountToSend > balance) {
      setErrorMessage("Saldo insuficiente. Você não tem tokens suficientes.")
      setSendState("error")
      return
    }

    // Check if on correct network
    if (chainId !== arcTestnet.id) {
      setErrorMessage("Você precisa estar na Arc Testnet para enviar tokens.")
      setSendState("error")
      return
    }

    setSendState("pending")
    setErrorMessage(null)

    try {
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, amountToSend],
      })
    } catch (err: any) {
      console.error("Send error:", err)
      setSendState("error")
      setErrorMessage(`Erro ao enviar: ${err?.message || "Erro desconhecido"}`)
      setTimeout(() => {
        setSendState("idle")
        setErrorMessage(null)
      }, 5000)
    }
  }

  const tokenBalanceFormatted = tokenBalance
    ? formatTokenAmount(tokenBalance as bigint, tokenDecimals)
    : "0.00"

  const isSending = sendState === "pending" || isPending || isConfirming
  const canSend = isConnected && amount && recipientAddress && Number.parseFloat(amount) > 0 && !isSending

  return (
    <Card className="p-6 bg-[#0f1729]/40 backdrop-blur-xl border-white/5 shadow-xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Enviar Token</h2>

      {/* Token Selection */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Token</label>
        <div className="flex gap-2">
          <Button
            variant={selectedToken === "USDC" ? "default" : "outline"}
            onClick={() => setSelectedToken("USDC")}
            className="flex-1"
            disabled={isSending}
          >
            USDC
          </Button>
          <Button
            variant={selectedToken === "EURC" ? "default" : "outline"}
            onClick={() => setSelectedToken("EURC")}
            className="flex-1"
            disabled={isSending}
          >
            EURC
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Saldo: {isConnected ? (balanceLoading ? "Carregando..." : `${tokenBalanceFormatted} ${selectedToken}`) : "0.00"}
        </div>
      </div>

      {/* Recipient Address */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Endereço de Destino</label>
        <Input
          type="text"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="bg-background/50 border-border/50 font-mono text-sm"
          disabled={!isConnected || isSending}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2 mb-6">
        <label className="text-sm text-muted-foreground">Valor</label>
        <Input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-background/50 border-border/50 text-lg"
          disabled={!isConnected || isSending}
          step="any"
          min="0"
        />
      </div>

      {/* Error Message */}
      {errorMessage && sendState === "error" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Erro</p>
            <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Pending Transaction Message */}
      {(sendState === "pending" || isPending || isConfirming) && hash && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
          <div className="flex-1">
            <p className="text-sm text-blue-500 font-medium">
              {isConfirming ? "Confirmando transação na blockchain..." : "Transação enviada! Aguardando confirmação..."}
            </p>
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500/80 mt-1 flex items-center gap-1 hover:underline"
            >
              Ver no ArcScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Success Message */}
      {sendState === "success" && txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-500 font-medium">Token enviado com sucesso!</p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-500/80 mt-1 flex items-center gap-1 hover:underline"
            >
              Ver no ArcScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!canSend}
        className="w-full h-12 text-base font-semibold"
      >
        {!isConnected ? (
          "Conectar Carteira"
        ) : isSending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isConfirming ? "Confirmando..." : "Enviando..."}
          </span>
        ) : sendState === "success" ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Enviado!
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar {selectedToken}
          </span>
        )}
      </Button>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Envie tokens USDC ou EURC para qualquer endereço na Arc Testnet.
        <br />
        Certifique-se de ter USDC suficiente para pagar as taxas de gas.
      </p>
    </Card>
  )
}


