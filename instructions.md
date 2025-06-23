# Complete Guide: Telegram DeFi Bot with AI Agent for Compound V2 Fork

## Overview

This guide takes you from a basic Telegram bot to a sophisticated DeFi assistant that can interact with Compound V2 fork smart contracts and provide AI-powered assistance.

## Prerequisites

- Node.js 18+ installed
- Telegram Bot Token (from @BotFather)
- RPC endpoint for your blockchain
- Smart contract addresses and ABIs
- OpenAI API key (or other AI service)
- Basic understanding of JavaScript/TypeScript

---

## Phase 1: The Skateboard - Basic Telegram Bot

### Step 1.1: Initialize Project

```bash
mkdir telegram-defi-bot
cd telegram-defi-bot
npm init -y
npm install telegraf dotenv
npm install --save-dev typescript @types/node ts-node
```

### Step 1.2: Create Basic Bot Structure

```typescript
// src/bot.ts
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Basic commands
bot.start((ctx) => {
  ctx.reply(
    "Welcome to DeFi Bot! 🚀\n\nAvailable commands:\n/help - Show this help\n/status - Bot status"
  );
});

bot.help((ctx) => {
  ctx.reply(
    "DeFi Bot Commands:\n/start - Welcome message\n/status - Check bot status\n/balance - Check your balance"
  );
});

bot.command("status", (ctx) => {
  ctx.reply("Bot is running! ✅");
});

bot.launch();
console.log("Bot started");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

### Step 1.3: Environment Configuration

```bash
# .env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Step 1.4: Package.json Scripts

```json
{
  "scripts": {
    "start": "ts-node src/bot.ts",
    "dev": "ts-node --watch src/bot.ts"
  }
}
```

---

## Phase 2: The Scooter - Add Blockchain Integration

### Step 2.1: Add Blockchain Dependencies

```bash
npm install ethers@5.7.2 axios
```

### Step 2.2: Create Blockchain Service

```typescript
// src/services/blockchain.ts
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
}
```

### Step 2.3: Update Bot with Blockchain Features

```typescript
// src/bot.ts (updated)
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { BlockchainService } from "./services/blockchain";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const blockchain = new BlockchainService(process.env.RPC_URL!);

bot.start((ctx) => {
  ctx.reply(`Welcome to DeFi Bot! 🚀

Available commands:
/help - Show help
/status - Bot status
/balance <address> - Check ETH balance
/block - Current block number`);
});

bot.command("balance", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply("Usage: /balance <address>");
    return;
  }

  const address = args[1];
  if (!(await blockchain.isValidAddress(address))) {
    ctx.reply("Invalid address format");
    return;
  }

  try {
    const balance = await blockchain.getBalance(address);
    ctx.reply(`Balance: ${balance} ETH`);
  } catch (error) {
    ctx.reply("Error fetching balance");
  }
});

bot.command("block", async (ctx) => {
  try {
    const blockNumber = await blockchain.getBlockNumber();
    ctx.reply(`Current block: ${blockNumber}`);
  } catch (error) {
    ctx.reply("Error fetching block number");
  }
});

bot.launch();
console.log("Bot started with blockchain integration");
```

### Step 2.4: Update Environment Variables

```bash
# .env
TELEGRAM_BOT_TOKEN=your_bot_token_here
RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

---

## Phase 3: The Bicycle - Add Compound V2 Integration

### Step 3.1: Create Smart Contract Service

```typescript
// src/services/compound.ts
import { ethers } from "ethers";

// Compound V2 cToken ABI (simplified)
const CTOKEN_ABI = [
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
];

const COMPTROLLER_ABI = [
  "function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory)",
  "function exitMarket(address cTokenAddress) external returns (uint256)",
  "function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)",
  "function markets(address cTokenAddress) external view returns (bool, uint256)",
];

export class CompoundService {
  private provider: ethers.providers.JsonRpcProvider;
  private comptrollerAddress: string;

  constructor(rpcUrl: string, comptrollerAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.comptrollerAddress = comptrollerAddress;
  }

  async getMarketInfo(cTokenAddress: string) {
    try {
      const cToken = new ethers.Contract(
        cTokenAddress,
        CTOKEN_ABI,
        this.provider
      );

      const [cash, totalBorrows, totalReserves, totalSupply, exchangeRate] =
        await Promise.all([
          cToken.getCash(),
          cToken.totalBorrows(),
          cToken.totalReserves(),
          cToken.totalSupply(),
          cToken.exchangeRateCurrent(),
        ]);

      return {
        cash: ethers.utils.formatEther(cash),
        totalBorrows: ethers.utils.formatEther(totalBorrows),
        totalReserves: ethers.utils.formatEther(totalReserves),
        totalSupply: ethers.utils.formatEther(totalSupply),
        exchangeRate: ethers.utils.formatEther(exchangeRate),
      };
    } catch (error) {
      throw new Error(`Failed to get market info: ${error}`);
    }
  }

