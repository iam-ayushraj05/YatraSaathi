'use client';

import React from 'react';
import GoogleAuthButton from './GoogleAuthButton';
import { 
  Bot, 
  MapPin, 
  Bookmark, 
  Accessibility, 
  Clock, 
  Sparkles, 
  Award, 
  Phone, 
  Mail,
  Zap
} from 'lucide-react';

interface VoiceAuthWallProps {
  onSuccess?: () => void;
  onSelectPhone: () => void;
  onSelectEmail: () => void;
  onSelectLogin: () => void;
}

export default function VoiceAuthWall({
  onSuccess,
  onSelectPhone,
  onSelectEmail,
  onSelectLogin,
}: VoiceAuthWallProps) {
  const benefits = [
    { icon: Bot, label: 'Unlimited YatraMitra AI voice assistant' },
    { icon: MapPin, label: 'Save step-free routes & journeys' },
    { icon: Bookmark, label: 'Bookmark verified accessible places' },
    { icon: Accessibility, label: 'Personalized accessibility preferences' },
    { icon: Clock, label: 'Access travel & navigation history' },
    { icon: Sparkles, label: 'Live crowd & barrier recommendations' },
    { icon: Award, label: 'Earn and redeem YatraPoints' },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 text-[#6b21a8] dark:text-purple-300 text-[11px] font-black uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Unlock Full Access</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Continue your journey with YatraSaathi
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
          You&apos;ve used your 2 free YatraMitra voice conversations. Sign in or create a free account to continue your conversation and unlock unlimited travel features.
        </p>
      </div>

      {/* Compact Benefits Grid */}
      <div className="bg-slate-50 dark:bg-[#151421] p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-2.5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
          Included with your free account:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authentication Options */}
      <div className="space-y-3 pt-1">
        <GoogleAuthButton 
          text="Continue with Google" 
          onSuccess={onSuccess} 
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onSelectPhone}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#6b21a8] dark:text-purple-400" />
            <span>Use Phone</span>
          </button>

          <button
            type="button"
            onClick={onSelectEmail}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#6b21a8] dark:text-purple-400" />
            <span>Use Email</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSelectLogin}
          className="font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
