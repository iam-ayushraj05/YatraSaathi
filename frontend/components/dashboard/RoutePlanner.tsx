'use client';

import React, { useState } from 'react';
import { 
  Accessibility, 
  MapPin, 
  Search, 
  Shuffle
} from 'lucide-react';
import { api } from '../../lib/api';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';

interface RoutePlannerProps {
  onRoutePlanned: (data: {
    origin: Coordinate;
    destination: Coordinate;
    routes: any[];
  }) => void;
}

const QUICK_LOCATIONS = [
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Qutub Minar', lat: 28.5244, lng: 77.1855 },
  { name: 'Red Fort', lat: 28.6562, lng: 77.2410 },
  { name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507 },
  { name: 'Lotus Temple', lat: 28.5535, lng: 77.2588 },
  { name: 'Connaught Place', lat: 28.6304, lng: 77.2177 },
];

export default function RoutePlanner({ onRoutePlanned }: RoutePlannerProps) {
  const { language } = useApp();
  const [fromLoc, setFromLoc] = useState('India Gate');
  const [toLoc, setToLoc] = useState('Lotus Temple');
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [preferStepFree, setPreferStepFree] = useState(true);
  const [preferElevators, setPreferElevators] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const originItem = QUICK_LOCATIONS.find(l => l.name.toLowerCase() === fromLoc.toLowerCase()) || QUICK_LOCATIONS[0];
      const destItem = QUICK_LOCATIONS.find(l => l.name.toLowerCase() === toLoc.toLowerCase()) || QUICK_LOCATIONS[4];

      const originCoord: Coordinate = { lat: originItem.lat, lng: originItem.lng };
      const destCoord: Coordinate = { lat: destItem.lat, lng: destItem.lng };

      const res = await api.routes.plan({
        origin: originCoord,
        destination: destCoord,
        preferences: {
          avoid_stairs: avoidStairs,
          prefer_step_free: preferStepFree,
          prefer_elevators: preferElevators
        }
      });

      onRoutePlanned({
        origin: originCoord,
        destination: destCoord,
        routes: res.routes
      });
    } catch (err: any) {
      setError(err.message || 'Route planning failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Preferences */}
        <div>
          <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {language === 'HI' ? 'त्वरित प्राथमिकताएं' : 'QUICK PREFERENCES'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setAvoidStairs(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${avoidStairs ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'व्हीलचेयर' : 'Wheelchair'}
            </button>
            <button
              type="button"
              onClick={() => setPreferStepFree(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${preferStepFree ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'सीढ़ी-मुक्त' : 'Step-free'}
            </button>
            <button
              type="button"
              onClick={() => setPreferElevators(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${preferElevators ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'HI' ? 'लिफ्ट' : 'Elevators'}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold border bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            >
              {language === 'HI' ? 'अधिक' : 'More'}
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

        {error && (
          <p className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
            {error}
          </p>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3 text-xs font-black transition-all shadow-md shadow-violet-200 dark:shadow-none hover:shadow-lg disabled:opacity-60 active:scale-[0.98]"
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
      </form>
    </div>
  );
}
