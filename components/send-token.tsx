"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { ERC20_ABI } from "@/lib/erc20"
import { TOKENS, getTokenAddress, getTokenDecimals, parseTokenAmount, formatTokenAmount } from "@/lib/tokens"

interface SendTokenProps {
  account: string | null
}

type SendState = "idle" | "pending" | "success" | "error"

export function SendToken({ account }: SendTokenProps) {
  const { address, isConnected } = useAccount()
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
    error: balanceError,
    isLoading: balanceLoading 
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  // Write contract for transfer
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Update state based on transaction
  useEffect(() => {
    if (hash) {
      setTxHash(hash)
      setSendState("pending")
    }
    if (isConfirmed) {
      setSendState("success")
      setAmount("")
      setRecipientAddress("")
      // Refetch balance
      refetchBalance()
      // Reset after 3 seconds
      setTimeout(() => {
        setSendState("idle")
        setTxHash(null)
      }, 3000)
    }
    if (error) {
      setSendState("error")
      setErrorMessage(error.message || "Transaction failed")
      setTimeout(() => {
        setSendState("idle")
        setErrorMessage(null)
      }, 5000)
    }
  }, [hash, isConfirmed, error, refetchBalance])

  const handleSend = async () => {
    if (!isConnected || !address || !amount || Number.parseFloat(amount) <= 0 || !recipientAddress) return

    // Validate recipient address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setErrorMessage("Invalid recipient address. Please enter a valid Ethereum address.")
      setSendState("error")
      return
    }

    // Check if token address is valid (not zero address)
    const isZeroAddress = (addr: string) => addr === "0x0000000000000000000000000000000000000000" || addr === "0x0"
    
    if (isZeroAddress(tokenAddress)) {
      setErrorMessage("Token address not configured. Please update lib/tokens.ts with actual token addresses.")
      setSendState("error")
      return
    }

    try {
      setSendState("pending")
      setErrorMessage(null)

      const transferAmount = parseTokenAmount(amount, tokenDecimals)

      // Check if balance is sufficient
      if (tokenBalance && typeof tokenBalance === 'bigint' && transferAmount > tokenBalance) {
        setErrorMessage("Insufficient balance. Make sure you have enough tokens and USDC for gas.")
        setSendState("error")
        return
      }

      // Execute transfer
      await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, transferAmount],
      })
    } catch (err) {
      console.error("Transfer error:", err)
      setSendState("error")
      
      // Handle user rejection
      if (err instanceof Error) {
        if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
          setErrorMessage("Transaction rejected by user")
        } else if (err.message.includes("insufficient funds") || err.message.includes("Insufficient")) {
          setErrorMessage("Insufficient balance. Make sure you have enough tokens and USDC for gas.")
        } else {
          setErrorMessage(err.message || "Transfer failed")
        }
      } else {
        setErrorMessage("Transfer failed. Please try again.")
      }
    }
  }

  // Format balance for display
  const tokenBalanceFormatted = tokenBalance
    ? formatTokenAmount(tokenBalance as bigint, tokenDecimals)
    : "0.00"

  const isSending = sendState === "pending" || isPending || isConfirming
  const canSend = isConnected && amount && Number.parseFloat(amount) > 0 && recipientAddress && !isSending

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Send Tokens</h2>
      </div>

      {/* Token Selection */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Select Token</label>
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
      </div>

      {/* Balance Display */}
      <div className="mb-6 p-4 bg-background/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your {selectedToken} Balance</span>
          <span className="text-lg font-semibold text-foreground">
            {isConnected ? (balanceLoading ? "Loading..." : tokenBalanceFormatted) : "0.00"} {selectedToken}
          </span>
        </div>
      </div>

      {/* Recipient Address */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Recipient Address</label>
        <Input
          type="text"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="bg-background/50 border-border/50 font-mono"
          disabled={!isConnected || isSending}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Amount</label>
          <span className="text-xs text-muted-foreground">
            Balance: {isConnected ? (balanceLoading ? "Loading..." : tokenBalanceFormatted) : "0.00"} {selectedToken}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-background/50 border-border/50 text-lg"
            disabled={!isConnected || isSending}
            step="any"
            min="0"
          />
          <Button
            variant="ghost"
            onClick={() => {
              if (tokenBalance && typeof tokenBalance === 'bigint') {
                const balance = formatTokenAmount(tokenBalance, tokenDecimals)
                setAmount(balance)
              }
            }}
            disabled={!isConnected || isSending || !tokenBalance}
            className="text-accent hover:text-accent/80"
          >
            MAX
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && sendState === "error" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Error</p>
            <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {sendState === "success" && txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-500 font-medium">Transfer Successful!</p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-500/80 mt-1 flex items-center gap-1 hover:underline"
            >
              View on Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!canSend}
        className="w-full h-12 text-base font-semibold gap-2"
      >
        {!isConnected ? (
          "Connect Wallet"
        ) : isSending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isConfirming ? "Confirming..." : "Sending..."}
          </span>
        ) : sendState === "success" ? (
          "Transfer Successful!"
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send {selectedToken}
          </>
        )}
      </Button>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Send {selectedToken} tokens to any address on Arc Testnet. Make sure you have enough USDC for gas fees.
      </p>
    </Card>
  )
}
