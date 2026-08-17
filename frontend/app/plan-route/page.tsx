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

export default function PlanRoute() {
  const { language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeData, setRouteData] = useState<{
    origin: Coordinate;
    destination: Coordinate;
    routes: any[];
  } | null>(null);

  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const activeRoute = routeData ? routeData.routes[selectedRouteIdx] : null;

  return (
    <div className="flex min-h-screen bg-[#fcfbfc] dark:bg-[#0c0e17] transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Route Planner + Recommended Routes */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <RoutePlanner onRoutePlanned={(data) => { setRouteData(data); setSelectedRouteIdx(0); }} />
              
              <RecommendedRoutes 
                routes={routeData ? routeData.routes : null}
                selectedRouteIndex={selectedRouteIdx}
                onSelectRoute={setSelectedRouteIdx}
              />
            </div>

            {/* Right Column: Full Interactive Map (Equal length to side box) */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <InteractiveMap 
                origin={routeData?.origin}
                destination={routeData?.destination}
                routeGeometry={activeRoute?.geometry || null}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