  async getUserPosition(userAddress: string, cTokenAddress: string) {
    try {
      const cToken = new ethers.Contract(
        cTokenAddress,
        CTOKEN_ABI,
        this.provider
      );

      const [balance, borrowBalance, underlyingBalance] = await Promise.all([
        cToken.balanceOf(userAddress),
        cToken.borrowBalanceCurrent(userAddress),
        cToken.balanceOfUnderlying(userAddress),
      ]);

      return {
        cTokenBalance: ethers.utils.formatEther(balance),
        borrowBalance: ethers.utils.formatEther(borrowBalance),
        underlyingBalance: ethers.utils.formatEther(underlyingBalance),
      };
    } catch (error) {
      throw new Error(`Failed to get user position: ${error}`);
    }
  }

  async getAccountLiquidity(userAddress: string) {
    try {
      const comptroller = new ethers.Contract(
        this.comptrollerAddress,
        COMPTROLLER_ABI,
        this.provider
      );
      const [error, liquidity, shortfall] =
        await comptroller.getAccountLiquidity(userAddress);

      return {
        error: error.toString(),
        liquidity: ethers.utils.formatEther(liquidity),
        shortfall: ethers.utils.formatEther(shortfall),
      };
    } catch (error) {
      throw new Error(`Failed to get account liquidity: ${error}`);
    }
  }
}
```

### Step 3.2: Update Bot with Compound Features

```typescript
// src/bot.ts (updated with Compound integration)
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { BlockchainService } from "./services/blockchain";
import { CompoundService } from "./services/compound";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const blockchain = new BlockchainService(process.env.RPC_URL!);
const compound = new CompoundService(
  process.env.RPC_URL!,
  process.env.COMPTROLLER_ADDRESS!
);

// Market addresses (example)
const MARKETS = {
  USDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
  DAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
  ETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
};

bot.start((ctx) => {
  ctx.reply(`Welcome to DeFi Bot! 🚀

Available commands:
/help - Show help
/markets - List available markets
/market <symbol> - Get market info
/position <address> <symbol> - Get user position
/liquidity <address> - Get account liquidity`);
});

bot.command("markets", (ctx) => {
  const marketList = Object.keys(MARKETS)
    .map((symbol) => `• ${symbol}`)
    .join("\n");
  ctx.reply(`Available markets:\n${marketList}`);
});

bot.command("market", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply("Usage: /market <symbol>\nExample: /market USDC");
    return;
  }

  const symbol = args[1].toUpperCase();
  const marketAddress = MARKETS[symbol];

  if (!marketAddress) {
    ctx.reply("Market not found. Use /markets to see available markets.");
    return;
  }

  try {
    const info = await compound.getMarketInfo(marketAddress);
    ctx.reply(`📊 ${symbol} Market Info:
💰 Available Cash: ${parseFloat(info.cash).toFixed(2)}
📈 Total Borrows: ${parseFloat(info.totalBorrows).toFixed(2)}
🏦 Total Reserves: ${parseFloat(info.totalReserves).toFixed(2)}
📊 Total Supply: ${parseFloat(info.totalSupply).toFixed(2)}
🔄 Exchange Rate: ${parseFloat(info.exchangeRate).toFixed(6)}`);
  } catch (error) {
    ctx.reply("Error fetching market info");
  }
});

bot.command("position", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 3) {
    ctx.reply(
      "Usage: /position <address> <symbol>\nExample: /position 0x... USDC"
    );
    return;
  }

  const address = args[1];
  const symbol = args[2].toUpperCase();
  const marketAddress = MARKETS[symbol];

  if (!(await blockchain.isValidAddress(address))) {
    ctx.reply("Invalid address format");
    return;
  }

  if (!marketAddress) {
    ctx.reply("Market not found. Use /markets to see available markets.");
    return;
  }

  try {
    const position = await compound.getUserPosition(address, marketAddress);
    ctx.reply(`👤 ${symbol} Position for ${address.slice(
      0,
      6
    )}...${address.slice(-4)}:
💎 cToken Balance: ${parseFloat(position.cTokenBalance).toFixed(6)}
💰 Underlying Balance: ${parseFloat(position.underlyingBalance).toFixed(6)}
📉 Borrow Balance: ${parseFloat(position.borrowBalance).toFixed(6)}`);
  } catch (error) {
    ctx.reply("Error fetching position");
  }
});

bot.command("liquidity", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply("Usage: /liquidity <address>");
    return;
  }

  const address = args[1];
  if (!(await blockchain.isValidAddress(address))) {
    ctx.reply("Invalid address format");
    return;
  }

  try {
    const liquidity = await compound.getAccountLiquidity(address);
    ctx.reply(`💧 Account Liquidity for ${address.slice(
      0,
      6
    )}...${address.slice(-4)}:
✅ Available Liquidity: $${parseFloat(liquidity.liquidity).toFixed(2)}
⚠️ Shortfall: $${parseFloat(liquidity.shortfall).toFixed(2)}
${
  parseFloat(liquidity.shortfall) > 0
    ? "🚨 Account is underwater!"
    : "✅ Account is healthy"
}`);
  } catch (error) {
    ctx.reply("Error fetching liquidity");
  }
});

