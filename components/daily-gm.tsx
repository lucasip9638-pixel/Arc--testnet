"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Flame, Share2, ExternalLink, X, AlertCircle } from "lucide-react"
import { DAILY_GM_ABI, DAILY_GM_CONTRACT_ADDRESS } from "@/lib/daily-gm-contract"
import { arcTestnet } from "@/lib/wagmi-config"

interface DailyGMProps {
  account: string | null
}

export function DailyGM({ account }: DailyGMProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [gmSuccess, setGmSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)

  // Check network when mounting component
  useEffect(() => {
    if (isConnected && chainId !== arcTestnet.id) {
      setErrorMessage("⚠️ You are on the wrong network! Switch to Arc Testnet at the top of the page to pay gas in USDC.")
    } else {
      setErrorMessage(null)
    }
  }, [isConnected, chainId])

  // Read contract data
  const { data: canSayGMData, refetch: refetchCanSayGM } = useReadContract({
    address: DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? DAILY_GM_CONTRACT_ADDRESS 
      : undefined,
    abi: DAILY_GM_ABI,
    functionName: "canSayGM",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  const { data: timeUntilNextData, refetch: refetchTimeUntilNext } = useReadContract({
    address: DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? DAILY_GM_CONTRACT_ADDRESS 
      : undefined,
    abi: DAILY_GM_ABI,
    functionName: "getTimeUntilNextGM",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 1000, // Refetch every second for countdown
    },
  })

  const { data: gmRecordData, refetch: refetchGMRecord } = useReadContract({
    address: DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? DAILY_GM_CONTRACT_ADDRESS 
      : undefined,
    abi: DAILY_GM_ABI,
    functionName: "getGMRecord",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && DAILY_GM_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  // Write contract (send GM)
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Stats from contract
  const stats = {
    totalGMs: gmRecordData ? Number(gmRecordData[1]) : 0,
    currentStreak: gmRecordData ? Number(gmRecordData[2]) : 0,
    longestStreak: gmRecordData ? Number(gmRecordData[3]) : 0,
  }

  const canSayGM = canSayGMData ?? false
  const timeUntilNext = timeUntilNextData ? Number(timeUntilNextData) : 0

  // Update error message
  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message || "Transaction failed")
    } else {
      setErrorMessage(null)
    }
  }, [writeError])

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      setGmSuccess(true)
      setErrorMessage(null)
      // Refetch all data
      refetchCanSayGM()
      refetchTimeUntilNext()
      refetchGMRecord()
    }
  }, [isConfirmed, hash, refetchCanSayGM, refetchTimeUntilNext, refetchGMRecord])

  // Countdown timer
  useEffect(() => {
    if (timeUntilNext <= 0) {
      return
    }

    const interval = setInterval(() => {
      refetchTimeUntilNext()
    }, 1000)

    return () => clearInterval(interval)
  }, [timeUntilNext, refetchTimeUntilNext])

  // Confetti effect
  useEffect(() => {
    if (gmSuccess) {
      const colors = ["#60A5FA", "#22D3EE", "#FFFFFF", "#34D399"]
      const confettiCount = 50

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div")
        confetti.className = "confetti-arc"
        confetti.textContent = "ARC"
        confetti.style.left = `${Math.random() * 100}%`
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`
        confetti.style.animationDelay = `${Math.random() * 0.5}s`
        document.body.appendChild(confetti)

        setTimeout(() => confetti.remove(), 4000)
      }
    }
  }, [gmSuccess])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Function to switch to Arc Testnet
  const handleSwitchToArcTestnet = async () => {
    setIsSwitchingChain(true)
    setErrorMessage(null)
    
    try {
      // Try to switch using wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
        // Wait for network to change
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (switchError: any) {
        // If it fails, try to add the network directly
        if (switchError?.code === 4902 || switchError?.name === "ChainNotFoundError") {
          if (typeof window !== "undefined" && window.ethereum) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: `0x${arcTestnet.id.toString(16)}`,
                chainName: "Arc Testnet",
                nativeCurrency: {
                  name: "USDC",
                  symbol: "USDC",
                  decimals: 6,
                },
                rpcUrls: ["https://rpc.testnet.arc.network"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              }],
            })
            // Wait for network to be added and change
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } else {
          throw switchError
        }
      }
      setIsSwitchingChain(false)
    } catch (error: any) {
      setIsSwitchingChain(false)
      console.error("Error switching network:", error)
      setErrorMessage("Failed to switch network. Please switch to Arc Testnet manually in your wallet.")
    }
  }

  const handleSayGM = async () => {
    if (!isConnected || !address) {
      setErrorMessage("Please connect your wallet first.")
      return
    }

    if (DAILY_GM_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setErrorMessage("DailyGM contract not deployed. Please deploy the contract first.")
      return
    }

    // FORCE check if on the correct network (Arc Testnet - Chain ID: 5042002)
    if (chainId !== arcTestnet.id) {
      setErrorMessage("⚠️ You must be on Arc Testnet to send GM! Gas fees will be paid in USDC, not ETH. Click 'Switch to Arc Testnet' button above.")
      // Try to switch automatically
      try {
        await handleSwitchToArcTestnet()
        // Wait a bit and check again
        await new Promise(resolve => setTimeout(resolve, 2000))
        if (typeof window !== "undefined" && window.ethereum) {
          const newChainId = await window.ethereum.request({ method: "eth_chainId" })
          if (newChainId && parseInt(newChainId as string, 16) !== arcTestnet.id) {
            return // Still wrong network, user needs to switch manually
          }
        }
      } catch (error) {
        return // Failed to switch
      }
    }

    if (!canSayGM) {
      setErrorMessage("You already sent GM today. Wait for the countdown to finish.")
      return
    }

    setErrorMessage(null)
    setGmSuccess(false)

    try {
      // Write contract - this will trigger MetaMask to show USDC gas fee
      writeContract({
        address: DAILY_GM_CONTRACT_ADDRESS,
        abi: DAILY_GM_ABI,
        functionName: "sayGM",
        chainId: arcTestnet.id, // Explicitly set chain ID to ensure Arc Testnet
      })
    } catch (error: any) {
      console.error("GM failed:", error)
      if (error?.message?.includes("chain") || error?.message?.includes("network")) {
        setErrorMessage("Wrong network. Please switch to Arc Testnet (Chain ID: 5042002) to pay gas in USDC.")
      } else if (error?.message?.includes("rejected") || error?.message?.includes("User rejected")) {
        setErrorMessage("Transaction rejected. Please approve the transaction to pay gas fees in USDC.")
      } else if (error?.message?.includes("insufficient") || error?.message?.includes("balance")) {
        setErrorMessage("Insufficient USDC balance. You need USDC to pay gas fees on Arc Testnet.")
      } else {
        setErrorMessage(`Failed to send GM: ${error?.message || "Unknown error"}`)
      }
    }
  }

  const handleShareOnX = () => {
    const text = encodeURIComponent(
      `Just said GM on-chain with @arc! 🌅\n\nCurrent streak: ${stats.currentStreak} days 🔥\n\nView on ArcScan: https://testnet.arcscan.app/tx/${hash}`,
    )
    const url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleViewTransaction = () => {
    if (hash) {
      window.open(`https://testnet.arcscan.app/tx/${hash}`, "_blank", "noopener,noreferrer")
    }
  }

  const handleCloseModal = () => {
    setGmSuccess(false)
  }

  const isSending = isPending || isConfirming

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6">Daily GM</h2>

      {/* Contract not deployed warning */}
      {DAILY_GM_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              DailyGM contract not deployed. Please deploy the contract and update the address in{" "}
              <code className="text-xs bg-yellow-500/20 px-1 rounded">lib/daily-gm-contract.ts</code>
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* GM Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-background/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total GMs</p>
          <p className="text-xl font-bold text-foreground">{stats.totalGMs}</p>
        </div>
        <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg p-3 text-center border border-accent/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="h-3 w-3 text-accent" />
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <p className="text-xl font-bold text-accent">{stats.currentStreak}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Longest</p>
          <p className="text-xl font-bold text-foreground">{stats.longestStreak}</p>
        </div>
      </div>

      {/* GM Button / Countdown */}
      {!canSayGM && !gmSuccess && timeUntilNext > 0 && (
        <div className="bg-background/30 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Next GM available in</p>
          <p className="text-2xl font-mono font-bold text-accent">{formatTime(timeUntilNext)}</p>
        </div>
      )}

      {gmSuccess && hash && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={handleCloseModal}
          />

          {/* Centered floating modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border-2 border-accent/40 shadow-2xl backdrop-blur-xl relative">
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              {/* Success message */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">🌅</div>
                <h3 className="text-3xl font-bold text-foreground mb-2">GM Sent!</h3>
                <p className="text-muted-foreground mb-4">Your on-chain good morning is now live on Arc Testnet</p>
                {hash && (
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {hash}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleShareOnX}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 gap-3"
                  size="lg"
                >
                  <Share2 className="h-6 w-6" />
                  Share on X
                </Button>
                <Button
                  onClick={handleViewTransaction}
                  variant="secondary"
                  className="w-full h-14 text-lg font-semibold gap-3 bg-white/10 hover:bg-white/20 border border-white/20"
                  size="lg"
                >
                  <ExternalLink className="h-6 w-6" />
                  View on ArcScan
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Network Warning */}
      {isConnected && chainId !== arcTestnet.id && (
        <div className="mb-4 p-4 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-bold">⚠️ WRONG NETWORK - Switch Required</p>
              <p className="text-xs text-yellow-500/90 mt-1">
                You are currently on Chain ID: {chainId}. You MUST switch to Arc Testnet (Chain ID: 5042002) to send GM.
              </p>
              <p className="text-xs text-yellow-500/90 mt-1 font-semibold">
                💰 Gas fees on Arc Testnet are paid in USDC, not ETH!
              </p>
            </div>
            <Button
              onClick={handleSwitchToArcTestnet}
              disabled={isSwitchingChain}
              size="sm"
              variant="outline"
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 font-semibold whitespace-nowrap"
            >
              {isSwitchingChain ? "Switching..." : "Switch to Arc Testnet"}
            </Button>
          </div>
        </div>
      )}

      {/* Main GM Button */}
      <Button
        onClick={handleSayGM}
        disabled={!isConnected || !canSayGM || isSending || isSwitchingChain || DAILY_GM_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" || (isConnected && chainId !== arcTestnet.id)}
        className="w-full h-14 text-lg font-bold"
        size="lg"
      >
        {!isConnected
          ? "Connect Wallet"
          : isSwitchingChain
            ? "Switching to Arc Testnet..."
            : isSending
              ? isPending
                ? "Confirming in wallet..."
                : "Confirming transaction..."
              : !canSayGM
                ? "GM Already Sent"
                : chainId !== arcTestnet.id
                  ? "Switch to Arc Testnet"
                  : "Say GM 🌅"}
      </Button>

      {/* Info Text */}
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          Send a daily GM on-chain to maintain your streak and earn rewards!
        </p>
        {isConnected && chainId === arcTestnet.id && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-xs text-green-400 font-semibold">
              ✅ Connected to Arc Testnet - Gas fees will be paid in USDC
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
