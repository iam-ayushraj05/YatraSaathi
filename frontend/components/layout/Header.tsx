'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import SosHelpModal from '../sos/SosHelpModal';
import appLogo from '../../public/app-logo.png';
import brandText from '../../public/brand-text.png';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, language, setLanguage, t } = useApp();
  const { user, isAuthenticated, openAuthModal, openLogoutModal } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  const langContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Elevator Maintenance Alert',
      message: 'Lift #2 at Rajiv Chowk Metro is under repair. Alternate step-free ramp activated.',
      time: '5m ago',
      type: 'warning',
      unread: true,
      icon: 'warning'
    },
    {
      id: '2',
      title: 'Barrier Verification (+50 Points)',
      message: 'Your photo report of broken curb ramp near India Gate was verified by 3 community auditors.',
      time: '25m ago',
      type: 'success',
      unread: true,
      icon: 'verified'
    },
    {
      id: '3',
      title: 'Rain & Wet Surface Advisory',
      message: 'Light showers in Central Delhi. Step-free low-traction route mode suggested.',
      time: '1h ago',
      type: 'info',
      unread: true,
      icon: 'thunderstorm'
    },
    {
      id: '4',
      title: 'YatraMitra AI Reroute Saved',
      message: 'Saved 12 minutes on your wheelchair path by avoiding construction near Red Fort.',
      time: '3h ago',
      type: 'ai',
      unread: false,
      icon: 'smart_toy'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    router.push('/');
  };

  const navLinks = [
    { key: 'dashboard', defaultLabel: 'Dashboard', href: '/dashboard' },
    { key: 'explore', defaultLabel: 'Explore', href: '/explore' },
    { key: 'plan_route', defaultLabel: 'Plan Route', href: '/plan-route' },
    { key: 'itineraries', defaultLabel: 'Itineraries', href: '/itineraries' },
    { key: 'reports', defaultLabel: 'Reports', href: '/reports' },
    { key: 'community', defaultLabel: 'Community', href: '/community' },
  ];

  return (
    <>
      <header className="flex items-center justify-between w-full px-3 md:px-5 lg:px-6 py-2 glass-panel sticky top-0 z-50 shadow-xs transition-all duration-300 border-b border-[#cbc3d9]/20 bg-white/95 dark:bg-[#121420]/95 backdrop-blur-xl gap-2 xl:gap-3">
        {/* Left: Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group no-underline shrink-0">
          <div className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0 drop-shadow-[0_4px_12px_rgba(107,33,168,0.15)]">
            <Image
              src={appLogo}
              alt="yatrasaathi Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col -ml-0.5 select-none">
            <div className="text-xl lg:text-2xl font-black tracking-tight leading-none">
              <span className="text-slate-900 dark:text-white transition-colors">yatra</span>
              <span className="bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">saathi</span>
            </div>
            <p className="text-[7.5px] lg:text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mt-1 leading-none">
              YOUR DESTINATION. YOUR NEEDS. YOUR JOURNEY.
            </p>
          </div>
        </Link>

        {/* Center: Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 bg-white/70 dark:bg-black/40 px-4 xl:px-5 py-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-xs backdrop-blur-xl shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-[13px] font-bold transition-all relative whitespace-nowrap px-0.5 ${
                  isActive
                    ? 'text-[#6b21a8] dark:text-purple-400 after:content-[\'\'] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-[#6b21a8] dark:after:bg-purple-400 after:rounded-full'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#6b21a8] dark:hover:text-purple-400 nav-link'
                }`}
              >
                {/* Floating "Earn Points ⭐" badge on top of Reports link */}
                {link.key === 'reports' && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-[7.5px] font-black px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5 whitespace-nowrap border border-white/60 animate-pulse">
                    Earn Points ⭐
                  </span>
                )}
                {t(link.key) || link.defaultLabel}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-2.5 shrink-0 pr-1">
          {/* YatraMitra AI Button */}
          <Link
            href="/copilot"
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#6b21a8] via-[#7e22ce] to-[#6b21a8] hover:brightness-110 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm hover:scale-103 transition-all shrink-0 cursor-pointer whitespace-nowrap border border-white/20"
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4 text-white shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="11" y="2" width="10" height="5" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <rect x="3" y="6" width="26" height="23" rx="5" fill="currentColor" />
              <circle cx="11.5" cy="15" r="2.2" fill="#6b21a8" />
              <circle cx="10.8" cy="14.2" r="0.8" fill="white" />
              <circle cx="20.5" cy="15" r="2.2" fill="#6b21a8" />
              <circle cx="19.8" cy="14.2" r="0.8" fill="white" />
              <path d="M12 20.5C13.5 22.8 18.5 22.8 20 20.5" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-bold tracking-tight">YatraMitra AI</span>
          </Link>

          {/* SOS Help Button */}
          <button 
            onClick={() => setSosOpen(true)}
            className="flex items-center gap-1 bg-[#ef4444] hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm sos-pulse transition-all hover:scale-103 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined fill text-sm">emergency</span>
            <span className="hidden sm:inline">SOS Help</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div ref={notifContainerRef} className="relative shrink-0">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-8.5 h-8.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-700 hidden sm:flex hover:scale-105 cursor-pointer relative shrink-0"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-base">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ef4444] text-white text-[8.5px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        n.unread 
                          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50' 
                          : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'warning' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300' :
                        n.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300' :
                        n.type === 'ai' ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300' :
                        'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                      }`}>
                        <span className="material-symbols-outlined text-sm">{n.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{n.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div ref={langContainerRef} className="relative hidden md:block shrink-0">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 transition-colors bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-700 hover:scale-105 cursor-pointer text-xs font-bold"
            >
              <span>{language}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar">
                {[
                  { code: 'EN', native: 'English', label: 'English' },
                  { code: 'HI', native: 'हिन्दी', label: 'Hindi' },
                  { code: 'BN', native: 'বাংলা', label: 'Bengali' },
                  { code: 'OR', native: 'ଓଡ଼ିଆ', label: 'Odia' },
                  { code: 'TA', native: 'தமிழ்', label: 'Tamil' },
                  { code: 'TE', native: 'తెలుగు', label: 'Telugu' },
                  { code: 'MR', native: 'मराठी', label: 'Marathi' },
                  { code: 'GU', native: 'ગુજરાતી', label: 'Gujarati' }
                ].map((item) => {
                  const isActive = language === item.code;
                  return (
                    <button 
                      key={item.code}
                      onClick={() => { setLanguage(item.code as any); setLangOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive 
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300 font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.native}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({item.code})</span>
                      </div>
                      {isActive && <span className="material-symbols-outlined text-sm text-[#6b21a8] dark:text-purple-400">check</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile */}
          {/* User Profile / Sign In */}
          {!isAuthenticated ? (
            <button 
              onClick={() => openAuthModal('login', 'header_button')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6b21a8] to-[#581c87] hover:opacity-95 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Sign In</span>
            </button>
          ) : (
            <div ref={profileContainerRef} className="relative shrink-0">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700 cursor-pointer group"
              >
                <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-[#581c87] to-[#6b21a8] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white dark:ring-slate-800 transition-transform duration-300 group-hover:scale-105 shrink-0">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'Y'}
                </div>
                <div className="text-left hidden sm:flex flex-col leading-none select-none">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#6b21a8] dark:group-hover:text-purple-400 transition-colors leading-tight">
                    {user?.first_name || user?.display_name?.split(' ')[0] || 'Aarav'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#6b21a8] dark:group-hover:text-purple-400 transition-colors leading-tight">
                    {user?.last_name || user?.display_name?.split(' ')[1] || 'Sharma'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-400 hidden sm:block group-hover:text-[#6b21a8] dark:group-hover:text-purple-400 transition-colors text-sm">
                  expand_more
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-scaleUp">
                  <div className="px-3 py-2 border-b border-[#cbc3d9]/30 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-[#191c20] dark:text-slate-100 truncate">{user?.display_name || 'Aarav Sharma'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email || 'aarav@yatrasaathi.in'}</p>
                    
                    {/* Loyalty Rewards Centre Banner / Link */}
                    <Link
                      href="/rewards"
                      onClick={() => setProfileOpen(false)}
                      className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 hover:scale-102 transition-transform cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-amber-500 fill">workspace_premium</span>
                        <div>
                          <p className="text-[10.5px] font-black leading-none">Loyalty Rewards</p>
                          <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">{user?.points || 350} YatraPoints</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 shrink-0">
                        Lvl 2 ⭐
                      </span>
                    </Link>
                  </div>
                  <Link 
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-purple-600">dashboard</span>
                    Dashboard
                  </Link>
                  <Link 
                    href="/itineraries"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-blue-500">route</span>
                    My Journeys
                  </Link>
                  <Link 
                    href="/rewards"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-amber-500">card_giftcard</span>
                    Loyalty Rewards
                  </Link>
                  <Link 
                    href="/reports"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-rose-500">report_problem</span>
                    Report Barrier
                  </Link>
                  <Link 
                    href="/accessibility-profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-purple-600">person</span>
                    Accessibility Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      openLogoutModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8.5 h-8.5 rounded-full hover:bg-[#e7e8ee] dark:hover:bg-slate-800 flex items-center justify-center text-[#4800b2] dark:text-[#4ffbe6] transition-all bg-white dark:bg-slate-900 shadow-xs border border-[#cbc3d9]/40 dark:border-slate-700 hover:scale-105 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">
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