bot.launch();
console.log("Bot started with Compound integration");
```

---

## Phase 4: The Motorcycle - Add AI Agent

### Step 4.1: Add AI Dependencies

```bash
npm install openai
```

### Step 4.2: Create AI Service

```typescript
// src/services/ai.ts
import { Configuration, OpenAIApi } from "openai";

export class AIService {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async getAdvice(userQuery: string, context?: any): Promise<string> {
    const systemPrompt = `You are a DeFi assistant specializing in Compound V2 protocol. 
    You help users understand:
    - Lending and borrowing mechanics
    - Interest rates and yield farming
    - Risk management
    - Liquidation risks
    - Market analysis
    
    Always provide accurate, helpful advice and warn about risks. 
    Keep responses concise but informative.`;

    const userPrompt = context
      ? `User question: ${userQuery}\n\nContext: ${JSON.stringify(
          context,
          null,
          2
        )}`
      : `User question: ${userQuery}`;

    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return (
        response.data.choices[0]?.message?.content ||
        "I couldn't generate a response."
      );
    } catch (error) {
      throw new Error(`AI service error: ${error}`);
    }
  }

  async analyzePosition(positionData: any): Promise<string> {
    const prompt = `Analyze this DeFi position and provide insights:
    ${JSON.stringify(positionData, null, 2)}
    
    Focus on:
    1. Health of the position
    2. Risk factors
    3. Optimization suggestions
    4. Potential concerns`;

    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a DeFi risk analyst. Provide clear, actionable insights.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.5,
      });

      return (
        response.data.choices[0]?.message?.content || "Analysis unavailable."
      );
    } catch (error) {
      throw new Error(`Analysis error: ${error}`);
    }
  }
}
```

### Step 4.3: Create User Session Management

```typescript
// src/services/userSession.ts
interface UserSession {
  userId: number;
  walletAddress?: string;
  lastActivity: Date;
  preferences: {
    defaultMarket?: string;
    riskTolerance?: "low" | "medium" | "high";
  };
}

export class UserSessionService {
  private sessions: Map<number, UserSession> = new Map();

  getSession(userId: number): UserSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        lastActivity: new Date(),
        preferences: {},
      });
    }
    return this.sessions.get(userId)!;
  }

  updateSession(userId: number, updates: Partial<UserSession>): void {
    const session = this.getSession(userId);
    Object.assign(session, updates, { lastActivity: new Date() });
    this.sessions.set(userId, session);
  }

  setWallet(userId: number, address: string): void {
    this.updateSession(userId, { walletAddress: address });
  }

  getWallet(userId: number): string | undefined {
    return this.getSession(userId).walletAddress;
  }
}
```

### Step 4.4: Update Bot with AI Features

```typescript
// src/bot.ts (updated with AI)
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { BlockchainService } from "./services/blockchain";
import { CompoundService } from "./services/compound";
import { AIService } from "./services/ai";
import { UserSessionService } from "./services/userSession";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const blockchain = new BlockchainService(process.env.RPC_URL!);
const compound = new CompoundService(
  process.env.RPC_URL!,
  process.env.COMPTROLLER_ADDRESS!
);
const ai = new AIService(process.env.OPENAI_API_KEY!);
const userSessions = new UserSessionService();

bot.start((ctx) => {
  ctx.reply(`🤖 Welcome to DeFi AI Assistant!

I can help you with:
• Market analysis and insights
• Position management advice
• Risk assessment
• DeFi strategy recommendations

Commands:
/help - Show all commands
/wallet <address> - Set your wallet
/ask <question> - Ask me anything about DeFi
/analyze - Analyze your current position
/markets - View available markets
/advice - Get personalized advice`);
});

bot.command("wallet", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply(
      "Usage: /wallet <address>\nExample: /wallet 0x742d35Cc6869C4e5B7b8d5e6b9A8B9b8B9b8B9b8"
    );
    return;
  }

  const address = args[1];
  if (!(await blockchain.isValidAddress(address))) {
    ctx.reply("❌ Invalid wallet address format");
    return;
  }

  userSessions.setWallet(ctx.from.id, address);
  ctx.reply(
    `✅ Wallet set: ${address.slice(0, 6)}...${address.slice(
      -4
    )}\n\nNow I can provide personalized analysis and advice!`
  );
});

