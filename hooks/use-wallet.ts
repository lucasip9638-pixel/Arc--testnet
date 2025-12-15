"use client"

import { useState, useEffect, useCallback } from "react"

// Definir tipo para o provider do Ethereum
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, callback: (...args: unknown[]) => void) => void
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

const ARC_TESTNET = {
  chainId: "0x4ce112", // 5042002 em hexadecimal
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://explorer.testnet.arc.network"],
}

export function useWallet() {
  const [address, setAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<string>("")
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false)

  // Verificar conexão existente ao carregar
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum || manuallyDisconnected) return

      try {
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[]

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)

          const currentChainId = (await window.ethereum.request({
            method: "eth_chainId",
          })) as string
          setChainId(currentChainId)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    checkConnection()

    // Listeners para mudanças na carteira
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[]
        if (accountsArray.length === 0) {
          setIsConnected(false)
          setAddress("")
        } else {
          setAddress(accountsArray[0])
          setIsConnected(true)
          setManuallyDisconnected(false)
        }
      }

      const handleChainChanged = (newChainId: unknown) => {
        setChainId(newChainId as string)
        // Recarregar a página quando a rede muda (recomendação do MetaMask)
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [manuallyDisconnected])

  // Conectar carteira
  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      setManuallyDisconnected(false)

      // Solicitar contas
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        // Verificar se está na rede correta
        const currentChainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string

        // Se não estiver na Arc Testnet, solicitar mudança de rede
        if (currentChainId !== ARC_TESTNET.chainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: ARC_TESTNET.chainId }],
            })
          } catch (switchError: unknown) {
            // Se a rede não existir, adicionar
            const error = switchError as { code?: number }
            if (error.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [ARC_TESTNET],
                })
              } catch (addError) {
                console.error("Error adding Arc Testnet:", addError)
              }
            }
          }
        }

        setChainId(ARC_TESTNET.chainId)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress("")
    setIsConnected(false)
    setManuallyDisconnected(true)
  }, [])

  return {
    address,
    isConnected,
    chainId,
    connect,
    disconnect,
  }
}
