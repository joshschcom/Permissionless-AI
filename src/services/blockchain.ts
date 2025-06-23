import { ethers } from "ethers";

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async isValidAddress(address: string): Promise<boolean> {
    return ethers.utils.isAddress(address);
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, "gwei");
    } catch (error) {
      throw new Error(`Failed to get gas price: ${error}`);
    }
  }

  getProvider(): ethers.providers.JsonRpcProvider {
    return this.provider;
  }
}
