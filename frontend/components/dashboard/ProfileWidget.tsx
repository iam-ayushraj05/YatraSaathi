'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Sparkles,
  SlidersHorizontal as Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProfileWidget() {
  const { language } = useApp();
  const [stepFree, setStepFree] = useState(true);
  const [toiletsFilter, setToiletsFilter] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <Sliders className="h-4 w-4 text-violet-700 dark:text-violet-400" />
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
          Quick Toggles
        </h3>
      </div>

      {/* Toggle 1: Requires Step-Free Path */}
      <div className="flex items-center justify-between py-0.5">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Requires Step-Free Path
        </span>
        <button 
          type="button" 
          onClick={() => setStepFree(!stepFree)}
          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 flex items-center ${stepFree ? 'bg-violet-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:border-slate-800" />

      {/* Toggle 2: Accessible Toilets Filter */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'HI' ? 'सुलभ शौचालय फ़िल्टर' : 'Accessible Toilets Filter'}
          </span>
        </div>
        <button 
          type="button" 
          onClick={() => setToiletsFilter(!toiletsFilter)}
          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 flex items-center ${toiletsFilter ? 'bg-violet-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      {/* Bottom helper text */}
      <div className="rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 p-3 border border-violet-100/60 dark:border-violet-900/30 flex gap-2 items-start">
        <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {language === 'HI' 
            ? 'ये सेटिंग्स स्वचालित रूप से सभी मार्ग खोज एल्गोरिदम को अनुकूलित करती हैं और संभावित बाधाओं की चेतावनियों को उजागर करती हैं।' 
            : 'These settings automatically customize all routing search algorithms and highlight potential barrier warnings'
          }
        </p>
      </div>
    </div>
  );
}
