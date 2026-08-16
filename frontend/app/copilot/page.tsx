'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  HelpCircle
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import CopilotWidget from '../../components/dashboard/CopilotWidget';

export default function CopilotPage() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const tips = [
    { 
      title: language === 'HI' ? 'मार्गों के बारे में पूछें' : 'Ask about paths', 
      desc: language === 'HI' ? '"क्या ताजमहल के मार्ग में सीढ़ियां हैं?"' : '"Are there stairs along the path to Taj Mahal?"' 
    },
    { 
      title: language === 'HI' ? 'शौचालय का पता लगाएं' : 'Locate toilets', 
      desc: language === 'HI' ? '"इंडिया गेट के पास एक व्हीलचेयर सुलभ शौचालय खोजें।"' : '"Find a wheelchair accessible restroom near India Gate."' 
    },
    { 
      title: language === 'HI' ? 'सहायता की जाँच करें' : 'Check assistance', 
      desc: language === 'HI' ? '"क्या लाल किले में गाइड डेस्क उपलब्ध है?"' : '"Is there a guide matching desk at Red Fort?"' 
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-650 dark:text-violet-400 animate-pulse" />
              {t('copilot')}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              {language === 'HI' 
                ? 'प्राकृतिक भाषा का उपयोग करके मार्ग नियोजन और पहुंच जांच।' 
                : 'AI-assisted natural language route planning and accessibility checks.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Chat Panel (8 cols) */}
            <div className="lg:col-span-8">
              <CopilotWidget />
            </div>

            {/* Voice Control & Suggestions (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Voice recognition SOS/Mic panel */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm text-center space-y-4 transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {language === 'HI' ? 'आवाज कोपायलट' : 'Voice Copilot'}
                </h3>
                
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {language === 'HI' 
                    ? 'हैंड्स-फ्री मार्ग की योजना बनाने या गतिशील रूप से ऑडियो नेविगेशन गाइड प्राप्त करने के लिए ध्वनि कमांड सक्रिय करें।' 
                    : 'Activate voice commands to plan routes hands-free or get audio navigation guides dynamically.'
                  }
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`
                      h-16 w-16 rounded-full flex items-center justify-center transition-all duration-150 shadow-md
                      ${micActive 
                        ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100 dark:ring-rose-950/40' 
                        : 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900'
                      }
                    `}
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {micActive 
                    ? (language === 'HI' ? 'सुन रहा हूँ... बोलें' : 'Listening... Speak now') 
                    : (language === 'HI' ? 'ध्वनि सहायक शुरू करने के लिए क्लिक करें' : 'Click to start voice companion')
                  }
                </p>
              </div>

              {/* Suggestions list */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm space-y-4 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-violet-650 dark:text-violet-400" />
                  {language === 'HI' ? 'उदाहरण प्रश्न' : 'Example Queries'}
                </h4>
                
                <div className="space-y-3.5">
                  {tips.map((tip, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
                      <h5 className="font-bold text-xs text-slate-850 dark:text-slate-200">{tip.title}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 italic mt-1 leading-relaxed">
                        {tip.desc}
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
