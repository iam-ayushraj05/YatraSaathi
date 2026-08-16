'use client';

import React, { useState } from 'react';
import { Plane, Hotel, Navigation, Package, Search, Calendar, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TravelSearch() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState('flights');

  const tabs = [
    { id: 'flights', label: t('flights'), icon: Plane },
    { id: 'hotels', label: t('hotels'), icon: Hotel },
    { id: 'tours', label: t('tours'), icon: Navigation },
    { id: 'packages', label: t('packages'), icon: Package }
  ];

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 shadow-sm transition-colors">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                ${isActive 
                  ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Fields Row */}
      <div className="mt-4 flex flex-wrap lg:flex-nowrap gap-3 items-end">
        {/* From */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 flex-1 min-w-[120px]">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('from')}</span>
          <input 
            type="text" 
            defaultValue="New York (JFK)" 
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
          />
        </div>

        {/* To */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 flex-1 min-w-[120px]">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('to')}</span>
          <input 
            type="text" 
            placeholder="Where to?" 
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
          />
        </div>

        {/* Depart */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 flex-1 min-w-[120px]">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {t('depart')}
          </span>
          <input 
            type="text" 
            defaultValue="May 20, 2024" 
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
          />
        </div>

        {/* Return */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 flex-1 min-w-[120px]">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {t('return_date')}
          </span>
          <input 
            type="text" 
            defaultValue="May 27, 2024" 
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
          />
        </div>

        {/* Travelers */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 flex-1 min-w-[120px]">
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="h-2.5 w-2.5" />
            {t('travelers')}
          </span>
          <input 
            type="text" 
            defaultValue="2 Adults, 1 Child" 
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5 truncate"
          />
        </div>

        {/* Search Button */}
        <button 
          type="button"
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center justify-center gap-1.5 px-5 py-3 shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0 font-bold text-xs"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </section>
  );
}
