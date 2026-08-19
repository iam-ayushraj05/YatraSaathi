'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';
import appLogo from '../../public/app-logo.png';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-white dark:bg-[#121420] border-t border-[#cbc3d9]/30 dark:border-slate-800/80 pt-16 pb-10 px-6 lg:px-12 w-full transition-colors">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-5">
            <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group no-underline">
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 drop-shadow-[0_4px_20px_rgba(72,0,178,0.28)]">
                <Image
                  src={appLogo}
                  alt="YatraSaathi Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain filter saturate-[1.08] contrast-[1.05]"
                />
              </div>
              <div className="-ml-1.5">
                <h2 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#9d2b6b] via-[#881337] via-[#6b21a8] to-[#581c87] dark:from-pink-400 dark:via-purple-300 dark:to-purple-400 leading-snug pb-1 transition-colors lowercase tracking-tighter overflow-visible">
                  yatrasaathi
                </h2>
                <p className="text-[10px] text-[#4800b2] dark:text-[#4ffbe6] uppercase opacity-85 leading-none mt-1.5 tracking-[0.22em] font-bold">
                  ACCESSIBLE JOURNEYS
                </p>
              </div>
            </Link>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
              Empowering everyone to explore the world with confidence, dignity, and comfort.
            </p>
            <div className="flex gap-3 pt-1">
              <button 
                title="Website"
                className="w-9 h-9 rounded-full border border-[#cbc3d9]/50 dark:border-slate-700 flex items-center justify-center text-[#494456] dark:text-slate-300 hover:text-white hover:bg-[#4800b2] dark:hover:bg-[#6d23f9] hover:border-transparent transition-all shadow-sm hover:scale-110 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">language</span>
              </button>
              <button 
                title="Share"
                className="w-9 h-9 rounded-full border border-[#cbc3d9]/50 dark:border-slate-700 flex items-center justify-center text-[#494456] dark:text-slate-300 hover:text-white hover:bg-[#4800b2] dark:hover:bg-[#6d23f9] hover:border-transparent transition-all shadow-sm hover:scale-110 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-[#191c20] dark:text-slate-200 mb-5 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/explore">
                  Explore Places
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/plan-route">
                  Plan Route
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/itineraries">
                  Itineraries
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black text-[#191c20] dark:text-slate-200 mb-5 uppercase tracking-widest">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/community">
                  Help Center
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/community">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/reports">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-[#4800b2] dark:hover:text-[#4ffbe6] hover:translate-x-1 inline-block font-medium transition-all" href="/reports">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-black text-[#191c20] dark:text-slate-200 mb-5 uppercase tracking-widest">
              Newsletter
            </h4>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium leading-relaxed">
              Subscribe for travel tips, deals and accessibility updates.
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing to YatraSaathi accessibility updates!");
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input 
                className="flex-1 bg-[#f8f9ff] dark:bg-[#1a1d2e] border border-[#cbc3d9]/40 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#4800b2] dark:focus:border-violet-400 focus:ring-2 focus:ring-[#4800b2]/20 focus:outline-none font-medium transition-all" 
                placeholder="Enter your email" 
                type="email" 
                required 
              />
              <button 
                className="bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-md cursor-pointer shrink-0" 
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#cbc3d9]/30 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-700 dark:text-slate-200 font-bold">
          <p className="font-bold tracking-wide">© 2026 YatraSaathi. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-bold tracking-wide">
            Made with <span className="material-symbols-outlined text-[16px] text-red-500 fill animate-pulse">favorite</span> for accessible travel.
          </p>
        </div>
      </div>
    </footer>
  );
}

