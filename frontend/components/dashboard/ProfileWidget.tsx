'use client';

import React, { useState } from 'react';
import { 
  Accessibility, 
  Eye, 
  Ear, 
  UserCheck, 
  Footprints, 
  Bath, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProfileWidget() {
  const { language } = useApp();
  const [profile, setProfile] = useState({
    wheelchair: true,
    lowVision: true,
    hearingImpaired: true,
    needAssistant: true,
    preferStepFree: true,
    accessibleToilets: true,
  });

  const toggle = (key: keyof typeof profile) => {
    setProfile(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'wheelchair', label: 'Wheelchair User', icon: Accessibility },
    { key: 'lowVision', label: 'Low Vision', icon: Eye },
    { key: 'hearingImpaired', label: 'Hearing Impaired', icon: Ear },
    { key: 'needAssistant', label: 'Need Assistant', icon: UserCheck },
    { key: 'preferStepFree', label: 'Prefer Step-free', icon: Footprints },
    { key: 'accessibleToilets', label: 'Accessible Toilets', icon: Bath },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
          Your Accessibility Profile
        </h3>
        <button className="text-[10px] font-black text-[#6b21a8] dark:text-purple-400 hover:underline">
          Edit
        </button>
      </div>

      {/* Checklist Grid matching exact reference design */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isChecked = profile[item.key as keyof typeof profile];
          return (
            <div 
              key={item.key}
              onClick={() => toggle(item.key as keyof typeof profile)}
              className="flex items-center justify-between py-1 px-1 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-slate-500 group-hover:text-[#6b21a8] transition-colors shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {item.label}
                </span>
              </div>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-[#6b21a8] text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>
                <CheckCircle2 className="h-4 w-4 fill-[#6b21a8] text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
