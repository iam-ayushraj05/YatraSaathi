'use client';

import React from 'react';
import { 
  Check, 
  Clock, 
  MapPin, 
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
      title: 'Route 1',
      subtitle: 'Most Accessible',
      distance: '15.2 km',
      duration: '18 min',
      stepFree: 'Step-free',
      score: 85,
      scoreBorder: 'border-purple-600 text-purple-700',
      tags: [
        { label: 'No Stairs', color: 'bg-slate-100 text-slate-600' },
        { label: 'Elevator Available', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' },
        { label: 'Less Crowd', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' }
      ]
    },
    {
      id: 'r2',
      title: 'Route 2',
      subtitle: 'Faster But Less Accessible',
      distance: '4.8 km',
      duration: '14 min',
      stepFree: null,
      score: 62,
      scoreBorder: 'border-amber-500 text-amber-600',
      tags: [
        { label: 'Some Stairs', color: 'bg-rose-50 text-rose-600 font-bold border border-rose-200' },
        { label: 'Crowded Area', color: 'bg-amber-50 text-amber-600 font-bold border border-amber-200' },
        { label: 'Limited Access', color: 'bg-amber-50 text-amber-600 font-bold border border-amber-200' }
      ]
    },
    {
      id: 'r3',
      title: 'Route 3',
      subtitle: 'Alternative Route',
      distance: '9.2 km',
      duration: '22 min',
      stepFree: null,
      score: 74,
      scoreBorder: 'border-amber-500 text-amber-600',
      tags: [
        { label: '1 Barrier', color: 'bg-rose-50 text-rose-600 font-bold border border-rose-200' },
        { label: 'Less Crowd', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' },
        { label: 'Good Facilities', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' }
      ]
    }
  ];

  const activeRoutes = routes 
    ? routes.map((r, i) => ({
        id: `live-${i}`,
        title: `Route ${i + 1}`,
        subtitle: i === 0 ? 'Most Accessible' : i === 1 ? 'Faster But Less Accessible' : 'Alternative Route',
        distance: `${(r.total_distance_meters / 1000).toFixed(1)} km`,
        duration: `${Math.round(r.total_duration_seconds / 60)} min`,
        stepFree: r.step_free ? 'Step-free' : null,
        score: r.suitability_score,
        scoreBorder: r.suitability_score >= 80 ? 'border-purple-600 text-purple-700' : 'border-amber-500 text-amber-600',
        tags: r.step_free 
          ? [
              { label: 'No Stairs', color: 'bg-slate-100 text-slate-600' },
              { label: 'Elevator Available', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' },
              { label: 'Less Crowd', color: 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200' }
            ] 
          : [
              { label: 'Some Stairs', color: 'bg-rose-50 text-rose-600 font-bold border border-rose-200' },
              { label: 'Limited Access', color: 'bg-amber-50 text-amber-600 font-bold border border-amber-200' }
            ]
      }))
    : demoRoutes;

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm transition-colors space-y-4">
      {/* Header matching exact user image */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs">
          Recommended Routes
        </h3>
        <button className="text-[10px] font-black text-purple-700 dark:text-purple-400 hover:underline">
          View All
        </button>
      </div>

      {/* Routes list matching circular badge style */}
      <div className="space-y-3.5">
        {activeRoutes.map((route, idx) => {
          const isSelected = selectedRouteIndex === idx;

          return (
            <div 
              key={route.id}
              onClick={() => onSelectRoute(idx)}
              className={`
                relative rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 flex items-start gap-3.5
                ${isSelected 
                  ? 'border-purple-600 bg-purple-50/20 dark:bg-purple-950/20 shadow-sm' 
                  : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-purple-200'
                }
              `}
            >
              {/* Circular Score Badge */}
              <div className={`w-11 h-11 rounded-full border-2 ${route.scoreBorder} flex flex-col items-center justify-center shrink-0 font-black text-[11px] leading-none bg-white dark:bg-slate-900 shadow-sm`}>
                <span>{route.score}</span>
                <span className="text-[7.5px] font-semibold text-slate-400 mt-0.5">/100</span>
              </div>

              {/* Route Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs">
                    {route.title}
                  </h4>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-bold">
                  {route.subtitle}
                </p>

                {/* Specs: Distance, Duration, Step-Free */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {route.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {route.duration}
                  </span>
                  {route.stepFree && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {route.stepFree}
                    </span>
                  )}
                </div>

                {/* Pill Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {route.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className={`text-[9px] px-2 py-0.5 rounded-md ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1 text-center">
        <button className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline">
          Compare all routes →
        </button>
      </div>
    </div>
  );
}
