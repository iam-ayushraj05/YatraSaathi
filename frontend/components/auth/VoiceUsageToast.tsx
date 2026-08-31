'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function VoiceUsageToast() {
  const { activeToast, hideToast } = useAuth();

  if (!activeToast) return null;

  const isSuccess = activeToast.type === 'success';
  const isWarning = activeToast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slideUp">
      <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-xl flex items-center justify-between gap-3 transition-all ${
        isSuccess
          ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          : isWarning
          ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          : 'bg-white/95 dark:bg-[#121420]/95 border-purple-200/80 dark:border-purple-900/60 text-slate-800 dark:text-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isSuccess
              ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
              : isWarning
              ? 'bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
              : 'bg-purple-100 dark:bg-purple-950/90 text-[#6b21a8] dark:text-purple-300'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isWarning ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>

          <p className="text-xs font-bold leading-tight">
            {activeToast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="w-6 h-6 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
