'use client';

import React from 'react';
import Link from 'next/link';

interface Destination {
  country: string;
  name: string;
  image: string;
  gridClass: string;
  showDesc?: boolean;
  desc?: string;
}

const DESTINATIONS: Destination[] = [
  {
    country: 'UAE',
    name: 'Burj Khalifa',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 md:row-span-2 min-h-[340px] md:min-h-[460px]'
  },
  {
    country: 'INDIA',
    name: 'Taj Mahal',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'TURKIYE',
    name: 'Hagia Sophia',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'ITALY',
    name: 'Colosseum',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  },
  {
    country: 'FRANCE',
    name: 'Eiffel Tower',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-1 min-h-[220px]'
  }
];

export default function TopDestinations() {
  return (
    <div className="w-full space-y-6 pt-4">
      {/* Title matching exact reference */}
      <div className="text-center space-y-1">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-purple-900 dark:text-purple-300 uppercase tracking-[0.15em]">
          TOP DESTINATION
        </h3>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Experience the world's top destinations like never before
        </p>
      </div>

      {/* Grid matching user image layout */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {DESTINATIONS.map((dest, idx) => (
          <Link
            key={idx}
            href="/explore"
            className={`relative rounded-3xl overflow-hidden group shadow-md border border-white/20 hover:shadow-xl transition-all cursor-pointer bg-slate-900 ${dest.gridClass}`}
          >
            <img 
              alt={dest.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src={dest.image}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            
            <div className="absolute bottom-5 left-5 right-5 text-white z-10 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#a855f7]">
                {dest.country}
              </p>
              <h4 className="text-lg font-black leading-tight text-white">
                {dest.name}
              </h4>
              {dest.showDesc && (
                <p className="text-[10px] text-slate-300 leading-relaxed font-medium mt-1 line-clamp-3">
                  {dest.desc}
                </p>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
