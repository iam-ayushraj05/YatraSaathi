'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  AlertTriangle, 
  Accessibility,
  Compass
} from 'lucide-react';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';

interface InteractiveMapProps {
  origin?: Coordinate | null;
  destination?: Coordinate | null;
  routeGeometry?: Coordinate[] | null;
  onPlaceSelect?: (placeId: string) => void;
  className?: string;
}

export default function InteractiveMap({
  origin,
  destination,
  routeGeometry,
  className = ''
}: InteractiveMapProps) {
  const { language } = useApp();
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));

  return (
    <div className={`relative flex flex-col justify-between h-full min-h-[580px] w-full bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm transition-colors ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <button 
          onClick={handleZoomIn}
          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-bold"
          title="Zoom In"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
        <div className="h-px bg-slate-100 dark:bg-slate-700" />
        <button 
          onClick={handleZoomOut}
          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-bold"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* SVG Map Canvas */}
      <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-6 min-h-[460px]">
        <div 
          className="w-full h-full transition-transform duration-300 ease-out origin-center flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg className="w-full h-full max-w-[850px] max-h-[750px]" viewBox="0 0 500 450" fill="none">
            {/* Gray Road Network Lines */}
            <path d="M 120,40 L 320,410" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-800" />
            <path d="M 380,50 L 160,190 L 260,370" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-800" />
            <path d="M 40,250 L 460,110" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-800" />
            <path d="M 220,130 L 320,330" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-800" />
            <path d="M 170,360 L 420,290" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-800" />

            {/* Active Vibrant Purple Transit Route */}
            <path 
              d="M 360,60 L 285,210 L 235,185" 
              stroke="#c084fc" 
              strokeWidth="14" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              opacity="0.4"
            />
            <path 
              d="M 360,60 L 285,210 L 235,185" 
              stroke="#a855f7" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M 360,60 L 285,210 L 235,185" 
              stroke="#7c3aed" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Start Node: Green Target Ring (Top Right) */}
            <g transform="translate(360, 60)">
              <circle r="14" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
              <circle r="6" fill="#16a34a" />
            </g>

            {/* Construction Warning Box & Icon */}
            <g transform="translate(275, 145)">
              <rect x="-42" y="-12" width="84" height="24" rx="8" fill="#ffffff" stroke="#f97316" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ea580c">Construction</text>
              {/* Amber Triangle Warning below */}
              <g transform="translate(0, 24)">
                <polygon points="0,-8 9,7 -9,7" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" />
                <text y="5" textAnchor="middle" fontSize="8" fontWeight="black" fill="#ea580c">!</text>
              </g>
            </g>

            {/* Transit Waypoint Box (Top of route) */}
            <g transform="translate(315, 105)">
              <rect x="-10" y="-10" width="20" height="20" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fontSize="10">🚊</text>
            </g>

            {/* Orange Waypoint Node */}
            <g transform="translate(285, 210)">
              <circle r="8" fill="#f97316" stroke="#ffffff" strokeWidth="2.5" />
            </g>

            {/* Accessible Wheelchair Waypoint Box */}
            <g transform="translate(295, 238)">
              <rect x="-10" y="-10" width="20" height="20" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fontSize="10">♿</text>
            </g>

            {/* End Node: Purple Target Ring (Left) */}
            <g transform="translate(235, 185)">
              <circle r="14" fill="#ffffff" stroke="#7c3aed" strokeWidth="4" />
              <circle r="6" fill="#7c3aed" />
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Map Legend Bottom Bar */}
      <div className="m-4 mx-6 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white/95 dark:bg-[#151824]/95 px-5 py-3 flex flex-wrap items-center justify-between text-xs text-slate-700 dark:text-slate-300 shadow-sm z-10 transition-colors">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2 font-bold">
            <span className="h-4 w-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] leading-tight">High<br />Access</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px]">Medium</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-rose-500">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-[11px]">Barrier</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-cyan-600">
            <span className="w-4 h-4 rounded-full border border-cyan-500 flex items-center justify-center text-[10px] font-serif font-black">i</span>
            <span className="text-[11px]">Assistance</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase tracking-wider">
          <span>❖</span>
          <span>INTERACTIVE MAP</span>
        </div>
      </div>
    </div>
  );
}
