'use client';

import React from 'react';
import { 
  Sun, 
  Users, 
  Wind, 
  Radio,
  RotateCw
} from 'lucide-react';

export default function ConditionsWidget() {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <Radio className="h-4 w-4 text-violet-700 dark:text-violet-400" />
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
          Today&apos;s Conditions
        </h3>
      </div>

      <div className="space-y-3">
        {/* Weather Row */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                WEATHER
              </p>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                Sunny
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-slate-900 dark:text-slate-100">
              32°C
            </p>
          </div>
        </div>

        {/* Crowd Row */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-sky-50 dark:bg-sky-950/30 text-sky-500 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                CROWD LEVEL
              </p>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                Right now
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg border uppercase text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
              LOW CROWD
            </span>
          </div>
        </div>

        {/* Air Quality Row */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-500 flex items-center justify-center shrink-0">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                AIR QUALITY
              </p>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                Moderate
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2 justify-end">
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 block uppercase">AQI</span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100">68</span>
            </div>
            <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg border uppercase text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
              GOOD
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info Pill */}
      <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <RotateCw className="h-3 w-3 text-slate-400" />
        <span>UPDATED IN REAL-TIME</span>
      </div>
    </div>
  );
}
