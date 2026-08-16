'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Settings, 
  Accessibility, 
  Milestone,
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

const LOCALIZED_PLACES: Record<string, Record<string, string>> = {
  EN: {
    'India Gate': 'India Gate',
    'Qutub Minar': 'Qutub Minar',
    'Red Fort': 'Red Fort',
    "Humayun's Tomb": "Humayun's Tomb",
    'Lotus Temple': 'Lotus Temple',
    'Connaught Place': 'Connaught Place'
  },
  HI: {
    'India Gate': 'इंडिया गेट',
    'Qutub Minar': 'कुतुब मीनार',
    'Red Fort': 'लाल किला',
    "Humayun's Tomb": 'हुमायूँ का मकबरा',
    'Lotus Temple': 'लोटस टेम्पल',
    'Connaught Place': 'कनॉट प्लेस'
  }
};

export default function RoutePlanner({ onRoutePlanned }: RoutePlannerProps) {
  const { t, language } = useApp();
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
      setError(err.message || 'Route planning failed. Try selecting quick locations.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwap = () => {
    const temp = fromLoc;
    setFromLoc(toLoc);
    setToLoc(temp);
  };

  const getLocalizedName = (name: string) => {
    return LOCALIZED_PLACES[language]?.[name] || name;
  };

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm transition-colors">
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-105 dark:border-slate-800">
        <Milestone className="h-4.5 w-4.5 text-violet-650 dark:text-violet-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{t('find_route')}</h3>
      </div>

      <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
        {/* From */}
        <div>
          <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1">
            {t('start_loc')}
          </label>
          <div className="relative">
            <select
              value={fromLoc}
              onChange={(e) => setFromLoc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:border-violet-500 focus:outline-none appearance-none"
            >
              {QUICK_LOCATIONS.map(l => (
                <option key={l.name} value={l.name}>{getLocalizedName(l.name)}</option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-3.5 h-3.5 w-3.5 text-emerald-500" />
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center -my-2">
          <button
            type="button"
            onClick={handleQuickSwap}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-400 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all hover:scale-105 active:scale-95"
            title="Swap locations"
          >
            <Shuffle className="h-3 w-3" />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="block text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1">
            {t('dest_loc')}
          </label>
          <div className="relative">
            <select
              value={toLoc}
              onChange={(e) => setToLoc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:border-violet-500 focus:outline-none appearance-none"
            >
              {QUICK_LOCATIONS.map(l => (
                <option key={l.name} value={l.name}>{getLocalizedName(l.name)}</option>
              ))}
            </select>
            <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-violet-500" />
          </div>
        </div>

        {/* Quick preference chips */}
        <div className="pt-1">
          <span className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            {t('quick_pref')}
          </span>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => { setAvoidStairs(prev => !prev); }}
              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-colors ${avoidStairs ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400'}`}
            >
              {t('wheelchair')}
            </button>
            <button
              type="button"
              onClick={() => { setPreferStepFree(prev => !prev); }}
              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-colors ${preferStepFree ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400'}`}
            >
              {t('step_free')}
            </button>
            <button
              type="button"
              onClick={() => { setPreferElevators(prev => !prev); }}
              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-colors ${preferElevators ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400'}`}
            >
              {t('elevators')}
            </button>
            <button
              type="button"
              className="px-2.5 py-1 rounded-full text-[9px] font-bold border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('more')}
            </button>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <span className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Settings className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            {t('acc_constraints')}
          </span>
          
          <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidStairs}
                onChange={(e) => setAvoidStairs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-705 text-violet-650 focus:ring-violet-500 bg-transparent"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-350 font-medium">{t('avoid_stairs')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferStepFree}
                onChange={(e) => setPreferStepFree(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-705 text-violet-655 focus:ring-violet-500 bg-transparent"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-350 font-medium">{t('prefer_step_free')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferElevators}
                onChange={(e) => setPreferElevators(e.target.checked)}
                className="h-4 w-4 rounded border-slate-305 dark:border-slate-705 text-violet-660 focus:ring-violet-500 bg-transparent"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-350 font-medium">{t('require_elevators')}</span>
            </label>
          </div>
        </div>

        {error && (
          <p className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{language === 'HI' ? 'मार्ग विश्लेषण किया जा रहा है...' : 'Analyzing Routes...'}</span>
            </>
          ) : (
            <>
              <Accessibility className="h-3.5 w-3.5" />
              <span>{t('plan_button')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
