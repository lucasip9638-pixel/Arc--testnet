"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Network, CheckCircle2, Loader2, Plus, AlertCircle, Info } from "lucide-react"
import { useChainId, useSwitchChain } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NetworkSwitcherProps {
  className?: string
}

export function NetworkSwitcher({ className }: NetworkSwitcherProps) {
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const isArcTestnet = chainId === arcTestnet.id

  const handleAddOrSwitchToArcTestnet = async () => {
    if (isArcTestnet) return

    setIsAddingNetwork(true)
    try {
      // Tentar fazer switch primeiro
      try {
        await switchChain({ chainId: arcTestnet.id })
      } catch (switchError: any) {
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
              // Aguardar e tentar switch novamente
              await new Promise(resolve => setTimeout(resolve, 1500))
              await switchChain({ chainId: arcTestnet.id })
            } catch (addError: any) {
              console.error("Error adding network:", addError)
              if (addError?.code !== 4001) {
                // Não mostrar erro se usuário cancelou
                alert("❌ Erro ao adicionar Arc Testnet. Por favor, adicione manualmente na carteira:\n\nRede: Arc Testnet\nRPC: https://rpc.testnet.arc.network\nChain ID: 5042002\nMoeda: USDC (6 decimais)")
              }
            }
          }
        } else if (switchError?.code !== 4001) {
          // Não mostrar erro se usuário cancelou
          console.error("Error switching network:", switchError)
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
    } finally {
      setIsAddingNetwork(false)
    }
  }

  const handleClick = () => {
    // Sempre mostrar a notificação quando clicar, mesmo se já estiver na rede
    setShowInfo(true)
  }

  const handleConfirmAdd = () => {
    setShowInfo(false)
    if (!isArcTestnet) {
      handleAddOrSwitchToArcTestnet()
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleClick}
        disabled={isSwitchingChain || isAddingNetwork}
        className={`rounded-full bg-[#0f1729]/50 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all gap-2 px-4 py-2 ${className} ${
          isArcTestnet ? "border-[#06b6d4]/50 bg-[#1e3a5f]/30 cursor-pointer" : "cursor-pointer"
        }`}
      >
        {isSwitchingChain || isAddingNetwork ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden md:inline text-sm font-medium">
              {isAddingNetwork ? "Adicionando..." : "Trocando..."}
            </span>
          </>
        ) : isArcTestnet ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-[#06b6d4]" />
            <span className="hidden md:inline text-sm font-medium">Arc Testnet</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline text-sm font-medium">Adicionar Arc Testnet</span>
          </>
        )}
      </Button>

      {/* Info Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="bg-[#0f1729]/95 backdrop-blur-xl border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-[#06b6d4]" />
              {isArcTestnet ? "Arc Testnet - Rede Oficial" : "Adicionar Arc Testnet"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {isArcTestnet 
                ? "Você está conectado à rede oficial da Arc" 
                : "Requisitos importantes antes de adicionar a rede"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isArcTestnet && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-300">✓ Conectado à Rede Oficial</p>
                    <p className="text-sm text-green-200/80">
                      Você está conectado à <strong>Arc Testnet</strong>, a rede oficial da Arc Network.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-300">⚠️ Informação Importante:</p>
                  <ul className="text-sm text-yellow-200/80 space-y-2 list-disc list-inside">
                    <li>Esta é a <strong>rede oficial da Arc Network</strong></li>
                    <li>É <strong>necessário ter tokens USDC</strong> na rede Arc Testnet para pagar as taxas de gas</li>
                    <li>O gas é pago em <strong>USDC</strong>, não em ETH</li>
                    <li>Obtenha USDC de teste através do{" "}
                      <a 
                        href="https://faucet.circle.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#06b6d4] hover:text-[#06b6d4]/80 underline font-semibold"
                      >
                        faucet oficial da Circle
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#1e3a5f]/30 border border-[#3b82f6]/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-white mb-2">Detalhes da Rede:</p>
              <div className="space-y-1 text-xs text-white/70 font-mono">
                <p>• Chain ID: 5042002</p>
                <p>• RPC: https://rpc.testnet.arc.network</p>
                <p>• Explorer: https://testnet.arcscan.app</p>
                <p>• Moeda Nativa: USDC (6 decimais)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowInfo(false)}
              className="text-white/70 hover:text-white"
            >
              Fechar
            </Button>
            {!isArcTestnet && (
              <Button
                onClick={handleConfirmAdd}
                disabled={isSwitchingChain || isAddingNetwork}
                className="bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white"
              >
                {isSwitchingChain || isAddingNetwork ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Rede
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

