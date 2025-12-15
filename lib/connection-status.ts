/**
 * Connection status utilities
 * Helps verify frontend-backend (blockchain) connection
 */

import { wagmiConfig } from "./wagmi-config"

/**
 * Check if RPC connection is healthy
 */
export async function checkRPCConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://rpc.testnet.arc.network", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    })
    const data = await response.json()
    return !!data.result
  } catch (error) {
    console.error("RPC connection check failed:", error)
    return false
  }
}

/**
 * Get network info
 */
export function getNetworkInfo() {
  return {
    chainId: 5042002,
    name: "Arc Testnet",
    rpcUrl: "https://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
  }
}

