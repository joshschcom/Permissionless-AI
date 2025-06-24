# Peridot Protocol Dashboard

A decentralized lending and borrowing protocol built on Binance Smart Chain (BSC). Users can supply crypto assets to earn interest or borrow against their collateral using a Compound-like protocol architecture.

## 🎯 Features

- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, and other popular wallets
- **Lending & Borrowing**: Supply assets to earn yield or borrow against collateral
- **Real-time Analytics**: Live APY rates, utilization rates, and position tracking
- **AI Agent Integration**: Get help and insights from our built-in AI assistant
- **Multi-Asset Support**: PUSD, PDOT, USDT, BUSD and more
- **Modern UI**: Beautiful, responsive interface with dark theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MetaMask or compatible Web3 wallet
- BSC Testnet setup with test tokens

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔧 Smart Contracts (BSC Testnet)

### Core Protocol Contracts
- **Peridottroller (Comptroller)**: `0xe797A0001A3bC1B2760a24c3D7FDD172906bCCd6`
- **PayPal USD (PUSD)**: `0xa41D586530BC7BC872095950aE03a780d5114445`
- **pPUSD Token (Lending Pool)**: `0xEDdC65ECaF2e67c301a01fDc1da6805084f621D0`
- **Peridot Token ($P)**: `0xB911C192ed1d6428A12F2Cf8F636B00c34e68a2a`

### Price Oracles
- **Simple Price Oracle**: `0xf79b3af6954bCbeDfE0F6BE34DD1153A391E8083`
- **Pyth Network Oracle**: `0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb`
- **Mock Oracle**: `0x82BF1C5516F6A91d4bF1E0aB62aF373dB049Df91`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React Icons
- **Blockchain**: Ethers.js, Wagmi, Viem
- **Wallet Integration**: Reown AppKit (WalletConnect v2)
- **Network**: Binance Smart Chain Testnet

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes for server-side operations
│   ├── page.tsx       # Main dashboard page
│   └── layout.tsx     # Root layout
├── components/        # React components
│   ├── ConnectWalletBSC.tsx      # BSC wallet connection
│   ├── LendingBorrowingBSC.tsx   # Main lending/borrowing interface
│   ├── LendingBalanceDisplay.tsx # Balance and position display
│   ├── AIAgent.tsx               # AI assistant component
│   └── VaultPerformanceChart.tsx # Analytics charts
├── config/
│   └── wallet.ts      # Wallet and network configuration
└── utils/
    └── bsc.ts         # BSC utilities and contract interactions
```

## 🎮 How to Use

### 1. Connect Wallet
- Install MetaMask or compatible wallet
- Switch to BSC Testnet
- Click "Connect Wallet" button
- Approve the connection

### 2. Get Test Tokens
- Use the built-in faucet to get test PUSD tokens
- Add BSC Testnet to your wallet if needed
- Ensure you have BNB for gas fees

### 3. Supply Assets (Lending)
- Navigate to the "Lending" tab
- Select an asset (PUSD, PDOT, etc.)
- Enter the amount to supply
- Approve the token spending
- Confirm the supply transaction
- Start earning interest immediately

### 4. Borrow Assets
- First supply collateral assets
- Enter the lending markets for your collateral
- Navigate to "Borrow" section
- Select asset to borrow
- Enter borrow amount (within collateral limits)
- Confirm borrow transaction

### 5. Manage Positions
- Monitor your supplied and borrowed assets
- Track APY rates and utilization
- Repay loans or withdraw supplies anytime
- Maintain healthy Collateral Factor (>150%)

## 🛠️ Development

### API Routes
- `POST /api/deposit` - Process lending deposits
- `POST /api/withdraw` - Process lending withdrawals
- `POST /api/mint-tokens` - Mint test tokens for development
- `GET /api/vault-balance` - Get vault balance data
- `GET /api/vault-stats` - Get protocol statistics
- `POST /api/submit-transaction` - Submit blockchain transactions

### Component Architecture
```typescript
interface WalletInfo {
  isConnected: boolean;
  address: string;
  bnbBalance: string;
  pdotBalance: string;
  stakedBalance: string;
}

interface LendingPosition {
  asset: string;
  supplied: string;
  borrowed: string;
  supplyApy: string;
  borrowApy: string;
  collateralFactor: string;
}
```

### Contract Integration
The protocol uses a Compound-like architecture:
- **Comptroller**: Manages risk and collateral calculations
- **pTokens**: ERC-20 tokens representing lending positions
- **Interest Rate Models**: Calculate supply and borrow rates
- **Price Oracles**: Provide real-time asset prices

## 🎨 Design System

### Color Scheme
- **Primary**: Emerald/Green gradient (`#10b981`, `#059669`)
- **Secondary**: Blue accents (`#3b82f6`)
- **Warning**: Orange (`#f59e0b`)
- **Error**: Red (`#ef4444`)
- **Background**: Dark theme with slate colors

### Key Features
- Responsive grid layouts
- Smooth animations and transitions
- Loading states and progress indicators
- Real-time data updates
- Mobile-optimized interface

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes |
| `NEXT_PUBLIC_BSC_TESTNET_RPC` | BSC Testnet RPC URL | Optional |

### Network Configuration
- **Network**: BSC Testnet (Chain ID: 97)
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Currency**: tBNB (Test BNB)

## 📊 Protocol Mechanics

### Lending (Supply)
1. Users deposit tokens into lending pools
2. Receive pTokens representing their share
3. Earn interest from borrower payments
4. Interest compounds automatically
5. Withdraw anytime (subject to utilization)

### Borrowing
1. Supply collateral assets first
2. Enter lending markets for collateral
3. Borrow up to collateral factor limit
4. Pay interest on borrowed amount
5. Must maintain minimum collateral ratio

### Liquidation Protection
- **Collateral Factor**: Maximum borrowing ratio per asset
- **Liquidation Threshold**: When positions can be liquidated
- **Safety Buffer**: Recommended >150% collateral ratio
- **Automated Liquidations**: Protect protocol solvency

## 🧪 Testing & Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start
```

### Smart Contract Testing
The protocol includes comprehensive test coverage for:
- Lending and borrowing mechanics
- Interest rate calculations
- Liquidation scenarios
- Oracle price feeds
- Access controls

## 📚 Learning Resources

- [Compound Protocol Documentation](https://compound.finance/docs)
- [BSC Developer Guide](https://docs.bnbchain.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi React Hooks](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

## ⚠️ Important Notes

- **Testnet Only**: This dashboard uses BSC Testnet
- **Educational Purpose**: Built for learning and demonstration
- **Risk Management**: Never borrow more than you can repay
- **Liquidation Risk**: Monitor collateral ratios carefully
- **Smart Contract Risk**: Protocol is experimental

## 🔐 Security

### Best Practices
- Always verify transaction details before signing
- Never share private keys or seed phrases
- Use hardware wallets for large amounts
- Monitor positions regularly
- Understand liquidation risks

### Audit Status
- **Status**: Under Development
- **Testing**: Comprehensive test suite included
- **Code Review**: Open source for community review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

- [ ] Mainnet deployment
- [ ] Additional asset support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Governance token integration
- [ ] Cross-chain bridge support

## 📄 License

This project is for educational and development purposes. See the [BSC Documentation](https://docs.bnbchain.org/) for more information about building on Binance Smart Chain.

---

**Built with ❤️ on Binance Smart Chain**

For support and updates, join our community or check our documentation.
