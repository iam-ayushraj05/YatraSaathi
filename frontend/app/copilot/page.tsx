'use client';

import React, { useRef, useCallback } from 'react';
import { Sparkles, HelpCircle, ShieldCheck, MapPin, Navigation, Accessibility } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import CopilotWidget from '../../components/dashboard/CopilotWidget';
import VoiceAgentCard from '../../components/dashboard/VoiceAgentCard';
import FaqSection from '../../components/common/FaqSection';
import InteractiveMap from '../../components/dashboard/InteractiveMap';
import { useVoiceCopilot } from '../../hooks/useVoiceCopilot';


export default function CopilotPage() {
  const { t, language, userLocation } = useApp();
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
          lat: p.latitude || userLocation.lat,
          lng: p.longitude || userLocation.lng,
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
            {/* COMPACT HERO BANNER */}
            <section className="mb-4">
              <div className="relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#0d0c12] px-4 py-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#6b21a8] dark:text-purple-400 shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        {isHindi ? 'आपका बुद्धिमत्तापूर्ण यात्रा सहायक' : 'Your Intelligent Travel Copilot'}
                      </h1>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {isHindi
                          ? 'प्राकृतिक भाषा में सवाल पूछें, सुलभ मार्ग (step-free routes) खोजें और वॉइस के जरिए सहायता प्राप्त करें।'
                          : 'Ask naturally, discover step-free routes, and get real-time travel assistance through voice or text.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/20 px-3 py-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 leading-none">
                        {isHindi ? 'AI सहायता सक्रिय' : 'Step-Free Routing Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN TWO-COLUMN GRID (Left: Voice Copilot, Right: Expanded Chat AI) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              {/* LEFT: VOICE COPILOT CARD */}
              <aside className="space-y-4">
                <VoiceAgentCard
                  voiceState={voiceState}
                  statusText={statusText}
                  liveTranscript={liveTranscript}
                  errorMessage={errorMessage}
                  onToggleSession={startSession}
                  onEndCall={endCall}
                  isHindi={isHindi}
                />
              </aside>

              {/* RIGHT: EXPANDED TEXT COPILOT CHAT AI */}
              <section className="min-w-0">
                <CopilotWidget
                  onExternalVoiceResponse={handleVoiceResponse}
                  voiceState={voiceState}
                />
              </section>
            </div>

            {/* FULL SCREEN LEFT TO RIGHT: EXAMPLE QUERIES */}
            <section className="mt-6 w-full">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d0c12] p-5 shadow-xs">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
                    <HelpCircle className="h-4 w-4 text-[#6b21a8] dark:text-purple-300" />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {tips.map((tip, index) => {
                    const Icon = tip.icon;

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 transition hover:border-purple-200 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                            <Icon className="h-4 w-4 text-[#6b21a8] dark:text-purple-300" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                              {tip.title}
                            </h4>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                              {tip.desc}
                            </p>
                            <p className="mt-2 text-[10px] italic font-bold text-[#6b21a8] dark:text-purple-400">
                              “{tip.example}”
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* YatraMitra Copilot & Voice AI FAQs */}
            <FaqSection 
              title={isHindi ? 'YatraMitra AI Copilot कैसे काम करता है?' : 'YatraMitra AI & Voice Copilot FAQs'}
              subtitle={isHindi 
                ? 'जानिए वॉइस कमांड, प्राकृतिक भाषा प्रश्न और Explainable AI उत्तर की प्रक्रिया' 
                : 'Understand how real-time voice recognition, natural language reasoning, and explainable AI assist your travel'
              }
              customFaqs={[
                {
                  category: 'Enhancing',
                  badge: 'Voice Assistant',
                  question: isHindi
                    ? 'YatraMitra Voice Copilot कैसे काम करता है?'
                    : 'How does the YatraMitra Voice Copilot process spoken queries?',
                  answer: isHindi
                    ? 'YatraMitra वॉइस Copilot वेब ऑडियो API और बैकएंड AI ट्रांसक्रिप्शन का उपयोग करके आपकी आवाज़ को रियल-टाइम में समझता है। यह हिन्दी और अंग्रेज़ी दोनों भाषाओं में प्रश्न स्वीकार करता है और तुरंत उत्तर व मैप रूट्स प्रदान करता है।'
                    : 'The YatraMitra Voice Copilot uses Web Audio APIs and a real-time speech processing pipeline. It understands natural spoken Hindi and English queries (e.g. "Find step-free routes near me") and instantly responds with spoken guidance and mapped locations.'
                },
                {
                  category: 'Enhancing',
                  badge: 'Explainable AI',
                  question: isHindi
                    ? 'Explainable AI "Why this route?" उत्तर कैसे जनरेट करता है?'
                    : 'How does Explainable AI generate "Why this route?" explanations?',
                  answer: isHindi
                    ? 'जब YatraMitra AI कोई मार्ग सुझाता है, तो यह बैकएंड एक्सेसिबिलिटी डेटाबेस से वास्तविक मापदंडों (जैसे सीढ़ियों की संख्या, लिफ्ट चालू है या नहीं, और रैंप का ढलान कोण) की जांच करता है और पारदर्शी कारण प्रदान करता है।'
                    : 'When YatraMitra AI suggests a journey, it cross-references real backend parameters (ramp inclines, active elevators, and tactile paths) and articulates explicit reasons why the route suits your mobility profile.'
                },
                {
                  category: 'Monitoring',
                  badge: 'Real-Time Sync',
                  question: isHindi
                    ? 'क्या चैट और वॉइस असिस्टेंट मेरी लाइव लोकेशन का उपयोग करते हैं?'
                    : 'Does YatraMitra Copilot automatically use my live GPS location?',
                  answer: isHindi
                    ? 'हाँ! ब्राउज़र Geolocation API की अनुमति मिलने पर YatraMitra AI आपकी वास्तविक अक्षांश और देशांतर (lat/lng) का उपयोग करके आपके निकटतम सुलभ स्थलों और बाधाओं के बारे में सटीक सलाह देता है।'
                    : 'Yes! Upon granting browser location permission, YatraMitra Copilot utilizes your live coordinates to tailor search responses, find nearby wheelchair-accessible facilities, and avoid active local obstacles.'
                },
                {
                  category: 'Trust & Verification',
                  badge: 'Context Awareness',
                  question: isHindi
                    ? 'यदि YatraMitra AI को किसी मार्ग पर बाधा मिलती है तो यह क्या करता है?'
                    : 'What happens if YatraMitra AI detects an active barrier on my requested route?',
                  answer: isHindi
                    ? 'यदि कम्युनिटी या स्टेशन कंट्रोलर द्वारा किसी लिफ्ट या रैंप के अवरुद्ध होने की रिपोर्ट होती है, तो YatraMitra AI तुरंत आपको चेतावनी देता है और वैकल्पिक बाधा-मुक्त मार्ग प्रस्तुत करता है।'
                    : 'If a broken elevator or blocked ramp is flagged in the verification database, YatraMitra AI proactively alerts you during chat and recalculates a verified step-free detour.'
                }
              ]}
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}