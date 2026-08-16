'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import RoutePlanner from '../../components/dashboard/RoutePlanner';
import InteractiveMap from '../../components/dashboard/InteractiveMap';
import RecommendedRoutes from '../../components/dashboard/RecommendedRoutes';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';
import { Compass, Map, Sparkles } from 'lucide-react';

export default function PlanRoute() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeData, setRouteData] = useState<{
    origin: Coordinate;
    destination: Coordinate;
    routes: any[];
  } | null>(null);

  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const activeRoute = routeData ? routeData.routes[selectedRouteIdx] : null;

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Map className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              {t('plan_route')}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              {language === 'HI' 
                ? 'अपना मार्ग विवरण दर्ज करें और सबसे सुरक्षित मार्ग खोजें।' 
                : 'Specify your route parameters and find the safest path.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input & Choices (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <RoutePlanner onRoutePlanned={(data) => { setRouteData(data); setSelectedRouteIdx(0); }} />
              
              <RecommendedRoutes 
                routes={routeData ? routeData.routes : null}
                selectedRouteIndex={selectedRouteIdx}
                onSelectRoute={setSelectedRouteIdx}
              />
            </div>

            {/* Map Canvas (7 cols) */}
            <div className="lg:col-span-7">
              <div className="sticky top-24 space-y-4">
                <InteractiveMap 
                  origin={routeData?.origin}
                  destination={routeData?.destination}
                  routeGeometry={activeRoute?.geometry || null}
                />
                
                {/* Route statistics overlay */}
                {activeRoute && (
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 shadow-sm space-y-3 transition-colors">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-violet-650 dark:text-violet-400" />
                      {language === 'HI' ? 'विस्तृत मार्ग विवरण' : 'Detailed Path Breakdown'}
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{language === 'HI' ? 'अनुकूलता' : 'Suitability'}</p>
                        <p className="text-sm font-black text-violet-600 dark:text-violet-400 mt-1">{activeRoute.suitability_score}%</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{language === 'HI' ? 'दूरी' : 'Distance'}</p>
                        <p className="text-sm font-black text-slate-850 dark:text-slate-200 mt-1">{(activeRoute.total_distance_meters / 1000).toFixed(1)} km</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{language === 'HI' ? 'समय' : 'Duration'}</p>
                        <p className="text-sm font-black text-slate-850 dark:text-slate-200 mt-1">{Math.round(activeRoute.total_duration_seconds / 60)} mins</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
