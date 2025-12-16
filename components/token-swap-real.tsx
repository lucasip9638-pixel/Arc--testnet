"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { arcTestnet } from "@/lib/wagmi-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { ERC20_ABI } from "@/lib/erc20"
import { TOKENS, getTokenAddress, getTokenDecimals, parseTokenAmount, formatTokenAmount } from "@/lib/tokens"
import { TOKEN_SWAP_ABI, SWAP_CONTRACT_ADDRESS } from "@/lib/swap-contract"

interface TokenSwapRealProps {
  account: string | null
}

type SwapState = "idle" | "pending" | "success" | "error" | "approving" | "approved"

export function TokenSwapReal({ account }: TokenSwapRealProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC")
  const [toToken, setToToken] = useState<"USDC" | "EURC">("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [swapState, setSwapState] = useState<SwapState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)

  const fromTokenAddress = getTokenAddress(fromToken)
  const toTokenAddress = getTokenAddress(toToken)
  const fromDecimals = getTokenDecimals(fromToken)
  const toDecimals = getTokenDecimals(toToken)

  // Read balances with error handling
  const { 
    data: usdcBalance, 
    refetch: refetchUSDC,
    error: usdcBalanceError,
    isLoading: usdcBalanceLoading 
  } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  const { 
    data: eurcBalance, 
    refetch: refetchEURC,
    error: eurcBalanceError,
    isLoading: eurcBalanceLoading 
  } = useReadContract({
    address: TOKENS.EURC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  // Read swap contract exchange rate and fee
  const { data: exchangeRateOnChain, error: exchangeRateError } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "exchangeRate",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: false,
    },
  })

  const { data: swapFeeOnChain, error: swapFeeError } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "swapFee",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: false,
    },
  })

  // Verify contract token addresses match configured addresses
  const { data: contractUSDCAddress } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "USDC",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      retry: false,
    },
  })

  const { data: contractEURCAddress } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? SWAP_CONTRACT_ADDRESS : undefined,
    abi: TOKEN_SWAP_ABI,
    functionName: "EURC",
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      retry: false,
    },
  })

  // Read contract balances to verify liquidity before swap
  const { data: contractUSDCBalance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? [SWAP_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  const { data: contractEURCBalance } = useReadContract({
    address: TOKENS.EURC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? [SWAP_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
    },
  })

  // Check allowance with faster polling
  const { 
    data: allowance, 
    refetch: refetchAllowance,
    error: allowanceError 
  } = useReadContract({
    address: fromTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? [address, SWAP_CONTRACT_ADDRESS] 
      : undefined,
    query: {
      enabled: isConnected && !!address && SWAP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000, // Refetch every 2 seconds for faster updates
      retry: false,
      staleTime: 1000, // Consider data stale after 1 second
    },
  })

  // Write contract for approve and swap
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction with faster polling
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000, // Poll every 1 second for faster confirmation
    query: {
      enabled: !!hash,
      retry: true,
    },
  })

  // Calculate output amount using on-chain rate or default
  const exchangeRateValue = exchangeRateOnChain 
    ? Number(exchangeRateOnChain) / 1e6 
    : 1.0
  const swapFeeValue = swapFeeOnChain 
    ? Number(swapFeeOnChain) / 10000 
    : 0.003 // 0.3% default
  
  const toAmount = fromAmount
    ? (Number.parseFloat(fromAmount) * (1 - swapFeeValue) * exchangeRateValue).toFixed(6)
    : ""

  // Check if approval is needed
  const amountNeeded = fromAmount ? parseTokenAmount(fromAmount, fromDecimals) : BigInt(0)
  const needsApproval = allowance !== undefined && allowance !== null && typeof allowance === 'bigint' && amountNeeded > BigInt(0) && allowance < amountNeeded

  // Update state based on transaction - optimized for faster approval
  useEffect(() => {
    if (hash && !isConfirmed) {
      console.log("Transaction hash received:", hash)
      console.log("View transaction on ArcScan:", `https://testnet.arcscan.app/tx/${hash}`)
      setTxHash(hash)
      // If we were approving, mark as approved immediately and refetch allowance
      if (swapState === "approving") {
        setSwapState("approved")
        // Refetch allowance immediately
        refetchAllowance()
        // Reset to idle quickly - allowance will be checked on next render
        setTimeout(() => {
          setSwapState("idle")
        }, 500) // Quick reset
      } else if (swapState === "idle" || swapState === "pending") {
        // If we're doing a swap, set to pending
        setSwapState("pending")
        console.log("Swap transaction sent! Hash:", hash)
      }
    }
  }, [hash, swapState, refetchAllowance, isConfirmed])

  // Separate effect for confirmed transactions
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("Transaction confirmed:", hash)
      console.log("View on ArcScan:", `https://testnet.arcscan.app/tx/${hash}`)
      // Set success state first to show success message
      setSwapState("success")
      setFromAmount("")
      setErrorMessage(null)
      // Refetch balances and allowance immediately
      refetchUSDC()
      refetchEURC()
      refetchAllowance()
      // Keep success message visible for 3 seconds, then reset to idle
      const timer = setTimeout(() => {
        setSwapState("idle")
        setTxHash(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, hash, refetchUSDC, refetchEURC, refetchAllowance])

  // Separate effect for errors
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error)
      setSwapState("error")
      
      // Parse error message for better user feedback
      let errorMsg = error.message || "Falha na transação"
      
      if (error.message) {
        if (error.message.includes("User rejected") || error.message.includes("user rejected") || error.message.includes("User denied") || error.message.includes("rejected")) {
          errorMsg = "Transação cancelada pelo usuário"
        } else if (error.message.includes("insufficient funds") || error.message.includes("Insufficient")) {
          errorMsg = "Saldo insuficiente. Verifique se você tem tokens e USDC para gas."
        } else if (error.message.includes("allowance") || error.message.includes("Allowance")) {
          errorMsg = "Aprovação insuficiente. Por favor, aprove o contrato primeiro."
        } else if (error.message.includes("transfer failed") || error.message.includes("transferFrom failed")) {
          errorMsg = "Falha na transferência. Verifique saldo e aprovação."
        } else if (error.message.includes("chain") || error.message.includes("network") || error.message.includes("cadeia") || error.message.includes("does not match")) {
          errorMsg = "Rede incorreta. Por favor, troque para Arc Testnet e tente novamente."
        } else if (error.message.includes("revert") || error.message.includes("execution reverted")) {
          errorMsg = "Transação revertida. Verifique: 1) Saldo suficiente, 2) Aprovação suficiente, 3) Saldo do contrato."
        }
      }
      
      setErrorMessage(errorMsg)
      const timer = setTimeout(() => {
        setSwapState("idle")
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }

  const handleApprove = async () => {
    if (!isConnected || !address || !fromAmount || Number.parseFloat(fromAmount) <= 0) return

    const isZeroAddress = (addr: string) => addr === "0x0000000000000000000000000000000000000000" || addr === "0x0"
    
    if (isZeroAddress(fromTokenAddress) || isZeroAddress(SWAP_CONTRACT_ADDRESS)) {
      setErrorMessage("Token or contract addresses not configured.")
      setSwapState("error")
      return
    }

    setSwapState("approving")
    setErrorMessage(null)

    // CRITICAL: Verificar e garantir que está na Arc Testnet ANTES de enviar transação
    let finalChainId = chainId
    
    // Verificar diretamente no MetaMask qual é a rede atual
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const walletChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
        finalChainId = parseInt(walletChainId, 16)
      } catch (error) {
        console.error("Error getting chainId from wallet:", error)
      }
    }

    // Se não estiver na Arc Testnet, trocar AGORA antes de continuar
    if (finalChainId !== arcTestnet.id) {
      setIsSwitchingChain(true)
      try {
        await switchChain({ chainId: arcTestnet.id })
        
        // CRITICAL: Aguardar e verificar se a rede REALMENTE trocou
        let attempts = 0
        const maxAttempts = 20
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300))
          if (typeof window !== "undefined" && window.ethereum) {
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
            const currentChainIdNumber = parseInt(currentChainId, 16)
            if (currentChainIdNumber === arcTestnet.id) {
              finalChainId = arcTestnet.id
              break
            }
          }
          attempts++
        }
        
        // Se ainda não trocou, tentar adicionar a rede
        if (finalChainId !== arcTestnet.id) {
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
              
              await new Promise(resolve => setTimeout(resolve, 1500))
              let attempts2 = 0
              while (attempts2 < 20) {
                await new Promise(resolve => setTimeout(resolve, 300))
                if (typeof window !== "undefined" && window.ethereum) {
                  const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
                  const currentChainIdNumber = parseInt(currentChainId, 16)
                  if (currentChainIdNumber === arcTestnet.id) {
                    finalChainId = arcTestnet.id
                    break
                  }
                }
                attempts2++
              }
            } catch (addError) {
              setErrorMessage("Falha ao adicionar Arc Testnet. Adicione manualmente no MetaMask.")
              setIsSwitchingChain(false)
              setSwapState("error")
              return
            }
          }
        }
        
        // Verificação final: se ainda não está na rede correta, abortar
        if (finalChainId !== arcTestnet.id) {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask e tente novamente.")
          setIsSwitchingChain(false)
          setSwapState("error")
          return
        }
      } catch (switchError: any) {
        setIsSwitchingChain(false)
        if (switchError?.code === 4001) {
          setErrorMessage("Troca de rede cancelada. Você precisa estar na Arc Testnet.")
          setSwapState("error")
          return
        } else {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask.")
          setSwapState("error")
          return
        }
      }
      setIsSwitchingChain(false)
    }
    
    // VERIFICAÇÃO FINAL CRÍTICA: Não enviar transação se não estiver na rede correta
    if (typeof window !== "undefined" && window.ethereum) {
      const finalCheck = await window.ethereum.request({ method: "eth_chainId" }) as string
      const finalCheckNumber = parseInt(finalCheck, 16)
      if (finalCheckNumber !== arcTestnet.id) {
        setErrorMessage("Você ainda não está na Arc Testnet. Por favor, troque manualmente no MetaMask e tente novamente.")
        setSwapState("error")
        return
      }
    }

    try {
      const amount = parseTokenAmount(fromAmount, fromDecimals)
      // Approve a large amount to avoid multiple approvals (max uint256 / 2)
      const approveAmount = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

      // Execute approval immediately - no delays
      // CRITICAL: At this point we've verified we're on Arc Testnet
      // Do NOT pass chainId - let wagmi use the current chain (which we verified is Arc Testnet)
      
      // Final validation before sending
      if (!fromTokenAddress || fromTokenAddress === "0x0000000000000000000000000000000000000000") {
        setErrorMessage("Endereço do token inválido.")
        setSwapState("error")
        return
      }

      if (!SWAP_CONTRACT_ADDRESS || SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setErrorMessage("Endereço do contrato de swap inválido.")
        setSwapState("error")
        return
      }

      // Call writeContract - this will trigger the transaction
      // IMPORTANT: writeContract is async but doesn't return a promise directly
      // The hash will be set in the 'hash' variable from useWriteContract hook
      try {
        writeContract({
          address: fromTokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [SWAP_CONTRACT_ADDRESS, approveAmount],
        })
        
        console.log("writeContract approve called. MetaMask should open for approval...")
        console.log("Waiting for transaction hash from useWriteContract hook...")
        
        // Note: The hash will be set via useEffect when writeContract completes
        // The transaction will be sent to blockchain when user approves in MetaMask
      } catch (writeErr: any) {
        console.error("Error calling writeContract for approve:", writeErr)
        setSwapState("error")
        setErrorMessage(`Erro ao enviar aprovação: ${writeErr?.message || "Erro desconhecido"}`)
        setTimeout(() => {
          setSwapState("idle")
          setErrorMessage(null)
        }, 5000)
      }
      
      // The hash will be set via useEffect when writeContract completes
      // State will update automatically when hash is received
    } catch (err: any) {
      console.error("Approve error:", err)
      setSwapState("error")
      
      if (err?.message) {
        if (err.message.includes("User rejected") || err.message.includes("user rejected") || err.message.includes("User denied")) {
          setErrorMessage("Aprovação cancelada pelo usuário")
        } else if (err.message.includes("insufficient funds") || err.message.includes("Insufficient")) {
          setErrorMessage("Saldo insuficiente. Verifique se você tem tokens e USDC para gas.")
        } else if (err.message.includes("chain") || err.message.includes("network")) {
          setErrorMessage("Rede incorreta. Por favor, troque para Arc Testnet.")
        } else {
          setErrorMessage(`Erro na aprovação: ${err.message}`)
        }
      } else {
        setErrorMessage("Falha na aprovação. Tente novamente.")
      }
      
      setTimeout(() => {
        setSwapState("idle")
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !address || !fromAmount || Number.parseFloat(fromAmount) <= 0) return

    // Check if token addresses are valid (not zero addresses)
    const isZeroAddress = (addr: string) => addr === "0x0000000000000000000000000000000000000000" || addr === "0x0"
    
    if (isZeroAddress(fromTokenAddress) || isZeroAddress(toTokenAddress)) {
      setErrorMessage("Endereços de tokens não configurados. Atualize lib/tokens.ts com os endereços corretos.")
      setSwapState("error")
      return
    }

    // Check if swap contract address is set
    if (SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setErrorMessage("Endereço do contrato de swap não configurado. Atualize lib/swap-contract.ts com o endereço do contrato deployado.")
      setSwapState("error")
      return
    }

    // Verify contract token addresses match configured addresses
    if (contractUSDCAddress && contractUSDCAddress.toLowerCase() !== TOKENS.USDC.address.toLowerCase()) {
      setErrorMessage(
        `Erro: O contrato de swap foi deployado com endereço USDC diferente. ` +
        `Contrato espera: ${contractUSDCAddress}, Configurado: ${TOKENS.USDC.address}. ` +
        `Por favor, verifique a configuração.`
      )
      setSwapState("error")
      return
    }

    if (contractEURCAddress && contractEURCAddress.toLowerCase() !== TOKENS.EURC.address.toLowerCase()) {
      setErrorMessage(
        `Erro: O contrato de swap foi deployado com endereço EURC diferente. ` +
        `Contrato espera: ${contractEURCAddress}, Configurado: ${TOKENS.EURC.address}. ` +
        `Por favor, verifique a configuração.`
      )
      setSwapState("error")
      return
    }

    // Check if approval is needed
    if (needsApproval) {
      setErrorMessage("Aprovação necessária. Por favor, aprove o contrato primeiro.")
      setSwapState("error")
      return
    }

    setSwapState("pending")
    setErrorMessage(null)

    // CRITICAL: Verificar e garantir que está na Arc Testnet ANTES de enviar transação
    let finalChainId = chainId
    
    // Verificar diretamente no MetaMask qual é a rede atual
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const walletChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
        finalChainId = parseInt(walletChainId, 16)
      } catch (error) {
        console.error("Error getting chainId from wallet:", error)
      }
    }

    // Se não estiver na Arc Testnet, trocar AGORA antes de continuar
    if (finalChainId !== arcTestnet.id) {
      setIsSwitchingChain(true)
      try {
        // Tentar fazer switch
        await switchChain({ chainId: arcTestnet.id })
        
        // CRITICAL: Aguardar e verificar se a rede REALMENTE trocou
        let attempts = 0
        const maxAttempts = 20
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300))
          if (typeof window !== "undefined" && window.ethereum) {
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
            const currentChainIdNumber = parseInt(currentChainId, 16)
            if (currentChainIdNumber === arcTestnet.id) {
              finalChainId = arcTestnet.id
              break
            }
          }
          attempts++
        }
        
        // Se ainda não trocou, tentar adicionar a rede
        if (finalChainId !== arcTestnet.id) {
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
              
              // Aguardar e verificar novamente
              await new Promise(resolve => setTimeout(resolve, 1500))
              let attempts2 = 0
              while (attempts2 < 20) {
                await new Promise(resolve => setTimeout(resolve, 300))
                if (typeof window !== "undefined" && window.ethereum) {
                  const currentChainId = await window.ethereum.request({ method: "eth_chainId" }) as string
                  const currentChainIdNumber = parseInt(currentChainId, 16)
                  if (currentChainIdNumber === arcTestnet.id) {
                    finalChainId = arcTestnet.id
                    break
                  }
                }
                attempts2++
              }
            } catch (addError) {
              setErrorMessage("Falha ao adicionar Arc Testnet. Adicione manualmente no MetaMask.")
              setIsSwitchingChain(false)
              setSwapState("error")
              return
            }
          }
        }
        
        // Verificação final: se ainda não está na rede correta, abortar
        if (finalChainId !== arcTestnet.id) {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask e tente novamente.")
          setIsSwitchingChain(false)
          setSwapState("error")
          return
        }
      } catch (switchError: any) {
        setIsSwitchingChain(false)
        if (switchError?.code === 4001) {
          setErrorMessage("Troca de rede cancelada. Você precisa estar na Arc Testnet para fazer swap.")
          setSwapState("error")
          return
        } else {
          setErrorMessage("Falha ao trocar para Arc Testnet. Por favor, troque manualmente no MetaMask.")
          setSwapState("error")
          return
        }
      }
      setIsSwitchingChain(false)
    }
    
    // VERIFICAÇÃO FINAL CRÍTICA: Não enviar transação se não estiver na rede correta
    if (typeof window !== "undefined" && window.ethereum) {
      const finalCheck = await window.ethereum.request({ method: "eth_chainId" }) as string
      const finalCheckNumber = parseInt(finalCheck, 16)
      if (finalCheckNumber !== arcTestnet.id) {
        setErrorMessage("Você ainda não está na Arc Testnet. Por favor, troque manualmente no MetaMask e tente novamente.")
        setSwapState("error")
        return
      }
    }

    try {
      // Parse and validate amount - ensure it's a valid BigInt
      const amount = parseTokenAmount(fromAmount, fromDecimals)
      
      // Critical validation: amount must be greater than 0
      if (!amount || amount === BigInt(0)) {
        setErrorMessage("Valor inválido. O valor deve ser maior que zero.")
        setSwapState("error")
        return
      }

      // Verify user balance with strict check
      const balance = fromToken === "USDC" ? usdcBalance : eurcBalance
      if (!balance || typeof balance !== 'bigint') {
        setErrorMessage("Não foi possível verificar o saldo. Tente novamente.")
        setSwapState("error")
        return
      }
      
      if (balance < amount) {
        setErrorMessage("Saldo insuficiente. Verifique se você tem tokens suficientes.")
        setSwapState("error")
        return
      }

      // Verify allowance is sufficient (double check before sending)
      const currentAllowance = allowance
      if (!currentAllowance || typeof currentAllowance !== 'bigint' || currentAllowance < amount) {
        setErrorMessage("Aprovação insuficiente. Por favor, aprove o contrato primeiro.")
        setSwapState("error")
        return
      }

      // Calculate expected output amount to verify contract has enough liquidity
      // Use the same calculation as the contract for accuracy
      const exchangeRateOnChainValue = exchangeRateOnChain 
        ? (exchangeRateOnChain as bigint)
        : BigInt(1000000) // 1:1 default (1e6)
      const swapFeeOnChainValue = swapFeeOnChain
        ? (swapFeeOnChain as bigint)
        : BigInt(30) // 0.3% default (30 basis points)
      
      // Calculate exactly as the contract does:
      // feeAmount = (amount * swapFee) / FEE_DENOMINATOR
      // amountAfterFee = amount - feeAmount
      // outputAmount = (amountAfterFee * exchangeRate) / 1e6 (for USDC->EURC)
      // outputAmount = (amountAfterFee * 1e6) / exchangeRate (for EURC->USDC)
      const FEE_DENOMINATOR = BigInt(10000)
      const feeAmount = (amount * swapFeeOnChainValue) / FEE_DENOMINATOR
      const amountAfterFee = amount - feeAmount
      
      const expectedOutput = fromToken === "USDC" 
        ? (amountAfterFee * exchangeRateOnChainValue) / BigInt(1e6)
        : (amountAfterFee * BigInt(1e6)) / exchangeRateOnChainValue

      // Verify contract has enough liquidity for the swap
      // REMOVED: This validation was too strict and causing false positives
      // The contract itself will validate and revert if there's insufficient balance
      // We'll only show a warning if the balance is clearly insufficient (less than 50% of required)
      const contractBalance = fromToken === "USDC" ? contractEURCBalance : contractUSDCBalance
      if (contractBalance !== undefined && contractBalance !== null) {
        const contractBalanceBigInt = contractBalance as bigint
        
        // Only block if contract balance is less than 50% of required (clearly insufficient)
        const minimumRequired = expectedOutput / BigInt(2)
        
        if (contractBalanceBigInt < minimumRequired) {
          const required = formatTokenAmount(expectedOutput, toDecimals)
          const available = formatTokenAmount(contractBalanceBigInt, toDecimals)
          setErrorMessage(
            `⚠️ Aviso: O contrato pode não ter ${toToken} suficiente. ` +
            `Estimado necessário: ${required} ${toToken}, Disponível: ${available} ${toToken}. ` +
            `O contrato fará a validação final. Se o swap falhar, o contrato reverterá a transação.`
          )
          setSwapState("error")
          return
        }
        
        // If balance is close to required, log a warning but allow the swap
        // The contract will handle the exact validation
        if (contractBalanceBigInt < expectedOutput) {
          console.log("Contract balance check: Balance is close to required amount. Allowing swap - contract will validate.")
          console.log("Expected output:", formatTokenAmount(expectedOutput, toDecimals), toToken)
          console.log("Contract balance:", formatTokenAmount(contractBalanceBigInt, toDecimals), toToken)
        }
      }

      // Determine which swap function to call
      const functionName = fromToken === "USDC" ? "swapUSDCtoEURC" : "swapEURCtoUSDC"

      // Log transaction details for debugging (similar to successful transaction)
      console.log("Swap transaction details:", {
        fromToken,
        toToken,
        amount: amount.toString(),
        functionName,
        contractAddress: SWAP_CONTRACT_ADDRESS,
        userAddress: address,
        chainId: arcTestnet.id,
        currentChainId: chainId,
        walletChainId: typeof window !== "undefined" && window.ethereum 
          ? await window.ethereum.request({ method: "eth_chainId" }) 
          : "N/A",
      })

      // Final validation before sending
      if (!SWAP_CONTRACT_ADDRESS || SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setErrorMessage("Endereço do contrato de swap inválido.")
        setSwapState("error")
        return
      }

      if (!amount || amount === BigInt(0)) {
        setErrorMessage("Valor inválido para swap.")
        setSwapState("error")
        return
      }

      // One final check: ensure we're on the correct network
      if (typeof window !== "undefined" && window.ethereum) {
        const finalChainCheck = await window.ethereum.request({ method: "eth_chainId" }) as string
        const finalChainCheckNumber = parseInt(finalChainCheck, 16)
        if (finalChainCheckNumber !== arcTestnet.id) {
          setErrorMessage(`Rede incorreta detectada (${finalChainCheckNumber}). Por favor, troque para Arc Testnet (${arcTestnet.id}) e tente novamente.`)
          setSwapState("error")
          return
        }
      }

      // Execute swap via contract - ensure all parameters are correct
      // CRITICAL: At this point we've verified we're on Arc Testnet
      // Do NOT pass chainId - let wagmi use the current chain (which we verified is Arc Testnet)
      console.log("Calling writeContract for swap...")
      console.log("Parameters:", {
        address: SWAP_CONTRACT_ADDRESS,
        functionName,
        args: [amount.toString()],
      })
      
      // Call writeContract - this will open MetaMask for user approval
      // The hash will be available in the 'hash' variable from useWriteContract hook
      // IMPORTANT: writeContract is async but doesn't return a promise directly
      // The hash will be set in the 'hash' variable from useWriteContract hook
      try {
        writeContract({
          address: SWAP_CONTRACT_ADDRESS,
          abi: TOKEN_SWAP_ABI,
          functionName: functionName,
          args: [amount], // Amount must be a valid BigInt
        })
        
        console.log("writeContract called. MetaMask should open for approval...")
        console.log("Waiting for transaction hash from useWriteContract hook...")
        
        // Set state to pending immediately - hash will come from useWriteContract hook
        setSwapState("pending")
        
        // Note: The hash will be set via useEffect when writeContract completes
        // The transaction will be sent to blockchain when user approves in MetaMask
      } catch (writeErr: any) {
        console.error("Error calling writeContract:", writeErr)
        setSwapState("error")
        setErrorMessage(`Erro ao enviar transação: ${writeErr?.message || "Erro desconhecido"}`)
        setTimeout(() => {
          setSwapState("idle")
          setErrorMessage(null)
        }, 5000)
      }
    } catch (err: any) {
      console.error("Swap error:", err)
      console.error("Error details:", {
        message: err?.message,
        code: err?.code,
        name: err?.name,
        stack: err?.stack,
      })
      setSwapState("error")
      
      // Handle user rejection and other errors
      if (err?.message) {
        if (err.message.includes("User rejected") || err.message.includes("user rejected") || err.message.includes("User denied") || err.message.includes("rejected")) {
          setErrorMessage("Transação cancelada pelo usuário")
        } else if (err.message.includes("insufficient funds") || err.message.includes("Insufficient")) {
          setErrorMessage("Saldo insuficiente. Verifique se você tem tokens e USDC para gas.")
        } else if (err.message.includes("allowance") || err.message.includes("Allowance") || err.message.includes("insufficient allowance")) {
          setErrorMessage("Aprovação insuficiente. Por favor, aprove o contrato primeiro.")
        } else if (err.message.includes("transfer failed") || err.message.includes("transferFrom failed") || err.message.includes("EURC transfer failed") || err.message.includes("USDC transfer failed") || err.message.includes("ERC20: transfer amount exceeds balance") || err.message.includes("insufficient balance")) {
          const contractBalance = fromToken === "USDC" 
            ? contractEURCBalance 
            : contractUSDCBalance
          const balanceFormatted = contractBalance 
            ? formatTokenAmount(contractBalance as bigint, toDecimals)
            : "desconhecido"
          setErrorMessage(
            `Falha na transferência. O contrato pode não ter tokens suficientes. ` +
            `Saldo do contrato em ${toToken}: ${balanceFormatted}. ` +
            `Verifique: https://testnet.arcscan.app/address/${SWAP_CONTRACT_ADDRESS}`
          )
        } else if (err.message.includes("chain") || err.message.includes("network") || err.message.includes("cadeia") || err.message.includes("does not match")) {
          setErrorMessage("Rede incorreta. Por favor, troque para Arc Testnet e tente novamente.")
        } else if (err.message.includes("revert") || err.message.includes("execution reverted") || err.message.includes("Amount must be greater than 0")) {
          // Try to extract the revert reason if available
          let revertReason = "Transação revertida pelo contrato."
          if (err.message.includes("USDC transfer failed")) {
            revertReason = "Falha na transferência de USDC. Verifique sua aprovação e saldo."
          } else if (err.message.includes("EURC transfer failed")) {
            revertReason = "Falha na transferência de EURC. O contrato pode não ter EURC suficiente."
          } else if (err.message.includes("Amount must be greater than 0")) {
            revertReason = "O valor deve ser maior que zero."
          }
          
          const contractBalance = fromToken === "USDC" 
            ? contractEURCBalance 
            : contractUSDCBalance
          const balanceFormatted = contractBalance 
            ? formatTokenAmount(contractBalance as bigint, toDecimals)
            : "desconhecido"
          
          setErrorMessage(
            `${revertReason} Verifique: 1) Valor maior que zero, 2) Saldo suficiente, ` +
            `3) Aprovação suficiente, 4) Saldo do contrato em ${toToken}: ${balanceFormatted}. ` +
            `Verifique o contrato: https://testnet.arcscan.app/address/${SWAP_CONTRACT_ADDRESS}`
          )
        } else if (err.message.includes("insufficient funds") || err.message.includes("gas")) {
          setErrorMessage("Saldo insuficiente para gas. Certifique-se de ter USDC suficiente para pagar as taxas.")
        } else {
          setErrorMessage(`Erro no swap: ${err.message || "Erro desconhecido. Verifique o console para mais detalhes."}`)
        }
      } else if (err?.code) {
        // Handle error codes
        if (err.code === 4001) {
          setErrorMessage("Transação cancelada pelo usuário")
        } else if (err.code === -32603) {
          setErrorMessage("Erro interno do RPC. Tente novamente em alguns instantes.")
        } else {
          setErrorMessage(`Erro no swap (código: ${err.code}). Verifique o console para mais detalhes.`)
        }
      } else {
        setErrorMessage("Falha no swap. Tente novamente. Se o problema persistir, verifique: 1) Rede Arc Testnet, 2) Saldo de tokens, 3) Aprovação, 4) Saldo do contrato.")
      }
      
      setTimeout(() => {
        setSwapState("idle")
        setErrorMessage(null)
      }, 6000)
    }
  }

  // Format balances for display
  const usdcBalanceFormatted = usdcBalance
    ? formatTokenAmount(usdcBalance as bigint, TOKENS.USDC.decimals)
    : "0.00"
  const eurcBalanceFormatted = eurcBalance
    ? formatTokenAmount(eurcBalance as bigint, TOKENS.EURC.decimals)
    : "0.00"

  const fromBalance = fromToken === "USDC" ? usdcBalanceFormatted : eurcBalanceFormatted
  const toBalance = toToken === "USDC" ? usdcBalanceFormatted : eurcBalanceFormatted

  // Only consider swapping if we're actually in a pending/approving state AND transaction is still processing
  // When transaction is confirmed (isConfirmed), input should be enabled immediately
  const isSwapping = (swapState === "pending" || swapState === "approving") && !isConfirmed && (isPending || isConfirming)
  // Input should be enabled when:
  // - Transaction is confirmed (isConfirmed), OR
  // - State is idle or success, OR
  // - Not in pending/approving state
  // This ensures input works immediately after swap confirmation
  const inputDisabled = !isConnected || isSwapping
  const canSwap = isConnected && fromAmount && Number.parseFloat(fromAmount) > 0 && !isSwapping && swapState !== "pending" && swapState !== "approving"

  return (
    <Card className="p-6 bg-[#0f1729]/40 backdrop-blur-xl border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Swap USDC ⇄ EURC</h2>
        {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <div className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
            Contract Not Deployed
          </div>
        )}
      </div>

      {/* Contract not deployed warning */}
      {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Swap contract not deployed. Please deploy the contract and update the address in{" "}
              <code className="text-xs bg-yellow-500/20 px-1 rounded">lib/swap-contract.ts</code>
            </p>
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">From</label>
          <span className="text-xs text-muted-foreground">
            Balance: {isConnected ? (usdcBalanceLoading || eurcBalanceLoading ? "Loading..." : fromBalance) : "0.00"} {fromToken}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-background/50 border-border/50 text-lg"
            disabled={inputDisabled}
            step="any"
            min="0"
          />
          <Button variant="secondary" className="min-w-24" disabled>
            {fromToken}
          </Button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapTokens}
          className="rounded-full hover:bg-accent/20"
          disabled={isSwapping}
        >
          <ArrowDownUp className="h-5 w-5" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">To</label>
          <span className="text-xs text-muted-foreground">
            Balance: {isConnected ? (usdcBalanceLoading || eurcBalanceLoading ? "Loading..." : toBalance) : "0.00"} {toToken}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="flex-1 bg-background/50 border-border/50 text-lg"
          />
          <Button variant="secondary" className="min-w-24" disabled>
            {toToken}
          </Button>
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && (
        <div className="bg-background/30 rounded-lg p-3 mb-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="text-foreground">
              1 {fromToken} = {exchangeRateValue.toFixed(6)} {toToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee ({(swapFeeValue * 100).toFixed(2)}%)</span>
            <span className="text-foreground">
              {(Number.parseFloat(fromAmount) * swapFeeValue).toFixed(6)} {fromToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">You will receive</span>
            <span className="text-foreground font-semibold">
              {toAmount} {toToken}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && swapState === "error" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Error</p>
            <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Pending Transaction Message - only show if not confirmed yet */}
      {(swapState === "pending" || isPending || isConfirming) && hash && !isConfirmed && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
          <div className="flex-1">
            <p className="text-sm text-blue-500 font-medium">
              {isConfirming ? "Confirmando transação na blockchain..." : "Transação enviada! Aguardando confirmação..."}
            </p>
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500/80 mt-1 flex items-center gap-1 hover:underline"
            >
              Ver no ArcScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Success Message */}
      {swapState === "success" && txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-500 font-medium">Swap realizado com sucesso!</p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-500/80 mt-1 flex items-center gap-1 hover:underline"
            >
              Ver no ArcScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Approval needed message */}
      {needsApproval && fromAmount && swapState !== "approved" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-500 font-medium mb-2">Aprovação Necessária</p>
          <p className="text-xs text-yellow-500/80 mb-3">
            Você precisa aprovar o contrato de swap para gastar seus tokens {fromToken} primeiro.
          </p>
          <Button
            onClick={handleApprove}
            disabled={swapState === "approving" || swapState === "pending" || isSwapping}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30"
          >
            {swapState === "approving" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aprovando...
              </span>
            ) : (
              `Aprovar ${fromToken}`
            )}
          </Button>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!canSwap || needsApproval}
        className="w-full h-12 text-base font-semibold"
      >
        {!isConnected ? (
          "Conectar Carteira"
        ) : needsApproval && swapState !== "approved" ? (
          "Aprovar Primeiro"
        ) : isSwapping || isSwitchingChain ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isSwitchingChain ? "Trocando rede..." : isConfirming ? "Confirmando..." : "Fazendo Swap..."}
          </span>
        ) : (
          `Swap ${fromToken} → ${toToken}`
        )}
      </Button>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        {SWAP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? (
          <>
            ⚠️ Swap contract not deployed. Please deploy the contract first.
            <br />
            Contract address needs to be configured in lib/swap-contract.ts
          </>
        ) : (
          <>
            Swap tokens on Arc Testnet. Get testnet tokens:{" "}
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Circle Faucet
            </a>
          </>
        )}
      </p>
    </Card>
  )
}

