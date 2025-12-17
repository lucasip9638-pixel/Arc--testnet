"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Wallet, AlertCircle, RefreshCw, Network, X, Loader2, Copy, ExternalLink, ChevronDown, Info } from "lucide-react"
import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import MetaMaskSDK from "@metamask/sdk"
import { TokenSwapReal } from "./token-swap-real"
import { DailyGM } from "./daily-gm"
import { SendToken } from "./send-token"
import { NetworkSelector } from "./network-selector"
import { NetworkSwitcher } from "./network-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeFiApp() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const [activeTab, setActiveTab] = useState("gm")
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)
  const [showNetworkInfo, setShowNetworkInfo] = useState(false)
  const [isConnectingMobile, setIsConnectingMobile] = useState(false)

  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Detectar se está em mobile
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const handleConnect = async () => {
    // Se estiver em mobile
    if (isMobile) {
      // Verificar se tem window.ethereum (navegador com extensão ou app de carteira)
      if (window.ethereum) {
        // Tem provider, tentar conectar normalmente
        const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
        if (connector) {
          try {
            await connect({ connector })
            return
          } catch (error) {
            console.error('Connection error:', error)
            // Se falhar, continuar para tentar SDK
          }
        }
      }

      // Não tem window.ethereum, usar MetaMask SDK para conectar no mobile
      setIsConnectingMobile(true)
      
      // URL do dApp no Vercel
      const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
      
      try {
        // Inicializar MetaMask SDK com configuração para mobile
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "Arc DeFi Hub",
            url: dappUrl, // Usar URL do dApp no Vercel
          },
          // Configuração para mobile - usar deep link
          useDeeplink: true,
          // Injetar provider no window.ethereum para funcionar com wagmi
          injectProvider: true,
          // Configurações de comunicação
          shouldShimWeb3: false,
          // Modo de comunicação para mobile
          communicationLayerPreference: 'webrtc',
        })

        // Inicializar o SDK
        await MMSDK.init()
        
        // Aguardar um pouco para o SDK inicializar completamente
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Verificar se o provider foi injetado
        if (window.ethereum) {
          // Solicitar conexão - isso vai abrir o MetaMask e pedir confirmação
          try {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
              params: [],
            })
            
            if (accounts && accounts.length > 0) {
              // Conectar usando o connector do wagmi após obter as contas
              const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
              if (connector && connector.ready) {
                await connect({ connector })
                setIsConnectingMobile(false)
                
                // Após conectar, abrir o dApp no navegador do MetaMask
                // O MetaMask mobile tem um navegador interno que pode abrir URLs
                const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
                window.location.href = metamaskBrowserLink
                
                return
              }
            }
          } catch (requestError: any) {
            console.error('Request accounts error:', requestError)
            // Se o usuário rejeitar ou cancelar, não fazer nada
            if (requestError.code === 4001) {
              setIsConnectingMobile(false)
              return
            }
            // Se der outro erro, tentar deep link
            throw requestError
          }
        } else {
          // Se o provider não foi injetado, usar deep link direto
          throw new Error('Provider not injected')
        }
      } catch (error: any) {
        console.error('MetaMask SDK error:', error)
        
        // Fallback: usar deep link que abre o dApp no navegador do MetaMask
        const encodedDappUrl = encodeURIComponent(dappUrl)
        
        // Deep link que abre o dApp no navegador interno do MetaMask
        const metamaskDeepLink = `https://metamask.app.link/dapp/${encodedDappUrl}`
        
        // Tentar abrir via deep link - isso vai abrir o MetaMask e depois o dApp no navegador interno
        window.location.href = metamaskDeepLink
        
        // O polling vai detectar quando voltar e conectar
      }
      
      return
    }

    // Desktop: usar conexão normal com wagmi
    const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  const handleSwitchToArcTestnet = async () => {
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
      }
    }
  }

  // Auto-switch para Arc Testnet quando conectar
  useEffect(() => {
    if (isConnected && chainId !== 0 && chainId !== arcTestnet.id) {
      handleSwitchToArcTestnet()
    }
  }, [isConnected, chainId])

  // Redirecionar para o navegador do MetaMask após conectar no mobile
  useEffect(() => {
    if (isMobile && isConnected && address && isConnectingMobile) {
      // Conectou com sucesso, abrir no navegador do MetaMask
      const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
      const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
      
      // Aguardar um pouco para garantir que tudo está pronto
      setTimeout(() => {
        window.location.href = metamaskBrowserLink
        setIsConnectingMobile(false)
      }, 1500)
    }
  }, [isMobile, isConnected, address, isConnectingMobile])

  // Verificar conexão quando voltar do MetaMask mobile
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined' && (isConnectingMobile || !isConnected)) {
      let checkInterval: NodeJS.Timeout | null = null
      
      // Função para verificar e conectar
      const checkAndConnect = async () => {
        if (window.ethereum && !isConnected) {
          try {
            // Verificar se há contas conectadas
            const accounts = await window.ethereum.request({
              method: 'eth_accounts',
            })
            
            // Verificar a rede atual
            const currentChainId = await window.ethereum.request({
              method: 'eth_chainId',
            })
            const currentChainIdNumber = parseInt(currentChainId as string, 16)
            
            if (accounts && accounts.length > 0) {
              // Se tem contas, conectar independente da rede (a troca de rede pode vir depois)
              const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
              if (connector && connector.ready) {
                try {
                  await connect({ connector })
                  setIsConnectingMobile(false)
                  
                  // Após conectar, abrir o dApp no navegador do MetaMask
                  const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
                  const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
                  
                  // Aguardar um pouco antes de redirecionar
                  setTimeout(() => {
                    window.location.href = metamaskBrowserLink
                  }, 1000)
                  
                  // Se conectou com sucesso, parar o polling
                  if (checkInterval) {
                    clearInterval(checkInterval)
                    checkInterval = null
                  }
                } catch (connectError) {
                  console.error('Error connecting after accounts found:', connectError)
                }
              }
            }
          } catch (error) {
            console.error('Error checking connection:', error)
          }
        }
      }

      // Quando a página ganha foco (usuário voltou do MetaMask)
      const handleFocus = async () => {
        // Verificar imediatamente quando volta
        if (window.ethereum && !isConnected) {
          try {
            // Verificar contas e rede
            const [accounts, currentChainId] = await Promise.all([
              window.ethereum.request({ method: 'eth_accounts' }),
              window.ethereum.request({ method: 'eth_chainId' })
            ])
            
            const currentChainIdNumber = parseInt(currentChainId as string, 16)
            
            // Se tem contas (aprovou) e está na Arc Testnet (trocou rede), conectar
            if (accounts && (accounts as string[]).length > 0) {
              const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
              if (connector && connector.ready) {
                try {
                  await connect({ connector })
                  setIsConnectingMobile(false)
                  
                  // Após conectar, abrir o dApp no navegador do MetaMask
                  const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
                  const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
                  
                  setTimeout(() => {
                    window.location.href = metamaskBrowserLink
                  }, 1000)
                  
                  return
                } catch (error) {
                  console.error('Error connecting on focus:', error)
                }
              }
            }
          } catch (error) {
            console.error('Error checking on focus:', error)
          }
        }
        
        checkAndConnect()
        
        // Iniciar polling mais agressivo quando está tentando conectar
        if (isConnectingMobile && !checkInterval) {
          checkInterval = setInterval(() => {
            if (!isConnected) {
              checkAndConnect()
            } else {
              // Se já conectou, parar o polling
              setIsConnectingMobile(false)
              if (checkInterval) {
                clearInterval(checkInterval)
                checkInterval = null
              }
            }
          }, 500) // Verificar a cada 500ms quando está conectando
        }
      }

      // Listener para mudanças de contas do MetaMask (mais confiável)
      const handleAccountsChanged = async (accounts: string[]) => {
        console.log('Accounts changed:', accounts)
        if (accounts && accounts.length > 0 && !isConnected) {
          const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
          if (connector && connector.ready) {
            try {
              await connect({ connector })
              setIsConnectingMobile(false)
              
              // Após conectar, abrir o dApp no navegador do MetaMask
              const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
              const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
              
              // Aguardar um pouco antes de redirecionar para garantir que a conexão foi estabelecida
              setTimeout(() => {
                window.location.href = metamaskBrowserLink
              }, 1000)
            } catch (error) {
              console.error('Error connecting on accountsChanged:', error)
            }
          }
        }
      }

      // Listener para mudanças de rede (quando troca para Arc Testnet)
      const handleChainChanged = async (newChainId: string) => {
        console.log('Chain changed:', newChainId)
        const newChainIdNumber = parseInt(newChainId, 16)
        
        // Se trocou para Arc Testnet e não está conectado, tentar conectar
        if (newChainIdNumber === arcTestnet.id && !isConnected && window.ethereum) {
          try {
            // Aguardar um pouco para garantir que a mudança de rede foi processada
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Verificar se há contas
            const accounts = await window.ethereum.request({
              method: 'eth_accounts',
            })
            
            if (accounts && (accounts as string[]).length > 0) {
              const connector = connectors.find(c => c.id === 'metaMask' || c.id === 'injected') || connectors[0]
              if (connector && connector.ready) {
                try {
                  await connect({ connector })
                  setIsConnectingMobile(false)
                  
                  // Após conectar, abrir o dApp no navegador do MetaMask
                  const dappUrl = 'https://arc-testnet-p1m7.vercel.app'
                  const metamaskBrowserLink = `https://metamask.app.link/dapp/${encodeURIComponent(dappUrl)}`
                  
                  setTimeout(() => {
                    window.location.href = metamaskBrowserLink
                  }, 1000)
                  
                  console.log('Connected after chain change to Arc Testnet')
                } catch (error) {
                  console.error('Error connecting on chainChanged:', error)
                }
              }
            }
          } catch (error) {
            console.error('Error checking accounts on chainChanged:', error)
          }
        }
      }

      // Listener para quando o provider é injetado
      const checkProvider = () => {
        if (window.ethereum && !isConnected) {
          checkAndConnect()
        }
      }

      window.addEventListener('focus', handleFocus)
      
      // Adicionar listeners se window.ethereum existir
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
        // Verificar imediatamente
        checkProvider()
      } else {
        // Se não tem provider ainda, verificar periodicamente
        const providerCheckInterval = setInterval(() => {
          if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            window.ethereum.on('chainChanged', handleChainChanged)
            checkProvider()
            clearInterval(providerCheckInterval)
          }
        }, 500)
      }
      
      // Iniciar polling mais agressivo quando está tentando conectar
      if (isConnectingMobile) {
        checkInterval = setInterval(() => {
          if (!isConnected) {
            checkAndConnect()
          } else {
            setIsConnectingMobile(false)
            if (checkInterval) {
              clearInterval(checkInterval)
              checkInterval = null
            }
          }
        }, 500) // Verificar a cada 500ms
        
        // Timeout: parar após 30 segundos se não conectar
        setTimeout(() => {
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
          setIsConnectingMobile(false)
        }, 30000)
      }
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
        if (checkInterval) {
          clearInterval(checkInterval)
        }
      }
    }
  }, [isMobile, isConnected, isConnectingMobile, connectors, connect])

  return (
    <div className="min-h-screen relative overflow-x-hidden w-full">
      {/* Additional decorative elements - Arc Network style */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] opacity-[0.08] -z-10 pointer-events-none">
        <svg viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arcGradient1" x1="1000" y1="0" x2="0" y2="1000">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="arcGradient2" x1="0" y1="0" x2="1000" y2="1000">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M1000 0C1000 500 750 750 250 1000" stroke="url(#arcGradient1)" strokeWidth="1.5" />
          <path d="M0 0C0 300 200 500 500 700" stroke="url(#arcGradient2)" strokeWidth="1.5" />
        </svg>
      </div>
      
      {/* Subtle animated gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      {/* Header - Arc Network style */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/5">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">Arc</div>
              <div className="text-lg sm:text-xl font-semibold text-white/60">DeFi</div>
            </div>
            <button
              onClick={() => setShowNetworkInfo(true)}
              className="hidden sm:flex items-center gap-2 ml-2 sm:ml-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#1e3a5f]/30 border border-[#3b82f6]/20 backdrop-blur-sm hover:bg-[#1e3a5f]/50 hover:border-[#3b82f6]/40 transition-all cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-[#06b6d4] animate-pulse" />
              <span className="text-xs text-[#06b6d4] font-medium">Testnet</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isConnected ? (
              <>
                {/* Network Switcher - Left side */}
                <NetworkSwitcher />
                
                {/* Network Warning/Switch */}
                {chainId !== arcTestnet.id && chainId !== 0 && (
                  <Button
                    onClick={handleSwitchToArcTestnet}
                    disabled={isSwitchingChain}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                    title="Switch to Arc Testnet to pay gas fees in USDC"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">{isSwitchingChain ? "Switching..." : "Switch to Arc Testnet"}</span>
                    <span className="sm:hidden">{isSwitchingChain ? "..." : "Switch"}</span>
                  </Button>
                )}
                
                {/* Connected Wallet Button with Dropdown - Similar to Arc Network */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full bg-[#0f1729]/50 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  <div className="h-2 w-2 rounded-full bg-[#06b6d4] animate-pulse" />
                  <span className="font-mono text-xs sm:text-sm">
                    {formatAddress(address || "")}
                  </span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-60" />
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
                      onClick={() => disconnect()}
                      className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Desconectar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Network Switcher - Left side of Connect Wallet */}
                <NetworkSwitcher />
                
                <Button
                  onClick={handleConnect}
                  className="rounded-full bg-white hover:bg-white/95 text-[#0a0e1a] font-semibold gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 transition-all shadow-lg hover:shadow-xl hover:shadow-white/20 text-xs sm:text-sm"
                >
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 w-full">
        <div className="max-w-6xl mx-auto w-full">
          {/* Network Selector Modal */}
          {showNetworkSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                    if (!isConnected) {
                      setTimeout(() => handleConnect(), 1000)
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Hero Section - Arc Network style */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent px-2">
              Arc DeFi Hub
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light px-4">
              Send, exchange tokens, and tell GM daily
            </p>
          </div>

          {/* Tabs - Arc Network style */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-[#0f1729]/50 backdrop-blur-xl border border-white/5 rounded-xl p-1 sm:p-1.5">
              <TabsTrigger 
                value="gm" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/50 rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Daily GM</span>
                <span className="sm:hidden">GM</span>
              </TabsTrigger>
              <TabsTrigger 
                value="swap" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/50 rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-4"
              >
                Swap
              </TabsTrigger>
              <TabsTrigger 
                value="send" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/50 rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Enviar Token</span>
                <span className="sm:hidden">Enviar</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gm" className="space-y-6">
              <DailyGM account={isConnected && address ? address : null} />
            </TabsContent>

            <TabsContent value="swap" className="space-y-6">
              <TokenSwapReal account={isConnected && address ? address : null} />
            </TabsContent>

            <TabsContent value="send" className="space-y-6">
              <SendToken account={isConnected && address ? address : null} />
            </TabsContent>
          </Tabs>

          {/* Info Cards - Arc Network style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 md:mt-16">
            <div className="bg-[#0f1729]/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 sm:p-6 text-center hover:border-white/10 transition-all">
              <p className="text-xs sm:text-sm text-white/50 mb-2 font-medium">Network</p>
              <p className="text-lg sm:text-xl font-semibold text-white">Arc Testnet</p>
            </div>
            <div className="bg-[#0f1729]/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 sm:p-6 text-center hover:border-white/10 transition-all">
              <p className="text-xs sm:text-sm text-white/50 mb-2 font-medium">Chain ID</p>
              <p className="text-lg sm:text-xl font-mono font-semibold text-white">5042002</p>
            </div>
            <div className="bg-[#0f1729]/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 sm:p-6 text-center hover:border-white/10 transition-all">
              <p className="text-xs sm:text-sm text-white/50 mb-2 font-medium">Gas Token</p>
              <p className="text-lg sm:text-xl font-semibold text-white">USDC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Arc Network style */}
      <footer className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 mt-12 sm:mt-16 md:mt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs sm:text-sm text-white/40">
          {/* Lado Esquerdo - Blockchain da Arc e Site */}
          <div className="flex flex-col items-center md:ml-8">
            <div className="flex flex-col md:flex-row items-center gap-4 relative">
              <p className="text-xs font-semibold text-white/70 mb-3 md:mb-0 md:absolute md:-top-6 md:left-1/2 md:-translate-x-1/2 uppercase tracking-wider text-center w-full md:w-auto">ARC TESTNET</p>
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
          <div className="flex flex-col items-center md:mr-8">
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
        </div>
      </footer>

      {/* Network Info Dialog */}
      <Dialog open={showNetworkInfo} onOpenChange={setShowNetworkInfo}>
        <DialogContent className="bg-[#0f1729]/95 backdrop-blur-xl border border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-[#06b6d4]" />
              Informações sobre Arc Testnet
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Requisitos para usar este dApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-300">Requisitos Importantes:</p>
                  <ul className="text-sm text-yellow-200/80 space-y-2 list-disc list-inside">
                    <li>Sua carteira precisa ter a rede <strong>Arc Testnet</strong> adicionada</li>
                    <li>Você precisa ter tokens <strong>USDC</strong> na rede Arc Testnet para pagar as taxas de gas</li>
                    <li>O gas é pago em USDC, não em ETH</li>
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

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-300 mb-2">Como obter USDC na Arc Testnet:</p>
              <p className="text-xs text-blue-200/80">
                Use o{" "}
                <a 
                  href="https://faucet.circle.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline font-semibold"
                >
                  faucet oficial da Circle
                </a>
                {" "}para obter USDC de teste na Arc Testnet. 
                Você precisará de USDC para pagar todas as transações neste dApp.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
