'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Coins, Percent, Clock, CheckCircle, AlertCircle, X, BarChart3, Wallet, ChevronDown, HelpCircle, ChevronRight, ChevronLeft, DollarSign, PiggyBank, Lock, Shield, Zap } from 'lucide-react';
import { WalletInfo, formatBalance, formatNumber, PERIDOTTROLLER_CONTRACT, PUSD_CONTRACT, PPUSD_CONTRACT, PPUSD_ADDRESS, PTOKEN_ABI, testContractConnection } from '@/utils/bsc';
import { useReadContract, useAccount, useBalance, useWriteContract } from 'wagmi';

interface LendingBorrowingBSCProps {
  walletInfo: WalletInfo | null;
  mockBorrowData?: {
    borrowedAmount: number;
    saveBorrow: (amount: number) => void;
    canBorrow: boolean;
  } | null;
}

type Asset = 'PUSD' | 'PDOT' | 'USDT' | 'BUSD';
type Mode = 'lend' | 'borrow' | 'withdraw' | 'repay';

const assetData = {
  PUSD: {
    icon: 'PU',
    name: 'PUSD',
    fullName: 'PayPal USD',
    lendApy: '4.2',
    borrowApy: '6.8',
    totalSupply: '500.0K',
    totalBorrow: '350.0K',
    utilizationRate: '70.0',
    price: 1.00,
    balance: '1000.00',
    collateralFactor: '0.85'
  },
  PDOT: {
    icon: 'PD',
    name: 'PDOT',
    fullName: 'Peridot Token',
    lendApy: '8.5',
    borrowApy: '12.3',
    totalSupply: '1.2M',
    totalBorrow: '890K',
    utilizationRate: '74.2',
    price: 0.85,
    balance: '15,420.00',
    collateralFactor: '0.60'
  },
  USDT: {
    icon: 'US',
    name: 'USDT',
    fullName: 'Tether USD',
    lendApy: '2.1',
    borrowApy: '4.5',
    totalSupply: '8.9M',
    totalBorrow: '6.2M',
    utilizationRate: '69.7',
    price: 1.00,
    balance: '1,250.00',
    collateralFactor: '0.85'
  },
  BUSD: {
    icon: 'BU',
    name: 'BUSD',
    fullName: 'Binance USD',
    lendApy: '1.8',
    borrowApy: '4.2',
    totalSupply: '5.4M',
    totalBorrow: '3.8M',
    utilizationRate: '70.4',
    price: 1.00,
    balance: '890.50',
    collateralFactor: '0.85'
  }
};

