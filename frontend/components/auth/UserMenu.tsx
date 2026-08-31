'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  MapPin, 
  Bookmark, 
  Accessibility, 
  Award, 
  Clock, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function UserMenu() {
  const { user, isAuthenticated, openAuthModal, openLogoutModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal('login', 'header_button')}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#6b21a8] to-[#581c87] hover:from-[#7c2d12] hover:to-[#6b21a8] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const initials = user.display_name
    ? user.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'YS';

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: User },
    { label: 'My Journeys', href: '/itineraries', icon: MapPin },
    { label: 'Saved Places', href: '/explore', icon: Bookmark },
    { label: 'Accessibility Profile', href: '/accessibility-profile', icon: Accessibility },
    { label: 'YatraPoints Rewards', href: '/rewards', icon: Award, badge: `${user.points || 350} pts` },
    { label: 'Travel History', href: '/dashboard', icon: Clock },
    { label: 'Account Settings', href: '/accessibility-profile', icon: Settings },
  ];

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6b21a8] to-[#881337] text-white text-xs font-black flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <span className="hidden sm:inline-block text-xs font-black text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
          {user.first_name || user.display_name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-[#121420]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-2.5 shadow-2xl z-50 animate-scaleUp space-y-1">
          {/* User Info Header */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/40 dark:to-slate-900/60 border border-purple-100 dark:border-purple-900/40 mb-1">
            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
              {user.display_name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6b21a8]/10 dark:bg-purple-900/50 text-[#6b21a8] dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{user.points || 350} YatraPoints</span>
            </div>
          </div>

          {/* Menu Links */}
          <div className="space-y-0.5">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#6b21a8] dark:hover:text-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#6b21a8]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-black text-[#6b21a8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openLogoutModal();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
