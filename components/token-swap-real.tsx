"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { ERC20_ABI } from "@/lib/erc20"
import { TOKENS, getTokenAddress, getTokenDecimals, parseTokenAmount, formatTokenAmount } from "@/lib/tokens"
import { TOKEN_SWAP_ABI, SWAP_CONTRACT_ADDRESS } from "@/lib/swap-contract"

interface TokenSwapRealProps {
  account: string | null
}

type SwapState = "idle" | "pending" | "success" | "error" | "approving" | "approved"

export function TokenSwapReal({ account }: TokenSwapRealProps) {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC")
  const [toToken, setToToken] = useState<"USDC" | "EURC">("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [swapState, setSwapState] = useState<SwapState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const fromTokenAddress = getTokenAddress(fromToken)
  const toTokenAddress = getTokenAddress(toToken)
  const fromDecimals = getTokenDecimals(fromToken)
  const toDecimals = getTokenDecimals(toToken)

  // Read balances with error handling
  const { 
    data: usdcBalance, 
    refetch: refetchUSDC,
    error: usdcBalanceError,
    isLoading: usdcBalanceLoading 
  } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  const { 
    data: eurcBalance, 
    refetch: refetchEURC,
    error: eurcBalanceError,
    isLoading: eurcBalanceLoading 
  } = useReadContract({
    address: TOKENS.EURC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  // Read swap contract exchange rate and fee
  const { data: exchangeRateOnChain, error: exchangeRateError } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "exchangeRate",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: false,
    },
  })

  const { data: swapFeeOnChain, error: swapFeeError } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "swapFee",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: false,
    },
  })

  // Check allowance
  const { 
    data: allowance, 
    refetch: refetchAllowance,
    error: allowanceError 
  } = useReadContract({
    address: fromTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? [address, SWAP_CONTRACT_ADDRESS] 
      : undefined,
    query: {
      enabled: isConnected && !!address && SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000, // Refetch every 5 seconds when amount changes
      retry: false,
    },
  })

  // Write contract for approve and swap
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Calculate output amount using on-chain rate or default
  const exchangeRateValue = exchangeRateOnChain 
    ? Number(exchangeRateOnChain) / 1e6 
    : 1.0
  const swapFeeValue = swapFeeOnChain 
    ? Number(swapFeeOnChain) / 10000 
    : 0.003 // 0.3% default
  
  const toAmount = fromAmount
    ? (Number.parseFloat(fromAmount) * (1 - swapFeeValue) * exchangeRateValue).toFixed(6)
    : ""

  // Check if approval is needed
  const amountNeeded = fromAmount ? parseTokenAmount(fromAmount, fromDecimals) : BigInt(0)
  const needsApproval = allowance !== undefined && allowance !== null && typeof allowance === 'bigint' && amountNeeded > BigInt(0) && allowance < amountNeeded

  // Update state based on transaction
  useEffect(() => {
    if (hash) {
      setTxHash(hash)
      setSwapState("pending")
    }
    if (isConfirmed) {
      setSwapState("success")
      setFromAmount("")
      // Refetch balances and allowance
      refetchUSDC()
      refetchEURC()
      refetchAllowance()
      // Reset after 3 seconds
      setTimeout(() => {
        setSwapState("idle")
        setTxHash(null)
      }, 3000)
    }
    if (error) {
      setSwapState("error")
      setErrorMessage(error.message || "Transaction failed")
      setTimeout(() => {
        setSwapState("idle")
        setErrorMessage(null)
      }, 5000)
    }
  }, [hash, isConfirmed, error, refetchUSDC, refetchEURC])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }

  const handleApprove = async () => {
    if (!isConnected || !address || !fromAmount || Number.parseFloat(fromAmount) <= 0) return

    const isZeroAddress = (addr: string) => addr === "0x0000000000000000000000000000000000000000" || addr === "0x0"
    
    if (isZeroAddress(fromTokenAddress) || isZeroAddress(SWAP_CONTRACT_ADDRESS)) {
      setErrorMessage("Token or contract addresses not configured.")
      setSwapState("error")
      return
    }

    try {
      setSwapState("pending")
      setErrorMessage(null)

      const amount = parseTokenAmount(fromAmount, fromDecimals)
      // Approve a bit more than needed to avoid multiple approvals
      const approveAmount = amount * BigInt(2)

      await writeContract({
        address: fromTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [SWAP_CONTRACT_ADDRESS, approveAmount],
      })
    } catch (err) {
      console.error("Approve error:", err)
      setSwapState("error")
      setErrorMessage(err instanceof Error ? err.message : "Approval failed")
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !address || !fromAmount || Number.parseFloat(fromAmount) <= 0) return

    // Check if token addresses are valid (not zero addresses)
    const isZeroAddress = (addr: string) => addr === "0x0000000000000000000000000000000000000000" || addr === "0x0"
    
    if (isZeroAddress(fromTokenAddress) || isZeroAddress(toTokenAddress)) {
      setErrorMessage("Token addresses not configured. Please update lib/tokens.ts with actual token addresses.")
      setSwapState("error")
      return
    }

    // Check if swap contract address is set
    if (SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setErrorMessage("Swap contract address not configured. Please update lib/swap-contract.ts with the deployed contract address.")
      setSwapState("error")
      return
    }

    try {
      setSwapState("pending")
      setErrorMessage(null)

      const amount = parseTokenAmount(fromAmount, fromDecimals)

      // Determine which swap function to call
      const functionName = fromToken === "USDC" ? "swapUSDCtoEURC" : "swapEURCtoUSDC"

      // Execute swap via contract
      await writeContract({
        address: SWAP_CONTRACT_ADDRESS,
        abi: TOKEN_SWAP_ABI,
        functionName: functionName,
        args: [amount],
      })
    } catch (err) {
      console.error("Swap error:", err)
      setSwapState("error")
      
      // Handle user rejection
      if (err instanceof Error) {
        if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
          setErrorMessage("Transaction rejected by user")
        } else if (err.message.includes("insufficient funds") || err.message.includes("Insufficient")) {
          setErrorMessage("Insufficient balance. Make sure you have enough tokens and USDC for gas.")
        } else if (err.message.includes("allowance") || err.message.includes("Allowance")) {
          setErrorMessage("Insufficient allowance. Please approve the contract to spend your tokens first.")
        } else {
          setErrorMessage(err.message || "Swap failed")
        }
      } else {
        setErrorMessage("Swap failed. Please try again.")
      }
    }
  }

  // Format balances for display
  const usdcBalanceFormatted = usdcBalance
    ? formatTokenAmount(usdcBalance as bigint, TOKENS.USDC.decimals)
    : "0.00"
  const eurcBalanceFormatted = eurcBalance
    ? formatTokenAmount(eurcBalance as bigint, TOKENS.EURC.decimals)
    : "0.00"

  const fromBalance = fromToken === "USDC" ? usdcBalanceFormatted : eurcBalanceFormatted
  const toBalance = toToken === "USDC" ? usdcBalanceFormatted : eurcBalanceFormatted

  const isSwapping = swapState === "pending" || isPending || isConfirming
  const canSwap = isConnected && fromAmount && Number.parseFloat(fromAmount) > 0 && !isSwapping

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Swap USDC ⇄ EURC</h2>
        {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <div className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
            Contract Not Deployed
          </div>
        )}
      </div>

      {/* Contract not deployed warning */}
      {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Swap contract not deployed. Please deploy the contract and update the address in{" "}
              <code className="text-xs bg-yellow-500/20 px-1 rounded">lib/swap-contract.ts</code>
            </p>
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">From</label>
          <span className="text-xs text-muted-foreground">
            Balance: {isConnected ? (usdcBalanceLoading || eurcBalanceLoading ? "Loading..." : fromBalance) : "0.00"} {fromToken}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-background/50 border-border/50 text-lg"
            disabled={!isConnected || isSwapping}
            step="any"
            min="0"
          />
          <Button variant="secondary" className="min-w-24" disabled>
            {fromToken}
          </Button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapTokens}
          className="rounded-full hover:bg-accent/20"
          disabled={isSwapping}
        >
          <ArrowDownUp className="h-5 w-5" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">To</label>
          <span className="text-xs text-muted-foreground">
            Balance: {isConnected ? (usdcBalanceLoading || eurcBalanceLoading ? "Loading..." : toBalance) : "0.00"} {toToken}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="flex-1 bg-background/50 border-border/50 text-lg"
          />
          <Button variant="secondary" className="min-w-24" disabled>
            {toToken}
          </Button>
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && (
        <div className="bg-background/30 rounded-lg p-3 mb-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="text-foreground">
              1 {fromToken} = {exchangeRateValue.toFixed(6)} {toToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee ({(swapFeeValue * 100).toFixed(2)}%)</span>
            <span className="text-foreground">
              {(Number.parseFloat(fromAmount) * swapFeeValue).toFixed(6)} {fromToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">You will receive</span>
            <span className="text-foreground font-semibold">
              {toAmount} {toToken}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && swapState === "error" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Error</p>
            <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {swapState === "success" && txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-500 font-medium">Swap Successful!</p>
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

      {/* Approval needed message */}
      {needsApproval && fromAmount && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-500 font-medium mb-2">Approval Required</p>
          <p className="text-xs text-yellow-500/80 mb-3">
            You need to approve the swap contract to spend your {fromToken} tokens first.
          </p>
          <Button
            onClick={handleApprove}
            disabled={isSwapping}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30"
          >
            {isSwapping ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving...
              </span>
            ) : (
              `Approve ${fromToken}`
            )}
          </Button>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!canSwap || needsApproval}
        className="w-full h-12 text-base font-semibold"
      >
        {!isConnected ? (
          "Connect Wallet"
        ) : needsApproval ? (
          "Approve First"
        ) : isSwapping ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isConfirming ? "Confirming..." : "Swapping..."}
          </span>
        ) : swapState === "success" ? (
          "Swap Successful!"
        ) : (
          `Swap ${fromToken} → ${toToken}`
        )}
      </Button>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? (
          <>
            ⚠️ Swap contract not deployed. Please deploy the contract first.
            <br />
            Contract address needs to be configured in lib/swap-contract.ts
          </>
        ) : (
          <>
            Swap tokens on Arc Testnet. Get testnet tokens:{" "}
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Circle Faucet
            </a>
          </>
        )}
      </p>
    </Card>
  )
}

