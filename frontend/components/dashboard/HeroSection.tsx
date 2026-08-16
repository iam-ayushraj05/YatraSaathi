'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const HERO_BG = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80';

const DEST_CARDS = [
  {
    key: 'india',
    landmark_key: 'taj_mahal',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&h=220&q=80',
  },
  {
    key: 'france',
    landmark_key: 'eiffel_tower',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&h=220&q=80',
  },
  {
    key: 'turkey',
    landmark_key: 'cappadocia',
    image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=300&h=220&q=80',
  }
];

export default function HeroSection() {
  const { t } = useApp();

  return (
    <section className="relative w-full rounded-2xl overflow-hidden text-white" style={{ minHeight: '280px', maxHeight: '320px' }}>
      {/* Background image */}
      <img 
        src={HERO_BG} 
        alt="Travel landscape" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Deep purple gradient overlay — strong on left, fading right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a0533]/95 via-[#2e1065]/85 to-violet-700/40" />

      <div className="relative z-10 flex items-center justify-between h-full px-6 md:px-8 py-6 gap-4" style={{ minHeight: '280px' }}>
        {/* Left text block */}
        <div className="max-w-sm space-y-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/25 border border-pink-400/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-pink-200">
            <Sparkles className="h-3 w-3 animate-pulse" />
            {t('explore_world')}
          </span>

          <h1 className="text-[28px] md:text-[32px] font-black tracking-tight leading-[1.1] uppercase">
            EXPLORE<br />
            BEAUTIFUL WORLD<br />
            WITH US
          </h1>

          <p className="text-[11px] text-purple-200/90 font-medium leading-relaxed max-w-xs">
            {t('hero_desc')}
          </p>

          <Link 
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[11px] font-bold text-violet-700 hover:bg-violet-50 transition-all shadow-md active:scale-[0.98]"
          >
            <span>{t('discover_now')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Right destination cards — float across the hero */}
        <div className="hidden md:flex items-stretch gap-3 h-[200px]">
          {DEST_CARDS.map((dest) => (
            <div 
              key={dest.key}
              className="w-[140px] rounded-xl overflow-hidden relative border border-white/20 shadow-lg flex flex-col justify-end p-3 group cursor-pointer hover:scale-[1.03] transition-transform duration-200"
            >
              <img 
                src={dest.image} 
                alt={t(dest.key)} 
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="relative z-10 text-[10px] leading-tight">
                <span className="font-extrabold text-pink-300 uppercase block tracking-wider">{t(dest.key)}</span>
                <span className="font-bold text-white block mt-0.5 truncate">{t(dest.landmark_key)}</span>
              </div>
            </div>
          ))}

          {/* Explore More card */}
          <Link 
            href="/explore"
            className="w-[100px] rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 flex flex-col items-center justify-center text-center transition-all duration-200 text-white shadow-lg"
          >
            <span className="text-[11px] font-extrabold tracking-wide">{t('explore_more')}</span>
            <ArrowRight className="h-4 w-4 mt-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
