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

const getLocalizedRouteName = (key: string, lang: string) => {
  const dict: Record<string, Record<string, string>> = {
    EN: {
      'Most Accessible': 'Most Accessible',
      'Faster but Less Accessible': 'Faster but Less Accessible',
      'Alternative Route': 'Alternative Route',
      'No Stairs': 'No Stairs',
      'Elevator Available': 'Elevator Available',
      'Low Crowd': 'Low Crowd',
      'Some Stairs': 'Some Stairs',
      'Crowded Area': 'Crowded Area',
      'Limited Access': 'Limited Access',
      '1 Barrier': '1 Barrier',
      'Good Facilities': 'Good Facilities',
      'Step-Free Path': 'Step-Free Path'
    },
    HI: {
      'Most Accessible': 'सबसे सुलभ मार्ग',
      'Faster but Less Accessible': 'तेज़ लेकिन कम सुलभ',
      'Alternative Route': 'वैकल्पिक मार्ग',
      'No Stairs': 'कोई सीढ़ी नहीं',
      'Elevator Available': 'लिफ्ट उपलब्ध है',
      'Low Crowd': 'कम भीड़',
      'Some Stairs': 'कुछ सीढ़ियां',
      'Crowded Area': 'भीड़भाड़ वाला क्षेत्र',
      'Limited Access': 'सीमित पहुंच',
      '1 Barrier': '1 बाधा',
      'Good Facilities': 'अच्छी सुविधाएं',
      'Step-Free Path': 'सीढ़ी-मुक्त पथ'
    }
  };
  return dict[lang]?.[key] || key;
};

export default function RecommendedRoutes({ 
  routes, 
  selectedRouteIndex, 
  onSelectRoute 
}: RecommendedRoutesProps) {
  const { t, language } = useApp();

  const demoRoutes = [
    {
      id: 'dr1',
      name: 'Most Accessible',
      total_distance_meters: 6200,
      total_duration_seconds: 1080,
      suitability_score: 85,
      accessibility_level: 'HIGH',
      safety_index: 92,
      stairs_count: 0,
      step_free: true,
      barriers_encountered_count: 0,
      geometry: [],
      details: ['No Stairs', 'Elevator Available', 'Low Crowd']
    },
    {
      id: 'dr2',
      name: 'Faster but Less Accessible',
      total_distance_meters: 4800,
      total_duration_seconds: 840,
      suitability_score: 62,
      accessibility_level: 'MEDIUM',
      safety_index: 70,
      stairs_count: 4,
      step_free: false,
      barriers_encountered_count: 1,
      geometry: [],
      details: ['Some Stairs', 'Crowded Area', 'Limited Access']
    },
    {
      id: 'dr3',
      name: 'Alternative Route',
      total_distance_meters: 6900,
      total_duration_seconds: 1200,
      suitability_score: 74,
      accessibility_level: 'HIGH',
      safety_index: 85,
      stairs_count: 0,
      step_free: true,
      barriers_encountered_count: 1,
      geometry: [],
      details: ['1 Barrier', 'Low Crowd', 'Good Facilities']
    }
  ];

  const activeRoutes = routes 
    ? routes.map((r, i) => ({
        ...r,
        name: i === 0 ? 'Most Accessible' : i === 1 ? 'Faster but Less Accessible' : 'Alternative Route',
        details: r.step_free ? ['No Stairs', 'Step-Free Path', 'Good Facilities'] : ['Some Stairs', 'Limited Access']
      }))
    : demoRoutes;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30';
    if (score >= 70) return 'text-violet-750 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30';
    return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30';
  };

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4.5 w-4.5 text-violet-650 dark:text-violet-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{t('recommended_routes')}</h3>
        </div>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">
          {routes ? t('live_routes') : t('suggested_options')}
        </span>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {activeRoutes.map((route: any, idx: number) => {
          const isSelected = selectedRouteIndex === idx;
          const scoreClass = getScoreColor(route.suitability_score);

          return (
            <div 
              key={route.id || idx}
              onClick={() => onSelectRoute(idx)}
              className={`
                relative rounded-xl border p-3.5 cursor-pointer transition-all duration-150
                ${isSelected 
                  ? 'border-violet-605 bg-violet-50/15 dark:bg-violet-950/25 shadow-sm' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-205 dark:hover:border-slate-700'
                }
              `}
            >
              {/* Score & Name */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-205 text-xs flex items-center gap-1">
                    {language === 'HI' ? `मार्ग ${idx + 1}` : `Route ${idx + 1}`}
                    {isSelected && (
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-white text-[8px]">
                        <Check className="h-2 w-2" strokeWidth={3} />
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-405 dark:text-slate-500 font-bold mt-0.5">
                    {getLocalizedRouteName(route.name, language)}
                  </p>
                </div>
                
                {/* Score */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border font-extrabold text-[10px] ${scoreClass}`}>
                  <span>{route.suitability_score} / 100</span>
                </div>
              </div>

              {/* Specs */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                {(route.total_distance_meters / 1000).toFixed(1)} km • {Math.round(route.total_duration_seconds / 60)} min
              </p>

              {/* Detail pills */}
              <div className="mt-2 flex flex-wrap gap-1">
                {route.details?.map((detail: string, i: number) => (
                  <span 
                    key={i} 
                    className="text-[9px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-405 border border-slate-200/50 dark:border-slate-800 px-1.5 py-0.2 rounded"
                  >
                    {getLocalizedRouteName(detail, language)}
                  </span>
                ))}
              </div>

              {/* Warnings / Detours if present */}
              {route.barriers_encountered_count > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-800 text-[9px] font-bold text-rose-650 dark:text-rose-450 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>
                    {language === 'HI' 
                      ? 'वैकल्पिक मार्ग की सलाह दी जाती है: सक्रिय निर्माण खंड की रिपोर्ट।' 
                      : 'Detour advised: Active construction block reported.'
                    }
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
