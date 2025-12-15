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
      // Tentar fazer switch usando wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
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
            // Aguardar um pouco e tentar switch novamente
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
                  Selecionar Rede
                </Button>
                <Button
                  onClick={async () => {
                    // Se não estiver na Arc Testnet, mostrar seletor primeiro
                    if (chainId !== 0 && chainId !== arcTestnet.id) {
                      setShowNetworkSelector(true)
                      return
                    }
                    // Conectar carteira
                    await connect()
                    // Verificar rede após conectar
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
                  <h2 className="text-xl font-bold text-foreground">Selecionar Rede</h2>
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
                    // Se não estiver conectado, conectar após selecionar rede
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
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 backdrop-blur-sm border border-white/10">
              <TabsTrigger value="gm" className="data-[state=active]:bg-white/10">
                Daily GM
              </TabsTrigger>
              <TabsTrigger value="swap" className="data-[state=active]:bg-white/10">
                Swap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gm" className="space-y-6">
              <DailyGM account={isConnected ? address : null} />
            </TabsContent>

            <TabsContent value="swap" className="space-y-6">
              <TokenSwapReal account={isConnected ? address : null} />
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
      <footer className="container mx-auto px-4 py-8 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-white/50">
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
            Arc Network
          </Button>

          <Button
            onClick={() => window.open("https://x.com/arc", "_blank")}
            variant="ghost"
            className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow on X
          </Button>

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
            Block Explorer
          </Button>
        </div>
      </footer>
    </div>
  )
}
