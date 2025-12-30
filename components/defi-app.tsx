"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Wallet, AlertCircle, RefreshCw, Network, X } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import { TokenSwapReal } from "./token-swap-real"
import { DailyGM } from "./daily-gm"
import { SendToken } from "./send-token"
import { NetworkSelector } from "./network-selector"

export function DeFiApp() {
  const { address, isConnected, connect, disconnect } = useWallet()
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const [activeTab, setActiveTab] = useState("gm")
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleSwitchToArcTestnet = async () => {
    try {
      // Try to switch using wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
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
            // Wait a bit and try to switch again
            await new Promise(resolve => setTimeout(resolve, 1000))
            await switchChain({ chainId: arcTestnet.id })
          }
        } else {
          throw switchError
        }
      }
    } catch (error) {
      console.error("Error switching network:", error)
      alert("Failed to switch network. Please switch to Arc Testnet manually in your wallet.")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a4d5c] -z-10" />

      {/* Decorative SVG */}
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

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">Arc DeFi</div>
            <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-accent/20 border border-accent/30">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent font-medium">Testnet</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected || wagmiConnected ? (
              <>
                {/* Network Warning/Switch */}
                {chainId !== arcTestnet.id && (
                  <Button
                    onClick={handleSwitchToArcTestnet}
                    disabled={isSwitchingChain}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 gap-2"
                    title="Switch to Arc Testnet to pay gas fees in USDC"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {isSwitchingChain ? "Switching..." : "Switch to Arc Testnet"}
                  </Button>
                )}
                
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-mono text-sm text-white">
                  {formatAddress(address || wagmiAddress || "")}
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/40 transition-all"
                  title="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setShowNetworkSelector(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-white/20 text-white hover:bg-white/10 gap-2"
                >
                  <Network className="h-4 w-4" />
                  Select Network
                </Button>
                <Button
                  onClick={async () => {
                    // If not on Arc Testnet, show selector first
                    if (chainId !== 0 && chainId !== arcTestnet.id) {
                      setShowNetworkSelector(true)
                      return
                    }
                    // Connect wallet
                    await connect()
                    // Check network after connecting
                    if (typeof window !== "undefined" && window.ethereum) {
                      const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
                      if (currentChainId !== `0x${arcTestnet.id.toString(16)}`) {
                        setShowNetworkSelector(true)
                      }
                    }
                  }}
                  className="rounded-full bg-white hover:bg-white/90 text-[#0a1628] font-semibold gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Network Selector Modal */}
          {showNetworkSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/50 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Select Network</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNetworkSelector(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <NetworkSelector
                  onNetworkSelected={() => {
                    setShowNetworkSelector(false)
                    // If not connected, connect after selecting network
                    if (!isConnected && !wagmiConnected) {
                      setTimeout(() => connect(), 1000)
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">Arc DeFi Hub</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Swap tokens and say GM daily on Arc Network
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/5 backdrop-blur-sm border border-white/10">
              <TabsTrigger value="gm" className="data-[state=active]:bg-white/10">
                Daily GM
              </TabsTrigger>
              <TabsTrigger value="swap" className="data-[state=active]:bg-white/10">
                Swap
              </TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-white/10">
                Send Tokens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gm" className="space-y-6">
              <DailyGM account={isConnected ? address : null} />
            </TabsContent>

            <TabsContent value="swap" className="space-y-6">
              <TokenSwapReal account={isConnected ? address : null} />
            </TabsContent>

            <TabsContent value="send" className="space-y-6">
              <SendToken account={isConnected ? address : null} />
            </TabsContent>
          </Tabs>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
              <p className="text-sm text-white/60 mb-1">Network</p>
              <p className="text-lg font-semibold text-white">Arc Testnet</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
              <p className="text-sm text-white/60 mb-1">Chain ID</p>
              <p className="text-lg font-mono font-semibold text-white">5042002</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
              <p className="text-sm text-white/60 mb-1">Gas Token</p>
              <p className="text-lg font-semibold text-white">USDC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-[3cm]">
          {/* Left Side - Arc Network Links */}
          <div className="flex flex-col gap-3 items-center">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 text-center">Arc Network</p>
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
          <div className="flex flex-col gap-3 items-center">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 text-center">Developer</p>
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
        </div>
      </footer>
    </div>
  )
}
