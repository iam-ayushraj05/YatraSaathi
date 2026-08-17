'use client';

import React, { useState } from 'react';
import { 
  Plane, 
  Hotel, 
  Flag, 
  Package, 
  Search, 
  ArrowLeftRight, 
  ShieldCheck, 
  Ticket, 
  Info,
  ExternalLink,
  ChevronDown,
  Route
} from 'lucide-react';

export default function TravelSearch() {
  const [activeTab, setActiveTab] = useState('accessible_routes');
  const [fromLocation, setFromLocation] = useState('Delhi (DEL)');
  const [toLocation, setToLocation] = useState('Lotus Temple, Delhi');
  const [departDate, setDepartDate] = useState('Today, Aug 17');
  const [returnDate, setReturnDate] = useState('Aug 24, 2024');
  const [travelers, setTravelers] = useState('1 Wheelchair + 1 Asst');

  const tabs = [
    { id: 'accessible_routes', label: 'Accessible Routes', icon: Route },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'tours', label: 'Tours', icon: Flag },
    { id: 'packages', label: 'Packages', icon: Package }
  ];

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  return (
    <section className="rounded-[32px] border border-slate-150/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-6 md:p-8 shadow-sm transition-colors w-full">
      {/* Top Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-150
                ${isActive 
                  ? 'bg-[#5b21b6] text-white shadow-md shadow-violet-200 dark:shadow-none' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Fields Grid */}
      <div className="mt-5 space-y-4">
        {/* Row 1: From, Swap, To, Depart & Return */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* FROM */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 px-4 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              FROM
            </span>
            <input 
              type="text" 
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-900 dark:text-slate-100 focus:outline-none mt-0.5"
            />
          </div>

          {/* SWAP BUTTON */}
          <div className="lg:col-span-1 flex justify-center -my-1 lg:my-0">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap locations"
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-violet-600 hover:border-violet-300 dark:hover:border-violet-600 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </button>
          </div>

          {/* TO */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 px-4 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              TO
            </span>
            <input 
              type="text" 
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-900 dark:text-slate-100 focus:outline-none mt-0.5"
            />
          </div>

          {/* DEPART & RETURN COMBINED */}
          <div className="lg:col-span-3 flex items-center justify-between bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 px-4 shadow-sm divide-x divide-slate-200 dark:divide-slate-700">
            <div className="flex flex-col pr-3">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                DEPART
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 whitespace-nowrap">
                {departDate}
              </span>
            </div>
            <div className="flex flex-col pl-3">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                RETURN
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 whitespace-nowrap">
                {returnDate}
              </span>
            </div>
          </div>

        </div>

        {/* Row 2: Travelers & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Travelers */}
          <div className="w-full sm:w-72 flex items-center justify-between bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 px-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                TRAVELERS
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {travelers}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Search Button */}
          <button 
            type="button"
            className="w-full sm:w-auto bg-[#5b21b6] hover:bg-[#4c1d95] text-white rounded-2xl flex items-center justify-center gap-2.5 py-3.5 px-8 shadow-lg shadow-violet-200 dark:shadow-none hover:shadow-xl transition-all active:scale-[0.98] font-black text-sm"
          >
            <Search className="h-4 w-4 stroke-[3]" />
            <span>Search</span>
          </button>

        </div>
      </div>

      {/* Verification & Partner Badges Bottom Row */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>100% Step-Free Confirmations</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5" />
            </div>
            <span>Zero Booking Fee</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
              <Info className="w-3.5 h-3.5" />
            </div>
            <span>Instant Assistance Guarantee</span>
          </div>
        </div>

        <a 
          href="#partner"
          className="flex items-center gap-1.5 font-black text-violet-700 dark:text-violet-400 hover:underline text-xs"
        >
          <span>Know My Accessibility Partner</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
