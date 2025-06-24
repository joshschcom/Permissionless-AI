import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // System prompt for the AI assistant
    const systemPrompt = `You are an AI assistant for Peridot Protocol, a cross-chain DeFi platform. You help users with:

1. Understanding DeFi concepts and strategies
2. Portfolio management and risk assessment
3. Cross-chain transactions and opportunities
4. Market analysis and insights
5. Platform features and navigation

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