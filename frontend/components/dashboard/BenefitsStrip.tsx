'use client';

import React from 'react';
import { BadgePercent, Headset, ShieldCheck, Landmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BenefitsStrip() {
  const { t } = useApp();

  const benefits = [
    {
      title: t('best_price'),
      desc: t('best_price_desc'),
      icon: BadgePercent,
      color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/30',
    },
    {
      title: t('customer_support'),
      desc: t('customer_support_desc'),
      icon: Headset,
      color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100 dark:border-blue-900/30',
    },
    {
      title: t('secure_bookings'),
      desc: t('secure_bookings_desc'),
      icon: ShieldCheck,
      color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: t('experiences'),
      desc: t('experiences_desc'),
      icon: Landmark,
      color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-100 dark:border-purple-900/30',
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {benefits.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div 
            key={idx} 
            className="flex items-start gap-3 bg-white dark:bg-[#0b0a0f] border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`h-9 w-9 rounded-full border flex items-center justify-center shrink-0 ${b.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{b.title}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-normal">
                {b.desc}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
