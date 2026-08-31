'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SessionExpiredModal() {
  const { sessionExpiredModalOpen, closeSessionExpiredModal, openAuthModal } = useAuth();

  if (!sessionExpiredModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Your session has expired
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Please sign in again to continue your journey and access your saved itineraries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/"
            onClick={closeSessionExpiredModal}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Return Home
          </Link>

          <button
            type="button"
            onClick={() => {
              closeSessionExpiredModal();
              openAuthModal('login', 'session_expired');
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#6b21a8] hover:bg-[#581c87] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Sign In Again</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
