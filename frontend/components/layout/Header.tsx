'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { 
  Sun, 
  Moon, 
  Globe, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { api } from '../../lib/api';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme, language, setLanguage, t } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<{ display_name: string; email: string } | null>(null);

  useEffect(() => {
    api.auth.getMe()
      .then((data) => {
        setUser({ display_name: data.display_name, email: data.email });
      })
      .catch(() => {
        setUser({ display_name: 'Aarav', email: 'aarav.wheelchair@demo.yatrasaathi.in' });
      });
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    router.push('/');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[52px] w-full items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-[#0b0a0f]/95 px-4 shadow-sm backdrop-blur-md shrink-0 transition-colors">
      {/* Left Menu Button (Mobile) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-[10px] px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <Globe className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            <span>{language}</span>
            <ChevronDown className="h-2.5 w-2.5" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1 w-24 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg z-50">
              <button 
                onClick={() => { setLanguage('EN'); setLangOpen(false); }}
                className={`flex w-full items-center rounded px-2 py-1 text-left text-[10px] font-bold transition-all ${language === 'EN' ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                English (EN)
              </button>
              <button 
                onClick={() => { setLanguage('HI'); setLangOpen(false); }}
                className={`flex w-full items-center rounded px-2 py-1 text-left text-[10px] font-bold transition-all ${language === 'HI' ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                हिन्दी (HI)
              </button>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 p-1 rounded-lg transition-all"
          >
            <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xs">
              {user ? user.display_name.charAt(0) : 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">{user?.display_name || 'Aarav'}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg z-50">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{user?.display_name || 'Aarav'}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <button 
                onClick={() => { setProfileOpen(false); router.push('/accessibility-profile'); }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all font-medium"
              >
                Profile Settings
              </button>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all font-bold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
