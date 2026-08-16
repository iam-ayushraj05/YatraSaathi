'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { 
  Compass, 
  MapPin, 
  Map, 
  BookOpen, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  User, 
  X,
  Accessibility
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useApp();

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: Compass },
    { name: t('explore'), href: '/explore', icon: MapPin },
    { name: t('plan_route'), href: '/plan-route', icon: Map },
    { name: t('itineraries'), href: '/itineraries', icon: BookOpen },
    { name: t('reports'), href: '/reports', icon: AlertTriangle },
    { name: t('community'), href: '/community', icon: Users },
    { name: t('copilot'), href: '/copilot', icon: Sparkles, badge: 'NEW' },
    { name: t('profile'), href: '/accessibility-profile', icon: User },
  ];

  const activeClass = "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-750 dark:text-violet-300 font-semibold text-xs transition-all duration-150";
  const inactiveClass = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-xs transition-all duration-150";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-[165px] flex-col border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shrink-0 overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Logo */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-605 text-white bg-violet-600 shadow-md shadow-violet-200 dark:shadow-none shrink-0">
              <Accessibility className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 block truncate">YatraSaathi</span>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-[9px] font-bold text-violet-600 dark:text-violet-400 tracking-wide uppercase px-0.5 leading-none">
          {t('tagline')}
        </p>

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={isActive ? activeClass : inactiveClass}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className="rounded bg-violet-600 dark:bg-violet-500 px-1 py-0.2 text-[8px] font-extrabold tracking-wider text-white uppercase ml-auto scale-90 shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Promotional Card */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/50 dark:border-violet-900/30 p-3 text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-[11px] text-violet-900 dark:text-violet-300 leading-tight">{t('plan_trips')}</h4>
            <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400 leading-normal">
              {t('plan_desc')}
            </p>
            <Link 
              href="/plan-route"
              className="mt-2.5 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-605 dark:hover:bg-violet-700 px-3 py-1.5 text-[9px] font-bold text-white transition-colors shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              {t('explore_now')}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
