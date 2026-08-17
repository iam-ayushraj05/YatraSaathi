'use client';

import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Check, 
  TrendingUp
} from 'lucide-react';
import { Route } from '../../lib/types';
import { useApp } from '../../context/AppContext';

interface RecommendedRoutesProps {
  routes: Route[] | null;
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
}

export default function RecommendedRoutes({ 
  routes, 
  selectedRouteIndex, 
  onSelectRoute 
}: RecommendedRoutesProps) {
  const { language } = useApp();

  const demoRoutes = [
    {
      id: 'r1',
      name: 'MOST ACCESSIBLE',
      distance: '12.4 km',
      duration: '45 mins',
      score: 98,
      scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
      details: ['No Stairs', 'Smooth Sidewalks', 'Less Crowd'],
      warning: null
    },
    {
      id: 'r2',
      name: 'FASTER BUT LESS ACCESSIBLE',
      distance: '14.1 km',
      duration: '32 mins',
      score: 82,
      scoreColor: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
      details: ['Some Stairs', 'Uneven Brick', 'Avoided by users'],
      warning: 'Active construction block reported.'
    },
    {
      id: 'r3',
      name: 'ALTERNATIVE SCENIC',
      distance: '15.2 km',
      duration: '55 mins',
      score: 75,
      scoreColor: 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/40',
      details: ['Elevator', 'Good Sidewalks'],
      warning: null
    }
  ];

  const activeRoutes = routes 
    ? routes.map((r, i) => ({
        id: `live-${i}`,
        name: i === 0 ? (language === 'HI' ? 'सबसे सुलभ मार्ग' : 'Most Accessible') : i === 1 ? (language === 'HI' ? 'तेज़ लेकिन कम सुलभ' : 'Faster but Less Accessible') : (language === 'HI' ? 'वैकल्पिक मार्ग' : 'Alternative Route'),
        distance: `${(r.total_distance_meters / 1000).toFixed(1)} km`,
        duration: `${Math.round(r.total_duration_seconds / 60)} min`,
        score: r.suitability_score,
        scoreColor: r.suitability_score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' : 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400',
        details: r.step_free ? ['No Stairs', 'Elevator Available', 'Low Crowd'] : ['Some Stairs', 'Limited Access'],
        warning: r.barriers_encountered_count > 0 ? (language === 'HI' ? 'वैकल्पिक मार्ग की सलाह: सक्रिय निर्माण बाधा।' : 'Detour advised: Active construction block reported.') : null
      }))
    : demoRoutes;

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-4 md:p-5 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-800 dark:text-slate-200" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {language === 'HI' ? 'अनुशंसित मार्ग' : 'Recommended Routes'}
          </h3>
        </div>
        <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {routes ? (language === 'HI' ? 'लाइव मार्ग' : 'LIVE ROUTES') : (language === 'HI' ? 'सुझाए गए विकल्प' : 'SUGGESTED OPTIONS')}
        </span>
      </div>

      {/* Routes List */}
      <div className="mt-3.5 space-y-2.5">
        {activeRoutes.map((route, idx) => {
          const isSelected = selectedRouteIndex === idx;

          return (
            <div 
              key={route.id}
              onClick={() => onSelectRoute(idx)}
              className={`
                relative rounded-2xl border p-3.5 cursor-pointer transition-all duration-150
                ${isSelected 
                  ? 'border-violet-600 bg-violet-50/15 dark:bg-violet-950/20 shadow-sm' 
                  : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                }
              `}
            >
              {/* Header row: Route # & Score */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <span>{language === 'HI' ? `मार्ग ${idx + 1}` : `Route ${idx + 1}`}</span>
                    {isSelected && (
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-white text-[8px]">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                    {route.name}
                  </p>
                </div>
                
                {/* Score Pill */}
                <div className={`px-2 py-0.5 rounded-lg border font-black text-[10px] ${route.scoreColor}`}>
                  <span>{route.score} / 100</span>
                </div>
              </div>

              {/* Distance & Time */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>{route.distance} • {route.duration}</span>
              </p>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap gap-1">
                {route.details?.map((detail, i) => (
                  <span 
                    key={i} 
                    className="text-[9px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded-md"
                  >
                    {detail}
                  </span>
                ))}
              </div>

              {/* Warning Notice if any */}
              {route.warning && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>{route.warning}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
