'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import RoutePlanner from '../../components/dashboard/RoutePlanner';
import InteractiveMap from '../../components/dashboard/InteractiveMap';
import RecommendedRoutes from '../../components/dashboard/RecommendedRoutes';
import FaqSection from '../../components/common/FaqSection';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

function PlanRouteContent() {
  const searchParams = useSearchParams();
  const { language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeData, setRouteData] = useState<{
    origin: Coordinate;
    destination: Coordinate;
    startLabel?: string;
    endLabel?: string;
    routes: any[];
  } | null>(null);

  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const activeRoute = routeData ? routeData.routes[selectedRouteIdx] : null;

  const toName = searchParams.get('to') || undefined;

  return (
    <div className="flex min-h-screen bg-[#fcfbfc] dark:bg-[#0c0e17] transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {toName && (
            <div className="max-w-[1600px] mx-auto mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base animate-spin">navigation</span>
                <span>
                  {language === 'HI' ? 'गंतव्य हेतु स्वचालित सुलभ मार्ग:' : 'Auto-routed step-free navigation for:'} <strong>{toName}</strong>
                </span>
              </div>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider">
                Step-Free Guidance
              </span>
            </div>
          )}

          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Route Planner + Recommended Routes */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <RoutePlanner 
                initialTo={toName}
                onRoutePlanned={(data) => { 
                  setRouteData(data); 
                  setSelectedRouteIdx(0); 
                }} 
              />
              
              <RecommendedRoutes 
                routes={routeData ? routeData.routes : null}
                selectedRouteIndex={selectedRouteIdx}
                onSelectRoute={setSelectedRouteIdx}
              />
            </div>

            {/* Right Column: Full Interactive Map */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[550px]">
              <InteractiveMap 
                origin={routeData?.origin || { lat: 28.5535, lng: 77.2588 }}
                destination={routeData?.destination || { lat: 28.6118, lng: 77.2191 }}
                startLabel={routeData?.startLabel || 'Lotus Temple'}
                endLabel={routeData?.endLabel || 'National Museum'}
                routeGeometry={activeRoute?.geometry || activeRoute?.path || null}
                showLegend={true}
                className="w-full h-full flex-1 min-h-[550px]"
              />
            </div>
          </div>

          {/* Route Engine & Accessibility FAQ Section */}
          <div className="max-w-[1600px] mx-auto mt-6">
            <FaqSection 
              title={language === 'HI' ? 'मार्ग नियोजन व सुगम नेविगेशन FAQ' : 'Accessibility-Aware Route Engine FAQs'}
              subtitle={language === 'HI' 
                ? 'जानिए सीढ़ी-मुक्त मार्ग, रैंप ढलान और वास्तविक समय की बाधाओं की गणना कैसे होती है' 
                : 'Learn how ramp angles, elevators, step-free options, and dynamic barrier bypass calculations work'
              }
              customFaqs={[
                {
                  category: 'Monitoring',
                  badge: 'Step-Free Routing',
                  question: language === 'HI' 
                    ? 'YatraSaathi सुलभ मार्गों की गणना कैसे करता है?' 
                    : 'How does YatraSaathi calculate step-free vs standard routes?',
                  answer: language === 'HI'
                    ? 'रूटर इंजन मानचित्र के प्रत्येक सेगमेंट का विश्लेषण करता है। यह केवल उन्हीं मार्गों को चुनता है जिनमें 0 सीढ़ियाँ, चालू लिफ्ट और 1:12 ग्रेड से कम ढलान वाले रैंप उपलब्ध हों।'
                    : 'The routing engine analyzes every segment of the transport graph, strictly prioritizing paths with zero steps, verified elevator access, and ramp inclines below 1:12 grade.'
                },
                {
                  category: 'Monitoring',
                  badge: 'Dynamic Barriers',
                  question: language === 'HI' 
                    ? 'यदि मेरे चुनिंदा मार्ग में अचानक कोई बाधा रिपोर्ट होती है तो क्या होता है?' 
                    : 'What happens if a new barrier is reported on my active route?',
                  answer: language === 'HI'
                    ? 'जैसे ही किसी लिफ्ट के बंद होने या बाधा की रिपोर्ट दर्ज होती है, YatraSaathi आपकी नेविगेशन स्क्रीन पर अलर्ट भेजता है और स्वचालित रूप से एक नया सुरक्षित मार्ग देता है।'
                    : 'When a broken lift or construction barrier is reported, YatraSaathi automatically flags the affected path and computes an instant detour.'
                },
                {
                  category: 'Enhancing',
                  badge: 'Compatibility Score',
                  question: language === 'HI' 
                    ? 'मार्गों के साथ दिए गए Compatibility Score (1-100) का क्या अर्थ है?' 
                    : 'What does the Traveller Compatibility Score (e.g. 95/100) mean?',
                  answer: language === 'HI'
                    ? 'यह स्कोर दिखाता है कि चुना गया रास्ता आपकी चुनिंदा एक्सेसिबिलिटी प्राथमिकताओं (जैसे व्हीलचेयर मॉडल, दृष्टि सहायता या सीढ़ी न चढ़ना) से कितना मेल खाता है।'
                    : 'The Compatibility Score reflects how closely a route matches your personal profile requirements, factoring in continuous ramp availability, tactile paving, and rest stops.'
                },
                {
                  category: 'Trust & Verification',
                  badge: 'Transit Transfers',
                  question: language === 'HI' 
                    ? 'क्या मेट्रो और ट्रेन स्टेशनों के बीच इंटरचेंज सुलभ हैं?' 
                    : 'Are multi-modal transit interchanges verified for wheelchair access?',
                  answer: language === 'HI'
                    ? 'हाँ! YatraSaathi मेट्रो, बस और रेलवे स्टेशनों के लिफ्ट स्थानों और लेवल-बोर्डिंग दरवाजों की मैपिंग को शामिल करता है ताकि निर्बाध बदलाव हो सके।'
                    : 'Yes! Metro and railway station transfers include precise elevator door coordinates and level-boarding carriage locations to guarantee step-free transit transfers.'
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

export default function PlanRoute() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#fcfbfc] dark:bg-[#0c0e17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Route Planner...</p>
        </div>
      </div>
    }>
      <PlanRouteContent />
    </Suspense>
  );
}
