'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Shield, TrendingUp, Coins, Settings, Database, Zap, Lock, HelpCircle, X, ChevronRight, ChevronLeft, ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank } from 'lucide-react';
import SectionBasedCarousel from './SectionBasedCarousel';
import ConnectWalletBSC from './ConnectWalletBSC';
import { WalletInfo } from '@/utils/bsc';

export default function DashboardWithCarousel() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
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

  const sections = [
    {
      id: 'wallet',
      title: 'Connect & Manage',
      color: '142, 249, 252', // Cyan
      cardContent: (
        <div className="text-white text-center">
          <Wallet className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">WALLET</h3>
          <p className="text-xs opacity-80">
            {walletInfo?.isConnected ? 'Connected' : 'Connect Now'}
          </p>
          {walletInfo?.isConnected && (
            <div className="mt-2 text-xs">
              <div>PDOT: {walletInfo.pdotBalance || '0'}</div>
            </div>
          )}
        </div>
      ),
      content: (
        <div className="space-y-6">
          <div className="max-w-md mx-auto lg:mx-0">
            <ConnectWalletBSC 
              walletInfo={walletInfo} 
              onWalletChange={setWalletInfo}
            />
          </div>
          
          <div className="prose prose-invert">
            <p className="text-xl text-slate-300 leading-relaxed">
              Your gateway to the Peridot protocol on BSC. Connect your wallet to access 
              all features including token minting, staking, and portfolio management.
            </p>
            
            {walletInfo?.isConnected && (
              <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
                <h4 className="text-emerald-300 font-semibold mb-2">Wallet Connected Successfully</h4>
                <p className="text-emerald-200 text-sm">
                  You're now ready to explore all Peridot features. Start by minting some test tokens 
                  or exploring your portfolio below.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'portfolio',
      title: 'Portfolio Overview',
      color: '215, 252, 142', // Lime
      cardContent: (
        <div className="text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">PORTFOLIO</h3>
          <p className="text-xs opacity-80">Track Positions</p>
          <div className="mt-2 text-xs">
            <div>Value: $0.00</div>
            <div>24h: +0%</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Total Balance</h3>
                  <p className="text-2xl font-bold text-lime-400">$0.00</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">24h Change</h3>
                  <p className="text-2xl font-bold text-green-400">+0%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Positions</h3>
                  <p className="text-2xl font-bold text-blue-400">0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert">
            <p className="text-xl text-slate-300 leading-relaxed">
              Monitor your token holdings, track performance, and analyze your investment 
              strategy across all Peridot positions. Real-time updates keep you informed 
              of market movements and portfolio changes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'vault',
      title: 'Secure Vaults',
      color: '252, 208, 142', // Orange
      cardContent: (
        <div className="text-white text-center">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">VAULT</h3>
          <p className="text-xs opacity-80">Secure Storage</p>
          <div className="mt-2 text-xs">
            <div>Locked: 0 PDOT</div>
            <div>APY: 12%</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Standard Vault</h3>
                  <p className="text-orange-400 font-semibold">12% APY</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Lock your PDOT tokens for steady rewards with flexible unlock periods.
              </p>
              <button className="w-full px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-orange-300 font-semibold transition-all duration-200">
                Stake PDOT
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">High-Yield Vault</h3>
                  <p className="text-red-400 font-semibold">25% APY</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Higher returns with longer lock periods and advanced strategies.
              </p>
              <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-300 font-semibold transition-all duration-200">
                Stake PDOT
              </button>
            </div>
          </div>

          <div className="prose prose-invert">
            <p className="text-xl text-slate-300 leading-relaxed">
              Secure your tokens in our battle-tested vaults. Choose from multiple strategies 
              to maximize your yields while maintaining the security of your assets through 
              our advanced smart contract architecture.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'swap',
      title: 'Token Exchange',
      color: '204, 142, 252', // Purple
      cardContent: (
        <div className="text-white text-center">
          <Coins className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">SWAP</h3>
          <p className="text-xs opacity-80">Exchange Tokens</p>
          <div className="mt-2 text-xs">
            <div>Best Rate</div>
            <div>0.1% Fee</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Token Swap</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">From</label>
                  <div className="bg-slate-700/50 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-xs">PDOT</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-all duration-200">
                    ⇅
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">To</label>
                  <div className="bg-slate-700/50 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-cyan-400 font-bold text-xs">pTKN</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-purple-300 font-semibold transition-all duration-200">
                  Swap Tokens
                </button>
              </div>
            </div>
          </div>

          <div className="prose prose-invert text-center">
            <p className="text-xl text-slate-300 leading-relaxed">
              Exchange tokens instantly with our automated market maker. Enjoy competitive 
              rates, minimal slippage, and lightning-fast transactions on the Binance Smart Chain network.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Market Analytics',
      color: '252, 142, 239', // Pink
      cardContent: (
        <div className="text-white text-center">
          <Database className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">ANALYTICS</h3>
          <p className="text-xs opacity-80">Market Data</p>
          <div className="mt-2 text-xs">
            <div>TVL: $0</div>
            <div>Volume: $0</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">$0</div>
              <div className="text-sm text-slate-400">Total Value Locked</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">$0</div>
              <div className="text-sm text-slate-400">24h Volume</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">0</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">0</div>
              <div className="text-sm text-slate-400">Transactions</div>
            </div>
          </div>

          <div className="prose prose-invert">
            <p className="text-xl text-slate-300 leading-relaxed">
              Comprehensive market analytics and insights for the Peridot protocol. 
              Track TVL, volume, user metrics, and protocol performance in real-time 
              to make informed decisions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Configuration',
      color: '142, 202, 252', // Light Blue
      cardContent: (
        <div className="text-white text-center">
          <Settings className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-sm mb-1">SETTINGS</h3>
          <p className="text-xs opacity-80">Preferences</p>
          <div className="mt-2 text-xs">
            <div>Theme: Dark</div>
            <div>Network: Testnet</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <div className="max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="font-semibold text-white mb-4">Appearance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Theme</span>
                    <select className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm">
                      <option>Dark</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Animations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="font-semibold text-white mb-4">Network</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Network</span>
                    <select className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm">
                      <option>Testnet</option>
                      <option>Mainnet</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">RPC Endpoint</span>
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert">
            <p className="text-xl text-slate-300 leading-relaxed">
              Customize your Peridot experience with personalized settings. 
              Configure themes, network preferences, and accessibility options 
              to match your workflow.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* How To Button */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => {
            setIsTutorialOpen(true);
            setTutorialStep(0);
          }}
          className="flex items-center space-x-2 px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 text-slate-800 dark:text-slate-100 shadow-lg"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">How To</span>
        </button>
      </div>

      <SectionBasedCarousel 
        sections={sections}
        threshold={0.3}
        rootMargin="-10% 0px -10% 0px"
      />

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