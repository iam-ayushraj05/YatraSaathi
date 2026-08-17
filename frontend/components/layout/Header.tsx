'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import SosHelpModal from '../sos/SosHelpModal';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, language, setLanguage } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [user, setUser] = useState<{ display_name: string; email: string } | null>(null);

  useEffect(() => {
    api.auth.getMe()
      .then(d => setUser({ display_name: d.display_name, email: d.email }))
      .catch(() => setUser({ display_name: 'Aarav Sharma', email: 'aarav@yatrasaathi.in' }));
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    router.push('/');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore', href: '/explore' },
    { label: 'Plan Route', href: '/plan-route' },
    { label: 'Itineraries', href: '/itineraries' },
    { label: 'Community', href: '/community' },
  ];

  return (
    <>
      <header className="flex items-center justify-between w-full px-4 lg:px-8 py-3 glass-panel sticky top-0 z-50 shadow-sm transition-all duration-300 border-b border-[#cbc3d9]/20 bg-white/90 dark:bg-[#121420]/90 backdrop-blur-xl gap-3">
        {/* Left: Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group no-underline shrink-0">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shrink-0">
            <span className="material-symbols-outlined fill text-2xl">accessibility_new</span>
          </div>
          <div className="shrink-0">
            <h1 className="text-xl lg:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] dark:from-[#cfbdff] dark:via-[#b084ff] dark:to-[#4ffbe6] leading-none transition-colors duration-300">
              YatraSaathi
            </h1>
            <p className="text-[9px] text-[#4800b2] dark:text-[#4ffbe6] uppercase opacity-80 leading-none mt-1 tracking-[0.18em] font-bold">
              Accessible Journeys
            </p>
          </div>
        </Link>

        {/* Center: Pill Navigation (Clean single line, shifted slightly left) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 bg-white/70 dark:bg-black/40 px-5 xl:px-6 py-2 rounded-full border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-xl shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-bold transition-all relative whitespace-nowrap px-1 ${
                  isActive
                    ? 'text-[#4800b2] dark:text-[#4ffbe6] after:content-[\'\'] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-[#4800b2] dark:after:bg-[#4ffbe6] after:rounded-full'
                    : 'text-[#494456] dark:text-slate-300 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] nav-link'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Travel Copilot Button */}
          <Link
            href="/copilot"
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] hover:opacity-90 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">smart_toy</span>
            <span className="hidden sm:inline">Travel Copilot</span>
          </Link>

          {/* SOS Help Button (Triggers Comprehensive SOS Modal) */}
          <button 
            onClick={() => setSosOpen(true)}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg sos-pulse transition-all hover:scale-105 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined fill text-base">emergency</span>
            <span className="hidden sm:inline">SOS Help</span>
          </button>

          {/* Notification Bell */}
          <button className="w-9 h-9 rounded-full hover:bg-[#e7e8ee] dark:hover:bg-slate-800 flex items-center justify-center text-[#494456] dark:text-slate-200 transition-colors bg-white dark:bg-slate-900 shadow-sm border border-[#cbc3d9]/30 dark:border-slate-700 hidden sm:flex hover:scale-105 cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-lg">notifications</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative hidden md:block shrink-0">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#e7e8ee] dark:hover:bg-slate-800 text-[#494456] dark:text-slate-200 transition-colors bg-white dark:bg-slate-900 shadow-sm border border-[#cbc3d9]/30 dark:border-slate-700 hover:scale-105 cursor-pointer text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-base">translate</span>
              <span>{language}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-11 w-36 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl z-50">
                <button 
                  onClick={() => { setLanguage('EN'); setLangOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${language === 'EN' ? 'bg-[#4800b2]/10 text-[#4800b2] dark:text-[#4ffbe6] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span>English (EN)</span>
                  {language === 'EN' && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
                <button 
                  onClick={() => { setLanguage('HI'); setLangOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${language === 'HI' ? 'bg-[#4800b2]/10 text-[#4800b2] dark:text-[#4ffbe6] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span>हिन्दी (HI)</span>
                  {language === 'HI' && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile (Aarav Sharma in 2 lines) */}
          <div className="relative shrink-0">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 border-l border-[#cbc3d9]/50 dark:border-slate-700 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a0b5c] to-[#4800b2] text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-white dark:ring-slate-800 transition-transform duration-300 group-hover:scale-110 shrink-0">
                A
              </div>
              <div className="text-left hidden sm:flex flex-col leading-none select-none">
                <span className="text-[11px] font-black text-[#191c20] dark:text-slate-100 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors leading-tight">
                  Aarav
                </span>
                <span className="text-[11px] font-black text-[#191c20] dark:text-slate-100 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors leading-tight">
                  Sharma
                </span>
              </div>
              <span className="material-symbols-outlined text-[#494456] dark:text-slate-400 hidden sm:block group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors text-sm">
                expand_more
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-[#cbc3d9]/30 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-[#191c20] dark:text-slate-100">Aarav Sharma</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email || 'aarav@yatrasaathi.in'}</p>
                </div>
                <Link 
                  href="/accessibility-profile"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Accessibility Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle Button (Beside Aarav Sharma Profile) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-full hover:bg-[#e7e8ee] dark:hover:bg-slate-800 flex items-center justify-center text-[#4800b2] dark:text-[#4ffbe6] transition-all bg-white dark:bg-slate-900 shadow-sm border border-[#cbc3d9]/40 dark:border-slate-700 hover:scale-110 cursor-pointer shrink-0 ml-0.5"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* SOS Emergency Assistance Modal */}
      <SosHelpModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}




