'use client';

import React from 'react';
import Link from 'next/link';

const DESTINATIONS = [
  {
    country: 'PAKISTAN',
    name: 'Hiran Minar Sheikhupura',
    image: 'https://images.unsplash.com/photo-1589982424006-258dc788939c?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 md:row-span-2 min-h-[340px] md:min-h-[460px]'
  },
  {
    country: 'INDIA',
    name: 'Taj Mahal Ramps',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'FRANCE',
    name: 'Eiffel Tower Lift',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'TURKEY',
    name: 'Hagia Sophia Museum',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'ITALY',
    name: 'Colosseum Access Lift',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'NEPAL',
    name: 'Doorbarhare Building',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  }
];

export default function TopDestinations() {
  return (
    <div className="w-full space-y-6 pt-4">
      {/* Top Destinations Title */}
      <div className="text-center relative py-4">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#cbc3d9]/30 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[#f8f9ff] dark:bg-[#0c0e17] px-8 transition-colors">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] dark:from-[#cfbdff] dark:to-[#4ffbe6] uppercase tracking-[0.15em]">
              TOP DESTINATION
            </h3>
            <p className="text-sm md:text-base text-[#494456] dark:text-slate-400 font-medium mt-1">
              Experience the world&apos;s top destinations like never before.
            </p>
          </div>
        </div>
      </div>

      {/* Top Destinations Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {DESTINATIONS.map((dest, idx) => (
          <Link
            key={idx}
            href="/explore"
            className={`relative rounded-[2rem] overflow-hidden group shadow-lg border border-white/30 hover-card cursor-pointer bg-slate-900 ${dest.gridClass}`}
          >
            <img 
              alt={dest.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src={dest.image}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white transform transition-transform duration-300 group-hover:-translate-y-2 z-10">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1.5 opacity-90 text-[#cfbdff]">
                {dest.country}
              </p>
              <h4 className="text-xl font-black tracking-tight leading-tight text-white">
                {dest.name}
              </h4>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
