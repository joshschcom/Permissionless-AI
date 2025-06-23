#!/bin/bash

# Peridot DeFi Bot Deployment Script
echo "🧿 Deploying Peridot DeFi Bot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please copy env.example to .env and configure your variables${NC}"
    exit 1
fi

# Check if required environment variables are set
echo -e "${BLUE}🔍 Checking environment variables...${NC}"

source .env

required_vars=("TELEGRAM_BOT_TOKEN" "RPC_URL" "PERIDOTTROLLER_ADDRESS")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables check passed${NC}"

# Build and deploy with Docker Compose
echo -e "${BLUE}🐳 Building Docker container...${NC}"

if docker-compose build; then
    echo -e "${GREEN}✅ Docker build successful${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Peridot DeFi Bot...${NC}"

if docker-compose up -d; then
    echo -e "${GREEN}✅ Bot deployed successfully!${NC}"
    echo -e "${BLUE}📊 Bot Status:${NC}"
    docker-compose ps
    
    echo -e "\n${BLUE}📋 Useful Commands:${NC}"
    echo -e "  View logs:    ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  Stop bot:     ${YELLOW}docker-compose down${NC}"
    echo -e "  Restart bot:  ${YELLOW}docker-compose restart${NC}"
    echo -e "  Bot status:   ${YELLOW}docker-compose ps${NC}"
    
    echo -e "\n${GREEN}🎉 Peridot DeFi Bot is now running!${NC}"
    echo -e "${BLUE}Check your Telegram bot to interact with it.${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi 