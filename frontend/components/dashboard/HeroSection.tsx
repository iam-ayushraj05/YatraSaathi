'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Compass, Accessibility } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full rounded-[40px] overflow-hidden text-white shadow-2xl bg-[#120a22] min-h-[500px] flex items-center">
      {/* Background Image: Panoramic mountains, blue lake, and lone hiker in red jacket */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_top]"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=95')` 
        }}
      />
      {/* Dark violet gradient across left half for crisp text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#170a2c]/95 via-[#230e42]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e061c]/80 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-8 md:px-14 py-12 md:py-16 gap-10">
        
        {/* Left Column Content */}
        <div className="max-w-xl space-y-6 shrink-0 text-left">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-[10.5px] font-black uppercase tracking-widest text-[#4ade80] shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>HODOPHILE&apos;S ACCESSIBLE JOURNEY</span>
          </div>

          {/* Large Bold Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.05] uppercase text-white font-sans">
            YOUR DESTINATION,<br />
            YOUR NEEDS.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b084ff] via-[#d0a7ff] to-[#4ffbe6]">
              THE JOURNEY TAILORED FOR YOU
            </span>
          </h1>

          {/* Subtitle Quote */}
          <p className="text-xs md:text-[13px] text-white/90 font-medium leading-relaxed max-w-md">
            &ldquo;Let us take the hassle out of travel planning, so you can focus on the adventure ahead.&rdquo;
          </p>

          {/* Reviews & Social Proof */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#2e1254] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Traveler" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#2e1254] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Traveler" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#2e1254] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Traveler" />
            </div>
            
            {/* 5 Gold Stars */}
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              ))}
            </div>

            {/* Rating pill */}
            <div className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3 py-1 text-white text-[11px] font-black tracking-wide">
              4.9/5 • 50k+ Trips
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-2">
            {/* Discover Now Button */}
            <Link 
              href="/explore"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#1e0d3d]/90 hover:bg-[#2d145c] border border-violet-500/30 px-7 py-3.5 text-xs font-black text-white transition-all shadow-xl shadow-purple-950/60 active:scale-[0.98]"
            >
              <span>Discover Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Plan Route Button */}
            <Link 
              href="/plan-route"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 px-7 py-3.5 text-xs font-black text-white transition-all backdrop-blur-md active:scale-[0.98]"
            >
              <Compass className="h-4 w-4" />
              <span>Plan Route</span>
            </Link>
          </div>
        </div>

        {/* Right Destination Preview Cards */}
        <div className="flex items-center gap-5 shrink-0 justify-center lg:justify-end overflow-hidden max-w-full">
          
          {/* Card 1: Taj Mahal */}
          <div className="relative w-[180px] sm:w-[200px] h-[320px] rounded-[30px] overflow-hidden shadow-2xl border border-white/20 group cursor-pointer shrink-0 transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between p-4">
            <img 
              src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&h=650&q=85" 
              alt="Taj Mahal" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            
            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 bg-[#06b6d4]/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm">
                <Accessibility className="w-2.5 h-2.5" />
                <span>92</span>
              </span>
              <span className="bg-[#6366f1] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                ADVENTURER&apos;S CHOICE
              </span>
            </div>

            {/* Bottom Details */}
            <div className="relative z-10 text-left space-y-2">
              <div>
                <span className="text-[9.5px] font-black text-[#10b981] uppercase tracking-wider block">
                  INDIA
                </span>
                <span className="text-lg font-black text-white block mt-0.5 leading-tight">
                  Taj Mahal
                </span>
              </div>
              
              {/* View Accessibility button */}
              <button 
                type="button"
                className="w-full py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-[10px] font-black transition-colors text-center"
              >
                View Accessibility
              </button>
            </div>
          </div>

          {/* Card 2: Eiffel Tower */}
          <div className="relative w-[180px] sm:w-[200px] h-[320px] rounded-[30px] overflow-hidden shadow-2xl border border-white/20 group cursor-pointer shrink-0 transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between p-4">
            <img 
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&h=650&q=85" 
              alt="Eiffel Tower" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            
            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between gap-1">
              <span className="bg-white/30 backdrop-blur-md text-white text-[8.5px] font-black px-2.5 py-1 rounded-full shadow-sm">
                Elevato
              </span>
              <span className="bg-[#6366f1] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                HODOPHILE&apos;S PICK
              </span>
            </div>

            {/* Bottom Details */}
            <div className="relative z-10 text-left">
              <span className="text-[9.5px] font-black text-slate-300 uppercase tracking-wider block">
                FRANCE
              </span>
              <span className="text-lg font-black text-white block mt-0.5 leading-tight">
                Eiffel Tower
              </span>
            </div>
          </div>

          {/* Card 3: Turkey / Cappadocia (Right Edge) */}
          <div className="relative w-[140px] sm:w-[160px] h-[320px] rounded-[30px] overflow-hidden shadow-2xl border border-white/20 group cursor-pointer shrink-0 opacity-85 transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between p-4">
            <img 
              src="https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=500&h=650&q=85" 
              alt="Cappadocia" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            
            {/* Top Badges */}
            <div className="relative z-10 flex items-center gap-1">
              <span className="bg-white/30 backdrop-blur-md text-white text-[8.5px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" />
                <span>Guide</span>
              </span>
            </div>

            {/* Bottom Details */}
            <div className="relative z-10 text-left">
              <span className="text-[9.5px] font-black text-slate-300 uppercase tracking-wider block">
                TURKEY
              </span>
              <span className="text-lg font-black text-white block mt-0.5 leading-tight truncate">
                Capp
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
