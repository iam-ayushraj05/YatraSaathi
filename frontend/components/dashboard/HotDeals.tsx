'use client';

import React from 'react';
import Link from 'next/link';

const DEALS = [
  {
    title: 'White House Tour',
    badge: 'Trending',
    flight: 'Flight',
    hotel: 'Luxury',
    access: 'Step-Free',
    image: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Egypt Pyramids',
    badge: "Adventurer's Choice",
    flight: 'Flight',
    hotel: 'Luxury',
    access: 'Accessible Path',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Heritage Exploration',
    badge: 'Popular',
    flight: 'Flight',
    hotel: 'Luxury',
    access: 'Wheelchair',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Faisal Mosque',
    badge: 'Architectural',
    flight: 'Flight',
    hotel: 'Luxury',
    access: 'Ramp Access',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
  }
];

export default function HotDeals() {
  return (
    <div className="w-full space-y-6 pt-4">
      {/* Secondary Sections Divider */}
      <div className="text-center relative py-4">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#cbc3d9]/30 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[#f8f9ff] dark:bg-[#0c0e17] px-8">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] dark:from-[#cfbdff] dark:to-[#4ffbe6] uppercase tracking-[0.15em]">
              HOT DEALS
            </h3>
            <p className="text-sm md:text-base text-[#494456] dark:text-slate-400 font-medium mt-1">
              Pile up your savings with our verified accessible hot deals.
            </p>
          </div>
        </div>
      </div>

      {/* Hot Deals Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEALS.map((deal, idx) => (
          <div 
            key={idx}
            className="relative h-[340px] rounded-[2rem] overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/40 dark:border-slate-800 bg-slate-950 flex flex-col justify-between p-5"
          >
            {/* Background Image - Clean and Crisp */}
            <img 
              alt={deal.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" 
              src={deal.image}
              loading="lazy"
            />
            
            {/* Subtle Gradient Overlays (preserves clear center view of the photo) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 opacity-75 group-hover:opacity-90 transition-opacity"></div>

            {/* Top Bar: Badges & Features */}
            <div className="relative z-10 flex items-center justify-between gap-2 w-full">
              {/* Feature Pill Button */}
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[13px] text-[#4ffbe6]">flight</span>
                <span>Flight</span>
                <span className="text-white/40">•</span>
                <span className="material-symbols-outlined text-[13px] text-[#cfbdff]">hotel</span>
                <span>Luxury</span>
              </div>

              {/* Badge */}
              {deal.badge && (
                <div className="bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md border border-white/20">
                  {deal.badge}
                </div>
              )}
            </div>

            {/* Bottom Content: Title, Accessibility Tag, & Popup Discover Button */}
            <div className="relative z-10 space-y-2.5">
              <div>
                <div className="inline-flex items-center gap-1 bg-emerald-500/30 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-400/30 mb-1.5">
                  <span className="material-symbols-outlined text-[12px]">accessible</span>
                  <span>{deal.access}</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {deal.title}
                </h4>
              </div>

              {/* Discover Now Pop-up Button */}
              <Link 
                href="/explore"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] hover:opacity-95 text-white py-2.5 rounded-xl text-xs font-black transition-all transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-[1.02] shadow-lg no-underline cursor-pointer"
              >
                <span>Discover Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
