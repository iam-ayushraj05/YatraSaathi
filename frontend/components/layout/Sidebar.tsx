'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Compass, 
  Map, 
  FileText, 
  TriangleAlert, 
  Users, 
  Sparkles, 
  Accessibility, 
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import appLogo from '../../public/app-logo.png';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { language, t } = useApp();

  const NAV_ITEMS = [
    { label: t('dashboard') || 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: t('explore') || 'Explore Places', href: '/explore', icon: Compass },
    { label: t('plan_route') || 'Plan Route', href: '/plan-route', icon: Map },
    { label: t('itineraries') || 'Itineraries', href: '/itineraries', icon: FileText },
    { label: t('reports') || 'Reports', href: '/reports', icon: TriangleAlert },
    { label: t('community') || 'Community', href: '/community', icon: Users },
    { label: t('copilot') || 'YatraMitra AI', href: '/copilot', icon: Sparkles, badge: 'NEW' },
    { label: t('profile') || 'Accessibility Profile', href: '/accessibility-profile', icon: Accessibility },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname === href;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true" 
        />
      )}

      <aside
        role="navigation" 
        aria-label="Main navigation"
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0
          top-0 h-screen w-[260px] shrink-0
          flex flex-col justify-between
          bg-white dark:bg-[#0f111a] border-r border-slate-200/80 dark:border-slate-800/80
          px-4 py-5 z-50 transition-all duration-300 ease-in-out shadow-2xl
        `}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="flex items-center justify-between mb-5 pl-0">
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-1.5 group no-underline"
            >
              <div className="relative w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 drop-shadow-[0_2px_12px_rgba(72,0,178,0.25)]">
                <Image
                  src={appLogo}
                  alt="YatraSaathi Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain filter saturate-[1.08] contrast-[1.05]"
                />
              </div>
              <div className="flex flex-col -ml-1">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-snug pb-1 lowercase bg-clip-text text-transparent bg-gradient-to-r from-[#9d2b6b] via-[#881337] via-[#6b21a8] to-[#581c87] dark:from-pink-400 dark:via-purple-300 dark:to-purple-400 overflow-visible">
                  yatrasaathi
                </span>
                <span className="text-[8px] font-black text-violet-600 dark:text-violet-400 tracking-wider uppercase mt-1 leading-none">
                  ACCESSIBLE JOURNEYS FOR ALL
                </span>
              </div>
            </Link>
            
            <button 
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600" 
              onClick={() => setIsOpen(false)} 
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-150
                    ${active 
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-[#6B21A8] dark:text-purple-300 font-extrabold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-violet-600 text-white text-[8px] font-extrabold uppercase tracking-wider scale-90">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promo Card */}
        <div className="pt-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/50 dark:from-violet-950/30 dark:to-slate-900 border border-violet-100/80 dark:border-violet-900/30 p-3.5 space-y-2">
            <h5 className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-tight">
              {language === 'HI' ? 'सुलभ यात्राएं योजना' : 'Plan Accessible Trips'}
            </h5>
            <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {language === 'HI' 
                ? 'सीढ़ी-मुक्त मार्ग, सुलभ स्थान, सहायता और बहुत कुछ खोजें।' 
                : 'Find step-free routes, accessible places, assistance and more.'
              }
            </p>
            <div className="flex items-center justify-between pt-1">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                N
              </div>
              <Link
                href="/plan-route"
                className="px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-extrabold transition-all shadow-sm shadow-violet-200 inline-flex items-center gap-1"
              >
                <span>{language === 'HI' ? 'अभी खोजें' : 'Explore Now'}</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
