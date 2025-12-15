/**
 * DailyGM Contract ABI
 * Generated from contracts/DailyGM.sol
 */
export const DAILY_GM_ABI = [
  {
    inputs: [],
    name: "sayGM",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "canSayGM",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getTimeUntilNextGM",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getGMRecord",
    outputs: [
      { internalType: "uint256", name: "lastGMTime", type: "uint256" },
      { internalType: "uint256", name: "totalGMs", type: "uint256" },
      { internalType: "uint256", name: "currentStreak", type: "uint256" },
      { internalType: "uint256", name: "longestStreak", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalGMsSent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
    ],
    name: "gmRecords",
    outputs: [
      { internalType: "uint256", name: "lastGMTime", type: "uint256" },
      { internalType: "uint256", name: "totalGMs", type: "uint256" },
      { internalType: "uint256", name: "currentStreak", type: "uint256" },
      { internalType: "uint256", name: "longestStreak", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "streak", type: "uint256" },
    ],
    name: "GMSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "oldStreak", type: "uint256" },
    ],
    name: "StreakBroken",
    type: "event",
  },
] as const

/**
 * DailyGM contract address on Arc Testnet
 * Update this after deploying the contract
 * 
 * To deploy the contract:
 * 1. Use Remix IDE: https://remix.ethereum.org
 * 2. Copy contracts/DailyGM.sol
 * 3. Compile with Solidity 0.8.20
 * 4. Deploy to Arc Testnet (Chain ID: 5042002)
 * 5. Update the address below
 */
export const DAILY_GM_CONTRACT_ADDRESS = "0x8d0ac3728e87be7cf293effaeb2118d90121ecb7" as `0x${string}`