bot.command("ask", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    ctx.reply(
      "Usage: /ask <your question>\nExample: /ask What is the best strategy for yield farming?"
    );
    return;
  }

  const question = args.join(" ");
  const session = userSessions.getSession(ctx.from.id);

  ctx.reply("🤔 Thinking...");

  try {
    let context = {};

    // Add context if user has a wallet set
    if (session.walletAddress) {
      try {
        const liquidity = await compound.getAccountLiquidity(
          session.walletAddress
        );
        context = { userLiquidity: liquidity };
      } catch (error) {
        // Continue without context if there's an error
      }
    }

    const advice = await ai.getAdvice(
      question,
      Object.keys(context).length > 0 ? context : undefined
    );
    ctx.reply(`🤖 ${advice}`);
  } catch (error) {
    ctx.reply("❌ Sorry, I encountered an error processing your question.");
  }
});

bot.command("analyze", async (ctx) => {
  const session = userSessions.getSession(ctx.from.id);

  if (!session.walletAddress) {
    ctx.reply(
      "❌ Please set your wallet address first using /wallet <address>"
    );
    return;
  }

  ctx.reply("📊 Analyzing your position...");

  try {
    // Gather comprehensive position data
    const positionData = {};

    for (const [symbol, address] of Object.entries(MARKETS)) {
      try {
        const position = await compound.getUserPosition(
          session.walletAddress,
          address
        );
        if (
          parseFloat(position.cTokenBalance) > 0 ||
          parseFloat(position.borrowBalance) > 0
        ) {
          positionData[symbol] = position;
        }
      } catch (error) {
        // Skip markets with errors
      }
    }

    const liquidity = await compound.getAccountLiquidity(session.walletAddress);

    const analysisData = {
      address: session.walletAddress,
      positions: positionData,
      liquidity: liquidity,
    };

    const analysis = await ai.analyzePosition(analysisData);
    ctx.reply(`📈 Position Analysis:\n\n${analysis}`);
  } catch (error) {
    ctx.reply("❌ Error analyzing position. Please try again.");
  }
});

bot.command("advice", async (ctx) => {
  const session = userSessions.getSession(ctx.from.id);

  if (!session.walletAddress) {
    ctx.reply(
      "❌ Please set your wallet address first using /wallet <address>"
    );
    return;
  }

  ctx.reply("💡 Generating personalized advice...");

  try {
    const liquidity = await compound.getAccountLiquidity(session.walletAddress);

    const question = `Based on my current account liquidity, what are some strategies I should consider?`;
    const advice = await ai.getAdvice(question, { liquidity });

    ctx.reply(`💡 Personalized Advice:\n\n${advice}`);
  } catch (error) {
    ctx.reply("❌ Error generating advice. Please try again.");
  }
});

// Handle general messages as AI queries
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // Skip if it's a command
  if (text.startsWith("/")) return;

  ctx.reply("🤔 Let me help you with that...");

  try {
    const advice = await ai.getAdvice(text);
    ctx.reply(`🤖 ${advice}`);
  } catch (error) {
    ctx.reply(
      "❌ I couldn't process your message. Try asking a specific question about DeFi!"
    );
  }
});

bot.launch();
console.log("🚀 DeFi AI Assistant Bot started!");
```

---

## Phase 5: The Car - Transaction Execution & Advanced Features

### Step 5.1: Add Transaction Service

```typescript
// src/services/transaction.ts
import { ethers } from "ethers";

export class TransactionService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet?: ethers.Wallet;

  constructor(rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    }
  }

  async estimateGas(
    to: string,
    data: string,
    value: string = "0"
  ): Promise<string> {
    try {
      if (!this.wallet) throw new Error("Wallet not configured");

      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        value: ethers.utils.parseEther(value),
        from: this.wallet.address,
      });

      return ethers.utils.formatUnits(gasEstimate, "gwei");
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error}`);
    }
  }

  async simulateTransaction(
    to: string,
    data: string,
    value: string = "0"
  ): Promise<any> {
    try {
      if (!this.wallet) throw new Error("Wallet not configured");

      const result = await this.provider.call({
        to,
        data,
        value: ethers.utils.parseEther(value),
        from: this.wallet.address,
      });

      return result;
    } catch (error) {
      throw new Error(`Transaction simulation failed: ${error}`);
    }
  }

  async executeTransaction(
    to: string,
    data: string,
    value: string = "0"
  ): Promise<string> {
    try {
      if (!this.wallet) throw new Error("Wallet not configured");

      const tx = await this.wallet.sendTransaction({
        to,
        data,
        value: ethers.utils.parseEther(value),
      });

      return tx.hash;
    } catch (error) {
      throw new Error(`Transaction execution failed: ${error}`);
    }
  }
}
```

### Step 5.2: Add Compound Transaction Builder