export default function LendingBorrowingBSC({ walletInfo, mockBorrowData }: LendingBorrowingBSCProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>('PUSD');
  const [mode, setMode] = useState<Mode>('lend');
  const [amount, setAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionStep, setTransactionStep] = useState<'idle' | 'wrap' | 'approve' | 'mint' | 'withdraw'>('idle');
  const [activeTab, setActiveTab] = useState<'lending' | 'borrowing'>('lending');

  // State for contract connection test
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; error?: string; markets?: string[] } | null>(null);
  const [connectionTestLoading, setConnectionTestLoading] = useState(false);
  const [isDebugDropdownOpen, setIsDebugDropdownOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Peridot Protocol",
      icon: <Shield className="w-12 h-12 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-lg">
            Peridot is a decentralized lending and borrowing protocol that allows you to earn yield 
            on your crypto assets or borrow against your collateral.
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">Key Benefits:</h4>
            <ul className="text-slate-300 space-y-1 text-sm">
              <li>• Earn competitive interest on deposits</li>
              <li>• Borrow against your crypto holdings</li>
              <li>• Transparent, on-chain operations</li>
              <li>• No intermediaries or hidden fees</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "How Lending Works",
      icon: <PiggyBank className="w-12 h-12 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-lg">
            Supply your tokens to earn interest paid by borrowers. Your funds are pooled with other lenders 
            to provide liquidity for the protocol.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <ArrowUpCircle className="w-8 h-8 text-blue-400 mb-2" />
              <h4 className="text-blue-400 font-semibold mb-2">Supply Assets</h4>
              <p className="text-slate-300 text-sm">
                Deposit your tokens into the lending pool and receive pTokens representing your share.
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <DollarSign className="w-8 h-8 text-green-400 mb-2" />
              <h4 className="text-green-400 font-semibold mb-2">Earn Interest</h4>
              <p className="text-slate-300 text-sm">
                Automatically earn interest that compounds over time. Withdraw anytime.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How Borrowing Works",
      icon: <ArrowDownCircle className="w-12 h-12 text-red-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-lg">
            Use your crypto as collateral to borrow other tokens. This allows you to access liquidity 
            without selling your assets.
          </p>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <h4 className="text-orange-400 font-semibold mb-3">Borrowing Process:</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold flex items-center justify-center">1</div>
                <span className="text-slate-300 text-sm">Supply collateral to the protocol</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold flex items-center justify-center">2</div>
                <span className="text-slate-300 text-sm">Borrow up to your collateral limit</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold flex items-center justify-center">3</div>
                <span className="text-slate-300 text-sm">Repay borrowed amount + interest</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Safety & Collateral",
      icon: <Lock className="w-12 h-12 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-lg">
            The protocol maintains safety through overcollateralization and automated liquidations 
            to protect lenders and maintain system stability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <h4 className="text-purple-400 font-semibold mb-2">Collateral Ratio</h4>
              <p className="text-slate-300 text-sm">
                Maintain at least 150% collateral value relative to borrowed amount to avoid liquidation.
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h4 className="text-red-400 font-semibold mb-2">Liquidation Protection</h4>
              <p className="text-slate-300 text-sm">
                If collateral value drops too low, positions may be liquidated to protect the protocol.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start",
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-lg">
            You're now ready to start lending and borrowing on Peridot! Remember to always manage 
            your risk and never invest more than you can afford to lose.
          </p>
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <h4 className="text-cyan-400 font-semibold mb-3">Next Steps:</h4>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>• Connect your wallet if you haven't already</li>
              <li>• Start with small amounts to get familiar</li>
              <li>• Monitor your positions regularly</li>
              <li>• Join our community for support and updates</li>
            </ul>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsTutorialOpen(false)}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200"
            >
              Start Using Peridot
            </button>
          </div>
        </div>
      )
    }
  ];

  const { address } = useAccount();

  // Get user's BNB balance
  const { data: bnbBalance } = useBalance({
    address,
    query: { enabled: !!address }
  });

  // Get user's PUSD balance
  const { data: pusdBalance, refetch: refetchPusdBalance } = useReadContract({
    ...PUSD_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Hook for writing to contracts
  const { writeContract, isPending: isWritePending, isSuccess: isWriteSuccess, error: writeError } = useWriteContract();

  // Wagmi hooks for contract calls
  const { 
    data: allMarkets, 
    error: allMarketsError, 
    isLoading: allMarketsLoading,
    refetch: refetchAllMarkets 
  } = useReadContract({
    ...PERIDOTTROLLER_CONTRACT,
    functionName: 'getAllMarkets',
  });

  const { 
    data: assetsIn, 
    error: assetsInError, 
    isLoading: assetsInLoading,
    refetch: refetchAssetsIn 
  } = useReadContract({
    ...PERIDOTTROLLER_CONTRACT,
    functionName: 'getAssetsIn',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only run when address is available
    },
  });

  // Get user's pPUSD balance (using the correct pPUSD contract address)
  const { data: pTokenBalance, refetch: refetchPTokenBalance } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get user's borrow balance for pPUSD
  const { data: borrowBalance, refetch: refetchBorrowBalance } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'borrowBalanceStored',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Check if user is in the pPUSD market
  const { data: isInMarket, refetch: refetchIsInMarket } = useReadContract({
    ...PERIDOTTROLLER_CONTRACT,
    functionName: 'checkMembership',
    args: address ? [address, PPUSD_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  // Get account liquidity
  const { data: accountLiquidity, refetch: refetchAccountLiquidity } = useReadContract({
    ...PERIDOTTROLLER_CONTRACT,
    functionName: 'getAccountLiquidity',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get current PUSD allowance for pPUSD contract
  const { data: pusdAllowance, refetch: refetchPusdAllowance } = useReadContract({
    ...PUSD_CONTRACT,
    functionName: 'allowance',
    args: address ? [address, PPUSD_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  // Get exchange rate for pPUSD conversion
  const { data: exchangeRate, refetch: refetchExchangeRate } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'exchangeRateStored',
    query: { enabled: !!address }
  });

  // Utility function to convert pPUSD tokens to underlying PUSD
  const convertPTokenToUnderlying = (pTokenAmount: bigint, exchangeRateValue: bigint) => {
    // pToken balance * exchangeRate / 1e18 (exchange rate scaling factor)
    // pToken has 8 decimals, underlying has 18 decimals
    // exchangeRate is scaled by 1e18
    const underlyingAmount = (pTokenAmount * exchangeRateValue) / BigInt(1e18);
    return underlyingAmount;
  };

  // Function to refresh all balances
  const refreshAllBalances = () => {
    refetchPusdBalance();
    refetchPTokenBalance();
    refetchBorrowBalance();
    refetchIsInMarket();
    refetchAccountLiquidity();
    refetchAllMarkets();
    refetchAssetsIn();
    refetchPusdAllowance();
    refetchExchangeRate();
  };

  // Watch for transaction completion and advance to next step
  useEffect(() => {
    if (isWriteSuccess && transactionStep !== 'idle') {
      if (transactionStep === 'approve' && !isInMarket) {
        // Just entered the market, now proceed to approval
        setTransactionStatus('Step 2/3: Approving PUSD...');
        setTimeout(() => {
          handleApprovePUSD();
        }, 2000);
      } else if (transactionStep === 'approve' && isInMarket) {
        // Approval completed, now proceed to mint automatically
        setTransactionStatus('Step 3/3: Minting pPUSD...');
        setTimeout(() => {
          handleMintPToken();
        }, 2000);
      } else if (transactionStep === 'mint') {
        const successMessage = mode === 'lend' 
          ? `✅ Successfully supplied ${amount} PUSD to the protocol!` 
          : `✅ Successfully borrowed ${amount} PUSD from the protocol!`;
        setTransactionStatus(successMessage);
        // Refetch all balances after transaction (with delay)
        setTimeout(() => {
          refreshAllBalances();
        }, 3000);
        setAmount('');
        setTimeout(() => {
          setIsModalOpen(false);
          setIsTransacting(false);
          setTransactionStatus('');
          setTransactionStep('idle');
        }, 5000);
      } else if (transactionStep === 'withdraw') {
        setTransactionStatus(`✅ Successfully withdrew ${amount} PUSD from the protocol!`);
        // Refetch all balances after withdrawal
        setTimeout(() => {
          refreshAllBalances();
        }, 3000);
        setAmount('');
        setTimeout(() => {
          setIsModalOpen(false);
          setIsTransacting(false);
          setTransactionStatus('');
          setTransactionStep('idle');
        }, 5000);
      }
    }
  }, [isWriteSuccess, transactionStep, isInMarket]);

  // Watch for transaction errors
  useEffect(() => {
    if (writeError && transactionStep !== 'idle') {
      const errorMessage = transactionStep === 'approve' && !isInMarket
        ? `❌ Failed to enter market: ${writeError.message.slice(0, 100)}...`
        : transactionStep === 'approve' && isInMarket
        ? `❌ Failed to approve ${amount} PUSD: ${writeError.message.slice(0, 100)}...`
        : transactionStep === 'mint'
        ? `❌ Failed to ${mode === 'lend' ? 'supply' : 'borrow'} ${amount} PUSD: ${writeError.message.slice(0, 100)}...`
        : transactionStep === 'withdraw'
        ? `❌ Failed to withdraw ${amount} PUSD: ${writeError.message.slice(0, 100)}...`
        : `❌ Transaction failed: ${writeError.message.slice(0, 100)}...`;
      
      setTransactionStatus(errorMessage);
      setTimeout(() => {
        setIsTransacting(false);
        setTransactionStatus('');
        setTransactionStep('idle');
      }, 5000);
    }
  }, [writeError, transactionStep, amount, mode, isInMarket]);

  // Auto-refresh balances every 30 seconds when connected
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(() => {
      refreshAllBalances();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [address]);

  // Get real user position data from contracts
  const getUserPositionData = (asset: Asset) => {
    if (asset === 'PUSD') {
      // For PUSD, use actual contract data + mock borrow data
      const walletBalance = pusdBalance ? formatBalance((Number(pusdBalance) / 1e18).toString()) : '0.00';
      
      // Convert pPUSD tokens to underlying PUSD using exchange rate
      let suppliedAmount = '0.00';
      if (pTokenBalance && exchangeRate) {
        const underlyingAmount = convertPTokenToUnderlying(pTokenBalance, exchangeRate);
        suppliedAmount = formatBalance((Number(underlyingAmount) / 1e18).toString());
      }
      
      // Use mock borrow data if available, otherwise fallback to contract data
      const borrowedAmount = mockBorrowData?.borrowedAmount 
        ? formatBalance(mockBorrowData.borrowedAmount.toString())
        : borrowBalance ? formatBalance((Number(borrowBalance) / 1e18).toString()) : '0.00';
      
      // Calculate health factor from account liquidity
      let healthFactor = '∞';
      if (accountLiquidity && Array.isArray(accountLiquidity) && accountLiquidity.length >= 3) {
        const liquidity = Number(accountLiquidity[1]);
        const shortfall = Number(accountLiquidity[2]);
        if (shortfall > 0) {
          healthFactor = '< 1.0'; // Unhealthy
        } else if (liquidity > 0) {
          healthFactor = '> 1.0'; // Healthy
        }
      }
      
      return {
        supplied: suppliedAmount,
        borrowed: borrowedAmount,
        collateral: suppliedAmount, // Supplied amount acts as collateral
        healthFactor: healthFactor,
        walletBalance: walletBalance
      };
    } else {
      // For other assets, use mock data for now
      return {
        supplied: formatBalance((parseFloat(assetData[asset].balance) * 0.6).toString()),
        borrowed: formatBalance((parseFloat(assetData[asset].balance) * 0.3).toString()),
        collateral: formatBalance((parseFloat(assetData[asset].balance) * 0.45).toString()),
        healthFactor: '2.34',
        walletBalance: formatBalance(assetData[asset].balance)
      };
    }
  };

  const openModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
    // Set mode based on active tab
    setMode(activeTab === 'lending' ? 'lend' : 'borrow');
    // Reset transaction state
    setTransactionStep('idle');
    setTransactionStatus('');
    setIsTransacting(false);
    // Refresh balances when opening modal
    refreshAllBalances();
  };

  const handleEnterMarket = () => {
    setTransactionStep('approve');
    setTransactionStatus('Step 1/3: Entering market...');
    
    writeContract({
      ...PERIDOTTROLLER_CONTRACT,
      functionName: 'enterMarkets',
      args: [[PPUSD_ADDRESS]],
    });
  };

  const handleApprovePUSD = () => {
    if (!amount) return;
    
    setTransactionStep('approve');
    setTransactionStatus('Step 2/3: Approving PUSD...');
    
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    
    console.log('💰 Approving PUSD:');
    console.log('- Amount:', amount, 'PUSD');
    console.log('- Amount Wei:', amountWei.toString());
    console.log('- Spender (pPUSD):', PPUSD_ADDRESS);
    console.log('- Current Balance:', pusdBalance ? (Number(pusdBalance) / 1e18).toString() : '0');
    console.log('- Current Allowance:', pusdAllowance ? (Number(pusdAllowance) / 1e18).toString() : '0');
    
    writeContract({
      ...PUSD_CONTRACT,
      functionName: 'approve',
      args: [PPUSD_ADDRESS, amountWei],
    });
  };

  const handleMintPToken = () => {
    if (!amount) return;
    
    setTransactionStep('mint');
    setTransactionStatus('Step 3/3: Minting pPUSD...');
    
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    
    console.log('🚀 Starting mint process:');
    console.log('- Amount:', amount, 'PUSD');
    console.log('- Amount Wei:', amountWei.toString());
    console.log('- pPUSD Contract:', PPUSD_ADDRESS);
    console.log('- User Address:', address);
    console.log('- Current PUSD Balance:', pusdBalance ? (Number(pusdBalance) / 1e18).toString() : '0');
    console.log('- Current PUSD Allowance:', pusdAllowance ? (Number(pusdAllowance) / 1e18).toString() : '0');
    console.log('- Is in Market:', isInMarket);
    
    writeContract({
      ...PPUSD_CONTRACT,
      functionName: 'mint',
      args: [amountWei],
    });
  };

  const handleBorrowPUSD = () => {
    if (!amount || !mockBorrowData?.canBorrow) return;
    
    const borrowAmount = parseFloat(amount);
    
    console.log('🚀 Starting mock borrow process:');
    console.log('- Amount:', borrowAmount, 'PUSD');
    console.log('- Current borrowed:', mockBorrowData.borrowedAmount);
    console.log('- Can borrow:', mockBorrowData.canBorrow);
    
    // Add to existing borrowed amount
    const newBorrowedAmount = mockBorrowData.borrowedAmount + borrowAmount;
    mockBorrowData.saveBorrow(newBorrowedAmount);
    
    setTransactionStatus(`✅ Successfully borrowed ${borrowAmount} PUSD (mock mode)!`);
    refreshAllBalances();
    setAmount('');
    
    setTimeout(() => {
      setIsModalOpen(false);
      setIsTransacting(false);
      setTransactionStatus('');
      setTransactionStep('idle');
    }, 3000);
  };

  const handleRepayPUSD = () => {
    if (!amount || !mockBorrowData) return;
    
    const repayAmount = parseFloat(amount);
    const currentBorrowed = mockBorrowData.borrowedAmount;
    
    if (repayAmount > currentBorrowed) {
      setTransactionStatus('❌ Cannot repay more than borrowed amount!');
      setTimeout(() => {
        setTransactionStatus('');
      }, 3000);
      return;
    }
    
    console.log('💰 Starting mock repay process:');
    console.log('- Repay Amount:', repayAmount, 'PUSD');
    console.log('- Current borrowed:', currentBorrowed);
    console.log('- Remaining after repay:', currentBorrowed - repayAmount);
    
    // Subtract from existing borrowed amount
    const newBorrowedAmount = Math.max(0, currentBorrowed - repayAmount);
    mockBorrowData.saveBorrow(newBorrowedAmount);
    
    setTransactionStatus(`✅ Successfully repaid ${repayAmount} PUSD (mock mode)!`);
    refreshAllBalances();
    setAmount('');
    
    setTimeout(() => {
      setIsModalOpen(false);
      setIsTransacting(false);
      setTransactionStatus('');
      setTransactionStep('idle');
    }, 3000);
  };

  const handleWithdrawPUSD = () => {
    if (!amount) return;
    
    setTransactionStep('withdraw');
    setTransactionStatus('Withdrawing PUSD...');
    
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    
    console.log('🔄 Starting withdrawal process:');
    console.log('- Amount:', amount, 'PUSD');
    console.log('- Amount Wei:', amountWei.toString());
    console.log('- pPUSD Contract:', PPUSD_ADDRESS);
    console.log('- User Address:', address);
    console.log('- Current pPUSD Balance:', pTokenBalance ? (Number(pTokenBalance) / 1e8).toString() : '0');
    
    writeContract({
      ...PPUSD_CONTRACT,
      functionName: 'redeemUnderlying',
      args: [amountWei],
    });
  };

  const handleTransaction = () => {
    if (!amount || parseFloat(amount) <= 0 || !address) return;
    
    if (selectedAsset === 'PUSD') {
      setIsTransacting(true);
      
      if (mode === 'lend') {
        // Check if user is already in the market
        if (!isInMarket) {
          // Start the 3-step process: enter market, approve, then mint
          handleEnterMarket();
        } else {
          // Start the 2-step process: approve then mint
          handleApprovePUSD();
        }
      } else if (mode === 'withdraw') {
        // Handle withdrawal
        handleWithdrawPUSD();
      } else if (mode === 'borrow') {
         // Mock borrowing: Check if user has supplied collateral first
         if (!mockBorrowData?.canBorrow) {
           setTransactionStatus('You must supply collateral first before borrowing');
           setTimeout(() => {
             setIsTransacting(false);
             setTransactionStatus('');
           }, 3000);
         } else {
           // User has collateral, can borrow with mock data
           setIsTransacting(true);
           handleBorrowPUSD();
         }
       } else if (mode === 'repay') {
         // Handle repayment with mock data
         setIsTransacting(true);
         handleRepayPUSD();
       }
    } else {
      // For other assets, implement ERC20 approval + mint flow
      setTransactionStatus('Feature coming soon for ' + selectedAsset);
    }
  };

  const calculateProjectedReturn = () => {
    if (!amount || parseFloat(amount) <= 0) return '0.00';
    const amountValue = parseFloat(amount);
    const apy = parseFloat(mode === 'lend' ? assetData[selectedAsset].lendApy : assetData[selectedAsset].borrowApy);
    const monthlyReturn = (amountValue * apy) / 100 / 12;
    return monthlyReturn.toFixed(2);
  };

  // Function to test contract connection
  const handleTestConnection = async () => {
    setConnectionTestLoading(true);
    try {
      const result = await testContractConnection();
      setConnectionTest(result);
    } catch (err: any) {
      setConnectionTest({
        success: false,
        error: err.message || 'Connection test failed'
      });
    } finally {
      setConnectionTestLoading(false);
    }
  };

  if (!walletInfo?.isConnected) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Contract Debug Section - Transparent Dropdown */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDebugDropdownOpen(!isDebugDropdownOpen)}
            className="flex items-center space-x-2 p-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 text-slate-800 dark:text-slate-100"
          >
            <span className="font-bold">Debug</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDebugDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={() => {
              setIsTutorialOpen(true);
              setTutorialStep(0);
            }}
            className="flex items-center space-x-2 p-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 text-slate-800 dark:text-slate-100"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">How To</span>
          </button>
        </div>
        
        {isDebugDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-lg shadow-lg z-10">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handleTestConnection}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                disabled={connectionTestLoading}
              >
                {connectionTestLoading ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={() => refetchAllMarkets()}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                disabled={allMarketsLoading}
              >
                {allMarketsLoading ? 'Loading...' : 'Get All Markets'}
              </button>
              <button
                onClick={() => refetchAssetsIn()}
                className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs"
                disabled={assetsInLoading || !address}
              >
                {assetsInLoading ? 'Loading...' : 'Get Assets In'}
              </button>
              <button
                onClick={refreshAllBalances}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                disabled={!address}
              >
                🔄 Refresh All Balances
              </button>
            </div>
            
            {/* Connection Test Results */}
            {connectionTest && (
              <div className="mb-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Connection Test:</span>
                {connectionTest.success ? (
                  <div className="text-green-500 text-xs">✓ Connection successful</div>
                ) : (
                  <div className="text-red-500 text-xs">✗ {connectionTest.error}</div>
                )}
                {connectionTest.markets && connectionTest.markets.length > 0 && (
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Markets found:</span>
                    <ul className="font-mono text-slate-600 dark:text-slate-400">
                      {connectionTest.markets.map(addr => (
                        <li key={addr}>{addr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* All Markets */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">All Markets (Wagmi):</span>
              {allMarketsError && <div className="text-red-500 text-xs">Error: {allMarketsError.message}</div>}
              {allMarkets && Array.isArray(allMarkets) && allMarkets.length > 0 ? (
                <ul className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {allMarkets.map((addr: string) => (
                    <li key={addr}>{addr}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-500">No markets found.</div>
              )}
            </div>
            
            {/* Entered Markets */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Entered Markets (Wagmi):</span>
              {assetsInError && <div className="text-red-500 text-xs">Error: {assetsInError.message}</div>}
              {assetsIn && Array.isArray(assetsIn) && assetsIn.length > 0 ? (
                <ul className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {assetsIn.map((addr: string) => (
                    <li key={addr}>{addr}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-500">No entered markets.</div>
              )}
            </div>

            {/* Token Balances & Market Status */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Token Balances & Market Status:</span>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <div>PUSD: {pusdBalance ? formatBalance((Number(pusdBalance) / 1e18).toString()) : '0'}</div>
                <div>pPUSD: {pTokenBalance && exchangeRate ? formatBalance((Number(convertPTokenToUnderlying(pTokenBalance, exchangeRate)) / 1e18).toString()) : '0'} <span className="font-mono text-xs">({PPUSD_ADDRESS.slice(0, 6)}...{PPUSD_ADDRESS.slice(-4)})</span></div>
                <div className="text-xs text-gray-500 ml-2">Raw pPUSD: {pTokenBalance ? formatBalance((Number(pTokenBalance) / 1e8).toString()) : '0'} tokens</div>
                <div>Borrowed: {borrowBalance ? formatBalance((Number(borrowBalance) / 1e18).toString()) : '0'}</div>
                <div>PUSD Allowance: {pusdAllowance ? formatBalance((Number(pusdAllowance) / 1e18).toString()) : '0'}</div>
                <div className={`font-semibold ${isInMarket ? 'text-green-600' : 'text-orange-600'}`}>
                  In Market: {isInMarket ? '✓ Yes' : '✗ No (need to enter)'}
                </div>
                {accountLiquidity && Array.isArray(accountLiquidity) && accountLiquidity.length >= 3 && (
                  <div>Liquidity: {formatBalance((Number(accountLiquidity[1]) / 1e18).toString())} | Shortfall: {formatBalance((Number(accountLiquidity[2]) / 1e18).toString())}</div>
                )}
                {exchangeRate && (
                  <div>Exchange Rate: {formatBalance((Number(exchangeRate) / 1e18).toString())} PUSD per pPUSD</div>
                )}
              </div>
            </div>

            {/* Test PUSD Minting */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Test PUSD Minting:</span>
              <div className="text-xs space-y-1">
                <button
                  onClick={() => {
                    if (!address) return;
                    const testAmount = BigInt(1000 * 1e18); // 1000 PUSD
                    writeContract({
                      address: PUSD_CONTRACT.address,
                      abi: [
                        {
                          "inputs": [
                            { "internalType": "address", "name": "to", "type": "address" },
                            { "internalType": "uint256", "name": "amount", "type": "uint256" }
                          ],
                          "name": "mint",
                          "outputs": [],
                          "stateMutability": "nonpayable",
                          "type": "function"
                        }
                      ] as const,
                      functionName: 'mint',
                      args: [address, testAmount],
                    });
                    // Refresh balances after minting test PUSD
                    setTimeout(() => {
                      refreshAllBalances();
                    }, 3000);
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                  disabled={!address}
                >
                  Mint 1000 Test PUSD
                </button>
                <div className="text-xs text-gray-500">
                  Note: This mints test PUSD tokens directly to your wallet for testing the lending protocol
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-white/5 rounded-3xl p-1 sm:p-2 border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 flex flex-row">
          <button
            onClick={() => setActiveTab('lending')}
            className={`relative px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'lending'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-900 dark:text-emerald-100 shadow-lg shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <span className="relative z-10 flex items-center space-x-2">
              <ArrowUpCircle className="w-4 h-4" />
              <span>LENDING</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`relative px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'borrowing'
                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-900 dark:text-red-100 shadow-lg shadow-red-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <span className="relative z-10 flex items-center space-x-2">
              <ArrowDownCircle className="w-4 h-4" />
              <span>BORROWING</span>
            </span>
          </button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(assetData).map(([key, asset]) => {
          const assetKey = key as Asset;
          const userPosition = getUserPositionData(assetKey);
          
          return (
            <div 
              key={key}
              className="group relative backdrop-blur-xl bg-white/5 dark:bg-white/5 rounded-2xl p-6 border border-white/10 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-[1.02] transform"
              onClick={() => openModal(assetKey)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0">

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-700 dark:group-hover:text-white transition-colors">{asset.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">{asset.fullName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">${formatNumber(asset.price)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">Balance: {userPosition.walletBalance || formatBalance(asset.balance)}</p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                {activeTab === 'lending' ? (
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="whitespace-nowrap">Supply APY</span>
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{asset.lendApy}%</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20">
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-2 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span className="whitespace-nowrap">Borrow APY</span>
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{asset.borrowApy}%</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-auto border-t border-white/10 dark:border-white/10">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-left">
                    <span className="block text-slate-600 dark:text-slate-400 mb-2 font-medium">
                      {activeTab === 'lending' ? 'Supplied' : 'Borrowed'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {activeTab === 'lending' ? userPosition.supplied : userPosition.borrowed}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-600 dark:text-slate-400 mb-2 font-medium">
                      {activeTab === 'lending' ? 'Earning' : 'Interest'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      ${(parseFloat(activeTab === 'lending' ? userPosition.supplied : userPosition.borrowed) * parseFloat(activeTab === 'lending' ? asset.lendApy : asset.borrowApy) / 100 / 12).toFixed(2)}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Details Modal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overscroll-contain"
          onClick={() => {
            setIsModalOpen(false);
            setTransactionStep('idle');
            setTransactionStatus('');
            setIsTransacting(false);
          }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{assetData[selectedAsset].icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {assetData[selectedAsset].fullName}
                    </h2>
                    <p className="text-gray-500">${formatNumber(assetData[selectedAsset].price)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setTransactionStep('idle');
                    setTransactionStatus('');
                    setIsTransacting(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-1 mb-6 border border-white/10">
                {activeTab === 'lending' ? (
                  <>
                    <button
                      onClick={() => setMode('lend')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        mode === 'lend'
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-100 shadow-lg'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4 inline mr-2" />
                      Supply
                    </button>
                    <button
                      onClick={() => setMode('withdraw')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        mode === 'withdraw'
                          ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-100 shadow-lg'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      <ArrowDownCircle className="w-4 h-4 inline mr-2" />
                      Withdraw
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setMode('borrow')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        mode === 'borrow'
                          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-900 dark:text-red-100 shadow-lg'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      <ArrowDownCircle className="w-4 h-4 inline mr-2" />
                      Borrow
                    </button>
                    <button
                      onClick={() => setMode('repay')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        mode === 'repay'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-900 dark:text-blue-100 shadow-lg'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4 inline mr-2" />
                      Repay
                    </button>
                  </>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{assetData[selectedAsset].name}</span>
                    <button 
                      onClick={() => {
                        if (selectedAsset === 'PUSD') {
                          if (mode === 'lend' && pusdBalance) {
                            // For lending: use full PUSD balance
                            const maxAmount = Number(pusdBalance) / 1e18;
                            setAmount(maxAmount.toString());
                          } else if (mode === 'withdraw' && pTokenBalance && exchangeRate) {
                            // For withdrawal: calculate safe withdrawal amount considering borrows
                            const underlyingAmount = convertPTokenToUnderlying(pTokenBalance, exchangeRate);
                            const totalSupplied = Number(underlyingAmount) / 1e18;
                            const totalBorrowed = borrowBalance ? Number(borrowBalance) / 1e18 : 0;
                            
                            // If there are borrows, only allow withdrawal of excess collateral
                            // Assuming 150% collateral ratio (minimum 1.5x collateral to debt)
                            const minCollateralRequired = totalBorrowed * 1.5;
                            const maxWithdrawAmount = totalBorrowed > 0 
                              ? Math.max(0, totalSupplied - minCollateralRequired)
                              : totalSupplied;
                            
                            setAmount(maxWithdrawAmount.toFixed(2));
                          } else if (mode === 'borrow' && pTokenBalance && exchangeRate) {
                            // For borrowing: use 80% of pPUSD tokens converted to underlying PUSD
                            const underlyingAmount = convertPTokenToUnderlying(pTokenBalance, exchangeRate);
                            const maxBorrowAmount = (Number(underlyingAmount) / 1e18) * 0.8; // 80% of collateral
                            setAmount(maxBorrowAmount.toFixed(2));
                          } else if (mode === 'repay' && mockBorrowData) {
                            // For repay: use current borrowed amount
                            setAmount(mockBorrowData.borrowedAmount.toString());
                          }
                        } else {
                          setAmount(assetData[selectedAsset].balance.replace(/,/g, ''));
                        }
                      }}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <div className="flex flex-col">
                    <span>{mode === 'lend' ? 'Available' : mode === 'withdraw' ? 'Available to Withdraw' : mode === 'repay' ? 'Outstanding Debt' : 'Max Borrow'}: {
                      selectedAsset === 'PUSD' 
                        ? mode === 'lend' && pusdBalance
                          ? formatBalance((Number(pusdBalance) / 1e18).toString()) 
                          : mode === 'withdraw' && pTokenBalance && exchangeRate
                          ? (() => {
                              const underlyingAmount = convertPTokenToUnderlying(pTokenBalance, exchangeRate);
                              const totalSupplied = Number(underlyingAmount) / 1e18;
                              const totalBorrowed = borrowBalance ? Number(borrowBalance) / 1e18 : 0;
                              const minCollateralRequired = totalBorrowed * 1.5;
                              const safeWithdrawAmount = totalBorrowed > 0 
                                ? Math.max(0, totalSupplied - minCollateralRequired)
                                : totalSupplied;
                              return formatBalance(safeWithdrawAmount.toFixed(2));
                            })()
                          : mode === 'borrow' && pTokenBalance && exchangeRate
                          ? formatBalance(((Number(convertPTokenToUnderlying(pTokenBalance, exchangeRate)) / 1e18) * 0.8).toFixed(2))
                          : mode === 'repay' && mockBorrowData
                          ? formatBalance(mockBorrowData.borrowedAmount.toString())
                          : '0.00'
                        : formatBalance(assetData[selectedAsset].balance)
                    } {assetData[selectedAsset].name}</span>
                  </div>
                  <span>≈ ${formatNumber((parseFloat(amount) || 0) * assetData[selectedAsset].price)}</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Percent className="w-4 h-4 mr-1" />
                    {mode === 'lend' ? 'Supply' : 'Borrow'} APY
                  </span>
                  <span className={`text-sm font-semibold ${mode === 'lend' ? 'text-green-600' : 'text-red-600'}`}>
                    {mode === 'lend' ? assetData[selectedAsset].lendApy : assetData[selectedAsset].borrowApy}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Monthly {mode === 'lend' ? 'Earnings' : 'Interest'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${calculateProjectedReturn()} {assetData[selectedAsset].name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Utilization Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {assetData[selectedAsset].utilizationRate}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAsset === 'PUSD' ? (
                <div className="space-y-3">
                  {/* Step indicators */}
                  {mode === 'lend' && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {!isInMarket && (
                        <div className={`flex items-center ${transactionStep === 'approve' && !isInMarket ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${transactionStep === 'approve' && !isInMarket ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                          Enter Market
                        </div>
                      )}
                      <div className={`flex items-center ${(transactionStep === 'approve' && isInMarket) || transactionStep === 'idle' ? 'text-blue-600' : 'text-green-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${transactionStep === 'approve' && isInMarket ? 'bg-blue-600 animate-pulse' : transactionStep === 'idle' ? 'bg-gray-300' : 'bg-green-600'}`}></div>
                        Approve PUSD
                      </div>
                      <div className={`flex items-center ${transactionStep === 'mint' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${transactionStep === 'mint' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                        Supply PUSD
                      </div>
                    </div>
                  )}

                  {mode === 'borrow' && !mockBorrowData?.canBorrow && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                      <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">You must supply pTokens first before borrowing (Mock Mode)</span>
                      </div>
                    </div>
                  )}

                  {mode === 'withdraw' && borrowBalance && Number(borrowBalance) > 0 && (
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg mb-4">
                      <div className="flex items-center text-orange-800 dark:text-orange-200">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <div className="text-sm">
                          <div className="font-semibold mb-1">Collateral Required</div>
                          <div>You have outstanding borrows ({formatBalance((Number(borrowBalance) / 1e18).toString())} PUSD). You can only withdraw excess collateral that doesn't violate the minimum collateral ratio.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {transactionStep === 'idle' && (
                    <button
                      onClick={handleTransaction}
                      disabled={!amount || parseFloat(amount) <= 0 || !address}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        !amount || parseFloat(amount) <= 0 || !address
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                                             {mode === 'lend' 
                         ? (!isInMarket ? 'Start PUSD Supply Process (3 steps)' : 'Start PUSD Supply Process (2 steps)')
                         : mode === 'withdraw'
                         ? 'Withdraw PUSD'
                         : mode === 'repay'
                         ? 'Repay PUSD'
                         : (!mockBorrowData?.canBorrow ? 'Supply pTokens First to Borrow' : 'Borrow PUSD')
                       }
                    </button>
                  )}

                  {transactionStep === 'approve' && (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-medium bg-yellow-600 text-white"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{!isInMarket ? 'Entering Market...' : 'Approving PUSD...'}</span>
                      </div>
                    </button>
                  )}

                  {transactionStep === 'mint' && (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-medium bg-yellow-600 text-white"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Minting pPUSD...</span>
                      </div>
                    </button>
                  )}

                  {transactionStep === 'withdraw' && (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-medium bg-orange-600 text-white"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Withdrawing PUSD...</span>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleTransaction}
                  disabled={!amount || parseFloat(amount) <= 0 || isTransacting || isWritePending || !address}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    !amount || parseFloat(amount) <= 0 || isTransacting || isWritePending || !address
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                      : mode === 'lend'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isTransacting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{transactionStatus}</span>
                    </div>
                  ) : (
                    `${mode === 'lend' ? 'Supply' : 'Borrow'} ${assetData[selectedAsset].name}`
                  )}
                </button>
              )}

              {transactionStatus && !isTransacting && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  transactionStatus.includes('✅') 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                }`}>
                  <div className={`flex items-start ${
                    transactionStatus.includes('✅') 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {transactionStatus.includes('✅') ? (
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{transactionStatus}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Tutorial Modal */}
      {isTutorialOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Glass Container */}
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  {tutorialSteps[tutorialStep].icon}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">
                      {tutorialSteps[tutorialStep].title}
                    </h2>
                    <p className="text-slate-400">
                      Step {tutorialStep + 1} of {tutorialSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {tutorialSteps[tutorialStep].content}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <button
                  onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                  disabled={tutorialStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    tutorialStep === 0
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-white/10'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                  {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setTutorialStep(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === tutorialStep
                          ? 'bg-emerald-400'
                          : index < tutorialStep
                          ? 'bg-emerald-400/50'
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {tutorialStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={() => setTutorialStep(Math.min(tutorialSteps.length - 1, tutorialStep + 1))}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div></div> // Empty div to maintain spacing
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 