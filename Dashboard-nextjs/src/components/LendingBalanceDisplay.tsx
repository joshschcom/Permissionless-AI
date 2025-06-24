import React, { useState, useEffect } from 'react';
import { Wallet, Copy, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { WalletInfo, PPUSD_CONTRACT, PUSD_CONTRACT } from '@/utils/bsc';
import ConnectWalletBSC from './ConnectWalletBSC';
import { useReadContract } from 'wagmi';

interface LendingBalanceDisplayProps {
  walletInfo: WalletInfo | null;
  onWalletChange?: (info: WalletInfo | null) => void;
  onMockBorrowDataChange?: (data: { borrowedAmount: number; saveBorrow: (amount: number) => void; canBorrow: boolean }) => void;
}

export default function LendingBalanceDisplay({ walletInfo, onWalletChange, onMockBorrowDataChange }: LendingBalanceDisplayProps) {
  // LocalStorage mock borrow data
  const [mockBorrowData, setMockBorrowData] = useState({
    borrowedAmount: 0,
    lastUpdate: Date.now()
  });

  // Get user's pPUSD balance to check if they can borrow
  const { data: pTokenBalance } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'balanceOf',
    args: walletInfo?.address ? [walletInfo.address as `0x${string}`] : undefined,
    query: { enabled: !!walletInfo?.address }
  });

  // Get exchange rate for pPUSD conversion
  const { data: exchangeRate } = useReadContract({
    ...PPUSD_CONTRACT,
    functionName: 'exchangeRateStored',
    query: { enabled: !!walletInfo?.address }
  });

  // Utility function to convert pPUSD tokens to underlying PUSD
  const convertPTokenToUnderlying = (pTokenAmount: bigint, exchangeRateValue: bigint) => {
    const underlyingAmount = (pTokenAmount * exchangeRateValue) / BigInt(1e18);
    return underlyingAmount;
  };

  // Load mock borrow data from localStorage
  useEffect(() => {
    if (walletInfo?.address) {
      const storageKey = `mockBorrow_${walletInfo.address}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setMockBorrowData(data);
        } catch (e) {
          console.error('Failed to parse mock borrow data:', e);
        }
      }
    }
  }, [walletInfo?.address]);

  // Save mock borrow data to localStorage
  const saveMockBorrowData = (data: typeof mockBorrowData) => {
    if (walletInfo?.address) {
      const storageKey = `mockBorrow_${walletInfo.address}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      setMockBorrowData(data);
    }
  };

  // Calculate lending data based on real pToken balance and mock borrows
  const getLendingData = () => {
    let supplyBalance = 0;
    let borrowLimit = 0;
    let borrowLimitUsed = mockBorrowData.borrowedAmount;

    // Calculate supply balance from pToken balance
    if (pTokenBalance && exchangeRate) {
      const underlyingAmount = convertPTokenToUnderlying(pTokenBalance, exchangeRate);
      supplyBalance = Number(underlyingAmount) / 1e18;
      // Borrow limit is 80% of supplied collateral
      borrowLimit = Math.max(0, (supplyBalance * 0.8) - borrowLimitUsed);
    }

    // Calculate APY based on utilization (Supply APY must be < Borrow APY)
    const totalSupplied = supplyBalance;
    const totalBorrowed = borrowLimitUsed;
    const utilizationRate = totalSupplied > 0 ? (totalBorrowed / totalSupplied) : 0;
    
    // Base rates from asset data
    const baseBorrowApy = 6.8;
    const baseSupplyApy = 4.2;
    
    // Calculate dynamic rates based on utilization
    // Higher utilization increases borrow APY, supply APY follows but stays lower
    const borrowApy = baseBorrowApy + (utilizationRate * 5.0); // Can go up to ~11.8% at 100% utilization
    const supplyApy = Math.min(
      baseSupplyApy + (utilizationRate * 3.0), // Can go up to ~7.2% at 100% utilization
      borrowApy * 0.7 // But never more than 70% of borrow APY
    );

    // Calculate user's net APY (earnings from supply - cost of borrows)
    let netApy = 0;
    if (supplyBalance > 0) {
      const supplyEarnings = supplyBalance * (supplyApy / 100);
      const borrowCost = borrowLimitUsed * (borrowApy / 100);
      const netEarnings = supplyEarnings - borrowCost;
      netApy = (netEarnings / supplyBalance) * 100;
    } else {
      netApy = supplyApy; // If no position, show base supply APY
    }

    return {
      supplyBalance,
      borrowBalance: borrowLimitUsed,
      supplyApy,
      borrowApy,
      netApy,
      borrowLimit,
      borrowLimitUsed,
      hasActiveLoans: borrowLimitUsed > 0,
      canBorrow: supplyBalance > 0 && borrowLimit > 0
    };
  };

  const mockLendingData = getLendingData();

  // Expose mock borrow functions to parent component
  useEffect(() => {
    if (onMockBorrowDataChange) {
      onMockBorrowDataChange({
        borrowedAmount: mockBorrowData.borrowedAmount,
        saveBorrow: (amount: number) => {
          saveMockBorrowData({
            borrowedAmount: amount,
            lastUpdate: Date.now()
          });
        },
        canBorrow: mockLendingData.canBorrow
      });
    }
  }, [mockBorrowData.borrowedAmount, mockLendingData.canBorrow, onMockBorrowDataChange]);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletInfo?.isConnected) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50/60 via-white/20 to-slate-100/40 dark:from-slate-900/60 dark:via-slate-800/20 dark:to-slate-700/40 border border-slate-200/30 dark:border-slate-700/30 shadow-2xl backdrop-blur-2xl p-8 text-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-sm"></div>
        
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-400/20 to-slate-500/30 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Connect Wallet to View Balances
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Connect your wallet to view your lending and borrowing positions
        </p>
        
        {/* Embedded wallet connection */}
        <div className="max-w-md mx-auto">
          <ConnectWalletBSC 
            walletInfo={walletInfo} 
            onWalletChange={onWalletChange || (() => {})}
            mode="lending"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50/60 via-white/20 to-slate-100/40 dark:from-slate-900/60 dark:via-slate-800/20 dark:to-slate-700/40 border border-slate-200/30 dark:border-slate-700/30 shadow-2xl backdrop-blur-2xl">
      {/* Liquid Glass Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-sm"></div>
      
      <div className="p-6 sm:p-8">
        {/* Wallet Connection Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wide">
                WALLET_CONNECTED
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {'>'} {shortenAddress(walletInfo.address)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors duration-200">
              <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors duration-200">
              <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Main Balance Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
          {/* APY Circle - Left on mobile, center on desktop */}
          <div className="flex justify-center lg:order-2">
            <div className="relative w-24 sm:w-32 h-24 sm:h-32">
              {/* Outer Glass Ring */}
              <div className="absolute inset-0 rounded-full backdrop-blur-3xl border border-white/40 shadow-2xl bg-gradient-to-br from-white/30 via-emerald-200/20 to-teal-300/25"
                   style={{ 
                     boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), 0 4px 16px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                   }}>
              </div>
              
              {/* Middle Frosted Layer */}
              <div className="absolute inset-1 rounded-full backdrop-blur-2xl shadow-inner bg-gradient-to-br from-emerald-400/40 via-teal-500/50 to-emerald-600/40 border border-emerald-300/50"
                   style={{ 
                     boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)' 
                   }}>
              </div>
              
              {/* Inner Content */}
              <div className="absolute inset-2 rounded-full backdrop-blur-xl shadow-inner flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600/90 via-teal-600/85 to-emerald-700/90 border border-emerald-400/60"
                   style={{ 
                     boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 12px rgba(16, 185, 129, 0.5)' 
                   }}>
                
                {/* Top Highlight */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1.5 sm:h-2 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm"></div>
                
                <span className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 font-mono uppercase tracking-wide text-emerald-100/90">
                  {mockLendingData.hasActiveLoans ? 'NET APY' : 'SUPPLY APY'}
                </span>
                <span className="text-lg sm:text-2xl font-bold text-white font-mono">
                  {mockLendingData.netApy >= 0 ? '+' : ''}{mockLendingData.netApy.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Supply and Borrow Balances - Stacked on mobile, separate on desktop */}
          <div className="space-y-6 lg:contents lg:order-1">
            {/* Supply Balance */}
            <div className="lg:text-left">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1 font-mono uppercase tracking-wide">
                SUPPLY BALANCE
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-mono mb-2">
                ${mockLendingData.supplyBalance.toFixed(2)}
              </p>

            </div>

            {/* Borrow Balance */}
            <div className="lg:order-3 lg:text-right">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1 font-mono uppercase tracking-wide">
                BORROW BALANCE
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-mono mb-2">
                ${mockLendingData.borrowBalance.toFixed(2)}
              </p>

            </div>
          </div>
        </div>

        {/* Borrow Limit Section */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="sm:hidden">Borrow Limit</span>
                <span className="hidden sm:inline">Borrow Limit (80% of collateral)</span>
              </span>
            </div>
            <div className="text-right">
              <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${mockLendingData.borrowLimit.toFixed(2)} available
              </p>
              <div className="hidden sm:flex items-center justify-end space-x-2 mt-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  ${mockLendingData.borrowLimitUsed.toFixed(2)} borrowed
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  ${(mockLendingData.borrowLimit + mockLendingData.borrowLimitUsed).toFixed(2)} max
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 sm:mt-3 w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-1.5 sm:h-2 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${mockLendingData.borrowLimitUsed > 0 ? 
                  Math.min(100, (mockLendingData.borrowLimitUsed / (mockLendingData.borrowLimit + mockLendingData.borrowLimitUsed)) * 100) 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 