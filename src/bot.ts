import { Telegraf, Markup } from "telegraf";
import * as dotenv from "dotenv";
import { BlockchainService } from "./services/blockchain";
import { PeridotService } from "./services/peridot";
import { AIService } from "./services/ai";
import { UserSessionService } from "./services/userSession";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "TELEGRAM_BOT_TOKEN",
  "RPC_URL",
  "PERIDOTTROLLER_ADDRESS",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const blockchain = new BlockchainService(process.env.RPC_URL!);
const peridot = new PeridotService(
  process.env.RPC_URL!,
  process.env.PERIDOTTROLLER_ADDRESS!
);

// Initialize AI service if OpenAI key is available
const ai = process.env.OPENAI_API_KEY
  ? new AIService(process.env.OPENAI_API_KEY)
  : null;

const userSessions = new UserSessionService();

// Market addresses for Arbitrum Sepolia (disabled for now)
const MARKETS: Record<string, string> = {
  USDC:
    process.env.PUSDC_ADDRESS || "0xFb08502090318eA69595ad5D80Ff854B87f457eb",
  USDT:
    process.env.PUSDT_ADDRESS || "0x3ed59D5D0a2236cDAd22aDFFC5414df74Ccb3040",
};

// Utility function to format large numbers
function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + "K";
  return num.toFixed(decimals);
}

// Bot startup message
bot.start((ctx) => {
  const welcomeMessage = `🌟 Welcome to Peridot DeFi Assistant!

🧿 **Peridot Protocol** - Advanced lending & borrowing on Arbitrum

🤖 **I can help you:**
• 📊 Analyze markets and positions
• 💰 Check your Peridot balances
• 🎯 Get personalized DeFi advice
• ⚡ Monitor liquidation risks
• 📈 Track yields and opportunities

🔧 **Quick Setup:**
/wallet <address> - Connect your wallet
/markets - View available markets
/help - See all commands

💡 **Pro Tip:** Just type naturally! I understand requests like:
"Show me USDC market info" or "What's my position?"`;

  ctx.reply(
    welcomeMessage,
    Markup.keyboard([
      ["📊 Markets", "💰 My Position"],
      ["🤖 Ask AI", "⚙️ Settings"],
      ["📈 Analytics", "🚨 Alerts"],
    ]).resize()
  );
});

// Help command
bot.help((ctx) => {
  const helpMessage = `🆘 **Peridot Bot Commands**

**💼 Wallet & Position:**
/wallet <address> - Set your wallet address
/position - View your positions
/liquidity - Check account health
/balance <address> - Check ETH balance

**📊 Market Data:**
/markets - List all markets
/market <symbol> - Get market details
/rates - Current supply/borrow rates
/tvl - Total value locked

**🤖 AI Assistant:**
/ask <question> - Ask anything about DeFi
/analyze - AI position analysis
/advice - Get personalized advice
/strategy - Investment strategies

**⚙️ Settings:**
/settings - User preferences
/alerts - Manage price alerts
/stats - Bot statistics

**🎯 Natural Language:**
Just type what you want! Examples:
• "How much USDC can I borrow?"
• "Show me the best rates"
• "Is my position safe?"`;

  ctx.reply(helpMessage);
});

// Wallet command
bot.command("wallet", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply(`💰 **Set Your Wallet**

Usage: \`/wallet <address>\`

Example: \`/wallet 0x742d35Cc6869C4e5B7b8d5e6b9A8B9b8B9b8B9b8\`

This allows me to:
• Check your positions
• Calculate health ratios
• Provide personalized advice
• Set up alerts`);
    return;
  }

  const address = args[1];
  if (!(await blockchain.isValidAddress(address))) {
    ctx.reply("❌ Invalid wallet address format");
    return;
  }

  userSessions.setWallet(ctx.from.id, address);
  ctx.reply(
    `✅ **Wallet Connected**
    
Address: \`${address.slice(0, 6)}...${address.slice(-4)}\`

Now I can provide personalized analysis! Try:
• /position - View your positions
• /analyze - AI-powered analysis
• /liquidity - Check health status`
  );
});

// Markets command (temporarily disabled)
bot.command("markets", async (ctx) => {
  ctx.reply(`📊 **Markets Coming Soon!**

Market data integration is currently being set up.

🔧 **Available for now:**
• /wallet <address> - Connect your wallet
• /position - View positions (when markets are ready)
• /liquidity - Check account health
• /ask - AI assistance

🚀 Markets will be available soon with full data integration!`);
});