```typescript
// src/services/compoundTransactions.ts
import { ethers } from "ethers";

export class CompoundTransactionBuilder {
  private cTokenABI = [
    "function mint(uint256 mintAmount) external returns (uint256)",
    "function redeem(uint256 redeemTokens) external returns (uint256)",
    "function redeemUnderlying(uint256 redeemAmount) external returns (uint256)",
    "function borrow(uint256 borrowAmount) external returns (uint256)",
    "function repayBorrow(uint256 repayAmount) external returns (uint256)",
  ];

  buildSupplyTransaction(
    cTokenAddress: string,
    amount: string
  ): { to: string; data: string } {
    const iface = new ethers.utils.Interface(this.cTokenABI);
    const data = iface.encodeFunctionData("mint", [
      ethers.utils.parseEther(amount),
    ]);

    return {
      to: cTokenAddress,
      data,
    };
  }

  buildWithdrawTransaction(
    cTokenAddress: string,
    amount: string
  ): { to: string; data: string } {
    const iface = new ethers.utils.Interface(this.cTokenABI);
    const data = iface.encodeFunctionData("redeemUnderlying", [
      ethers.utils.parseEther(amount),
    ]);

    return {
      to: cTokenAddress,
      data,
    };
  }

  buildBorrowTransaction(
    cTokenAddress: string,
    amount: string
  ): { to: string; data: string } {
    const iface = new ethers.utils.Interface(this.cTokenABI);
    const data = iface.encodeFunctionData("borrow", [
      ethers.utils.parseEther(amount),
    ]);

    return {
      to: cTokenAddress,
      data,
    };
  }

  buildRepayTransaction(
    cTokenAddress: string,
    amount: string
  ): { to: string; data: string } {
    const iface = new ethers.utils.Interface(this.cTokenABI);
    const data = iface.encodeFunctionData("repayBorrow", [
      ethers.utils.parseEther(amount),
    ]);

    return {
      to: cTokenAddress,
      data,
    };
  }
}
```

### Step 5.3: Add AI-Powered Transaction Assistant

```typescript
// src/services/aiTransactionAssistant.ts
import { AIService } from "./ai";
import { CompoundService } from "./compound";
import { CompoundTransactionBuilder } from "./compoundTransactions";
import { TransactionService } from "./transaction";

export class AITransactionAssistant {
  constructor(
    private ai: AIService,
    private compound: CompoundService,
    private txBuilder: CompoundTransactionBuilder,
    private txService: TransactionService
  ) {}

  async parseIntent(
    userMessage: string,
    userAddress: string
  ): Promise<{
    action: string;
    token: string;
    amount: string;
    confidence: number;
    warnings: string[];
  } | null> {
    const prompt = `Parse this user message for DeFi intent:
    "${userMessage}"
    
    Identify:
    1. Action (supply, withdraw, borrow, repay)
    2. Token symbol
    3. Amount
    4. Confidence level (0-1)
    5. Any warnings needed
    
    Respond in JSON format only.`;

    try {
      const response = await this.ai.getAdvice(prompt);
      return JSON.parse(response);
    } catch (error) {
      return null;
    }
  }

  async validateTransaction(
    action: string,
    token: string,
    amount: string,
    userAddress: string
  ): Promise<{ valid: boolean; message: string; gasEstimate?: string }> {
    try {
      // Get user's current position
      const tokenAddress = this.getTokenAddress(token);
      if (!tokenAddress) {
        return { valid: false, message: `Token ${token} not supported` };
      }

      const position = await this.compound.getUserPosition(
        userAddress,
        tokenAddress
      );
      const liquidity = await this.compound.getAccountLiquidity(userAddress);

      // Validate based on action
      switch (action.toLowerCase()) {
        case "supply":
          // Check if user has enough balance
          return await this.validateSupply(amount, userAddress, tokenAddress);

        case "withdraw":
          // Check if user has enough supplied
          return await this.validateWithdraw(amount, position, liquidity);

        case "borrow":
          // Check if user has enough collateral
          return await this.validateBorrow(amount, liquidity, tokenAddress);

        case "repay":
          // Check if user has debt to repay
          return await this.validateRepay(amount, position, userAddress);

        default:
          return { valid: false, message: "Unknown action" };
      }
    } catch (error) {
      return { valid: false, message: `Validation error: ${error}` };
    }
  }

  private async validateSupply(
    amount: string,
    userAddress: string,
    tokenAddress: string
  ): Promise<{ valid: boolean; message: string; gasEstimate?: string }> {
    // Implementation for supply validation
    const tx = this.txBuilder.buildSupplyTransaction(tokenAddress, amount);
    try {
      const gasEstimate = await this.txService.estimateGas(tx.to, tx.data);
      return {
        valid: true,
        message: `Supply ${amount} tokens validated`,
        gasEstimate,
      };
    } catch (error) {
      return { valid: false, message: `Supply validation failed: ${error}` };
    }
  }

  private async validateWithdraw(
    amount: string,
    position: any,
    liquidity: any
  ): Promise<{ valid: boolean; message: string }> {
    const availableAmount = parseFloat(position.underlyingBalance);
    const requestedAmount = parseFloat(amount);

    if (requestedAmount > availableAmount) {
      return {
        valid: false,
        message: `Insufficient balance. Available: ${availableAmount.toFixed(
          6
        )}`,
      };
    }

    // Check if withdrawal would cause liquidation
    if (parseFloat(liquidity.shortfall) > 0) {
      return {
        valid: false,
        message: "Account is underwater. Cannot withdraw.",
      };
    }

    return { valid: true, message: "Withdrawal validated" };
  }

  private async validateBorrow(
    amount: string,
    liquidity: any,
    tokenAddress: string
  ): Promise<{ valid: boolean; message: string }> {
    const availableLiquidity = parseFloat(liquidity.liquidity);
    const requestedAmount = parseFloat(amount);

    if (requestedAmount > availableLiquidity) {
      return {
        valid: false,
        message: `Insufficient collateral. Available: ${availableLiquidity.toFixed(
          2
        )}`,
      };
    }

    return { valid: true, message: "Borrow validated" };
  }

  private async validateRepay(
    amount: string,
    position: any,
    userAddress: string
  ): Promise<{ valid: boolean; message: string }> {
    const borrowBalance = parseFloat(position.borrowBalance);
    const requestedAmount = parseFloat(amount);

    if (borrowBalance === 0) {
      return {
        valid: false,
        message: "No debt to repay",
      };
    }

    if (requestedAmount > borrowBalance) {
      return {
        valid: false,
        message: `Amount exceeds debt. Current debt: ${borrowBalance.toFixed(
          6
        )}`,
      };
    }

    return { valid: true, message: "Repay validated" };
  }

  private getTokenAddress(symbol: string): string | null {
    const MARKETS = {
      USDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
      DAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
      ETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
    };

    return MARKETS[symbol.toUpperCase()] || null;
  }
}
```

