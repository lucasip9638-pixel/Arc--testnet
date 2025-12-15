// Contract addresses and ABIs for ARC testnet
// Update these addresses after deploying contracts

export const CONTRACTS = {
  TOKEN_SWAP: {
    address: "0x0000000000000000000000000000000000000000", // Update after deployment
    abi: [
      "function swapUSDCtoEURC(uint256 amount) external",
      "function swapEURCtoUSDC(uint256 amount) external",
      "function exchangeRate() view returns (uint256)",
      "function swapFee() view returns (uint256)",
    ],
  },
  STAKING: {
    address: "0x0000000000000000000000000000000000000000", // Update after deployment
    abi: [
      "function stake(uint256 amount) external",
      "function unstake(uint256 amount) external",
      "function claimRewards() external",
      "function calculateRewards(address user) view returns (uint256)",
      "function getStakeInfo(address user) view returns (uint256, uint256, uint256)",
      "function apy() view returns (uint256)",
    ],
  },
  DAILY_GM: {
    address: "0x0000000000000000000000000000000000000000", // Update after deployment
    abi: [
      "function sayGM() external",
      "function canSayGM(address user) view returns (bool)",
      "function getTimeUntilNextGM(address user) view returns (uint256)",
      "function getGMRecord(address user) view returns (uint256, uint256, uint256, uint256)",
      "function totalGMsSent() view returns (uint256)",
    ],
  },
  TOKENS: {
    USDC: "0x0000000000000000000000000000000000000000", // Update with actual USDC address
    EURC: "0x0000000000000000000000000000000000000000", // Update with actual EURC address
  },
}

export const ARC_TESTNET = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  explorer: "https://testnet.arcscan.app",
}
