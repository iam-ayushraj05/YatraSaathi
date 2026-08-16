'use client';

import React, { useState } from 'react';

import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

import RoutePlanner from '../../components/dashboard/RoutePlanner';
import InteractiveMap from '../../components/dashboard/InteractiveMap';
import RecommendedRoutes from '../../components/dashboard/RecommendedRoutes';
import ProfileWidget from '../../components/dashboard/ProfileWidget';
import ConditionsWidget from '../../components/dashboard/ConditionsWidget';
import CopilotWidget from '../../components/dashboard/CopilotWidget';

import HeroSection from '../../components/dashboard/HeroSection';
import TravelSearch from '../../components/dashboard/TravelSearch';
import BenefitsStrip from '../../components/dashboard/BenefitsStrip';
import HotDeals from '../../components/dashboard/HotDeals';
import TopDestinations from '../../components/dashboard/TopDestinations';
import Responsibilities from '../../components/dashboard/Responsibilities';

import { useApp } from '../../context/AppContext';
import { Coordinate } from '../../lib/types';

export default function Dashboard() {
  const { t } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [plannedRouteData, setPlannedRouteData] = useState<{
    origin: Coordinate;
    destination: Coordinate;
    routes: any[];
  } | null>(null);

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const handleRoutePlanned = (data: {
    origin: Coordinate;
    destination: Coordinate;
    routes: any[];
  }) => {
    setPlannedRouteData(data);
    setSelectedRouteIndex(0);
  };

  const activeRoute = plannedRouteData ? plannedRouteData.routes[selectedRouteIndex] : null;

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header Controls */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-5 w-full">
          
          {/* 1. HERO SECTION */}
          <HeroSection />

          {/* 2. TRAVEL SEARCH */}
          <TravelSearch />

          {/* 3. BENEFITS STRIP */}
          <BenefitsStrip />

          {/* 4. MAIN ACCESSIBILITY DASHBOARD — 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT: Route Planner + Recommended Routes (~25%) */}
            <div className="lg:col-span-3 space-y-4">
              <RoutePlanner onRoutePlanned={handleRoutePlanned} />
              <RecommendedRoutes 
                routes={plannedRouteData ? plannedRouteData.routes : null}
                selectedRouteIndex={selectedRouteIndex}
                onSelectRoute={setSelectedRouteIndex}
              />
            </div>

            {/* CENTER: Interactive Map (~45%) */}
            <div className="lg:col-span-5">
              <div className="sticky top-16">
                <InteractiveMap 
                  origin={plannedRouteData?.origin}
                  destination={plannedRouteData?.destination}
                  routeGeometry={activeRoute?.geometry || null}
                />
              </div>
            </div>

            {/* RIGHT: Profile + Conditions + Copilot (~30%) */}
            <div className="lg:col-span-4 space-y-4">
              <ProfileWidget />
              <ConditionsWidget />
              <CopilotWidget />
            </div>
          </div>

          {/* 5. HOT DEALS */}
          <HotDeals />

          {/* 6. TOP DESTINATIONS */}
          <TopDestinations />

          {/* 7. RESPONSIBILITIES */}
          <Responsibilities />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
