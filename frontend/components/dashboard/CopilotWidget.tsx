'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  MoreHorizontal
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
}

export default function CopilotWidget() {
  const initialGreeting = "Hi Aarav! I'm your AI travel assistant. How can I help you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'copilot',
      text: initialGreeting,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    'Find accessible hotels',
    'Nearby wheelchair...',
    'Route tips'
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I can help you check monuments, find step-free paths, or design an accessible itinerary.";
      const lower = text.toLowerCase();
      if (lower.includes('hotel') || lower.includes('accessible')) {
        reply = "Here are 3 verified step-free hotels near your route with roll-in showers.";
      } else if (lower.includes('wheelchair') || lower.includes('nearby')) {
        reply = "Nearby wheelchair rental & assistance point is available 200m away at Gate 3.";
      } else if (lower.includes('tips') || lower.includes('route')) {
        reply = "Tip: Route 1 offers full elevator access and wide paved footpaths.";
      }

      const copilotMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'copilot',
        text: reply,
      };

      setMessages(prev => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm flex flex-col h-[350px] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
            Travel Copilot
          </h3>
        </div>
        <button 
          type="button" 
          aria-label="Options" 
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 scrollbar-none">
        {messages.map((msg) => {
          const isCopilot = msg.sender === 'copilot';
          return (
            <div 
              key={msg.id}
              className={`flex gap-2.5 max-w-[95%] ${isCopilot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse'}`}
            >
              {isCopilot && (
                <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`
                rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed font-medium
                ${isCopilot 
                  ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200' 
                  : 'bg-violet-600 text-white'
                }
              `}>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 max-w-[90%] mr-auto items-center">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-3 py-2 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(action)}
            className="inline-block px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
        className="mt-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shrink-0 focus-within:border-violet-500 shadow-sm"
      >
        <input 
          type="text" 
          placeholder="Ask me anything..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pl-3 font-medium"
        />
        <button 
          type="submit"
          aria-label="Send message"
          className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