// Market details command (temporarily disabled)
bot.command("market", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const symbol = args.length > 1 ? args[1].toUpperCase() : "USDC";

  ctx.reply(`🎯 **${symbol} Market - Coming Soon!**

Market details are currently being integrated.

🔧 **What's coming:**
• Real-time APY data
• Utilization rates
• Collateral factors
• Supply/borrow limits

📊 Use /markets to see when market data becomes available.`);
});

// Position command
bot.command("position", async (ctx) => {
  const session = userSessions.getSession(ctx.from.id);

  if (!session.walletAddress) {
    ctx.reply("❌ Please set your wallet first: `/wallet <address>`");
    return;
  }

  ctx.reply("💼 Analyzing your positions...");

  try {
    const positions = [];

    for (const [symbol, address] of Object.entries(MARKETS)) {
      try {
        const position = await peridot.getUserPosition(
          session.walletAddress,
          address
        );

        if (
          parseFloat(position.pTokenBalance) > 0 ||
          parseFloat(position.borrowBalance) > 0
        ) {
          positions.push({
            symbol,
            ...position,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol} position:`, error);
      }
    }

    const liquidity = await peridot.getAccountLiquidity(session.walletAddress);

    if (positions.length === 0) {
      ctx.reply(
        `💼 **No Active Positions**
      
Address: \`${session.walletAddress.slice(0, 6)}...${session.walletAddress.slice(
          -4
        )}\`

You don't have any active positions in Peridot protocol.

🚀 **Get Started:**
• Supply assets to earn interest
• Use supplied assets as collateral to borrow
• Check /markets for opportunities`
      );
      return;
    }

    let positionSummary = `💼 **Your Peridot Positions**
    
Address: \`${session.walletAddress.slice(0, 6)}...${session.walletAddress.slice(
      -4
    )}\`

`;

    positions.forEach((pos) => {
      positionSummary += `**${pos.symbol} Position:**\n`;
      if (parseFloat(pos.underlyingBalance) > 0) {
        positionSummary += `💰 Supplied: ${parseFloat(
          pos.underlyingBalance
        ).toFixed(4)} ${pos.symbol}\n`;
      }
      if (parseFloat(pos.borrowBalance) > 0) {
        positionSummary += `📉 Borrowed: ${parseFloat(
          pos.borrowBalance
        ).toFixed(4)} ${pos.symbol}\n`;
      }
      positionSummary += "\n";
    });

    positionSummary += `**🏥 Account Health:**
💚 Available Liquidity: $${parseFloat(liquidity.liquidity).toFixed(2)}
${
  parseFloat(liquidity.shortfall) > 0
    ? `🚨 Shortfall: $${parseFloat(liquidity.shortfall).toFixed(2)} - AT RISK!`
    : "✅ Account is healthy"
}

Use \`/analyze\` for AI-powered insights!`;

    ctx.reply(positionSummary);
  } catch (error) {
    ctx.reply("❌ Error analyzing positions. Please try again.");
  }
});

// Liquidity check command
bot.command("liquidity", async (ctx) => {
  const session = userSessions.getSession(ctx.from.id);

  if (!session.walletAddress) {
    ctx.reply("❌ Please set your wallet first: `/wallet <address>`");
    return;
  }

  try {
    const liquidity = await peridot.getAccountLiquidity(session.walletAddress);
    const availableLiquidity = parseFloat(liquidity.liquidity);
    const shortfall = parseFloat(liquidity.shortfall);

    let healthMessage = `🏥 **Account Health Check**

Address: \`${session.walletAddress.slice(0, 6)}...${session.walletAddress.slice(
      -4
    )}\`

`;

    if (shortfall > 0) {
      healthMessage += `🚨 **LIQUIDATION RISK**
❌ Shortfall: $${shortfall.toFixed(2)}
⚠️ Your account is underwater!

**Immediate Actions:**
• Add more collateral
• Repay some debt
• Consider closing risky positions`;
    } else if (availableLiquidity < 100) {
      healthMessage += `⚠️ **LOW LIQUIDITY**
💛 Available: $${availableLiquidity.toFixed(2)}
📊 Consider adding more collateral for safety`;
    } else {
      healthMessage += `✅ **HEALTHY ACCOUNT**
💚 Available Liquidity: $${availableLiquidity.toFixed(2)}
🛡️ You have good collateral coverage`;
    }

    ctx.reply(healthMessage);
  } catch (error) {
    ctx.reply("❌ Error checking account liquidity.");
  }
});

// AI Ask command
if (ai) {
  bot.command("ask", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length === 0) {
      ctx.reply(
        "🤖 **Ask me anything about DeFi!**\n\nExample: `/ask What is the best strategy for yield farming?`"
      );
      return;
    }

    const question = args.join(" ");
    ctx.reply("🤔 Thinking...");

    try {
      const advice = await ai.getAdvice(question);
      ctx.reply(`🤖 **AI Assistant:**\n\n${advice}`);
    } catch (error) {
      ctx.reply("❌ Sorry, I couldn't process your question right now.");
    }
  });

  // AI Analyze command
  bot.command("analyze", async (ctx) => {
    const session = userSessions.getSession(ctx.from.id);

    if (!session.walletAddress) {
      ctx.reply("❌ Please set your wallet first: `/wallet <address>`");
      return;
    }

    ctx.reply("🧠 AI is analyzing your position...");

    try {
      // Gather position data
      const positions: Record<string, any> = {};
      for (const [symbol, address] of Object.entries(MARKETS)) {
        try {
          const position = await peridot.getUserPosition(
            session.walletAddress,
            address
          );
          if (
            parseFloat(position.pTokenBalance) > 0 ||
            parseFloat(position.borrowBalance) > 0
          ) {
            positions[symbol] = position;
          }
        } catch (error) {
          // Skip failed positions
        }
      }

      const liquidity = await peridot.getAccountLiquidity(
        session.walletAddress
      );

      const analysisData = {
        address: session.walletAddress,
        positions,
        liquidity,
      };

      const analysis = await ai.analyzePosition(analysisData);
      ctx.reply(`🧠 **AI Position Analysis:**\n\n${analysis}`);
    } catch (error) {
      ctx.reply("❌ Error generating analysis. Please try again.");
    }
  });
}

