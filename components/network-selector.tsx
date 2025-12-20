"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// Card component inline para evitar dependência
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`}>
    {children}
  </div>
)
import { CheckCircle2, AlertCircle, Network } from "lucide-react"
import { useChainId, useSwitchChain } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"

interface NetworkSelectorProps {
  onNetworkSelected?: () => void
}

export function NetworkSelector({ onNetworkSelected }: NetworkSelectorProps) {
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)

  const handleSelectArcTestnet = async () => {
    try {
      setIsAddingNetwork(true)
      
      // Try to switch using wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
        onNetworkSelected?.()
      } catch (switchError: any) {
        // If it fails, try to add the network directly
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
              // Wait a bit and try to switch again
              await new Promise(resolve => setTimeout(resolve, 1500))
              await switchChain({ chainId: arcTestnet.id })
              onNetworkSelected?.()
            } catch (addError: any) {
              console.error("Error adding network:", addError)
              alert("❌ Error adding network. Please add manually in MetaMask:\n\nNetwork: Arc Testnet\nRPC: https://rpc.testnet.arc.network\nChain ID: 5042002\nCurrency: USDC (6 decimals)")
            }
          }
        } else if (switchError?.code === 4001) {
          // User rejected
          alert("⚠️ Network switch cancelled. You need to be on Arc Testnet to use this dApp.")
        } else {
          throw switchError
        }
      }
    } catch (error: any) {
      console.error("Error switching network:", error)
      alert(`❌ Error switching network: ${error?.message || "Unknown error"}`)
    } finally {
      setIsAddingNetwork(false)
    }
  }

  const isArcTestnet = chainId === arcTestnet.id

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <Network className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Select Network</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Choose the network your wallet should be connected to use this dApp.
      </p>

      {/* Arc Testnet Option */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        isArcTestnet 
          ? "bg-green-500/10 border-green-500/50" 
          : "bg-background/30 border-border/50 hover:border-accent/50"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {isArcTestnet ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
            )}
            <div>
              <h4 className="font-semibold text-foreground">Arc Testnet</h4>
              <p className="text-xs text-muted-foreground">Recommended network</p>
            </div>
          </div>
          {isArcTestnet && (
            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="ml-8 space-y-1 text-sm text-muted-foreground">
          <p>• Chain ID: 5042002</p>
          <p>• Gas Token: USDC (6 decimals)</p>
          <p>• RPC: https://rpc.testnet.arc.network</p>
          <p>• Explorer: https://testnet.arcscan.app</p>
        </div>

        {!isArcTestnet && (
          <Button
            onClick={handleSelectArcTestnet}
            disabled={isSwitchingChain || isAddingNetwork}
            className="mt-4 w-full"
            variant={isArcTestnet ? "outline" : "default"}
          >
            {isSwitchingChain || isAddingNetwork ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                {isAddingNetwork ? "Adding network..." : "Switching network..."}
              </>
            ) : (
              <>
                <Network className="h-4 w-4 mr-2" />
                Connect to Arc Testnet
              </>
            )}
          </Button>
        )}

        {isArcTestnet && (
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-sm text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Your wallet is connected to Arc Testnet. You can pay gas in USDC.
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Important:</p>
            <p>This dApp only works on Arc Testnet. You need to be connected to this network to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send transactions (GM, Swap)</li>
              <li>Pay gas fees in USDC</li>
              <li>Access deployed contracts</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}

