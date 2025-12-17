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

  // Verificar rede ao montar componente
  useEffect(() => {
    if (isConnected && chainId !== arcTestnet.id) {
      setErrorMessage("⚠️ Você está na rede errada! Troque para Arc Testnet no topo da página para pagar gas em USDC.")
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

  // Wait for transaction with faster polling
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000, // Poll every 1 second for faster confirmation
    query: {
      enabled: !!hash,
      retry: true,
    },
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

  // Função para trocar para Arc Testnet
  const handleSwitchToArcTestnet = async () => {
    setIsSwitchingChain(true)
    setErrorMessage(null)
    
    try {
      // Tentar fazer switch usando wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
        // Aguardar rede mudar
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (switchError: any) {
        // Se falhar, tentar adicionar a rede diretamente
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
            // Aguardar rede ser adicionada e mudar
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
    if (!isConnected || !address || !canSayGM) return

    if (DAILY_GM_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setErrorMessage("DailyGM contract not deployed. Please deploy the contract first.")
      return
    }

    setErrorMessage(null)
    setGmSuccess(false)

    // Verificar primeiro diretamente no MetaMask qual é a rede atual
    let currentChainIdFromWallet = chainId
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const walletChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
        currentChainIdFromWallet = parseInt(walletChainId, 16)
      } catch (error) {
        console.error("Error getting chainId from wallet:", error)
      }
    }

    // Verificar e trocar para Arc Testnet se necessário
    if (currentChainIdFromWallet !== arcTestnet.id) {
      setIsSwitchingChain(true)
      try {
        // Tentar fazer switch
        await switchChain({ chainId: arcTestnet.id })
        
        // Aguardar e verificar se a rede realmente trocou
        let attempts = 0
        const maxAttempts = 10
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500))
          if (typeof window !== "undefined" && window.ethereum) {
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
            const currentChainIdNumber = parseInt(currentChainId, 16)
            if (currentChainIdNumber === arcTestnet.id) {
              break
            }
          }
          attempts++
        }
        
        // Verificar novamente o chainId do wagmi
        if (chainId !== arcTestnet.id && attempts >= maxAttempts) {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask.")
          setIsSwitchingChain(false)
          return
        }
      } catch (switchError: any) {
        setIsSwitchingChain(false)
        // Se a rede não existir, adicionar
        if (switchError?.code === 4902 || switchError?.name === "ChainNotFoundError" || switchError?.message?.includes("not found")) {
          if (typeof window !== "undefined" && window.ethereum) {
            try {
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
              // Aguardar e verificar se a rede trocou
              await new Promise(resolve => setTimeout(resolve, 1500))
              let attempts = 0
              const maxAttempts = 10
              while (attempts < maxAttempts) {
                if (typeof window !== "undefined" && window.ethereum) {
                  const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
                  const currentChainIdNumber = parseInt(currentChainId, 16)
                  if (currentChainIdNumber === arcTestnet.id) {
                    break
                  }
                }
                await new Promise(resolve => setTimeout(resolve, 500))
                attempts++
              }
            } catch (addError) {
              setErrorMessage("Falha ao adicionar Arc Testnet. Por favor, adicione manualmente no MetaMask.")
              setIsSwitchingChain(false)
              return
            }
          }
        } else if (switchError?.code === 4001) {
          setErrorMessage("Troca de rede cancelada pelo usuário.")
          setIsSwitchingChain(false)
          return
        } else {
          setErrorMessage("Por favor, troque para Arc Testnet para pagar gas em USDC.")
          setIsSwitchingChain(false)
          return
        }
      }
      setIsSwitchingChain(false)
      
      // Verificar novamente após a troca
      if (typeof window !== "undefined" && window.ethereum) {
        const finalChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
        const finalChainIdNumber = parseInt(finalChainId, 16)
        if (finalChainIdNumber !== arcTestnet.id) {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask.")
          return
        }
      }
    }

    try {
      // Não passar chainId - deixar wagmi usar a rede atual (que já verificamos ser Arc Testnet)
      writeContract({
        address: DAILY_GM_CONTRACT_ADDRESS,
        abi: DAILY_GM_ABI,
        functionName: "sayGM",
      })
    } catch (error: any) {
      console.error("GM failed:", error)
      if (error?.message?.includes("chain") || error?.message?.includes("network") || error?.message?.includes("cadeia")) {
        setErrorMessage("Rede incorreta. Por favor, troque para Arc Testnet e tente novamente.")
      } else if (error?.message?.includes("User rejected") || error?.message?.includes("user rejected") || error?.message?.includes("rejected")) {
        setErrorMessage("Transação cancelada pelo usuário")
      } else {
        setErrorMessage(`Falha ao enviar GM: ${error?.message || "Erro desconhecido"}`)
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

  const isSending = isPending || isConfirming || isSwitchingChain

  return (
    <Card className="p-4 sm:p-6 bg-[#0f1729]/40 backdrop-blur-xl border-white/5 shadow-xl">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Daily GM</h2>

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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total GMs</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{stats.totalGMs}</p>
        </div>
        <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg p-2 sm:p-3 text-center border border-accent/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="h-3 w-3 text-accent" />
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-accent">{stats.currentStreak}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Longest</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{stats.longestStreak}</p>
        </div>
      </div>

      {/* GM Button / Countdown */}
      {!canSayGM && !gmSuccess && timeUntilNext > 0 && (
        <div className="bg-background/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Next GM available in</p>
          <p className="text-xl sm:text-2xl font-mono font-bold text-accent">{formatTime(timeUntilNext)}</p>
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
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-3 sm:px-4 animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-accent/40 shadow-2xl backdrop-blur-xl relative max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              {/* Success message */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🌅</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">GM Sent!</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">Your on-chain good morning is now live on Arc Testnet</p>
                {hash && (
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {hash}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleShareOnX}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 gap-2 sm:gap-3"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
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
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Wrong Network</p>
              <p className="text-xs text-yellow-500/80">
                Please switch to Arc Testnet (Chain ID: 5042002) to send GM. Gas fees will be paid in USDC, not ETH.
              </p>
            </div>
            <Button
              onClick={handleSwitchToArcTestnet}
              disabled={isSwitchingChain}
              size="sm"
              variant="outline"
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20"
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
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
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
      <p className="text-xs text-muted-foreground text-center mt-4">
        Send a daily GM on-chain to maintain your streak and earn rewards!
      </p>
    </Card>
  )
}
