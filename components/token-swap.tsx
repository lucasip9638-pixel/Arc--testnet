"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDownUp } from "lucide-react"

interface TokenSwapProps {
  account: string | null
}

export function TokenSwap({ account }: TokenSwapProps) {
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC")
  const [toToken, setToToken] = useState<"USDC" | "EURC">("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapSuccess, setSwapSuccess] = useState(false)

  // Mock exchange rate (1:1 for simplicity)
  const exchangeRate = 1.0
  const swapFee = 0.003 // 0.3%

  useEffect(() => {
    if (fromAmount) {
      const amount = Number.parseFloat(fromAmount)
      if (!isNaN(amount)) {
        const afterFee = amount * (1 - swapFee)
        const output = afterFee * exchangeRate
        setToAmount(output.toFixed(6))
      }
    } else {
      setToAmount("")
    }
  }, [fromAmount])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!account || !fromAmount || Number.parseFloat(fromAmount) <= 0) return

    setIsSwapping(true)
    setSwapSuccess(false)

    try {
      // Simulate swap transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSwapSuccess(true)
      setFromAmount("")
      setToAmount("")

      // Reset success state after 3 seconds
      setTimeout(() => setSwapSuccess(false), 3000)
    } catch (error) {
      console.error("Swap failed:", error)
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6">Token Swap</h2>

      {/* From Token */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">From</label>
          <span className="text-xs text-muted-foreground">Balance: 0.00</span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-background/50 border-border/50 text-lg"
            disabled={!account}
          />
          <Button variant="secondary" className="min-w-24">
            {fromToken}
          </Button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-4">
        <Button variant="ghost" size="icon" onClick={handleSwapTokens} className="rounded-full hover:bg-accent/20">
          <ArrowDownUp className="h-5 w-5" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">To</label>
          <span className="text-xs text-muted-foreground">Balance: 0.00</span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="flex-1 bg-background/50 border-border/50 text-lg"
          />
          <Button variant="secondary" className="min-w-24">
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
              1 {fromToken} = {exchangeRate} {toToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee (0.3%)</span>
            <span className="text-foreground">
              {(Number.parseFloat(fromAmount) * swapFee).toFixed(6)} {fromToken}
            </span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!account || !fromAmount || Number.parseFloat(fromAmount) <= 0 || isSwapping}
        className="w-full h-12 text-base font-semibold"
      >
        {!account ? "Connect Wallet" : isSwapping ? "Swapping..." : swapSuccess ? "Swap Successful!" : "Swap"}
      </Button>
    </Card>
  )
}
