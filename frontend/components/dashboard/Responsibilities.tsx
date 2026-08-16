'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Responsibilities() {
  const { t } = useApp();

  const cards = [
    { title: t('always_available'), desc: t('always_available_desc') },
    { title: t('free_cancel'), desc: t('free_cancel_desc') },
    { title: t('train_flight'), desc: t('train_flight_desc') },
    { title: t('offers'), desc: t('offers_desc') },
  ];

  return (
    <section className="rounded-2xl overflow-hidden relative p-6 md:p-8 text-white bg-[linear-gradient(to_right,rgba(46,16,101,0.92)_20%,rgba(109,40,217,0.75)_100%),url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
      <div className="relative z-10 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black tracking-wider uppercase">{t('responsibilities_title')}</h2>
          <p className="text-[11px] text-purple-200 font-medium">
            {t('responsibilities_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-3 hover:bg-white/15 transition-all duration-200"
            >
              <CheckCircle2 className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold leading-tight text-white">{card.title}</h4>
                <p className="text-[10px] text-purple-100 font-medium mt-1 leading-normal">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
