'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function TopDestinations() {
  const { t } = useApp();

  const destinations = [
    {
      countryKey: 'pakistan',
      landmarkKey: 'hiran_minar',
      image: 'https://images.unsplash.com/photo-1589982424006-258dc788939c?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-2',
    },
    {
      countryKey: 'india',
      landmarkKey: 'taj_mahal',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-1',
    },
    {
      countryKey: 'turkey',
      landmarkKey: 'hagia_sophia',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-2',
    },
    {
      countryKey: 'italy',
      landmarkKey: 'colosseum',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-1',
    },
    {
      countryKey: 'france',
      landmarkKey: 'eiffel_tower',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-1',
    },
    {
      countryKey: 'canada',
      landmarkKey: 'gooderham',
      image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=500&q=80',
      className: 'col-span-1 row-span-1',
    }
  ];

  return (
    <section className="space-y-4 pt-2">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black tracking-wider text-violet-700 dark:text-violet-400 uppercase">{t('top_destination')}</h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {t('top_destination_desc')}
        </p>
      </div>

      {/* Mosaic grid: 4 columns, 2 rows — Pakistan and Turkiye span 2 rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] gap-3">
        {destinations.map((dest, idx) => (
          <div 
            key={idx}
            className={`rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-end p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg group cursor-pointer ${dest.className}`}
          >
            <img 
              src={dest.image} 
              alt={t(dest.landmarkKey)} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            <div className="relative z-10 text-white">
              <span className="font-extrabold text-[10px] text-pink-300 uppercase block tracking-wider leading-none">
                {t(dest.countryKey)}
              </span>
              <h4 className="font-black text-sm mt-0.5 truncate">
                {t(dest.landmarkKey)}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
