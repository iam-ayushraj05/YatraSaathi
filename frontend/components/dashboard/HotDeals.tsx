'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Hotel, Utensils } from 'lucide-react';

const DEALS = [
  {
    title: 'White House',
    days: '7 Days',
    hotel: 'Luxury',
    meal: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Egypt Pyramids',
    days: '7 Days',
    hotel: 'Luxury',
    meal: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Taj Mahal',
    days: '7 Days',
    hotel: 'Luxury',
    meal: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Faisal Mosque',
    days: '7 Days',
    hotel: 'Luxury',
    meal: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
  }
];

export default function HotDeals() {
  return (
    <div className="w-full space-y-6 pt-4">
      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-purple-900 dark:text-purple-300 uppercase tracking-[0.15em]">
          HOT DEALS
        </h3>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Pile up your savings with our hot deals
        </p>
      </div>

      {/* Hot Deals Grid matching reference image */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {DEALS.map((deal, idx) => (
          <div 
            key={idx}
            className="relative h-[290px] rounded-3xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200/50 dark:border-slate-800 bg-slate-900 flex flex-col justify-between p-4"
          >
            {/* Background Image */}
            <img 
              alt={deal.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src={deal.image}
              loading="lazy"
            />
            
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40"></div>

            <div className="relative z-10"></div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-3">
              <div>
                <h4 className="text-lg font-black text-white leading-tight">
                  {deal.title}
                </h4>
                
                {/* 3 Spec Icons */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-white/90 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-purple-300" />
                    {deal.days}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hotel className="h-3 w-3 text-purple-300" />
                    {deal.hotel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="h-3 w-3 text-purple-300" />
                    {deal.meal}
                  </span>
                </div>
              </div>

              {/* White Pill Discover Now Button */}
              <Link 
                href="/explore"
                className="flex items-center justify-center w-full bg-white hover:bg-slate-100 text-purple-900 py-2 rounded-full text-xs font-black transition-all shadow-md cursor-pointer no-underline"
              >
                Discover Now
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