### Step 5.4: Enhanced Bot with Transaction Capabilities

```typescript
// src/bot.ts (final version)
import { Telegraf, Markup } from "telegraf";
import * as dotenv from "dotenv";
import { BlockchainService } from "./services/blockchain";
import { CompoundService } from "./services/compound";
import { AIService } from "./services/ai";
import { UserSessionService } from "./services/userSession";
import { TransactionService } from "./services/transaction";
import { CompoundTransactionBuilder } from "./services/compoundTransactions";
import { AITransactionAssistant } from "./services/aiTransactionAssistant";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const blockchain = new BlockchainService(process.env.RPC_URL!);
const compound = new CompoundService(
  process.env.RPC_URL!,
  process.env.COMPTROLLER_ADDRESS!
);
const ai = new AIService(process.env.OPENAI_API_KEY!);
const userSessions = new UserSessionService();
const txService = new TransactionService(
  process.env.RPC_URL!,
  process.env.PRIVATE_KEY
);
const txBuilder = new CompoundTransactionBuilder();
const aiTxAssistant = new AITransactionAssistant(
  ai,
  compound,
  txBuilder,
  txService
);

// Pending transactions storage
const pendingTransactions = new Map();

bot.start((ctx) => {
  ctx.reply(
    `🚀 Welcome to Advanced DeFi AI Assistant!

🤖 I can help you:
• Analyze markets and positions
• Execute transactions safely
• Provide personalized advice
• Risk management guidance

🔧 Setup:
/wallet <address> - Set your wallet
/connect - Connect for transactions (admin only)

💼 Trading:
/supply <amount> <token> - Supply tokens
/withdraw <amount> <token> - Withdraw tokens
/borrow <amount> <token> - Borrow tokens
/repay <amount> <token> - Repay loans

📊 Analysis:
/analyze - Full position analysis
/ask <question> - Ask anything
/markets - View all markets
/alerts - Set up alerts

Just type naturally and I'll understand what you want to do!`,
    Markup.keyboard([
      ["📊 Markets", "💰 My Position"],
      ["🤖 Ask AI", "⚙️ Settings"],
      ["📈 Analyze", "🚨 Alerts"],
    ]).resize()
  );
});

