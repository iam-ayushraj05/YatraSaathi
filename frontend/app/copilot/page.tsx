'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  HelpCircle,
  Send,
  Bot,
  User as UserIcon
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
}

export default function CopilotPage() {
  const { language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const initialGreeting = language === 'HI'
    ? "नमस्ते आरव! मैं आपका एआई यात्रा सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?"
    : "Hi Aarav! I'm your AI travel assistant. How can I help you today?";

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

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [{
          id: 'm1',
          sender: 'copilot',
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
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = language === 'HI'
        ? "मैं स्मारकों की जांच करने या सुलभ यात्रा कार्यक्रम तैयार करने में आपकी सहायता कर सकता हूँ। आप अगली बार दिल्ली में किस स्थान पर जा रहे हैं?"
        : "I can help you check monuments, verify step-free routes, or find assistance desks. Which place are you visiting next?";
        
      const lower = text.toLowerCase();
      if (lower.includes('route') || lower.includes('मार्ग') || lower.includes('ताजमहल') || lower.includes('taj')) {
        reply = language === 'HI'
          ? "ताजमहल का मुख्य प्रवेश मार्ग 92% सीढ़ी-मुक्त है जिसमें रैंप और समर्पित व्हीलचेयर लेन हैं।"
          : "The Taj Mahal main entrance corridor is 92% step-free with dedicated wheelchair ramps and smooth paved paths.";
      } else if (lower.includes('toilet') || lower.includes('शौचालय') || lower.includes('restroom')) {
        reply = language === 'HI'
          ? "इंडिया Gate के मुख्य प्रवेश द्वार के पास 2 सुलभ शौचालय उपलब्ध हैं।"
          : "There are 2 fully accessible restrooms located near India Gate North Entrance with grab rails and step-free access.";
      } else if (lower.includes('assistance') || lower.includes('सहायता') || lower.includes('desk')) {
        reply = language === 'HI'
          ? "लाल किला (Red Fort) के मुख्य टिकट काउंटर के पास एक सक्रिय यात्रासाथी सहायता डेस्क है।"
          : "Yes! There is an active YatraSaathi Assistance & Guide Matching desk at Red Fort located right beside the main ticket pavilion.";
      }

      const copilotMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'copilot',
        text: reply,
      };

      setMessages(prev => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 800);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const exampleQueries = [
    {
      title: language === 'HI' ? 'मार्गों के बारे में पूछें' : 'Ask about paths',
      query: language === 'HI' ? '"क्या ताजमहल के मार्ग में सीढ़ियां हैं?"' : '"Are there stairs along the path to Taj Mahal?"'
    },
    {
      title: language === 'HI' ? 'शौचालय का पता लगाएं' : 'Locate toilets',
      query: language === 'HI' ? '"इंडिया गेट के पास एक व्हीलचेयर सुलभ शौचालय खोजें।"' : '"Find a wheelchair accessible restroom near India Gate."'
    },
    {
      title: language === 'HI' ? 'सहायता की जाँच करें' : 'Check assistance',
      query: language === 'HI' ? '"क्या लाल किले में गाइड डेस्क उपलब्ध है?"' : '"Is there a guide matching desk at Red Fort?"'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#fcfbfc] dark:bg-[#0c0e17] transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-[1600px] mx-auto w-full">
          
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-slate-900 dark:text-slate-100" />
              {language === 'HI' ? 'यात्रा कोपायलट' : 'Travel Copilot'}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              {language === 'HI' 
                ? 'प्राकृतिक भाषा का उपयोग करके मार्ग नियोजन और पहुंच जांच।' 
                : 'AI-assisted natural language route planning and accessibility checks.'
              }
            </p>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Chat Box (8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[580px] transition-colors">
              
              {/* Header Title inside Card */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {language === 'HI' ? 'यात्रा कोपायलट' : 'Travel Copilot'}
                </h3>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 scrollbar-none">
                {messages.map((msg) => {
                  const isCopilot = msg.sender === 'copilot';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[90%] ${isCopilot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`
                        h-7 w-7 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5
                        ${isCopilot ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-violet-600 text-white'}
                      `}>
                        {isCopilot ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div className={`
                        rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-medium
                        ${isCopilot 
                          ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200' 
                          : 'bg-violet-600 text-white'
                        }
                      `}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 max-w-[90%] mr-auto">
                    <div className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Quick Suggestion Chips */}
              <div className="pt-2 pb-2.5 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800/80">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-300 hover:border-violet-200 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 focus-within:border-violet-500 transition-colors"
              >
                <input 
                  type="text" 
                  placeholder={language === 'HI' ? 'मुझसे कुछ भी पूछें...' : 'Ask me anything...'} 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pl-3 font-medium"
                />
                <button 
                  type="submit"
                  className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors flex items-center justify-center shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Right Column: Voice Copilot + Example Queries (4 cols) */}
            <div className="lg:col-span-4 space-y-5 flex flex-col">
              
              {/* Voice Copilot Card */}
              <div className="bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {language === 'HI' ? 'आवाज कोपायलट' : 'Voice Copilot'}
                </h3>
                
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {language === 'HI' 
                    ? 'हैंड्स-फ्री मार्ग की योजना बनाने या गतिशील रूप से ऑडियो नेविगेशन गाइड प्राप्त करने के लिए ध्वनि कमांड सक्रिय करें।' 
                    : 'Activate voice commands to plan routes hands-free or get audio navigation guides dynamically.'
                  }
                </p>

                <div className="flex justify-center py-2">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`
                      h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105
                      ${micActive 
                        ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100 dark:ring-rose-950/40' 
                        : 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900'
                      }
                    `}
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {micActive 
                    ? (language === 'HI' ? 'सुन रहा हूँ... बोलें' : 'LISTENING... SPEAK NOW') 
                    : (language === 'HI' ? 'ध्वनि सहायक शुरू करने के लिए क्लिक करें' : 'CLICK TO START VOICE COMPANION')
                  }
                </p>
              </div>

              {/* Example Queries Card */}
              <div className="bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-3.5 shadow-sm transition-colors">
                <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                  <span>{language === 'HI' ? 'उदाहरण प्रश्न' : 'EXAMPLE QUERIES'}</span>
                </h4>
                
                <div className="space-y-2.5">
                  {exampleQueries.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSend(item.query.replace(/['"]+/g, ''))}
                      className="bg-slate-50/70 dark:bg-slate-900/50 hover:bg-violet-50 dark:hover:bg-violet-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 font-medium leading-relaxed">
                        {item.query}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
