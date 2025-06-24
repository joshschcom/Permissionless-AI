'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Minimize2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
  timestamp: number;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      message: 'Hello! I\'m your AI assistant for Peridot Protocol. How can I help you with DeFi strategies and portfolio management today?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to history
    const newUserMessage: ChatMessage = {
      role: 'user',
      message: userMessage,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to history
      const aiMessage: ChatMessage = {
        role: 'ai',
        message: data.message,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'ai',
        message: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Chat button (when closed)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          <MessageCircle className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping"></div>
        </button>
      </div>
    );
  }

  // Chat interface (when open)
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-96 w-80'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    chat.role === 'user' 
                      ? 'bg-emerald-500 text-white rounded-br-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md'
                  }`}>
                    {chat.message}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 dark:border-slate-700/50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about DeFi strategies..."
                  className="flex-1 px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/50 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 