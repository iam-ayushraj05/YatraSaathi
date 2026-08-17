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
        return 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30 scale-105 ring-8 ring-violet-500/20 animate-pulse';
      case 'processing':
        return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 animate-spin';
      case 'speaking':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 scale-105 ring-8 ring-emerald-500/20 animate-bounce';
      case 'connecting':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse';
      case 'error':
        return 'bg-rose-500 text-white shadow-xl shadow-rose-500/30';
      default:
        return 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/20 hover:scale-105';
    }
  };

  // State badge pill
  const getBadgeConfig = () => {
    switch (voiceState) {
      case 'listening':
        return { color: 'bg-violet-500', text: isHindi ? 'सुन रहा हूँ' : 'Listening' };
      case 'processing':
        return { color: 'bg-amber-500 animate-ping', text: isHindi ? 'सोच रहा हूँ' : 'Thinking' };
      case 'speaking':
        return { color: 'bg-emerald-500 animate-pulse', text: isHindi ? 'बोल रहा हूँ' : 'Speaking' };
      case 'connecting':
        return { color: 'bg-blue-500 animate-pulse', text: isHindi ? 'कनेक्ट हो रहा है' : 'Connecting' };
      case 'error':
        return { color: 'bg-rose-500', text: isHindi ? 'त्रुटि' : 'Error' };
      default:
        return { color: 'bg-slate-300 dark:bg-slate-700', text: isHindi ? 'निष्क्रिय' : 'Idle' };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-100 dark:border-violet-950/60 bg-white dark:bg-[#0d0c12] p-6 shadow-sm transition-all">
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

      <div className="relative space-y-5">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {isHindi ? 'Voice Copilot' : 'Voice Copilot'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isHindi ? 'हैंड्स-फ्री वॉइस असिस्टेंट' : 'Hands-free AI voice companion'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className={`h-2 w-2 rounded-full ${badge.color}`} />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {badge.text}
            </span>
          </div>
        </div>

        {/* Orb Visualizer & Control */}
        <div className="flex flex-col items-center py-4 space-y-4">
          <button
            type="button"
            onClick={onToggleSession}
            aria-label={isSessionActive ? 'End voice session' : 'Start voice session'}
            className={`group relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 ${getOrbClasses()}`}
          >
            {voiceState === 'listening' && (
              <>
                <span className="absolute inset-0 rounded-full animate-ping bg-violet-400/30" />
                <span className="absolute -inset-3 rounded-full border border-violet-300/30" />
              </>
            )}

            {isSessionActive ? (
              <PhoneOff className="relative z-10 h-8 w-8 text-white" />
            ) : (
              <Mic className="relative z-10 h-8 w-8 text-white" />
            )}
          </button>

          {/* Dynamic Status Text */}
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {statusText}
            </p>

            {errorMessage && (
              <p className="text-[10px] font-medium text-rose-500 flex items-center justify-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Live Transcript Display */}
          {liveTranscript && (
            <div className="w-full rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 p-3 shadow-inner">
              <p className="text-center text-xs italic text-slate-600 dark:text-slate-300 font-medium">
                “{liveTranscript}”
              </p>
            </div>
          )}

          {/* Explicit End Call Button */}
          {isSessionActive && (
            <button
              type="button"
              onClick={onEndCall}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-xs"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              {isHindi ? 'कॉल समाप्त करें' : 'End Call'}
            </button>
          )}
        </div>

        {/* Footer info tag */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isHindi ? 'सत्यापित वॉइस मॉडल' : 'Verified Voice Pipeline'}</span>
          </div>
          <span>{isHindi ? 'महिला आवाज़ (डिफ़ॉल्ट)' : 'Female Voice (Default)'}</span>
        </div>
      </div>
    </div>
  );
}
