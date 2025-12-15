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
      
      // Tentar fazer switch usando wagmi
      try {
        await switchChain({ chainId: arcTestnet.id })
        onNetworkSelected?.()
      } catch (switchError: any) {
        // Se falhar, tentar adicionar a rede diretamente
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
              // Aguardar um pouco e tentar switch novamente
              await new Promise(resolve => setTimeout(resolve, 1500))
              await switchChain({ chainId: arcTestnet.id })
              onNetworkSelected?.()
            } catch (addError: any) {
              console.error("Error adding network:", addError)
              alert("❌ Erro ao adicionar rede. Por favor, adicione manualmente no MetaMask:\n\nRede: Arc Testnet\nRPC: https://rpc.testnet.arc.network\nChain ID: 5042002\nMoeda: USDC (6 decimais)")
            }
          }
        } else if (switchError?.code === 4001) {
          // Usuário rejeitou
          alert("⚠️ Troca de rede cancelada. Você precisa estar na Arc Testnet para usar este dApp.")
        } else {
          throw switchError
        }
      }
    } catch (error: any) {
      console.error("Error switching network:", error)
      alert(`❌ Erro ao trocar rede: ${error?.message || "Erro desconhecido"}`)
    } finally {
      setIsAddingNetwork(false)
    }
  }

  const isArcTestnet = chainId === arcTestnet.id

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <Network className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Selecione a Rede</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Escolha a rede que sua carteira deve estar conectada para usar este dApp.
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
              <p className="text-xs text-muted-foreground">Rede recomendada</p>
            </div>
          </div>
          {isArcTestnet && (
            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full">
              Ativa
            </span>
          )}
        </div>

        <div className="ml-8 space-y-1 text-sm text-muted-foreground">
          <p>• Chain ID: 5042002</p>
          <p>• Gas Token: USDC (6 decimais)</p>
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
                {isAddingNetwork ? "Adicionando rede..." : "Trocando rede..."}
              </>
            ) : (
              <>
                <Network className="h-4 w-4 mr-2" />
                Conectar à Arc Testnet
              </>
            )}
          </Button>
        )}

        {isArcTestnet && (
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-sm text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Sua carteira está conectada à Arc Testnet. Você pode pagar gas em USDC.
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Importante:</p>
            <p>Este dApp funciona apenas na Arc Testnet. Você precisa estar conectado a esta rede para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Enviar transações (GM, Swap)</li>
              <li>Pagar taxas de gas em USDC</li>
              <li>Acessar os contratos deployados</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}