// Natural language processing for transactions
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  // Skip commands
  if (text.startsWith("/")) return;

  // Skip keyboard buttons for now
  if (
    [
      "📊 Markets",
      "💰 My Position",
      "🤖 Ask AI",
      "⚙️ Settings",
      "📈 Analyze",
      "🚨 Alerts",
    ].includes(text)
  ) {
    return;
  }

  const session = userSessions.getSession(userId);

  if (!session.walletAddress) {
    ctx.reply("❌ Please set your wallet first: /wallet <address>");
    return;
  }

  ctx.reply("🤔 Understanding your request...");

  try {
    // Parse user intent
    const intent = await aiTxAssistant.parseIntent(text, session.walletAddress);

    if (!intent) {
      // Fallback to general AI assistance
      const advice = await ai.getAdvice(text);
      ctx.reply(`🤖 ${advice}`);
      return;
    }

    if (intent.confidence < 0.7) {
      ctx.reply(
        `❓ I'm not sure what you want to do. Could you be more specific?\n\nDid you mean to:\n• Supply tokens?\n• Withdraw funds?\n• Borrow money?\n• Repay a loan?`
      );
      return;
    }

    // Show warnings if any
    if (intent.warnings.length > 0) {
      ctx.reply(`⚠️ Important warnings:\n${intent.warnings.join("\n")}`);
    }

    // Validate transaction
    const validation = await aiTxAssistant.validateTransaction(
      intent.action,
      intent.token,
      intent.amount,
      session.walletAddress
    );

    if (!validation.valid) {
      ctx.reply(`❌ Transaction validation failed:\n${validation.message}`);
      return;
    }

    // Show transaction preview
    const preview = `📋 Transaction Preview:
Action: ${intent.action.toUpperCase()}
Token: ${intent.token.toUpperCase()}
Amount: ${intent.amount}
${validation.gasEstimate ? `Estimated Gas: ${validation.gasEstimate} Gwei` : ""}

${validation.message}

Proceed with this transaction?`;

    const txId = `${userId}-${Date.now()}`;
    pendingTransactions.set(txId, {
      userId,
      action: intent.action,
      token: intent.token,
      amount: intent.amount,
      timestamp: Date.now(),
    });

    ctx.reply(
      preview,
      Markup.inlineKeyboard([
        [Markup.button.callback("✅ Confirm", `confirm-${txId}`)],
        [Markup.button.callback("❌ Cancel", `cancel-${txId}`)],
      ])
    );
  } catch (error) {
    ctx.reply("❌ Error processing your request. Please try again.");
  }
});

// Handle transaction confirmations
bot.action(/confirm-(.+)/, async (ctx) => {
  const txId = ctx.match[1];
  const pendingTx = pendingTransactions.get(txId);

  if (!pendingTx) {
    ctx.reply("❌ Transaction expired. Please try again.");
    return;
  }

  if (pendingTx.userId !== ctx.from.id) {
    ctx.reply("❌ Unauthorized transaction.");
    return;
  }

  ctx.reply("⏳ Executing transaction...");

  try {
    // Build transaction
    const tokenAddress = getTokenAddress(pendingTx.token);
    let tx;

    switch (pendingTx.action.toLowerCase()) {
      case "supply":
        tx = txBuilder.buildSupplyTransaction(tokenAddress, pendingTx.amount);
        break;
      case "withdraw":
        tx = txBuilder.buildWithdrawTransaction(tokenAddress, pendingTx.amount);
        break;
      case "borrow":
        tx = txBuilder.buildBorrowTransaction(tokenAddress, pendingTx.amount);
        break;
      case "repay":
        tx = txBuilder.buildRepayTransaction(tokenAddress, pendingTx.amount);
        break;
      default:
        throw new Error("Unknown action");
    }

    // Execute transaction
    const txHash = await txService.executeTransaction(tx.to, tx.data);

    ctx.reply(`✅ Transaction executed successfully!
Hash: ${txHash}
Action: ${pendingTx.action.toUpperCase()}
Amount: ${pendingTx.amount} ${pendingTx.token.toUpperCase()}

View on explorer: https://etherscan.io/tx/${txHash}`);

    // Clean up
    pendingTransactions.delete(txId);
  } catch (error) {
    ctx.reply(`❌ Transaction failed: ${error.message}`);
    pendingTransactions.delete(txId);
  }
});

// Handle transaction cancellations
bot.action(/cancel-(.+)/, async (ctx) => {
  const txId = ctx.match[1];
  pendingTransactions.delete(txId);
  ctx.reply("❌ Transaction cancelled.");
});

// Keyboard button handlers
bot.hears("📊 Markets", async (ctx) => {
  ctx.reply("📊 Loading market data...");
  // Implementation for markets overview
});

bot.hears("💰 My Position", async (ctx) => {
  const session = userSessions.getSession(ctx.from.id);
  if (!session.walletAddress) {
    ctx.reply("❌ Please set your wallet first: /wallet <address>");
    return;
  }
  // Trigger position analysis
  ctx.message.text = "/analyze";
  // Re-process as analyze command
});

bot.hears("🤖 Ask AI", async (ctx) => {
  ctx.reply(
    "🤖 What would you like to know about DeFi? Just type your question!"
  );
});

bot.hears("📈 Analyze", async (ctx) => {
  ctx.message.text = "/analyze";
  // Re-process as analyze command
});

// Utility functions
function getTokenAddress(symbol: string): string {
  const MARKETS = {
    USDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
    DAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    ETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
  };

  return MARKETS[symbol.toUpperCase()];
}

bot.launch();
console.log("🚀 Advanced DeFi AI Assistant Bot is running!");
```

### Step 5.5: Add Alert System

```typescript
// src/services/alertService.ts
interface Alert {
  id: string;
  userId: number;
  type: "liquidation" | "rate_change" | "position_threshold";
  conditions: any;
  isActive: boolean;
  createdAt: Date;
}

export class AlertService {
  private alerts: Map<string, Alert> = new Map();
  private checkInterval: NodeJS.Timeout;

  constructor(private compound: CompoundService, private bot: any) {
    // Check alerts every 5 minutes
    this.checkInterval = setInterval(() => this.checkAlerts(), 5 * 60 * 1000);
  }

