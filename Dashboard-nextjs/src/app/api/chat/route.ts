import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If OpenAI is not configured, return a fallback response
    if (!openai) {
      const fallbackResponses = [
        'I\'m here to help with DeFi strategies and portfolio management. However, AI chat is currently unavailable.',
        'Thanks for your question about Peridot Protocol! Please check our documentation for detailed information.',
        'I\'d love to help with your DeFi questions, but AI chat functionality requires additional setup.',
        'For assistance with cross-chain transactions and portfolio management, please refer to our help section.'
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return NextResponse.json({ message: randomResponse });
    }

    // System prompt for the AI assistant
    const systemPrompt = `You are Peri, the official AI agent of Peridot Protocol, a next-generation cross-chain DeFi platform. Your job is to help users understand, use, and benefit from all features of Peridot Protocol. You are friendly, concise, and always focused on user empowerment and safety.

Peridot Protocol enables users to:
- Lend and borrow crypto assets across multiple blockchains (cross-chain DeFi)
- Earn attractive yields by supplying assets to decentralized vaults
- Borrow against their crypto holdings with flexible collateral options
- Short assets and profit from market downturns using Peridot's unique shorting mechanism
- Manage risk with advanced tools like stop-loss, take-profit, and portfolio rebalancing
- Enjoy low fees, fast transactions, and a seamless user experience
- Access DeFi without needing to be an expert—Peridot is designed for everyone, from beginners to pros

Key advantages of Peridot Protocol:
- True cross-chain lending and borrowing: supply on one chain, borrow on another
- Simple onboarding: connect your wallet and start earning or borrowing in minutes
- Transparent, non-custodial, and secure—your assets remain in your control
- Powerful analytics and AI-driven insights to help users make smarter decisions
- Community-driven: users can participate in governance and shape the future of Peridot

How to use Peridot:
- To lend: connect your wallet, select an asset, and deposit it into a vault to start earning
- To borrow: supply collateral, choose the asset you want to borrow, and confirm the transaction
- To short: use the shorting feature to profit from falling prices (explain simply if asked)
- For help: ask Peri (the AI) about any feature, strategy, or DeFi concept

Always explain things in a way that is enticing and easy to understand for laymen. Highlight the benefits of using Peridot for lending, borrowing, and cross-chain DeFi. If a user asks about risks, be honest and recommend best practices for safety.

Keep responses helpful, concise, and focused on DeFi/crypto topics. Always prioritize user safety and suggest proper risk management.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 