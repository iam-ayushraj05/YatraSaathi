'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Responsibilities() {
  const cards = [
    { title: 'Always Available', desc: 'For your help' },
    { title: 'Cancel Free of Charge', desc: 'WUO-FLEX TARIFF' },
    { title: 'Train to Flight', desc: 'Ticket?' },
    { title: 'Flyloco', desc: 'Angebote' },
  ];

  return (
    <section className="rounded-3xl overflow-hidden relative p-6 md:p-8 text-white bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 border border-purple-900/50 shadow-lg">
      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-lg md:text-xl font-black tracking-widest uppercase text-white">
            OUR RESPONSIBILITIES
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white/15 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black leading-tight text-white">{card.title}</h4>
                <p className="text-[10px] text-purple-200 font-semibold mt-0.5">
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
