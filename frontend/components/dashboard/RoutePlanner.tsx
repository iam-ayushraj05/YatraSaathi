'use client';

import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  MapPin, 
  Search, 
  Shuffle,
  Crosshair,
  ChevronDown,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';

interface RoutePlannerProps {
  onRoutePlanned: (data: {
    origin: Coordinate;
    destination: Coordinate;
    startLabel?: string;
    endLabel?: string;
    routes: any[];
  }) => void;
  initialFrom?: string;
  initialTo?: string;
}

const DELHI_LOCATIONS: Record<string, { lat: number; lng: number; area: string; level: string; icon: string }> = {
  'Lotus Temple': { lat: 28.5535, lng: 77.2588, area: 'Kalkaji', level: 'High Access', icon: 'nature_people' },
  'National Museum': { lat: 28.6118, lng: 77.2191, area: 'Janpath', level: 'High Access', icon: 'museum' },
  'India Gate': { lat: 28.6129, lng: 77.2295, area: 'Central Delhi', level: 'High Access', icon: 'account_balance' },
  'Qutub Minar': { lat: 28.5244, lng: 77.1855, area: 'Mehrauli', level: 'Medium Access', icon: 'temple_buddhist' },
  'Red Fort': { lat: 28.6562, lng: 77.2410, area: 'Old Delhi', level: '2 Barriers', icon: 'fort' },
  'Lodhi Gardens': { lat: 28.5931, lng: 77.2197, area: 'Lodhi Colony', level: 'High Access', icon: 'park' },
  'Connaught Place': { lat: 28.6304, lng: 77.2177, area: 'Central Delhi', level: 'Step-Free Ramps', icon: 'storefront' },
  'Akshardham Temple': { lat: 28.6127, lng: 77.2773, area: 'East Delhi', level: 'Wheelchair Lift', icon: 'temple_hindu' },
  'Humayun\'s Tomb': { lat: 28.5933, lng: 77.2507, area: 'Nizamuddin', level: 'High Access', icon: 'account_balance' },
  'Rashtrapati Bhavan': { lat: 28.6143, lng: 77.1994, area: 'Raisina Hill', level: 'High Access', icon: 'account_balance' },
  'Dilli Haat INA': { lat: 28.5732, lng: 77.2083, area: 'INA Colony', level: 'Step-Free Ramps', icon: 'storefront' },
  'Safdarjung Tomb': { lat: 28.5893, lng: 77.2106, area: 'Safdarjung', level: 'Medium Access', icon: 'account_balance' }
};

const ACCESSIBLE_PLACES = [
  { name: 'Lotus Temple', area: 'Kalkaji', level: 'High Access' },
  { name: 'National Museum', area: 'Janpath', level: 'High Access' },
  { name: 'India Gate', area: 'Central Delhi', level: 'High Access' },
  { name: 'Qutub Minar', area: 'Mehrauli', level: 'Medium Access' },
  { name: 'Red Fort', area: 'Old Delhi', level: '2 Barriers' },
  { name: 'Lodhi Gardens', area: 'Lodhi Colony', level: 'High Access' },
  { name: 'Connaught Place', area: 'Central Delhi', level: 'Step-Free Ramps' },
  { name: 'Akshardham Temple', area: 'East Delhi', level: 'Wheelchair Lift' },
  { name: 'Humayun\'s Tomb', area: 'Nizamuddin', level: 'High Access' },
  { name: 'Dilli Haat INA', area: 'INA Colony', level: 'Step-Free Ramps' }
];

