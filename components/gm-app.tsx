"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, LogOut, ExternalLink, Wallet, Copy, ChevronDown } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TransactionState = "idle" | "pending" | "success" | "error"

export function GMApp() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [txState, setTxState] = useState<TransactionState>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [showConfetti, setShowConfetti] = useState(false)

  const handleConnect = async () => {
    const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  const handleSendGM = async () => {
    if (!isConnected) {
      await handleConnect()
      return
    }

    try {
      setTxState("pending")

      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`

      setTxHash(mockTxHash)
      setTxState("success")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      setTimeout(() => setTxState("idle"), 5000)
    } catch (error) {
      setTxState("error")
      setTimeout(() => setTxState("idle"), 3000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleShareGM = () => {
    const tweetText = encodeURIComponent("Just said GM on-chain with @arc! 🌅\n\nGood Morning everyone! ☀️")
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank")
  }

  const handleViewOnBlockchain = () => {
    window.open(`https://testnet.arcscan.app/tx/${txHash}`, "_blank")
  }

  const handleDisconnect = () => {
    disconnect()
    setTxState("idle")
    setTxHash("")
    setShowConfetti(false)
  }

  // Auto-switch para Arc Testnet quando conectar
  useEffect(() => {
    if (isConnected && typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then((chainId: unknown) => {
        const chainIdStr = chainId as string
        if (chainIdStr && parseInt(chainIdStr, 16) !== arcTestnet.id) {
          try {
            switchChain({ chainId: arcTestnet.id })
          } catch {
            // Silently fail if user rejects
          }
        }
      }).catch(() => {
        // Silently fail
      })
    }
  }, [isConnected, switchChain])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a4d5c] -z-10" />

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 1}s`,
                backgroundColor: ["#60a5fa", "#22d3ee", "#ffffff", "#4ade80"][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-20 -z-10">
        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M800 0C800 400 600 600 200 800" stroke="url(#gradient)" strokeWidth="2" />
          <defs>
            <linearGradient id="gradient" x1="800" y1="0" x2="200" y2="800">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <header className="absolute top-8 left-8 flex items-center gap-2">
        <div className="text-2xl font-bold text-white">Arc</div>
      </header>

      {isConnected ? (
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all gap-2 px-4 py-2"
              >
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-sm">
                  {formatAddress(address || "")}
                </span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-card/95 backdrop-blur-md border border-white/20"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Carteira Conectada</p>
                  <p className="text-xs leading-none text-muted-foreground font-mono">
                    {formatAddress(address || "")}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address)
                  }
                }}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Copiar Endereço</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (address) {
                    window.open(`https://testnet.arcscan.app/address/${address}`, "_blank")
                  }
                }}
                className="cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Ver no Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Desconectar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="absolute top-8 right-8">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="rounded-full bg-white hover:bg-white/90 text-[#0a1628] font-semibold gap-2 px-6 py-2.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>
      )}

      <div className="max-w-xl w-full text-center z-10">
        <h1
          className={`text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight transition-transform duration-300 ${txState === "success" ? "scale-110" : "scale-100"}`}
        >
          GM
        </h1>

        <p className="text-xl text-white/70 mb-12 leading-relaxed">Say Good Morning on-chain</p>

        <div className="relative">
          <Button
            size="lg"
            onClick={handleSendGM}
            disabled={txState === "pending"}
            className="h-16 px-12 text-lg font-semibold rounded-full bg-white hover:bg-white/90 text-[#0a1628] shadow-2xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {txState === "pending" ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending GM...
              </span>
            ) : txState === "success" ? (
              <span className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                GM Sent!
              </span>
            ) : !isConnected ? (
              "Connect & Send GM"
            ) : (
              "Send GM"
            )}
          </Button>
        </div>

        {txState === "success" && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
              <Button
                onClick={handleShareGM}
                size="lg"
                className="h-14 px-10 text-base font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 backdrop-blur-sm transition-all flex items-center gap-3 w-full"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share GM on X
              </Button>

              <Button
                onClick={handleViewOnBlockchain}
                size="lg"
                className="h-14 px-10 text-base font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 backdrop-blur-sm transition-all flex items-center gap-3 w-full"
              >
                <ExternalLink className="h-5 w-5" />
                View on Blockchain
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 h-6">
          {txState === "success" && txHash && (
            <a
              href={`https://explorer.testnet.arc.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/60 hover:text-white/90 transition-colors font-mono"
            >
              View on Explorer →
            </a>
          )}
          {txState === "error" && <p className="text-sm text-red-300">Failed to send. Please try again.</p>}
        </div>

        <div className="mt-20 flex items-center justify-center gap-8 text-sm text-white/50">
          <div>Arc Testnet</div>
          <div className="h-1 w-1 rounded-full bg-white/30" />
          <div className="font-mono">Chain 5042002</div>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-8 gap-4">
        {/* Lado Esquerdo - Blockchain da Arc e Site */}
        <div className="flex flex-col items-center ml-8">
          <div className="flex items-center gap-4 relative">
            <p className="text-xs font-semibold text-white/70 mb-3 absolute -top-6 left-1/2 -translate-x-1/2 uppercase tracking-wider text-center w-full">ARC TESTNET</p>
            <Button
              onClick={() => window.open("https://testnet.arcscan.app", "_blank")}
              variant="ghost"
              className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Blockchain da Arc
            </Button>

            <Button
              onClick={() => window.open("https://www.arc.network/", "_blank")}
              variant="ghost"
              className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Site
            </Button>
          </div>
        </div>

        {/* Lado Direito - X do Usuário */}
        <div className="flex flex-col items-center mr-8">
          <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wider text-center">SOCIAL DEV</p>
          <div className="flex items-center">
            <Button
              onClick={() => window.open("https://x.com/lucas9879171721", "_blank")}
              variant="ghost"
              className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="X (Twitter)"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
