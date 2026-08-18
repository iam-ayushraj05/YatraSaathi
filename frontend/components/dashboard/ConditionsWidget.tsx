'use client';

import React from 'react';
import { 
  Sun, 
  Users, 
  Wind,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ConditionsWidget() {
  const { language } = useApp();

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm space-y-4 transition-colors">
      {/* Header matching exact user image */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
          Today's Conditions
        </h3>
        <button className="text-[10px] font-black text-purple-700 dark:text-purple-400 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Weather Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100/80 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weather</p>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">32°C</p>
              <p className="text-[10px] text-slate-500 font-semibold">Sunny</p>
            </div>
          </div>
        </div>

        {/* Crowd Level Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crowd Level</p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Low</p>
              <p className="text-[10px] text-slate-500 font-semibold">Right now</p>
            </div>
          </div>
        </div>

        {/* Air Quality Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Air Quality</p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Good</p>
              <p className="text-[10px] text-slate-500 font-semibold">AQI 42</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
