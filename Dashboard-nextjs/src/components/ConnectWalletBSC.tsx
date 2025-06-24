'use client';

import { useState, useEffect } from 'react';
import { Wallet, LogOut, Copy, CheckCircle, AlertCircle, ExternalLink, Coins, Loader, Zap, TrendingUp, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAccount, useBalance, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { WalletInfo, shortenAddress, formatBalance, formatNumber, depositToVault, withdrawFromVault, mintTestTokens, PUSD_CONTRACT, PPUSD_CONTRACT, PUSD_ADDRESS, PPUSD_ADDRESS } from '@/utils/bsc';

// Add the CSS styles for loading animations and blend-in effects
const loadingStyles = `
  .pl__ring {
    animation: ring 2s ease-out infinite;
    stroke: #10b981;
  }
  .pl__ring--a {
    stroke: #10b981;
  }
  .pl__ring--b {
    animation-delay: -0.25s;
    stroke: #059669;
  }
  .pl__ring--c {
    animation-delay: -0.5s;
    stroke: #047857;
  }
  .pl__ring--d {
    animation-delay: -0.75s;
    stroke: #065f46;
  }
  @keyframes ring {
    0%, 4% {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -330;
    }
    12% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -335;
    }
    32% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -595;
    }
    40%, 54% {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -660;
    }
    62% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -665;
    }
    82% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -925;
    }
    90%, 100% {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -990;
    }
  }

  /* Blend-in animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fade-in-scale {
    animation: fadeInScale 0.5s ease-out forwards;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.4s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.4s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .animate-delay-100 {
    animation-delay: 0.1s;
  }

  .animate-delay-200 {
    animation-delay: 0.2s;
  }

  .animate-delay-300 {
    animation-delay: 0.3s;
  }

  .animate-delay-400 {
    animation-delay: 0.4s;
  }

  .animate-delay-500 {
    animation-delay: 0.5s;
  }

  /* Initial state for animations */
  .animate-fade-in-up,
  .animate-fade-in-scale,
  .animate-slide-in-left,
  .animate-slide-in-right,
  .animate-fade-in {
    opacity: 0;
  }

  /* New floating and elegant animations */
  @keyframes float-in {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes float-up {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-float-in {
    animation: float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .animate-float-up {
    animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .animate-scale-in {
    animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Smooth gradient animations */
  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes gradient-pulse {
    0%, 100% {
      background-position: 0% 50%;
      opacity: 0.8;
    }
    50% {
      background-position: 100% 50%;
      opacity: 1;
    }
  }

  /* Input text visibility - hide when not focused to prevent overlap */
  .inputbox input:not(:focus):not(:valid) {
    color: transparent !important;
  }
  
  .inputbox input:focus,
  .inputbox input:valid {
    color: #23242a !important;
  }
  
  [data-theme="dark"] .inputbox input:focus,
  [data-theme="dark"] .inputbox input:valid {
    color: #ffffff !important;
  }
`;

interface ConnectWalletBSCProps {
  walletInfo: WalletInfo | null;
  onWalletChange: (info: WalletInfo | null) => void;
  mode?: 'lending' | 'faucet';
  selectedAsset?: 'PDOT' | 'BNB' | 'USDT' | 'BUSD';
  onSelectedAssetChange?: (asset: 'PDOT' | 'BNB' | 'USDT' | 'BUSD') => void;
}

export default function ConnectWalletBSC({ 
  walletInfo, 
  onWalletChange, 
  mode = 'faucet', 
  selectedAsset: propSelectedAsset = 'PDOT',
  onSelectedAssetChange 
}: ConnectWalletBSCProps) {
  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { data: balance } = useBalance({ address: address as `0x${string}` | undefined });
  const { disconnect } = useDisconnect();
  const { writeContract, isPending: isWritePending, isSuccess: isWriteSuccess, error: writeError } = useWriteContract();

  // Get user's PUSD balance
  const { data: pusdBalance, refetch: refetchPusdBalance } = useReadContract({
    ...PUSD_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  // Get user's pPUSD balance
  const { data: pTokenBalance, refetch: refetchPTokenBalance } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
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
    refetchExchangeRate();
  };

  // Auto-refresh balances every 30 seconds when connected
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(() => {
      refreshAllBalances();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [address]);

  // Refresh balances on component mount
  useEffect(() => {
    if (address) {
      refreshAllBalances();
    }
  }, [address]);
  
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mintError, setMintError] = useState<string | null>(null);

  // Inject loading styles
  if (typeof document !== 'undefined') {
    const styleId = 'loading-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = loadingStyles;
      document.head.appendChild(style);
    }
  }

  // Update wallet info when connection changes
  useEffect(() => {
    if (isConnected && address) {
      const mockWalletInfo: WalletInfo = {
        isConnected: true,
        address: address,
        bnbBalance: balance ? formatEther(balance.value) : '0',
        pdotBalance: '100.00', // Mock data - replace with actual contract call
        stakedBalance: '50.00', // Mock data - replace with actual contract call
      };
      onWalletChange(mockWalletInfo);
    } else {
      onWalletChange(null);
    }
  }, [isConnected, address, balance, onWalletChange]);

  const handleConnect = () => {
    setError(null);
    open();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      close();
      onWalletChange(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Still update the local state even if there's an error
      onWalletChange(null);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      await navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openBSCScan = () => {
    if (walletInfo?.address) {
      window.open(`https://testnet.bscscan.com/address/${walletInfo.address}`, '_blank');
    }
  };

  const handleMintTokens = async () => {
    if (!address) return;
    
    setIsMinting(true);
    setMintingStatus('idle');
    setMintError(null);
    
    try {
      // Use the same PUSD minting logic as in LendingBorrowingBSC
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
        args: [address as `0x${string}`, testAmount],
      });
      
      setMintingStatus('success');
      // Refresh balances after minting
      setTimeout(() => {
        refreshAllBalances();
        setMintingStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      setMintingStatus('error');
      setMintError(`Minting failed: ${err.message || err}`);
    } finally {
      setIsMinting(false);
    }
  };

  // If wallet is not connected, show connect button
  if (!walletInfo?.isConnected) {
    return (
      <>
        <div className="space-y-6 animate-fade-in-up">
          {error && (
            <div className="p-4 rounded-2xl border border-red-500/20 dark:border-red-400/30 bg-gradient-to-r from-red-500/5 via-red-400/2 to-red-500/5 dark:from-red-400/8 dark:via-red-300/4 dark:to-red-400/8 backdrop-blur-2xl shadow-lg shadow-red-500/5 animate-fade-in-scale animate-delay-100">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 dark:bg-red-400/30 flex items-center justify-center mt-0.5">
                  <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono opacity-80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Professional Peridot Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full group relative overflow-hidden px-8 py-4 rounded-2xl border border-slate-200/20 dark:border-slate-700/30 hover:border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400/40 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/10 backdrop-blur-xl bg-white/5 dark:bg-slate-900/50 hover:bg-white/10 dark:hover:bg-slate-800/60 min-h-[68px] touch-manipulation animate-fade-in-up animate-delay-400"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            
            <div className="relative flex items-center justify-center space-x-3">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-all duration-300" />
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white tracking-wide transition-colors duration-300">
                Connect BSC Wallet
              </span>
            </div>
          </button>

          {/* Cyber Requirements Panel */}
          <div className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/2 via-indigo-500/1 to-purple-500/2 dark:from-blue-400/3 dark:via-indigo-400/2 dark:to-purple-400/3 border border-blue-400/10 dark:border-blue-400/15 shadow-lg shadow-blue-500/3 backdrop-blur-2xl animate-fade-in animate-delay-500">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-purple-400/30"></div>
            <div className="relative p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
                <span className="text-purple-600 dark:text-purple-400 font-bold">REQUIREMENTS:</span><br/>
                {'>'} Install{' '}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline font-bold transition-colors duration-200"
                >
                  METAMASK
                </a>{' '}or compatible wallet<br/>
                {'>'} Configure network: BSC_TESTNET<br/>
                {'>'} Get testnet tBNB from{' '}
                <a
                  href="https://testnet.bnbchain.org/faucet-smart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline font-bold transition-colors duration-200"
                >
                  FAUCET
                </a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* BSC Wallet Connected Header */}
      <div className="flex items-center space-x-4 mb-6 animate-slide-in-left">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden">
          {/* Animated background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 opacity-80"></div>
          <div className="relative w-full h-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Wallet className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-emerald-400/50 animate-ping"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            BSC_WALLET_CONNECTED
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
            {'>'} {shortenAddress(walletInfo.address)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyAddress}
            className="group relative p-2 bg-gradient-to-r from-slate-600/20 to-slate-700/20 hover:from-slate-500/30 hover:to-slate-600/30 active:from-slate-700/40 active:to-slate-800/40 rounded-lg border border-slate-400/10 hover:border-slate-300/20 active:border-slate-300/30 focus:outline-none focus:ring-2 focus:ring-slate-400/30 transition-all duration-200 shadow-lg hover:shadow-slate-500/10 backdrop-blur-lg transform hover:scale-105 active:scale-95 touch-manipulation"
            title="Copy Address"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500 transition-colors duration-200" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200" />
            )}
          </button>
          
          <button
            onClick={openBSCScan}
            className="hidden sm:block group relative p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-500/30 hover:to-blue-600/30 active:from-blue-700/40 active:to-blue-800/40 rounded-lg border border-blue-400/10 hover:border-blue-300/20 active:border-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-blue-500/10 backdrop-blur-lg transform hover:scale-105 active:scale-95 touch-manipulation"
            title="View on BSCScan"
          >
            <ExternalLink className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
          </button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-yellow-500/8 via-yellow-400/4 to-orange-500/8 border border-yellow-400/20 rounded-2xl backdrop-blur-3xl shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50"></div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">BNB Balance</p>
          </div>
          <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">
            {balance ? formatBalance(formatEther(balance.value)) : '0.00'}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold opacity-90">tBNB</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-500/8 via-emerald-400/4 to-teal-500/8 border border-emerald-400/20 rounded-2xl backdrop-blur-3xl shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">PUSD Balance</p>
          </div>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
            {pusdBalance ? formatBalance((Number(pusdBalance) / 1e18).toFixed(2)) : '0.00'}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold opacity-90">PUSD</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/8 via-purple-400/4 to-indigo-500/8 border border-purple-400/20 rounded-2xl backdrop-blur-3xl shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></div>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">pPUSD Tokens</p>
          </div>
          <p className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-1">
            {pTokenBalance && exchangeRate ? formatBalance((Number(convertPTokenToUnderlying(pTokenBalance, exchangeRate)) / 1e18).toString()) : '0.00'}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold opacity-90">pPUSD</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleMintTokens}
            disabled={isMinting}
            className="group relative overflow-hidden px-6 py-4 rounded-2xl border border-emerald-400/20 hover:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20"
          >
            <div className="relative flex items-center justify-center space-x-3">
              {isMinting ? (
                <>
                  <Loader className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Minting...
                  </span>
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Mint 1000 PUSD
                  </span>
                </>
              )}
            </div>
          </button>

          <button
            onClick={refreshAllBalances}
            className="group relative overflow-hidden px-6 py-4 rounded-2xl border border-blue-400/20 hover:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20"
          >
            <div className="relative flex items-center justify-center space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                🔄 Refresh
              </span>
            </div>
          </button>
        </div>

        {mintingStatus === 'success' && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Tokens minted successfully!</span>
          </div>
        )}

        {mintingStatus === 'error' && mintError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{mintError}</span>
          </div>
        )}
      </div>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="w-full group relative overflow-hidden px-4 py-3 rounded-xl border border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 focus:outline-none focus:ring-4 focus:ring-slate-400/20 transition-all duration-300 shadow-lg hover:shadow-slate-500/10 backdrop-blur-2xl min-h-[48px] bg-gradient-to-r from-slate-100/10 via-white/5 to-slate-100/10 dark:from-slate-800/20 dark:via-slate-700/10 dark:to-slate-800/20"
      >
        <div className="relative flex items-center justify-center space-x-2">
          <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-all duration-300" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 font-mono uppercase tracking-wide transition-colors duration-300">
            Disconnect
          </span>
        </div>
      </button>
    </>
  );
} 