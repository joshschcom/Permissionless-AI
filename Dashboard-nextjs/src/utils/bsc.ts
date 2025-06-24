import { ethers } from 'ethers'

// BSC Testnet configuration
export const BSC_TESTNET = {
  chainId: 97,
  name: 'BSC Testnet',
  currency: 'tBNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
}

export interface WalletInfo {
  isConnected: boolean;
  address: string;
  bnbBalance: string;
  pdotBalance: string;
  stakedBalance: string;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance: string): string {
  const num = parseFloat(balance)
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  if (num < 1) return num.toFixed(3)
  if (num < 100) return num.toFixed(2)
  return num.toFixed(1)
}

export function formatNumber(num: number | string): string {
  const value = typeof num === 'string' ? parseFloat(num) : num
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toFixed(2)
}

// Mock functions for vault operations (replace with actual implementations)
export async function depositToVault(
  userAddress: string,
  amount: string,
  statusCallback?: (status: string) => void
): Promise<{ success: boolean; error?: string; transactionHash?: string }> {
  // TODO: Implement actual deposit function
  statusCallback?.('preparing')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  statusCallback?.('signing')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  statusCallback?.('confirming')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    transactionHash: '0x' + Math.random().toString(16).substring(2)
  }
}

export async function withdrawFromVault(
  userAddress: string,
  amount: string,
  statusCallback?: (status: string) => void
): Promise<{ success: boolean; error?: string; transactionHash?: string }> {
  // TODO: Implement actual withdrawal function
  statusCallback?.('preparing')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  statusCallback?.('signing')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  statusCallback?.('confirming')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    transactionHash: '0x' + Math.random().toString(16).substring(2)
  }
}

export async function mintTestTokens(
  userAddress: string,
  statusCallback?: (status: string) => void
): Promise<{ success: boolean; error?: string; transactionHash?: string }> {
  // TODO: Implement actual minting function
  statusCallback?.('Minting test tokens...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    transactionHash: '0x' + Math.random().toString(16).substring(2)
  }
}

// Contract addresses
export const PERIDOTTROLLER_PROXY = '0xe797A0001A3bC1B2760a24c3D7FDD172906bCCd6' as const;
export const PUSD_ADDRESS = '0xa41D586530BC7BC872095950aE03a780d5114445' as const; // PayPal USD
export const PPUSD_ADDRESS = '0xEDdC65ECaF2e67c301a01fDc1da6805084f621D0' as const; // pPUSD Token

// Enhanced Peridottroller ABI with more functions
export const PERIDOTTROLLER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "getAssetsIn",
    "outputs": [
      { "internalType": "contract PToken[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMarkets",
    "outputs": [
      { "internalType": "contract PToken[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "pTokens", "type": "address[]" }
    ],
    "name": "enterMarkets",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "getAccountLiquidity",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "contract PToken", "name": "pToken", "type": "address" }
    ],
    "name": "checkMembership",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ERC20 ABI (for PUSD and other tokens)
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Enhanced pToken ABI (for Compound-style lending)
export const PTOKEN_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "mintAmount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "redeemTokens", "type": "uint256" }
    ],
    "name": "redeem",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "redeemAmount", "type": "uint256" }
    ],
    "name": "redeemUnderlying",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "borrowAmount", "type": "uint256" }
    ],
    "name": "borrow",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "repayAmount", "type": "uint256" }
    ],
    "name": "repayBorrow",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "borrowBalanceStored",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "getAccountSnapshot",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "exchangeRateStored",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBorrows",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "supplyRatePerBlock",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "borrowRatePerBlock", 
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract configuration for Wagmi hooks
export const PERIDOTTROLLER_CONTRACT = {
  address: PERIDOTTROLLER_PROXY,
  abi: PERIDOTTROLLER_ABI,
} as const;

export const PUSD_CONTRACT = {
  address: PUSD_ADDRESS,
  abi: ERC20_ABI,
} as const;

export const PPUSD_CONTRACT = {
  address: PPUSD_ADDRESS,
  abi: PTOKEN_ABI,
} as const;

// Test contract connection using static provider (for debugging)
export async function testContractConnection(): Promise<{ success: boolean; error?: string; markets?: string[] }> {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_TESTNET.rpcUrl);
    
    console.log('Testing contract connection...');
    console.log('RPC URL:', BSC_TESTNET.rpcUrl);
    console.log('Contract address:', PERIDOTTROLLER_PROXY);
    
    const network = await provider.getNetwork();
    console.log('Network info:', network);
    
    if (Number(network.chainId) !== 97) {
      throw new Error(`Wrong network. Expected BSC Testnet (97), got ${network.chainId}`);
    }
    
    const contract = new ethers.Contract(PERIDOTTROLLER_PROXY, PERIDOTTROLLER_ABI, provider);
    const markets = await contract.getAllMarkets();
    
    console.log('getAllMarkets successful:', markets);
    
    return {
      success: true,
      markets: markets.map((market: any) => market.toString())
    };
  } catch (error: any) {
    console.error('Contract connection test failed:', error);
    return {
      success: false,
      error: error?.message || String(error)
    };
  }
} 