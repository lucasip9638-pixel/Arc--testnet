# Arc DeFi Hub

A complete DeFi platform built on Arc Network testnet featuring token swaps, staking, and daily GM rewards.

## Features

### Daily GM
- Say "Good Morning" on-chain daily
- Build streaks for consistency
- Track your GM history
- Share on social media
- View transactions on ArcScan explorer

### Swap USDC ⇄ EURC
- Swap between USDC and EURC on Arc Network
- Simple 1:1 exchange rate (demo/educational)
- Real-time balance display
- Transaction status tracking
- View transactions on ArcScan explorer
- **⚠️ Experimental/Demo**: This is a simplified swap implementation for educational purposes
- **Token addresses**: Update `lib/tokens.ts` with actual USDC/EURC addresses on Arc Testnet
- **Get testnet tokens**: Use [Circle Faucet](https://faucet.circle.com)

## Smart Contracts

The project includes three Solidity smart contracts:

1. **TokenSwap.sol** - USDC/EURC token swap with configurable fees
2. **Staking.sol** - Token staking with APY rewards
3. **DailyGM.sol** - Daily GM tracking with streak system

## 🌐 Live Demo

**Deployed on Vercel:** [https://arc-testnet-sdsz.vercel.app/](https://arc-testnet-sdsz.vercel.app/)

## Getting Started

### Prerequisites

- MetaMask or compatible Web3 wallet
- Arc Testnet configured in your wallet
- Testnet USDC for gas fees
- Get testnet tokens: [Circle Faucet](https://faucet.circle.com)

### Arc Testnet Configuration

- Network Name: Arc Testnet
- RPC URL: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Currency Symbol: USDC
- Block Explorer: https://testnet.arcscan.app

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/lucasip9638-pixel/Arc--testnet.git
   cd Arc--testnet
   ```

2. Install dependencies
   ```bash
   npm install --legacy-peer-deps
   ```

3. Run development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

### Deploying Contracts

1. Set up Hardhat or Foundry
2. Compile the contracts in `/contracts` directory
3. Deploy to Arc testnet using the deployment script
4. Update contract addresses in `/lib/contract-config.ts`

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Web3**: wagmi + viem
- **UI Components**: shadcn/ui
- **State Management**: @tanstack/react-query

## Token Addresses & Contract

### Token Addresses
Update these in `/lib/tokens.ts` with actual addresses on Arc Testnet:

- USDC Token: Update `TOKENS.USDC.address`
- EURC Token: Update `TOKENS.EURC.address`

### Swap Contract
The `TokenSwap.sol` contract is located in `/contracts/TokenSwap.sol`.

**To deploy:**
1. Deploy the contract to Arc Testnet with USDC and EURC addresses as constructor parameters
2. Update `SWAP_CONTRACT_ADDRESS` in `/lib/swap-contract.ts` with the deployed contract address

**Contract Features:**
- Swap USDC → EURC
- Swap EURC → USDC
- Configurable exchange rate (owner only)
- Configurable swap fee (0.3% default, max 10%)
- Owner can withdraw tokens

**Important**: Both token addresses and swap contract address must be configured before using the swap feature.

## Swap Implementation Notes

The swap feature is implemented as a **demo/educational** tool:

- Uses wagmi + viem for Web3 interactions
- Reads token balances using ERC20 standard
- Simple 1:1 exchange rate (for demo purposes)
- Transaction tracking and explorer links
- **Note**: A swap contract is required for actual swaps. The current implementation shows the UI and structure but needs a swap contract address to be fully functional.

For production use, you would need to:
1. Deploy or use an existing swap contract on Arc Testnet
2. Update the swap logic in `components/token-swap-real.tsx`
3. Configure token addresses in `lib/tokens.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
