/**
 * Token addresses on Arc Testnet
 * 
 * IMPORTANT: These are testnet addresses. For mainnet, update accordingly.
 * 
 * To get testnet tokens, use Circle's faucet:
 * https://faucet.circle.com
 */

export const ARC_TESTNET_CHAIN_ID = 5042002

// Token addresses on Arc Testnet
// Updated with actual deployed token addresses
export const TOKENS = {
  USDC: {
    address: "0x3600000000000000000000000000000000000000" as `0x${string}`,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
  EURC: {
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`,
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
  },
} as const

/**
 * Get token address by symbol
 */
export function getTokenAddress(symbol: "USDC" | "EURC"): `0x${string}` {
  return TOKENS[symbol].address
}

/**
 * Get token decimals by symbol
 */
export function getTokenDecimals(symbol: "USDC" | "EURC"): number {
  return TOKENS[symbol].decimals
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const fraction = amount % divisor
  const fractionStr = fraction.toString().padStart(decimals, "0")
  const trimmed = fractionStr.replace(/0+$/, "")
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

/**
 * Parse token amount from string input
 * Ensures valid BigInt output for blockchain transactions
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  if (!amount || amount === "" || amount.trim() === "") return 0n
  
  // Remove any whitespace
  const cleanAmount = amount.trim()
  
  // Validate format (numbers and decimal point only)
  if (!/^\d+\.?\d*$/.test(cleanAmount)) {
    return 0n
  }
  
  const [whole, fraction = ""] = cleanAmount.split(".")
  
  // Validate whole part
  if (!whole || whole === "") {
    return 0n
  }
  
  const wholePart = BigInt(whole)
  const fractionPart = BigInt((fraction.padEnd(decimals, "0").slice(0, decimals) || "0"))
  const divisor = BigInt(10 ** decimals)
  const result = wholePart * divisor + fractionPart
  
  // Ensure result is positive and valid
  if (result <= 0n) {
    return 0n
  }
  
  return result
}

