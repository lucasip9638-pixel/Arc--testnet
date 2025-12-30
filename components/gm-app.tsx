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

  // Auto-switch to Arc Testnet when connecting
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
                  <p className="text-sm font-medium leading-none">Connected Wallet</p>
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
                <span>Copy Address</span>
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
                <span>View on Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
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

      <footer className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-[3cm] gap-4 border-t border-white/10 pt-6">
        {/* Left Side - Arc Network Links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Arc Network</p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open("https://www.arc.network/", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Arc Network Website"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </Button>

            <Button
              onClick={() => window.open("https://x.com/arc", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Follow Arc Network on X"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Button>

            <Button
              onClick={() => window.open("https://testnet.arcscan.app", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Arc Testnet Block Explorer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Right Side - Developer Links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Developer</p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open("https://x.com/lucas9879171721", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Follow developer on X"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Button>
            <Button
              onClick={() => window.open("https://github.com/lucasip9638-pixel", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="View developer on GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button
              onClick={() => window.open("http://discordapp.com/users/1304074522067996854", "_blank")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Contact developer on Discord"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
