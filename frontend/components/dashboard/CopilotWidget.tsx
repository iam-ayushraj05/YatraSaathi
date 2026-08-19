'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Send, Mic, MicOff, RotateCcw, Volume2, StopCircle, Navigation, MapPin, Accessibility, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import CopilotMessage, { CopilotMessageData } from './CopilotMessage';
import { VoiceState } from '../../hooks/useVoiceCopilot';
import { getUserLocation, UserLocation } from '../../lib/location';

interface CopilotWidgetProps {
  onExternalVoiceResponse?: (res: {
    transcript: string;
    response: string;
    relevant_places?: any[];
    route_info?: any;
    warnings?: string[];
  }) => void;
  voiceState?: VoiceState;
}

export default function CopilotWidget({ onExternalVoiceResponse, voiceState }: CopilotWidgetProps) {
  const { t, language } = useApp();
  const isHindi = language === 'HI';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Shared Location Service State
  const [userLocationState, setUserLocationState] = useState<UserLocation | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  const fetchUserLocation = useCallback(async (forceRefresh = false) => {
    setIsLoadingLoc(true);
    setLocError(null);
    try {
      const loc = await getUserLocation(forceRefresh);
      setUserLocationState(loc);
    } catch (err: any) {
      setLocError(err?.message || 'Location unavailable');
      setUserLocationState(null);
    } finally {
      setIsLoadingLoc(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLocation(false);
  }, [fetchUserLocation]);

  const getInitialGreeting = useCallback(() => {
    return isHindi
      ? 'नमस्ते! मैं आपका YatraMitra AI सहायता साथी हूँ। मैं सुलभ मार्गों (step-free routes), स्थानों और बाधा रिपोर्टों में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?'
      : "Hi! I'm your YatraMitra AI travel assistant. I can help you find step-free routes, accessible places, check barriers, and plan your journey. How can I help you today?";
  }, [isHindi]);

  const [messages, setMessages] = useState<CopilotMessageData[]>([
    {
      id: 'm1',
      sender: 'copilot',
      text: getInitialGreeting(),
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync initial greeting on language switch if conversation hasn't progressed
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [{ ...prev[0], text: getInitialGreeting() }];
      }
      return prev;
    });
  }, [language, getInitialGreeting]);

  // Scroll to bottom on message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.lang.startsWith(isHindi ? 'hi' : 'en') &&
      (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female') || v.name.includes('Karen') || v.name.includes('Shweta') || v.name.includes('Google हिन्दी'))
    ) || voices.find(v => v.lang.startsWith(isHindi ? 'hi' : 'en'));
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const resetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'm1',
        sender: 'copilot',
        text: getInitialGreeting(),
        timestamp: new Date()
      }
    ]);
    setInputText('');
  };

  const handleSend = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isTyping) return;

    const userMessage: CopilotMessageData = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'm1')
        .slice(-8)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const response = await api.copilot.chat({
        message: cleanText,
        current_location: userLocationState
          ? {
              lat: userLocationState.lat,
              lng: userLocationState.lng,
            }
          : undefined,
        conversation_history: history
      });

      const replyText = response?.response || (isHindi ? 'कोई उत्तर नहीं प्राप्त हुआ।' : 'I could not generate a response right now.');

      const copilotMessage: CopilotMessageData = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: replyText,
        timestamp: new Date(),
        relevant_places: response.relevant_places,
        route_info: response.route_info,
        warnings: response.warnings
      };

      setMessages((prev) => [...prev, copilotMessage]);

      if (onExternalVoiceResponse) {
        onExternalVoiceResponse({
          transcript: cleanText,
          response: replyText,
          relevant_places: response.relevant_places,
          route_info: response.route_info,
          warnings: response.warnings
        });
      }
    } catch (error) {
      console.error('[COPILOT CHAT]', error);
      const errorMessage: CopilotMessageData = {
        id: `error-${Date.now()}`,
        sender: 'copilot',
        text: isHindi
          ? 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
          : 'Sorry, I could not connect to the YatraSaathi server. Please try again.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Chat-level quick voice input trigger
  const handleVoiceToggle = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInputText(isHindi ? 'सुलभ मार्ग खोजें' : 'Find accessible route');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        setIsListening(false);
        if (transcript) {
          setInputText(transcript);
          void handleSend(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const quickActions = [
    {
      label: isHindi ? 'सुलभ मार्ग' : 'Step-free route',
      icon: Navigation,
      text: isHindi ? 'मुझे आसपास के किसी गंतव्य के लिए सबसे सुलभ मार्ग बताओ।' : 'Find me the most accessible step-free route.'
    },
    {
      label: isHindi ? 'पास की सहायता' : 'Nearby places',
      icon: MapPin,
      text: isHindi ? 'मेरे पास व्हीलचेयर सुलभ स्थान और सहायता केंद्र खोजो।' : 'Find wheelchair accessible places and assistance near me.'
    },
    {
      label: isHindi ? 'बाधा जांच' : 'Check barriers',
      icon: Accessibility,
      text: isHindi ? 'मार्ग में किसी निर्माण या बाधा की जांच करो।' : 'Check if there are any reported barriers along the route.'
    }
  ];

  return (
    <div className="flex h-[540px] min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d0c12] shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0d0c12] bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                YatraMitra
              </h2>
              <span className="rounded-full bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                YatraMitra AI
              </span>

              {/* Location Indicator & Refresh Button */}
              <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                <MapPin className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span>
                  {isLoadingLoc
                    ? 'Getting your location...'
                    : userLocationState?.displayName
                    ? userLocationState.displayName
                    : 'Location unavailable'}
                </span>
                <button
                  type="button"
                  onClick={() => fetchUserLocation(true)}
                  disabled={isLoadingLoc}
                  title="Refresh location"
                  className="ml-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${isLoadingLoc ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 font-medium">
              {isTyping
                ? (isHindi ? 'सोच रहा हूँ...' : 'Thinking...')
                : voiceState === 'listening'
                ? (isHindi ? 'सुन रहा हूँ...' : 'Listening...')
                : (isHindi ? 'ऑनलाइन • यात्रा सहायता सक्रिय' : 'Online • Ready to assist')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              title="Stop speaking"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition hover:bg-rose-100"
            >
              <StopCircle className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={resetChat}
            title="New conversation"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((msg) => (
            <CopilotMessage
              key={msg.id}
              message={msg}
              onSpeak={speakText}
              isHindi={isHindi}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-900 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-violet-500" />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            {isHindi ? 'त्वरित प्रश्न' : 'Quick Prompts'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                type="button"
                disabled={isTyping}
                onClick={() => void handleSend(action.text)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-[9px] font-bold text-slate-600 dark:text-slate-300 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 disabled:opacity-50"
              >
                <Icon className="h-3 w-3" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Input Form */}
      <div className="shrink-0 px-4 pb-4 sm:px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(inputText);
          }}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder={isHindi ? 'अपनी यात्रा के बारे में कुछ भी पूछें...' : 'Ask anything about your journey...'}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 font-medium"
          />

          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isTyping}
            title={isListening ? 'Listening...' : 'Voice Input'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#581c87] to-[#6b21a8] text-white shadow-lg shadow-purple-900/20 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-2 text-center text-[8px] font-medium text-slate-400">
          {isHindi
            ? 'AI द्वारा प्रदान की गई यात्रा जानकारी की आवश्यकता अनुसार पुष्टि करें।'
            : 'AI-generated travel information should be verified when necessary.'}
        </p>
      </div>
    </div>
  );
}