  addLiquidationAlert(
    userId: number,
    walletAddress: string,
    threshold: number
  ): string {
    const alertId = `liquidation-${userId}-${Date.now()}`;

    this.alerts.set(alertId, {
      id: alertId,
      userId,
      type: "liquidation",
      conditions: { walletAddress, threshold },
      isActive: true,
      createdAt: new Date(),
    });

    return alertId;
  }

  private async checkAlerts(): Promise<void> {
    for (const [alertId, alert] of this.alerts) {
      if (!alert.isActive) continue;

      try {
        if (alert.type === "liquidation") {
          await this.checkLiquidationAlert(alert);
        }
      } catch (error) {
        console.error(`Error checking alert ${alertId}:`, error);
      }
    }
  }

  private async checkLiquidationAlert(alert: Alert): Promise<void> {
    const { walletAddress, threshold } = alert.conditions;

    try {
      const liquidity = await this.compound.getAccountLiquidity(walletAddress);
      const liquidityRatio =
        parseFloat(liquidity.liquidity) /
        (parseFloat(liquidity.liquidity) + parseFloat(liquidity.shortfall));

      if (liquidityRatio < threshold) {
        await this.bot.telegram.sendMessage(
          alert.userId,
          `🚨 LIQUIDATION ALERT!\n\nYour position is at risk!\nCurrent health: ${(
            liquidityRatio * 100
          ).toFixed(2)}%\nThreshold: ${(threshold * 100).toFixed(
            2
          )}%\n\nConsider adding collateral or repaying debt immediately!`
        );

        // Deactivate alert to prevent spam
        alert.isActive = false;
      }
    } catch (error) {
      console.error("Error checking liquidation alert:", error);
    }
  }

  removeAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  getUserAlerts(userId: number): Alert[] {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }
}
```

### Step 5.6: Environment Configuration (Final)

```bash
# .env (complete)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
RPC_URL=https://mainnet.infura.io/v3/your_project_id
COMPTROLLER_ADDRESS=0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B
OPENAI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_private_key_for_transactions
```

### Step 5.7: Production Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/bot.js"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  defi-bot:
    build: .
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - RPC_URL=${RPC_URL}
      - COMPTROLLER_ADDRESS=${COMPTROLLER_ADDRESS}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PRIVATE_KEY=${PRIVATE_KEY}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "ts-node --watch src/bot.ts",
    "deploy": "npm run build && docker-compose up -d"
  }
}
```

---

## Security Considerations

### Essential Security Measures:

1. **Private Key Management**

   - Never hardcode private keys
   - Use environment variables
   - Consider using hardware wallets for production
   - Implement key rotation

2. **User Authentication**

   - Implement user verification
   - Rate limiting for transactions
   - Transaction amount limits
   - Multi-signature for large amounts

3. **Input Validation**

   - Validate all user inputs
   - Sanitize addresses and amounts
   - Implement transaction simulation before execution

4. **Error Handling**
   - Never expose sensitive information in errors
   - Log security events
   - Implement proper fallbacks

---

## Testing Strategy

### Step 6.1: Unit Tests

```typescript
// tests/services/compound.test.ts
import { CompoundService } from "../src/services/compound";

describe("CompoundService", () => {
  let service: CompoundService;

  beforeEach(() => {
    service = new CompoundService("http://localhost:8545", "0x...");
  });

  test("should get market info", async () => {
    // Test implementation
  });
});
```

### Step 6.2: Integration Tests

```typescript
// tests/integration/bot.test.ts
import { Telegraf } from "telegraf";

describe("Bot Integration", () => {
  test("should respond to /start command", async () => {
    // Test bot responses
  });
});
```

---

## Monitoring and Maintenance

### Step 7.1: Logging

```typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console(),
  ],
});
```

### Step 7.2: Health Checks

```typescript
// src/health.ts
export class HealthChecker {
  async checkServices(): Promise<{ healthy: boolean; services: any }> {
    const results = {
      blockchain: await this.checkBlockchain(),
      ai: await this.checkAI(),
      compound: await this.checkCompound(),
    };

    return {
      healthy: Object.values(results).every((r) => r.healthy),
      services: results,
    };
  }
}
```

---

## Conclusion

This guide takes you from a basic Telegram bot to a sophisticated DeFi assistant with:

✅ **Skateboard**: Basic bot with simple commands
✅ **Scooter**: Blockchain integration and balance checking
✅ **Bicycle**: Compound V2 protocol integration
✅ **Motorcycle**: AI-powered assistance and analysis
✅ **Car**: Full transaction execution with safety features

The final product includes:

- Natural language transaction processing
- AI-powered risk analysis
- Real-time position monitoring
- Automated alerts and warnings
- Secure transaction execution
- Comprehensive error handling

Remember to thoroughly test each phase before moving to the next, and always prioritize security when handling user funds and private keys.
