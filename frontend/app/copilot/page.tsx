'use client';

import React, { useRef, useCallback } from 'react';
import { Sparkles, HelpCircle, ShieldCheck, MapPin, Navigation, Accessibility } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import CopilotWidget from '../../components/dashboard/CopilotWidget';
import VoiceAgentCard from '../../components/dashboard/VoiceAgentCard';
import InteractiveMap from '../../components/dashboard/InteractiveMap';
import { useVoiceCopilot } from '../../hooks/useVoiceCopilot';


export default function CopilotPage() {
  const { t, language } = useApp();
  const isHindi = language === 'HI';

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Unified conversation history shared across text and voice channels
  const [mapPlaces, setMapPlaces] = React.useState<any[]>([]);
  const [routeInfo, setRouteInfo] = React.useState<any>(null);

  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  const getHistoryCallback = useCallback(() => {
    return conversationHistoryRef.current;
  }, []);

  const handleVoiceResponse = useCallback(
    (res: {
      transcript: string;
      response: string;
      relevant_places?: any[];
      route_info?: any;
      warnings?: string[];
    }) => {
      conversationHistoryRef.current.push({ role: 'user', content: res.transcript });
      conversationHistoryRef.current.push({ role: 'assistant', content: res.response });

      if (res.relevant_places && res.relevant_places.length > 0) {
        setMapPlaces(res.relevant_places.map((p, idx) => ({
          id: p.id || `p-${idx}`,
          name: p.name,
          lat: p.latitude || 28.6129,
          lng: p.longitude || 77.2295,
          type: (p.category || 'monument').toLowerCase(),
          accessible: p.accessibility_level || 'HIGH'
        })));
      }

      if (res.route_info) {
        setRouteInfo(res.route_info);
      }
    },
    []
  );

  const {
    voiceState,
    statusText,
    liveTranscript,
    errorMessage,
    startSession,
    endCall
  } = useVoiceCopilot({
    language,
    onResponse: handleVoiceResponse,
    getHistory: getHistoryCallback
  });

  const tips = [
    {
      icon: Accessibility,
      title: isHindi ? 'सुलभ रास्ते खोजें' : 'Find accessible routes',
      desc: isHindi
        ? 'व्हीलचेयर और बुजुर्ग यात्रियों के लिए step-free routes पूछें।'
        : 'Ask for step-free routes suitable for wheelchair and elderly travelers.',
      example: isHindi
        ? 'ताजमहल तक wheelchair accessible रास्ता बताओ'
        : 'Find a wheelchair accessible route to Taj Mahal'
    },
    {
      icon: MapPin,
      title: isHindi ? 'सुलभ स्थान खोजें' : 'Find accessible places',
      desc: isHindi
        ? 'पास के accessible toilets, entrances और facilities खोजें।'
        : 'Find accessible toilets, entrances and facilities nearby.',
      example: isHindi
        ? 'India Gate के पास accessible toilet खोजो'
        : 'Find an accessible restroom near India Gate'
    },
    {
      icon: Navigation,
      title: isHindi ? 'यात्रा की योजना बनाएं' : 'Plan your journey',
      desc: isHindi
        ? 'पूरी यात्रा को accessibility के हिसाब से plan करें।'
        : 'Plan your journey around accessibility requirements.',
      example: isHindi
        ? 'दिल्ली में accessible day trip plan करो'
        : 'Plan an accessible day trip in Delhi'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f6fb] dark:bg-[#07070a] text-slate-900 dark:text-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* HERO BANNER */}
            <section className="mb-6">
              <div className="relative overflow-hidden rounded-3xl border border-violet-100 dark:border-violet-950/60 bg-white dark:bg-[#0d0c12] shadow-xs">
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                      <Sparkles className="h-3 w-3" />
                      YatraSaathi Copilot
                    </div>

                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                      {isHindi ? 'आपका बुद्धिमत्तापूर्ण यात्रा सहायक' : 'Your Intelligent Travel Copilot'}
                    </h1>

                    <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm font-medium">
                      {isHindi
                        ? 'प्राकृतिक भाषा में सवाल पूछें, सुलभ मार्ग (step-free routes) खोजें और वॉइस के जरिए रियल-टाइम यात्रा सहायता प्राप्त करें।'
                        : 'Ask naturally, discover step-free routes, and get real-time travel assistance through voice or text.'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {isHindi ? 'AI सहायता सक्रिय' : 'AI Travel Companion'}
                      </p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 font-medium">
                        {isHindi ? 'बाधा मुक्त मार्ग सहायता' : 'Step-free routing active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* LEFT: TEXT COPILOT CHAT WIDGET */}
              <section className="min-w-0">
                <CopilotWidget
                  onExternalVoiceResponse={handleVoiceResponse}
                  voiceState={voiceState}
                />
              </section>

              {/* RIGHT SIDEBAR: VOICE AGENT CARD, INTERACTIVE MAP & EXAMPLES */}
              <aside className="space-y-5">
                {/* Real-time Voice Agent Card */}
                <VoiceAgentCard
                  voiceState={voiceState}
                  statusText={statusText}
                  liveTranscript={liveTranscript}
                  errorMessage={errorMessage}
                  onToggleSession={startSession}
                  onEndCall={endCall}
                  isHindi={isHindi}
                />

                {/* Live Interactive Accessibility Map */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d0c12] p-4 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        {isHindi ? 'लाइव सुलभ मानचित्र' : 'Live Accessibility Map'}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                      {isHindi ? 'लाइव' : 'LIVE'}
                    </span>
                  </div>
                  <div className="h-[260px] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                    <InteractiveMap
                      places={mapPlaces.length > 0 ? mapPlaces : undefined}
                      routeGeometry={routeInfo?.geometry}
                    />
                  </div>
                </div>


                {/* Example Query Hints */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d0c12] p-5 shadow-xs">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/50">
                      <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        {isHindi ? 'आप क्या पूछ सकते हैं?' : 'Example Queries'}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {isHindi ? 'सुझाए गए यात्रा प्रश्न' : 'Suggested travel prompts'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tips.map((tip, index) => {
                      const Icon = tip.icon;

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3 transition hover:border-violet-200"
                        >
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                              <Icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                                {tip.title}
                              </h4>
                              <p className="mt-1 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                                {tip.desc}
                              </p>
                              <p className="mt-2 text-[9px] italic font-semibold text-violet-600 dark:text-violet-400">
                                “{tip.example}”
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}