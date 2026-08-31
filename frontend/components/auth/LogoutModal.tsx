'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, X } from 'lucide-react';

export default function LogoutModal() {
  const { logoutModalOpen, closeLogoutModal, confirmLogout, isLoading } = useAuth();

  if (!logoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <button
          type="button"
          onClick={closeLogoutModal}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 id="logout-title" className="text-lg font-black text-slate-900 dark:text-white">
              Log out of YatraSaathi?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              You&apos;ll need to sign in again to access your saved journeys and personalized travel experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeLogoutModal}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmLogout}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Log Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
