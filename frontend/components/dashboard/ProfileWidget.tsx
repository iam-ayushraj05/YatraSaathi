'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Accessibility, 
  Eye, 
  Ear, 
  Check, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { AccessibilityProfile } from '../../lib/types';
import { useApp } from '../../context/AppContext';

export default function ProfileWidget() {
  const { t, language } = useApp();
  const [profile, setProfile] = useState<AccessibilityProfile | null>(null);

  useEffect(() => {
    api.profiles.get('default')
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        setProfile({
          id: 'p-demo',
          user_id: 'u-demo',
          walking_limit_meters: 500,
          avoid_stairs: true,
          prefer_step_free: true,
          prefer_rest_stops: false,
          preferred_route_style: 'MOST_ACCESSIBLE',
          mobility_preferences: { wheelchair: true, step_free: true },
          vision_preferences: { braille_signs: false, high_contrast: false },
          hearing_preferences: { audio_descriptions: false },
          cognitive_preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
  }, []);

  const getLocalizedLabel = (label: string) => {
    const labels: Record<string, Record<string, string>> = {
      EN: {
        'Wheelchair / Mobility Aid': 'Wheelchair / Mobility Aid',
        'Low Vision Guidance': 'Low Vision Guidance',
        'Hearing Assistive Announcements': 'Hearing Assistive Announcements',
        'Requires Step-Free Path': 'Requires Step-Free Path',
        'Accessible Toilets Filter': 'Accessible Toilets Filter',
      },
      HI: {
        'Wheelchair / Mobility Aid': 'व्हीलचेयर / गतिशीलता सहायता',
        'Low Vision Guidance': 'कम दृष्टि मार्गदर्शन',
        'Hearing Assistive Announcements': 'श्रवण सहायक घोषणाएं',
        'Requires Step-Free Path': 'सीढ़ी-मुक्त मार्ग की आवश्यकता',
        'Accessible Toilets Filter': 'सुलभ शौचालय फ़िल्टर',
      }
    };
    return labels[language]?.[label] || label;
  };

  const profileOptions = [
    { label: 'Wheelchair / Mobility Aid', active: profile?.avoid_stairs || false, icon: Accessibility },
    { label: 'Low Vision Guidance', active: profile?.vision_preferences?.high_contrast || false, icon: Eye },
    { label: 'Hearing Assistive Announcements', active: profile?.hearing_preferences?.audio_descriptions || false, icon: Ear },
    { label: 'Requires Step-Free Path', active: profile?.prefer_step_free || true, icon: Check },
    { label: 'Accessible Toilets Filter', active: true, icon: Check },
  ];

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-violet-650 dark:text-violet-400" />
          <h3 className="font-bold text-slate-850 dark:text-slate-100 text-xs">{t('your_profile')}</h3>
        </div>
        <Link 
          href="/accessibility-profile"
          className="text-[10px] font-bold text-violet-600 hover:text-violet-755 hover:underline"
        >
          {language === 'HI' ? 'संपादित करें' : 'Edit'}
        </Link>
      </div>

      <div className="mt-3.5 space-y-2">
        {profileOptions.map((opt, idx) => {
          const Icon = opt.icon;
          return (
            <div 
              key={idx}
              className={`
                flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150
                ${opt.active 
                  ? 'border-violet-100 dark:border-violet-900/35 bg-violet-50/15 dark:bg-violet-950/20 text-slate-800 dark:text-slate-200' 
                  : 'border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${opt.active ? 'text-violet-605 dark:text-violet-400' : 'text-slate-350 dark:text-slate-500'}`} />
                <span className="text-[11px] font-semibold">{getLocalizedLabel(opt.label)}</span>
              </div>
              <button type="button" className="text-slate-400 dark:text-slate-500 hover:text-violet-600">
                {opt.active ? (
                  <ToggleRight className="h-5 w-5 text-violet-650 dark:text-violet-400" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-slate-300 dark:text-slate-650" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-100/50 dark:border-slate-800">
        <p className="text-[9px] text-slate-450 dark:text-slate-400 leading-normal flex gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0 animate-pulse" />
          <span>
            {language === 'HI' 
              ? 'ये सेटिंग्स स्वचालित रूप से सभी मार्ग खोज एल्गोरिदम को अनुकूलित करती हैं और संभावित बाधाओं की चेतावनियों को उजागर करती हैं।' 
              : 'These settings automatically customize all routing search algorithms and highlight potential barrier warnings.'
            }
          </span>
        </p>
      </div>
    </div>
  );
}