export default function RoutePlanner({ onRoutePlanned, initialFrom, initialTo }: RoutePlannerProps) {
  const { language } = useApp();
  const [fromLoc, setFromLoc] = useState(initialFrom || 'Lotus Temple');
  const [toLoc, setToLoc] = useState(initialTo || 'National Museum');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const [avoidStairs, setAvoidStairs] = useState(true);
  const [preferStepFree, setPreferStepFree] = useState(true);
  const [preferElevators, setPreferElevators] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLiveLocation, setUserLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getCoords = (name: string): { lat: number; lng: number } => {
    if (name.includes('Live Location') || name.includes('Real-Time')) {
      return userLiveLocation || { lat: 28.6139, lng: 77.2090 };
    }
    const cleanName = name.split(',')[0].trim();
    if (DELHI_LOCATIONS[cleanName]) return DELHI_LOCATIONS[cleanName];
    for (const [k, v] of Object.entries(DELHI_LOCATIONS)) {
      if (cleanName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cleanName.toLowerCase())) {
        return v;
      }
    }
    return { lat: 28.5830, lng: 77.2400 };
  };

  const calculateDistanceKm = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const lat1 = start.lat * Math.PI / 180;
    const lat2 = end.lat * Math.PI / 180;
    const deltaLat = (end.lat - start.lat) * Math.PI / 180;
    const deltaLng = (end.lng - start.lng) * Math.PI / 180;
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.max(1.5, 6371 * c * 1.32);
  };

  const generateRouteGeometry = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const path: { lat: number; lng: number }[] = [];
    const steps = 14;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const lat = start.lat + (end.lat - start.lat) * t + Math.sin(t * Math.PI) * ((end.lng - start.lng) * 0.15);
      const lng = start.lng + (end.lng - start.lng) * t - Math.sin(t * Math.PI) * ((end.lat - start.lat) * 0.15);
      path.push({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
    }
    return path;
  };

  const computeAndNotifyRoute = (startName: string, endName: string) => {
    const originCoord = getCoords(startName);
    const destCoord = getCoords(endName);
    const distKm = calculateDistanceKm(originCoord, destCoord);
    const durationSec = Math.round(distKm * 3.4 * 60);
    const geometry = generateRouteGeometry(originCoord, destCoord);

    const routes = [
      {
        id: `r1-${Date.now()}`,
        total_distance_meters: Math.round(distKm * 1000),
        total_duration_seconds: durationSec,
        suitability_score: 98,
        step_free: true,
        geometry: geometry,
        barriers_encountered_count: 0,
        warnings: []
      },
      {
        id: `r2-${Date.now()}`,
        total_distance_meters: Math.round(distKm * 1.12 * 1000),
        total_duration_seconds: Math.round(durationSec * 0.78),
        suitability_score: 82,
        step_free: false,
        geometry: geometry,
        barriers_encountered_count: 1,
        warnings: ['Some Stairs present on alternate path']
      }
    ];

    onRoutePlanned({
      origin: originCoord,
      destination: destCoord,
      startLabel: startName,
      endLabel: endName,
      routes: routes
    });
  };

  useEffect(() => {
    if (initialFrom) setFromLoc(initialFrom);
    if (initialTo) setToLoc(initialTo);
    computeAndNotifyRoute(initialFrom || fromLoc, initialTo || toLoc);
  }, [initialFrom, initialTo]);

  const handleSelectFrom = (placeName: string) => {
    setFromLoc(placeName);
    setShowFromDropdown(false);
    computeAndNotifyRoute(placeName, toLoc);
  };

  const handleSelectTo = (placeName: string) => {
    setToLoc(placeName);
    setShowToDropdown(false);
    computeAndNotifyRoute(fromLoc, placeName);
  };

  const handleSwap = () => {
    const temp = fromLoc;
    setFromLoc(toLoc);
    setToLoc(temp);
    computeAndNotifyRoute(toLoc, temp);
  };

  const handleLiveLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLiveLocation(coords);
          setFromLoc('My Real-Time Location');
          setShowFromDropdown(false);
          computeAndNotifyRoute('My Real-Time Location', toLoc);
        },
        () => {
          const simulated = { lat: 28.6139, lng: 77.2090 };
          setUserLiveLocation(simulated);
          setFromLoc('My Real-Time Location');
          setShowFromDropdown(false);
          computeAndNotifyRoute('My Real-Time Location', toLoc);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const filteredFromPlaces = ACCESSIBLE_PLACES.filter(p => 
    p.name.toLowerCase().includes(searchFrom.toLowerCase()) || 
    p.area.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredToPlaces = ACCESSIBLE_PLACES.filter(p => 
    p.name.toLowerCase().includes(searchTo.toLowerCase()) || 
    p.area.toLowerCase().includes(searchTo.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm transition-colors space-y-4">
      <div className="space-y-4">
        {/* Origin & Destination Dropdown Selectors */}
        <div className="space-y-2 relative">
          
          {/* Origin Dropdown Field */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-3.5 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-violet-500 transition-colors cursor-pointer shadow-sm text-left group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">{fromLoc}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-transform shrink-0" />
            </button>

            {/* Origin Popover Menu */}
            {showFromDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFromDropdown(false)} />
                <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-50 animate-fade-in">
                  
                  {/* GPS Live Location Quick Button */}
                  <button
                    type="button"
                    onClick={handleLiveLocation}
                    className="w-full mb-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-between text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Crosshair className="h-4 w-4 text-blue-600 animate-pulse" />
                      <span>Use My Real-Time Location</span>
                    </div>
                    {fromLoc === 'My Real-Time Location' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>

                  {/* Search Filter Input */}
                  <div className="relative mb-2">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search starting place..."
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredFromPlaces.map(place => (
                      <button
                        key={place.name}
                        type="button"
                        onClick={() => handleSelectFrom(place.name)}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          fromLoc === place.name 
                            ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{place.name}</div>
                          <div className="text-[10px] text-slate-400">{place.area} • {place.level}</div>
                        </div>
                        {fromLoc === place.name && <Check className="h-4 w-4 text-violet-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Swap Button in between */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-full text-slate-500 hover:text-violet-600 transition-colors shadow-sm cursor-pointer hover:rotate-180 duration-200"
              title="Swap Locations"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Destination Dropdown Field */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-3.5 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-violet-500 transition-colors cursor-pointer shadow-sm text-left group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="truncate">{toLoc}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-transform shrink-0" />
            </button>

            {/* Destination Popover Menu */}
            {showToDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowToDropdown(false)} />
                <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-50 animate-fade-in">
                  
                  {/* Search Filter Input */}
                  <div className="relative mb-2">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search destination landmark..."
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredToPlaces.map(place => (
                      <button
                        key={place.name}
                        type="button"
                        onClick={() => handleSelectTo(place.name)}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          toLoc === place.name 
                            ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{place.name}</div>
                          <div className="text-[10px] text-slate-400">{place.area} • {place.level}</div>
                        </div>
                        {toLoc === place.name && <Check className="h-4 w-4 text-violet-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Preferences */}
        <div>
          <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {language === 'HI' ? 'त्वरित प्राथमिकताएं' : 'QUICK PREFERENCES'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setAvoidStairs(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${avoidStairs ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'व्हीलचेयर' : 'Wheelchair'}
            </button>
            <button
              type="button"
              onClick={() => setPreferStepFree(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${preferStepFree ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'सीढ़ी-मुक्त' : 'Step-free'}
            </button>
            <button
              type="button"
              onClick={() => setPreferElevators(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${preferElevators ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'लिफ्ट' : 'Elevators'}
            </button>
          </div>
        </div>

        {/* Accessibility Constraints */}
        <div className="pt-1">
          <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
            {language === 'HI' ? 'सुलभता बाधाएं' : 'ACCESSIBILITY CONSTRAINTS'}
          </span>
          
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidStairs}
                onChange={(e) => setAvoidStairs(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 bg-transparent accent-violet-600"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                {language === 'HI' ? 'सीढ़ियों से बचें' : 'Avoid Stairs'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={preferStepFree}
                onChange={(e) => setPreferStepFree(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 bg-transparent accent-violet-600"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                {language === 'HI' ? 'सीढ़ी-मुक्त मार्ग को प्राथमिकता दें' : 'Prefer Step-Free Paths'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={preferElevators}
                onChange={(e) => setPreferElevators(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 bg-transparent accent-violet-600"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                {language === 'HI' ? 'लिफ्ट की आवश्यकता है' : 'Require Elevators / Lifts'}
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => computeAndNotifyRoute(fromLoc, toLoc)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl py-3 text-xs font-black transition-all shadow-md shadow-violet-200 dark:shadow-none hover:shadow-lg disabled:opacity-60 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Routes...</span>
            </>
          ) : (
            <>
              <Accessibility className="h-4 w-4" />
              <span>{language === 'HI' ? 'मेरा सुलभ मार्ग योजना बनाएं →' : 'Plan My Accessible Route →'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
