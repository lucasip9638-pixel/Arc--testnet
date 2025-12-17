import { defineChain } from "viem"
import { createConfig, http } from "wagmi"
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors"

/**
 * Wagmi configuration for Arc Testnet
 * 
 * Arc Testnet details:
 * - Chain ID: 5042002
 * - RPC: https://rpc.testnet.arc.network
 * - Explorer: https://testnet.arcscan.app
 */

// Define Arc Testnet chain using viem
// IMPORTANT: Arc Testnet uses USDC as native currency (not ETH)
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
    public: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
})

// Create wagmi config with optimized polling
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "Arc DeFi Hub",
      appLogoUrl: "https://testnet.arcscan.app/favicon.ico",
    }),
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})

