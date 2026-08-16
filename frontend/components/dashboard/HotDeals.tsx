'use client';

import React from 'react';
import { Calendar, Award, Coffee } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DEALS = [
  {
    title: 'White House Tour',
    location: 'Washington D.C., USA',
    duration: '7 Days',
    style: 'Luxury',
    food: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1580129990041-c858514ebd73?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Egypt Pyramids',
    location: 'Cairo, Egypt',
    duration: '7 Days',
    style: 'Luxury',
    food: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Taj Mahal Heritage',
    location: 'Agra, India',
    duration: '7 Days',
    style: 'Luxury',
    food: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Faisal Mosque',
    location: 'Islamabad, Pakistan',
    duration: '7 Days',
    style: 'Luxury',
    food: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1627839567990-256ef26e594d?auto=format&fit=crop&w=400&q=80',
  }
];

export default function HotDeals() {
  const { t } = useApp();

  return (
    <section className="space-y-4 pt-2">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black tracking-wider text-violet-700 dark:text-violet-400 uppercase">{t('hot_deals')}</h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {t('hot_deals_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEALS.map((deal, idx) => (
          <div 
            key={idx}
            className="h-[220px] rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-end p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
          >
            <img 
              src={deal.image} 
              alt={deal.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="relative z-10 space-y-2 text-white">
              <div>
                <h4 className="font-extrabold text-sm">{deal.title}</h4>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[8px] font-bold">
                <span className="bg-white/15 px-2 py-0.5 rounded flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {deal.duration}
                </span>
                <span className="bg-white/15 px-2 py-0.5 rounded flex items-center gap-1">
                  <Award className="h-2.5 w-2.5 text-pink-300" />
                  {deal.style}
                </span>
                <span className="bg-white/15 px-2 py-0.5 rounded flex items-center gap-1">
                  <Coffee className="h-2.5 w-2.5 text-amber-300" />
                  {deal.food}
                </span>
              </div>

              <button 
                type="button"
                className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-extrabold transition-colors"
              >
                {t('discover_deal')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
