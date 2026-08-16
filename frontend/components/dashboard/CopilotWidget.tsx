'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: Date;
}

export default function CopilotWidget() {
  const { t, language } = useApp();
  
  const initialGreeting = language === 'HI'
    ? "नमस्ते आरव! मैं आपका एआई यात्रा सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?"
    : "Hi Aarav! I'm your AI travel assistant. How can I help you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'copilot',
      text: initialGreeting,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync greeting when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [{
          ...prev[0],
          text: language === 'HI'
            ? "नमस्ते आरव! मैं आपका एआई यात्रा सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?"
            : "Hi Aarav! I'm your AI travel assistant. How can I help you today?"
        }];
      }
      return prev;
    });
  }, [language]);

  const quickActions = [
    language === 'HI' ? 'सुलभ मार्ग खोजें' : 'Find accessible routes',
    language === 'HI' ? 'आसपास की सहायता' : 'Nearby assistance',
    language === 'HI' ? 'यात्रा के टिप्स' : 'Travel tips',
    language === 'HI' ? 'यात्रा कार्यक्रम' : 'Travel itinerary'
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = language === 'HI'
        ? "मैं स्मारकों की जांच करने या यात्रा कार्यक्रम तैयार करने में आपकी सहायता कर सकता हूँ। आप अगली बार दिल्ली में किस स्थान पर जा रहे हैं?"
        : "I can help you check monuments or design an itinerary. Which place in Delhi are you visiting next?";
        
      const lower = text.toLowerCase();
      if (lower.includes('route') || lower.includes('मार्ग') || lower.includes('सुलभ')) {
        reply = language === 'HI'
          ? "आइए योजना बनाएं! ऊपर अपना प्रस्थान और गंतव्य निर्दिष्ट करें, और मैं सक्रिय निर्माण बाधाओं से बचते हुए एक सीढ़ी-मुक्त मार्ग खोजूंगा।"
          : "Let's plan! Specify your origin and destination above, and I'll find a step-free path avoiding active construction barriers.";
      } else if (lower.includes('assistance') || lower.includes('सहायता')) {
        reply = language === 'HI'
          ? "कनॉट प्लेस और इंडिया गेट दोनों में मैन्युअल व्हीलचेयर प्रेषण के साथ सक्रिय यात्रासाथी सहायता डेस्क हैं।"
          : "Connaught Place and India Gate both have active YatraSaathi Assistance Desks with manual wheelchair dispatch.";
      } else if (lower.includes('tips') || lower.includes('टिप्स') || lower.includes('advice')) {
        reply = language === 'HI'
          ? "सुझाव: लोधी गार्डन जाते समय, गेट 2 से प्रवेश करें जो पूरी तरह से सीढ़ी-मुक्त और पक्का है।"
          : "Tip: When visiting Lodhi Gardens, enter through Gate 2 which is fully step-free and paved.";
      } else if (lower.includes('itinerary') || lower.includes('कार्यक्रम')) {
        reply = language === 'HI'
          ? "हमने यात्रा कार्यक्रम पृष्ठ में दिल्ली विरासत यात्रा कार्यक्रम की संरचना की है। अपने समयबद्ध स्टॉप की योजना बनाने के लिए इसे देखें!"
          : "We have structured a Delhi Heritage itinerary in the itineraries page. Check it out to plan your timed stops!";
      }

      const copilotMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'copilot',
        text: reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm flex flex-col h-[360px] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-805 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-650 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <span>{t('copilot')}</span>
              <span className="rounded bg-violet-650 px-1 py-0.2 text-[8px] font-extrabold tracking-wider text-white uppercase scale-90">
                NEW
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isCopilot = msg.sender === 'copilot';
          return (
            <div 
              key={msg.id}
              className={`flex gap-2 max-w-[90%] ${isCopilot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`
                h-6 w-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold
                ${isCopilot ? 'bg-violet-100 dark:bg-violet-950 text-violet-750 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
              `}>
                {isCopilot ? <Bot className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <div className={`
                rounded-xl px-3 py-2 text-[11px] leading-relaxed
                ${isCopilot 
                  ? 'bg-slate-50 dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800 text-slate-705 dark:text-slate-200 rounded-tl-sm' 
                  : 'bg-violet-600 text-white rounded-tr-sm'
                }
              `}>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 max-w-[90%] mr-auto">
            <div className="h-6 w-6 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-750 dark:text-violet-300 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800 text-slate-750 dark:text-slate-300 rounded-xl rounded-tl-sm px-3 py-2 text-[11px] flex items-center gap-1">
              <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions Pills */}
      <div className="py-1.5 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-none border-t border-slate-50 dark:border-slate-900">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(action)}
            className="inline-block px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-955 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-100 dark:hover:border-violet-900 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
        className="mt-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-0.5 shrink-0 focus-within:border-violet-400"
      >
        <input 
          type="text" 
          placeholder={language === 'HI' ? 'मुझसे कुछ भी पूछें...' : 'Ask me anything...'} 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-transparent text-[11px] text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pl-2.5"
        />
        <button 
          type="submit"
          className="p-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