// Natural language processing for general messages
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // Skip commands and keyboard buttons
  if (
    text.startsWith("/") ||
    [
      "📊 Markets",
      "💰 My Position",
      "🤖 Ask AI",
      "⚙️ Settings",
      "📈 Analytics",
      "🚨 Alerts",
    ].includes(text)
  ) {
    return;
  }

  if (!ai) {
    ctx.reply(
      "🤖 AI assistant is not available. Please configure OpenAI API key."
    );
    return;
  }

  // Simple keyword detection for common queries
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("market") &&
    (lowerText.includes("usdc") || lowerText.includes("usdt"))
  ) {
    const symbol = lowerText.includes("usdc") ? "USDC" : "USDT";
    ctx.message.text = `/market ${symbol}`;
    return;
  }

  if (lowerText.includes("position") || lowerText.includes("balance")) {
    ctx.message.text = "/position";
    return;
  }

  if (lowerText.includes("health") || lowerText.includes("liquidity")) {
    ctx.message.text = "/liquidity";
    return;
  }

  // Default to AI assistance
  ctx.reply("🤔 Let me help you with that...");

  try {
    const session = userSessions.getSession(ctx.from.id);
    let context = {};

    // Add user context if wallet is set
    if (session.walletAddress) {
      try {
        const liquidity = await peridot.getAccountLiquidity(
          session.walletAddress
        );
        context = { userLiquidity: liquidity };
      } catch (error) {
        // Continue without context
      }
    }

    const advice = await ai.getAdvice(
      text,
      Object.keys(context).length > 0 ? context : undefined
    );
    ctx.reply(`🤖 ${advice}`);
  } catch (error) {
    ctx.reply(
      "❌ I couldn't process your message. Try asking a specific question!"
    );
  }
});

// Keyboard button handlers
bot.hears("📊 Markets", (ctx) => {
  ctx.message.text = "/markets";
});

bot.hears("💰 My Position", (ctx) => {
  ctx.message.text = "/position";
});

bot.hears("🤖 Ask AI", (ctx) => {
  ctx.reply(
    "🤖 **What would you like to know?**\n\nJust type your question! Examples:\n• How does lending work in Peridot?\n• What are the risks of borrowing?\n• Should I supply or borrow USDC?"
  );
});

bot.hears("📈 Analytics", (ctx) => {
  ctx.message.text = "/analyze";
});

// Error handling
bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  ctx.reply("❌ Something went wrong. Please try again.");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Start the bot
bot.launch().then(() => {
  console.log("🚀 Peridot DeFi Bot is running!");
  console.log(`📊 Monitoring ${Object.keys(MARKETS).length} markets`);
  console.log(`🤖 AI Assistant: ${ai ? "Enabled" : "Disabled"}`);
});

// Clean up old sessions periodically (every 24 hours)
setInterval(() => {
  userSessions.cleanupOldSessions();
}, 24 * 60 * 60 * 1000);
