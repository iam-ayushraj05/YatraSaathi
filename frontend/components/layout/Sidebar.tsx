'use client';

import React from 'react';
import Link from 'next/link';
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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { language } = useApp();

  const NAV_ITEMS = [
    { label: language === 'HI' ? 'डैशबोर्ड' : 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: language === 'HI' ? 'स्थान खोजें...' : 'Explore Pl...', href: '/explore', icon: Compass },
    { label: language === 'HI' ? 'मार्ग योजना' : 'Plan Route', href: '/plan-route', icon: Map },
    { label: language === 'HI' ? 'यात्रा विवरण' : 'Itineraries', href: '/itineraries', icon: FileText },
    { label: language === 'HI' ? 'रिपोर्ट' : 'Reports', href: '/reports', icon: TriangleAlert },
    { label: language === 'HI' ? 'समुदाय' : 'Community', href: '/community', icon: Users },
    { label: language === 'HI' ? 'ट्रैवल कोपायलट' : 'Tra...', href: '/copilot', icon: Sparkles, badge: 'NEW' },
    { label: language === 'HI' ? 'सुलभता...' : 'Accessibilit...', href: '/accessibility-profile', icon: Accessibility },
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
          <div className="flex items-center justify-between mb-5 pl-1">
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-2.5 group no-underline"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm shadow-violet-200 group-hover:scale-105 transition-transform shrink-0">
                <Accessibility className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  YatraSaathi
                </span>
                <span className="text-[7.5px] font-black text-violet-600 dark:text-violet-400 tracking-wider uppercase mt-1 leading-none">
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
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300' 
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
