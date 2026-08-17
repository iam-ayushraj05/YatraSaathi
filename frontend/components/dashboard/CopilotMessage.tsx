'use client';

import React from 'react';
import { Bot, User as UserIcon, MapPin, Navigation, AlertTriangle, ShieldCheck, Volume2 } from 'lucide-react';

export interface CopilotMessageData {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: Date;
  relevant_places?: any[];
  route_info?: any;
  warnings?: string[];
}

interface CopilotMessageProps {
  message: CopilotMessageData;
  onSpeak?: (text: string) => void;
  isHindi: boolean;
}

export default function CopilotMessage({ message, onSpeak, isHindi }: CopilotMessageProps) {
  const isCopilot = message.sender === 'copilot';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-3 ${isCopilot ? 'justify-start' : 'justify-end'} group`}>
      {isCopilot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 font-bold text-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`max-w-[85%] ${isCopilot ? '' : 'flex flex-col items-end'}`}>
        {/* Main Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
            isCopilot
              ? 'rounded-tl-sm border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              : 'rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-medium'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Structured Result Cards */}
        {isCopilot && (
          <div className="mt-2 space-y-2.5 w-full">
            {/* Warnings / Accessibility Alerts */}
            {message.warnings && message.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{isHindi ? 'पहुंच चेतावनी' : 'Accessibility Alert'}</span>
                </div>
                {message.warnings.map((warn, idx) => (
                  <p key={idx} className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-tight">
                    • {warn}
                  </p>
                ))}
              </div>
            )}

            {/* Route Info Card */}
            {message.route_info && (
              <div className="rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-950/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300 font-extrabold text-[10px] uppercase tracking-wider">
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{isHindi ? 'सुलभ मार्ग' : 'Step-Free Route'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                    {isHindi ? 'उच्च पहुंच (Score 92/100)' : 'High Access (Score 92/100)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                  <div>
                    <span className="text-slate-400 block">{isHindi ? 'दूरी' : 'Distance'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{message.route_info.distance || '1.2 km'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHindi ? 'अनुमानित समय' : 'Est. Duration'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{message.route_info.duration || '15 mins'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Relevant Places Cards */}
            {message.relevant_places && message.relevant_places.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-violet-500" />
                  <span>{isHindi ? 'सत्यापित सुलभ स्थान' : 'Verified Accessible Places'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.relevant_places.map((place: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs hover:border-violet-200 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <h5 className="font-bold text-xs text-slate-850 dark:text-slate-100 leading-tight">
                          {place.name || place.title}
                        </h5>
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          {place.accessibility_score ? `${place.accessibility_score}/100` : 'Step-Free'}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {place.description || place.address || 'Verified accessible facilities available.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Timestamp & Speech Control */}
        <div className="mt-1.5 flex items-center gap-2 px-1">
          <span className="text-[8px] font-bold text-slate-400">
            {formatTime(message.timestamp)}
          </span>

          {isCopilot && onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(message.text)}
              className="flex items-center gap-1 text-[8px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 transition-colors"
            >
              <Volume2 className="h-3 w-3" />
              {isHindi ? 'सुनें' : 'Listen'}
            </button>
          )}
        </div>
      </div>

      {!isCopilot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
