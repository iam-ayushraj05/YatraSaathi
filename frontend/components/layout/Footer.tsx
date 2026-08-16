'use client';

import React from 'react';
import Link from 'next/link';
import { Accessibility, Heart, Globe, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useApp();

  const quickLinks = [
    { name: t('dashboard'), href: '/dashboard' },
    { name: t('explore'), href: '/explore' },
    { name: t('plan_route'), href: '/plan-route' },
    { name: t('itineraries'), href: '/itineraries' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'Terms & Conditions', href: '#' },
    { name: 'Privacy Policy', href: '#' },
  ];

  return (
    <footer className="w-full bg-white dark:bg-[#0b0a0f] border-t border-slate-100 dark:border-slate-800 py-10 px-6 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Branding & Description */}
        <div className="space-y-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-md">
              <Accessibility className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">YatraSaathi</span>
              <span className="block text-[8px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{t('tagline')}</span>
            </div>
          </Link>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
            {t('footer_desc')}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a href="#" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-500 transition-all" aria-label="Website">
              <Globe className="h-3.5 w-3.5" />
            </a>
            <a href="#" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-500 transition-all" aria-label="Share">
              <Share2 className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase mb-3">{t('quick_links')}</h5>
          <ul className="space-y-2 text-[11px]">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase mb-3">{t('support')}</h5>
          <ul className="space-y-2 text-[11px]">
            {supportLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h5 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase mb-3">{t('newsletter')}</h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('newsletter_desc')}
          </p>
          <form className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-violet-500"
            />
            <button 
              type="submit" 
              className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all hover:shadow-md"
            >
              {t('subscribe')}
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 gap-3">
        <p>&copy; {new Date().getFullYear()} YatraSaathi. {t('rights')}</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for accessible travel.
        </p>
      </div>
    </footer>
  );
}
