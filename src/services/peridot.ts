import { ethers } from "ethers";

// Peridot pToken ABI (adapted from Compound cToken)
const PTOKEN_ABI = [
  "function mint(uint256 mintAmount) external returns (uint256)",
  "function redeem(uint256 redeemTokens) external returns (uint256)",
  "function redeemUnderlying(uint256 redeemAmount) external returns (uint256)",
  "function borrow(uint256 borrowAmount) external returns (uint256)",
  "function repayBorrow(uint256 repayAmount) external returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function balanceOfUnderlying(address owner) external returns (uint256)",
  "function borrowBalanceCurrent(address account) external returns (uint256)",
  "function exchangeRateCurrent() external returns (uint256)",
  "function getCash() external view returns (uint256)",
  "function totalBorrows() external view returns (uint256)",
  "function totalReserves() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function borrowRatePerBlock() external view returns (uint256)",
  "function supplyRatePerBlock() external view returns (uint256)",
];

const PERIDOTTROLLER_ABI = [
  "function enterMarkets(address[] calldata pTokens) external returns (uint256[] memory)",
  "function exitMarket(address pTokenAddress) external returns (uint256)",
  "function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)",
  "function markets(address pTokenAddress) external view returns (bool, uint256)",
  "function getAllMarkets() external view returns (address[] memory)",
];

export class PeridotService {
  private provider: ethers.providers.JsonRpcProvider;
  private peridottrollerAddress: string;

  constructor(rpcUrl: string, peridottrollerAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.peridottrollerAddress = peridottrollerAddress;
  }

  async getMarketInfo(pTokenAddress: string) {
    try {
      const pToken = new ethers.Contract(
        pTokenAddress,
        PTOKEN_ABI,
        this.provider
      );

      const [
        cash,
        totalBorrows,
        totalReserves,
        totalSupply,
        exchangeRate,
        borrowRate,
        supplyRate,
      ] = await Promise.all([
        pToken.getCash(),
        pToken.totalBorrows(),
        pToken.totalReserves(),
        pToken.totalSupply(),
        pToken.exchangeRateCurrent(),
        pToken.borrowRatePerBlock(),
        pToken.supplyRatePerBlock(),
      ]);

      return {
        cash: ethers.utils.formatEther(cash),
        totalBorrows: ethers.utils.formatEther(totalBorrows),
        totalReserves: ethers.utils.formatEther(totalReserves),
        totalSupply: ethers.utils.formatEther(totalSupply),
        exchangeRate: ethers.utils.formatEther(exchangeRate),
        borrowRatePerBlock: ethers.utils.formatUnits(borrowRate, 18),
        supplyRatePerBlock: ethers.utils.formatUnits(supplyRate, 18),
      };
    } catch (error) {
      throw new Error(`Failed to get market info: ${error}`);
    }
  }

  async getUserPosition(userAddress: string, pTokenAddress: string) {
    try {
      const pToken = new ethers.Contract(
        pTokenAddress,
        PTOKEN_ABI,
        this.provider
      );

      const [balance, borrowBalance, underlyingBalance] = await Promise.all([
        pToken.balanceOf(userAddress),
        pToken.borrowBalanceCurrent(userAddress),
        pToken.balanceOfUnderlying(userAddress),
      ]);

      return {
        pTokenBalance: ethers.utils.formatEther(balance),
        borrowBalance: ethers.utils.formatEther(borrowBalance),
        underlyingBalance: ethers.utils.formatEther(underlyingBalance),
      };
    } catch (error) {
      throw new Error(`Failed to get user position: ${error}`);
    }
  }

  async getAccountLiquidity(userAddress: string) {
    try {
      const peridottroller = new ethers.Contract(
        this.peridottrollerAddress,
        PERIDOTTROLLER_ABI,
        this.provider
      );
      const [error, liquidity, shortfall] =
        await peridottroller.getAccountLiquidity(userAddress);

      return {
        error: error.toString(),
        liquidity: ethers.utils.formatEther(liquidity),
        shortfall: ethers.utils.formatEther(shortfall),
      };
    } catch (error) {
      throw new Error(`Failed to get account liquidity: ${error}`);
    }
  }

  async getAllMarkets(): Promise<string[]> {
    try {
      const peridottroller = new ethers.Contract(
        this.peridottrollerAddress,
        PERIDOTTROLLER_ABI,
        this.provider
      );

      return await peridottroller.getAllMarkets();
    } catch (error) {
      throw new Error(`Failed to get all markets: ${error}`);
    }
  }

  async getMarketStatus(pTokenAddress: string): Promise<{
    isListed: boolean;
    collateralFactorMantissa: string;
  }> {
    try {
      const peridottroller = new ethers.Contract(
        this.peridottrollerAddress,
        PERIDOTTROLLER_ABI,
        this.provider
      );

      const [isListed, collateralFactorMantissa] = await peridottroller.markets(
        pTokenAddress
      );

      return {
        isListed,
        collateralFactorMantissa: ethers.utils.formatEther(
          collateralFactorMantissa
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get market status: ${error}`);
    }
  }

  // Calculate APY from per-block rates
  calculateAPY(ratePerBlock: string, blocksPerYear: number = 2102400): number {
    const rate = parseFloat(ratePerBlock);
    return (Math.pow(1 + rate, blocksPerYear) - 1) * 100;
  }

  // Get utilization rate
  async getUtilizationRate(pTokenAddress: string): Promise<number> {
    try {
      const info = await this.getMarketInfo(pTokenAddress);
      const totalBorrows = parseFloat(info.totalBorrows);
      const totalCash = parseFloat(info.cash);

      if (totalBorrows === 0) return 0;

      return (totalBorrows / (totalBorrows + totalCash)) * 100;
    } catch (error) {
      throw new Error(`Failed to calculate utilization rate: ${error}`);
    }
  }
}
