'use client';

import React from 'react';
import { BadgePercent, Headset, ShieldCheck, Landmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BenefitsStrip() {
  const { t, language } = useApp();

  const benefits = [
    {
      title: language === 'HI' ? 'सर्वोत्तम मूल्य गारंटी' : 'Best Price Guarantee',
      desc: language === 'HI' ? 'हम सुनिश्चित करते हैं कि आपको हमेशा सर्वोत्तम सौदे मिलें।' : 'We ensure you get the best deals always.',
      icon: BadgePercent,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: language === 'HI' ? '24/7 ग्राहक सहायता' : '24/7 Customer Support',
      desc: language === 'HI' ? 'हम आपकी सहायता के लिए किसी भी समय, कहीं भी हैं।' : "We're here to help you anytime, anywhere.",
      icon: Headset,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: language === 'HI' ? 'सुरक्षित बुकिंग' : 'Secure Bookings',
      desc: language === 'HI' ? 'आपका डेटा और भुगतान 100% सुरक्षित हैं।' : 'Your data and payments are 100% safe.',
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: language === 'HI' ? 'चुनिंदा अनुभव' : 'Handpicked Experiences',
      desc: language === 'HI' ? 'अविस्मरणीय यात्राओं के लिए क्यूरेटेड टूर।' : 'Curated tours for unforgettable trips.',
      icon: Landmark,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {benefits.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div 
            key={idx} 
            className="flex items-center gap-3.5 bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${b.bgColor} ${b.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">{b.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-normal">
                {b.desc}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
