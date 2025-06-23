# 🚀 Quick Start Guide - Peridot DeFi Bot

Get your Peridot DeFi Bot running in 5 minutes!

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/) installed
- [Docker](https://docker.com/) and Docker Compose (optional)
- Telegram account
- OpenAI account (optional, for AI features)

## 🎯 Step 1: Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send** `/newbot` command
4. **Choose a name** for your bot (e.g., "My Peridot Bot")
5. **Choose a username** ending in "bot" (e.g., "my_peridot_defi_bot")
6. **Copy the token** - you'll need this!

## ⚙️ Step 2: Configure Environment

1. **Copy environment template:**

```bash
cp env.example .env
```

2. **Edit `.env` file** with your details:

```bash
# Required - Your bot token from BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Required - Blockchain RPC (Arbitrum Sepolia)
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Required - Peridot Protocol Address
PERIDOTTROLLER_ADDRESS=0xfB3f8837B1Ad7249C1B253898b3aa7FaB22E68aD

# Required - Market Addresses
PUSDC_ADDRESS=0xFb08502090318eA69595ad5D80Ff854B87f457eb
PUSDT_ADDRESS=0x3ed59D5D0a2236cDAd22aDFFC5414df74Ccb3040

# Optional - For AI features
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 🏃‍♂️ Step 3: Run the Bot

### Option A: Docker (Recommended)

1. **Quick Deploy:**

```bash
./deploy.sh
```

2. **Manual Docker:**

```bash
docker-compose up -d
```

### Option B: Node.js Direct

1. **Install dependencies:**

```bash
npm install
```

2. **Start development mode:**

```bash
npm run dev
```

3. **Or build and run:**

```bash
npm run build
npm start
```

## 🎉 Step 4: Test Your Bot

1. **Find your bot** in Telegram (search for the username you created)
2. **Start the bot** by sending `/start`
3. **Try basic commands:**
   - `/help` - See all commands
   - `/markets` - View Peridot markets
   - `/wallet <your-address>` - Connect your wallet

## 🤖 Step 5: Enable AI Features (Optional)

1. **Get OpenAI API Key:**

   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file

2. **Test AI features:**
   - `/ask What is Peridot protocol?`
   - `/analyze` (after connecting wallet)
   - Just chat naturally with the bot!

## 📱 Example Usage

Once your bot is running, try these:

```
# Connect your wallet
/wallet 0x742d35Cc6869C4e5B7b8d5e6b9A8B9b8B9b8B9b8

# Check markets
/markets

# Get specific market info
/market USDC

# Check your positions
/position

# Check account health
/liquidity

# Ask AI questions
/ask How does lending work in Peridot?

# Natural language (if AI enabled)
"Show me USDC market"
"What's my position?"
"Is my account healthy?"
```

## 🔧 Troubleshooting

### Bot doesn't respond

- ✅ Check your `TELEGRAM_BOT_TOKEN` is correct
- ✅ Ensure bot is running (`docker-compose ps` or check logs)
- ✅ Verify internet connection

### Market data not loading

- ✅ Check `RPC_URL` is working
- ✅ Verify contract addresses are correct
- ✅ Check Arbitrum Sepolia network status

### AI features not working

- ✅ Verify `OPENAI_API_KEY` is set
- ✅ Check OpenAI account has credits
- ✅ Restart bot after adding API key

### Docker issues

```bash
# View logs
docker-compose logs -f

# Restart bot
docker-compose restart

# Rebuild container
docker-compose build --no-cache
```

### Node.js issues

```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

## 📊 Monitoring

### View logs

```bash
# Docker
docker-compose logs -f

# Node.js
npm run dev  # Shows logs in console
```

### Check bot status

```bash
# Docker
docker-compose ps

# Or send /start to your bot
```

## 🔄 Updates

To update your bot:

1. **Pull latest changes:**

```bash
git pull origin main
```

2. **Rebuild and restart:**

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## 🆘 Getting Help

- **Check logs first** - most issues show up there
- **Verify environment variables** - common source of problems
- **Test network connectivity** - ensure RPC endpoint works
- **Check official docs** in README.md

## 🎊 You're Ready!

Your Peridot DeFi Bot is now running! Users can:

- 📊 Get real-time market data
- 💰 Check their positions
- 🏥 Monitor account health
- 🤖 Get AI-powered advice
- 🎯 Use natural language commands

**Happy DeFi-ing! 🧿**
