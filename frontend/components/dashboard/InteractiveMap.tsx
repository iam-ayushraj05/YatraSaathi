'use client';

import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Minus, 
  AlertTriangle, 
  Compass, 
  Navigation,
  Accessibility
} from 'lucide-react';
import { Coordinate } from '../../lib/types';
import { useApp } from '../../context/AppContext';

interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'monument' | 'station' | 'hotel' | 'museum';
  accessible: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MapBarrier {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface MapAssistance {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

interface InteractiveMapProps {
  origin?: Coordinate | null;
  destination?: Coordinate | null;
  routeGeometry?: Coordinate[] | null;
  barriers?: MapBarrier[];
  assistancePoints?: MapAssistance[];
  places?: MapPlace[];
  onPlaceSelect?: (placeId: string) => void;
}

const LAT_MIN = 28.50;
const LAT_MAX = 28.68;
const LNG_MIN = 77.15;
const LNG_MAX = 77.30;

export default function InteractiveMap({
  origin,
  destination,
  routeGeometry,
  barriers = [
    { id: 'b1', title: 'Broken Elevator', lat: 28.5244, lng: 77.1855, type: 'ELEVATOR', severity: 'HIGH' },
    { id: 'b2', title: 'Construction Work', lat: 28.6129, lng: 77.2295, type: 'CONSTRUCTION', severity: 'CRITICAL' },
    { id: 'b3', title: 'Ramp Blocked', lat: 28.5933, lng: 77.2507, type: 'RAMP', severity: 'MEDIUM' }
  ],
  assistancePoints = [
    { id: 'ap1', name: 'Information Support', lat: 28.6118, lng: 77.2191, type: 'SUPPORT' },
    { id: 'ap2', name: 'Wheelchair Assistance', lat: 28.6304, lng: 77.2177, type: 'WHEELCHAIR' }
  ],
  places = [
    { id: 'p1', name: 'Qutub Minar', lat: 28.5244, lng: 77.1855, type: 'monument', accessible: 'MEDIUM' },
    { id: 'p2', name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'monument', accessible: 'LOW' },
    { id: 'p3', name: 'India Gate', lat: 28.6129, lng: 77.2295, type: 'monument', accessible: 'HIGH' },
    { id: 'p4', name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, type: 'monument', accessible: 'MEDIUM' },
    { id: 'p5', name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, type: 'monument', accessible: 'HIGH' },
    { id: 'p6', name: 'National Museum', lat: 28.6118, lng: 77.2191, type: 'museum', accessible: 'HIGH' },
    { id: 'p7', name: 'Connaught Place', lat: 28.6304, lng: 77.2177, type: 'station', accessible: 'MEDIUM' },
    { id: 'p8', name: 'Lodhi Gardens', lat: 28.5931, lng: 77.2197, type: 'monument', accessible: 'HIGH' }
  ],
  onPlaceSelect
}: InteractiveMapProps) {
  const { language } = useApp();
  const [zoom, setZoom] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; type: string; details?: string } | null>(null);
  const [useVectorMap, setUseVectorMap] = useState<boolean>(false);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const leafletInstanceRef = React.useRef<any>(null);

  // Dynamically load Leaflet for real map tile rendering
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      setUseVectorMap(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize and update Leaflet map when available
  useEffect(() => {
    if (!leafletLoaded || useVectorMap || !mapRef.current || !(window as any).L) return;

    const L = (window as any).L;
    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    const centerLat = origin?.lat || 28.6129;
    const centerLng = origin?.lng || 77.2295;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([centerLat, centerLng], 13);

    leafletInstanceRef.current = map;

    // Use OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Draw route polyline
    if (routeGeometry && routeGeometry.length > 0) {
      const latLngs = routeGeometry.map(p => [p.lat, p.lng]);
      L.polyline(latLngs, { color: '#7c3aed', weight: 5, opacity: 0.85, dashArray: '8, 6' }).addTo(map);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
    }

    // Origin marker
    if (origin) {
      L.circleMarker([origin.lat, origin.lng], {
        radius: 8,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.9
      }).bindTooltip('Origin').addTo(map);
    }

    // Destination marker
    if (destination) {
      L.circleMarker([destination.lat, destination.lng], {
        radius: 8,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.9
      }).bindTooltip('Destination').addTo(map);
    }

    // Places
    places.forEach(p => {
      const color = p.accessible === 'HIGH' ? '#10b981' : p.accessible === 'MEDIUM' ? '#f59e0b' : '#ef4444';
      L.circleMarker([p.lat, p.lng], {
        radius: 6,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
      }).bindTooltip(`<b>${p.name}</b><br/>Accessibility: ${p.accessible}`)
        .on('click', () => onPlaceSelect?.(p.id))
        .addTo(map);
    });

    // Barriers
    barriers.forEach(b => {
      L.circleMarker([b.lat, b.lng], {
        radius: 7,
        color: '#e11d48',
        fillColor: '#fda4af',
        fillOpacity: 0.9
      }).bindTooltip(`⚠️ <b>Barrier</b>: ${b.title} (${b.severity})`).addTo(map);
    });

    // Assistance
    assistancePoints.forEach(ap => {
      L.circleMarker([ap.lat, ap.lng], {
        radius: 6,
        color: '#2563eb',
        fillColor: '#93c5fd',
        fillOpacity: 0.9
      }).bindTooltip(`♿ <b>Assistance</b>: ${ap.name}`).addTo(map);
    });

    return () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, useVectorMap, origin, destination, routeGeometry, places, barriers, assistancePoints]);

  const getCoords = (lat: number, lng: number) => {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
    const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
    return { x, y };
  };

  const handleZoomIn = () => {
    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.zoomIn();
    } else {
      setZoom(prev => Math.min(prev + 0.25, 2.5));
    }
  };

  const handleZoomOut = () => {
    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.zoomOut();
    } else {
      setZoom(prev => Math.max(prev - 0.25, 0.75));
    }
  };

  return (
    <div className="relative flex flex-col h-[420px] w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">

      {/* Map Title */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 shadow-sm">
        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{language === 'HI' ? 'इंडिया गेट' : 'India Gate'}</span>
        <span className="text-[10px] text-slate-400 mx-1">→</span>
        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{language === 'HI' ? 'लोटस टेम्पल' : 'Lotus Temple'}</span>
      </div>

      {/* Zoom Controls & Map View Toggle */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
        <div className="flex flex-col rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
          <button 
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Zoom In"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700" />
          <button 
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => setUseVectorMap(prev => !prev)}
          className="bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 px-2 py-1 rounded-md shadow-sm hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
        >
          {useVectorMap ? '🗺️ OSM Tiles' : '🎨 Vector View'}
        </button>
      </div>

      {/* Floating Info Tooltip */}
      {hoveredItem && (
        <div className="absolute top-12 right-3 z-10 rounded-lg bg-slate-900/95 text-white p-2.5 shadow-lg backdrop-blur-sm max-w-[200px]">
          <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">{hoveredItem.type}</p>
          <h5 className="text-[11px] font-bold mt-0.5">{hoveredItem.name}</h5>
          {hoveredItem.details && <p className="text-[9px] text-slate-300 mt-1 leading-relaxed">{hoveredItem.details}</p>}
        </div>
      )}

      {/* Live Route Navigation Banner */}
      {routeGeometry && (
        <div className="absolute bottom-12 left-3 z-10 rounded-lg bg-violet-600 text-white px-3 py-1.5 text-[10px] font-semibold shadow-lg flex items-center gap-1.5">
          <Navigation className="h-3 w-3 rotate-45" />
          <span>{language === 'HI' ? 'सक्रिय सुलभ मार्ग' : 'Active Accessible Path'}</span>
        </div>
      )}

      {/* Real Leaflet Map View */}
      {!useVectorMap && leafletLoaded && (
        <div ref={mapRef} className="flex-1 w-full h-full z-0" />
      )}

      {/* Fallback Vector SVG Map Canvas */}
      {(useVectorMap || !leafletLoaded) && (
        <div className="flex-1 w-full relative overflow-auto scrollbar-none" style={{ touchAction: 'none' }}>
          <div 
            className="w-full h-full min-w-[400px] min-h-[300px] transition-transform duration-200 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >

          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background waterways */}
            <path d="M 0,25 Q 30,30 50,45 T 100,55" fill="none" stroke="#e0e7ff" strokeWidth="2" opacity="0.6" />
            <path d="M 10,70 Q 40,65 70,80 T 100,75" fill="none" stroke="#e0e7ff" strokeWidth="1.5" opacity="0.6" />
            
            {/* Base Roads */}
            <path d="M 15,90 L 45,60 L 65,30 L 85,15" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M 30,50 L 50,55 L 75,50 L 95,80" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M 45,60 L 50,55 M 30,50 L 45,60" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            
            {/* Active route path */}
            {routeGeometry && routeGeometry.length > 1 && (() => {
              const points = routeGeometry.map(p => {
                const { x, y } = getCoords(p.lat, p.lng);
                return `${x},${y}`;
              }).join(' ');
              return (
                <>
                  <polyline points={points} fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  <polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" style={{ animation: 'dash 30s linear infinite' }} />
                </>
              );
            })()}

            {/* Origin/Destination pins */}
            {origin && (() => {
              const { x, y } = getCoords(origin.lat, origin.lng);
              return (
                <g transform={`translate(${x}, ${y})`}>
                  <circle r="2.5" fill="#10b981" opacity="0.3" className="animate-ping" />
                  <circle r="1.2" fill="#10b981" />
                  <text y="-2.5" textAnchor="middle" fontSize="1.8" fontWeight="bold" fill="#065f46">START</text>
                </g>
              );
            })()}

            {destination && (() => {
              const { x, y } = getCoords(destination.lat, destination.lng);
              return (
                <g transform={`translate(${x}, ${y})`}>
                  <circle r="2.5" fill="#ef4444" opacity="0.3" className="animate-ping" />
                  <circle r="1.2" fill="#ef4444" />
                  <text y="-2.5" textAnchor="middle" fontSize="1.8" fontWeight="bold" fill="#991b1b">END</text>
                </g>
              );
            })()}
          </svg>

          {/* Place Nodes */}
          {places.map((place) => {
            const { x, y } = getCoords(place.lat, place.lng);
            const colorClass = 
              place.accessible === 'HIGH' ? 'bg-emerald-500 ring-emerald-100' :
              place.accessible === 'MEDIUM' ? 'bg-amber-500 ring-amber-100' : 
              'bg-rose-500 ring-rose-100';

            return (
              <button
                key={place.id}
                onClick={() => onPlaceSelect?.(place.id)}
                onMouseEnter={() => setHoveredItem({
                  name: place.name,
                  type: `PLACE • ${place.type.toUpperCase()}`,
                  details: `Accessibility: ${place.accessible}`
                })}
                onMouseLeave={() => setHoveredItem(null)}
                className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span className="absolute flex h-5 w-5 rounded-full bg-white opacity-40 shadow-sm border border-slate-200" />
                <span className={`h-2.5 w-2.5 rounded-full ring-4 ${colorClass} group-hover:scale-110 transition-transform`} />
                <span className="absolute top-4 scale-0 group-hover:scale-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap transition-all z-30">
                  {place.name}
                </span>
              </button>
            );
          })}

          {/* Barrier Markers */}
          {barriers.map((b) => {
            const { x, y } = getCoords(b.lat, b.lng);
            return (
              <div
                key={b.id}
                onMouseEnter={() => setHoveredItem({
                  name: b.title,
                  type: `BARRIER • ${b.type}`,
                  details: `Severity: ${b.severity}`
                })}
                onMouseLeave={() => setHoveredItem(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-rose-600 hover:scale-125 transition-transform z-20 cursor-pointer bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/40 p-0.5 rounded-lg shadow-sm"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <AlertTriangle className="h-3 w-3 fill-rose-100 dark:fill-rose-950" />
              </div>
            );
          })}

          {/* Assistance Point Markers */}
          {assistancePoints.map((ap) => {
            const { x, y } = getCoords(ap.lat, ap.lng);
            return (
              <div
                key={ap.id}
                onMouseEnter={() => setHoveredItem({
                  name: ap.name,
                  type: `ASSISTANCE • ${ap.type}`,
                  details: 'Operational assistance desk'
                })}
                onMouseLeave={() => setHoveredItem(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-emerald-600 hover:scale-125 transition-transform z-20 cursor-pointer bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 p-0.5 rounded-lg shadow-sm"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Accessibility className="h-3 w-3" />
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Map Legend */}

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] px-3 py-2 flex flex-wrap gap-3 items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 z-10 transition-colors">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{language === 'HI' ? 'उच्च' : 'High Access'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{language === 'HI' ? 'मध्यम' : 'Medium'}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            <span>{language === 'HI' ? 'बाधा' : 'Barrier'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Accessibility className="h-3 w-3 text-emerald-600" />
            <span>{language === 'HI' ? 'सहायता' : 'Assistance'}</span>
          </div>
        </div>
        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
          <Compass className="h-3 w-3 text-violet-500" />
          <span>Interactive Map</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  );
}
