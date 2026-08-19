'use client';

import React from 'react';
import { Mic, PhoneOff, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { VoiceState } from '../../hooks/useVoiceCopilot';

interface VoiceAgentCardProps {
  voiceState: VoiceState;
  statusText: string;
  liveTranscript: string;
  errorMessage?: string | null;
  onToggleSession: () => void;
  onEndCall: () => void;
  isHindi: boolean;
}

export default function VoiceAgentCard({
  voiceState,
  statusText,
  liveTranscript,
  errorMessage,
  onToggleSession,
  onEndCall,
  isHindi
}: VoiceAgentCardProps) {
  const isSessionActive = voiceState !== 'idle' && voiceState !== 'ending';

  // Orb styling based on current state
  const getOrbClasses = () => {
    switch (voiceState) {
      case 'listening':
        return 'bg-gradient-to-br from-[#6b21a8] to-indigo-600 text-white shadow-2xl shadow-purple-900/40 scale-110 ring-8 ring-purple-500/20 animate-pulse';
      case 'processing':
        return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl shadow-amber-500/40 animate-spin';
      case 'speaking':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 scale-110 ring-8 ring-emerald-500/20 animate-bounce';
      case 'connecting':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse';
      case 'error':
        return 'bg-rose-500 text-white shadow-xl shadow-rose-500/30';
      default:
        return 'bg-gradient-to-br from-[#581c87] via-[#6b21a8] to-indigo-600 text-white shadow-2xl shadow-purple-900/30 hover:scale-105';
    }
  };

  // State badge pill
  const getBadgeConfig = () => {
    switch (voiceState) {
      case 'listening':
        return { color: 'bg-purple-600 animate-pulse', text: isHindi ? 'सुन रहा हूँ' : 'Listening' };
      case 'processing':
        return { color: 'bg-amber-500 animate-ping', text: isHindi ? 'सोच रहा हूँ' : 'Thinking' };
      case 'speaking':
        return { color: 'bg-emerald-500 animate-pulse', text: isHindi ? 'बोल रहा हूँ' : 'Speaking' };
      case 'connecting':
        return { color: 'bg-blue-500 animate-pulse', text: isHindi ? 'कनेक्ट हो रहा है' : 'Connecting' };
      case 'error':
        return { color: 'bg-rose-500', text: isHindi ? 'त्रुटि' : 'Error' };
      default:
        return { color: 'bg-emerald-500', text: isHindi ? 'रेडी (सक्रिय)' : 'Ready (Active)' };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="relative flex flex-col justify-between h-[540px] overflow-hidden rounded-3xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#0d0c12] p-6 sm:p-7 shadow-sm transition-all">
      {/* Background ambient lighting */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300 shadow-2xs">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {isHindi ? 'वॉइस साथी' : 'Voice Copilot Hub'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {isHindi ? 'हैंड्स-फ्री वॉइस असिस्टेंट' : 'Hands-free AI voice companion'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <span className={`h-2.5 w-2.5 rounded-full ${badge.color}`} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              {badge.text}
            </span>
          </div>
        </div>

        {/* Orb Visualizer & Interactive Voice Controls */}
        <div className="flex flex-col items-center justify-center py-6 space-y-5">
          <button
            type="button"
            onClick={onToggleSession}
            aria-label={isSessionActive ? 'End voice session' : 'Start voice session'}
            className={`group relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300 ${getOrbClasses()}`}
          >
            {voiceState === 'listening' && (
              <>
                <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/30" />
                <span className="absolute -inset-4 rounded-full border border-purple-300/30" />
                <span className="absolute -inset-8 rounded-full border border-purple-200/20" />
              </>
            )}

            {isSessionActive ? (
              <PhoneOff className="relative z-10 h-10 w-10 text-white" />
            ) : (
              <Mic className="relative z-10 h-10 w-10 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Soundwave equalizer animation */}
          {isSessionActive && (
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30].map((height, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#6b21a8] dark:bg-purple-400 rounded-full animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Dynamic Status Text */}
          <div className="text-center space-y-1 max-w-sm">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
              {statusText}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {isSessionActive
                ? (isHindi ? 'बोलना जारी रखें, AI सुन रहा है...' : 'Speak now, AI is listening...')
                : (isHindi ? 'माइक्रोफ़ोन दबाकर बात शुरू करें' : 'Tap the microphone to start voice copilot')}
            </p>

            {errorMessage && (
              <p className="text-xs font-medium text-rose-500 flex items-center justify-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Live Transcript Display */}
          {liveTranscript && (
            <div className="w-full rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-3.5 shadow-inner">
              <p className="text-center text-xs italic text-purple-900 dark:text-purple-200 font-medium">
                “{liveTranscript}”
              </p>
            </div>
          )}

          {/* Explicit End Call Button */}
          {isSessionActive && (
            <button
              type="button"
              onClick={onEndCall}
              className="px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-xs"
            >
              <PhoneOff className="h-4 w-4" />
              {isHindi ? 'कॉल समाप्त करें' : 'End Call'}
            </button>
          )}
        </div>

        {/* Footer info tag */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>{isHindi ? 'सत्यापित वॉइस मॉडल' : 'Verified AI Voice Engine'}</span>
          </div>
          <span>{isHindi ? 'हिन्दी व अंग्रेजी सहायता' : 'Hindi & English Support'}</span>
        </div>
      </div>
    </div>
  );
}
