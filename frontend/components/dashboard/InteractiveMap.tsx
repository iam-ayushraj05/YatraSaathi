'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  AlertTriangle, 
  Compass, 
  Navigation,
  Accessibility,
  Crosshair
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

interface IntermediatePoint {
  name: string;
  lat: number;
  lng: number;
}

interface InteractiveMapProps {
  origin?: Coordinate | null;
  destination?: Coordinate | null;
  startLabel?: string;
  endLabel?: string;
  intermediatePoints?: IntermediatePoint[];
  userLocation?: Coordinate | null;
  routeGeometry?: Coordinate[] | null;
  barriers?: MapBarrier[];
  assistancePoints?: MapAssistance[];
  places?: MapPlace[];
  onPlaceSelect?: (placeId: string) => void;
  onLocateMe?: () => void;
  className?: string;
  showLegend?: boolean;
}

const LAT_MIN = 28.50;
const LAT_MAX = 28.68;
const LNG_MIN = 77.15;
const LNG_MAX = 77.30;

export default function InteractiveMap({
  origin = { lat: 28.5535, lng: 77.2588 },
  destination = { lat: 28.6118, lng: 77.2191 },
  startLabel = 'Lotus Temple',
  endLabel = 'National Museum',
  intermediatePoints = [],
  userLocation = null,
  routeGeometry,
  barriers = [
    { id: 'b1', title: 'Broken Elevator', lat: 28.5750, lng: 77.2350, type: 'ELEVATOR', severity: 'HIGH' },
    { id: 'b2', title: 'Road Repaving Work', lat: 28.5900, lng: 77.2400, type: 'CONSTRUCTION', severity: 'MEDIUM' },
    { id: 'b3', title: 'Steep Curb without Ramp', lat: 28.6050, lng: 77.2250, type: 'RAMP', severity: 'HIGH' }
  ],
  assistancePoints = [
    { id: 'ap1', name: 'Metro Mobility Helpdesk', lat: 28.5600, lng: 77.2500, type: 'SUPPORT' },
    { id: 'ap2', name: 'Accessible Transit Hub', lat: 28.6000, lng: 77.2300, type: 'WHEELCHAIR' }
  ],
  places = [
    { id: 'p1', name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, type: 'monument', accessible: 'HIGH' },
    { id: 'p2', name: 'National Museum', lat: 28.6118, lng: 77.2191, type: 'museum', accessible: 'HIGH' },
    { id: 'p3', name: 'India Gate', lat: 28.6129, lng: 77.2295, type: 'monument', accessible: 'HIGH' },
    { id: 'p4', name: 'Qutub Minar', lat: 28.5244, lng: 77.1855, type: 'monument', accessible: 'MEDIUM' },
    { id: 'p5', name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'monument', accessible: 'LOW' },
    { id: 'p6', name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, type: 'monument', accessible: 'HIGH' },
    { id: 'p7', name: 'Connaught Place', lat: 28.6304, lng: 77.2177, type: 'station', accessible: 'HIGH' },
    { id: 'p8', name: 'Lodhi Gardens', lat: 28.5931, lng: 77.2197, type: 'monument', accessible: 'HIGH' },
    { id: 'p9', name: 'Akshardham Temple', lat: 28.6127, lng: 77.2773, type: 'monument', accessible: 'HIGH' }
  ],
  onPlaceSelect,
  onLocateMe,
  className,
  showLegend = false
}: InteractiveMapProps) {
  const { language } = useApp();
  const [zoom, setZoom] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; type: string; details?: string } | null>(null);
  const [useVectorMap, setUseVectorMap] = useState<boolean>(false);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);

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

  // Initialize and update Leaflet map when inputs/coordinates change
  useEffect(() => {
    if (!leafletLoaded || useVectorMap || !mapRef.current || !(window as any).L) return;

    const L = (window as any).L;
    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    const centerLat = origin?.lat || 28.5830;
    const centerLng = origin?.lng || 77.2400;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true
    }).setView([centerLat, centerLng], 12);

    leafletInstanceRef.current = map;

    // Use OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const boundsPoints: any[] = [];

    // Helper for creating custom styled HTML icons
    const createCustomIcon = (color: string, label: string, iconSymbol: string, isBig = false) => {
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            transform: translate(-50%, -100%);
            pointer-events: auto;
          ">
            <div style="
              background: ${color}; 
              color: #ffffff; 
              font-weight: 800; 
              font-size: ${isBig ? '11px' : '9px'}; 
              padding: 3px 8px; 
              border-radius: 999px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
              white-space: nowrap;
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              gap: 3px;
              margin-bottom: 2px;
            ">
              <span>${iconSymbol}</span>
              <span>${label}</span>
            </div>
            <div style="
              width: ${isBig ? '16px' : '12px'}; 
              height: ${isBig ? '16px' : '12px'}; 
              background: ${color}; 
              border-radius: 50%; 
              border: 2.5px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    };

    // Draw route polyline
    if (routeGeometry && routeGeometry.length > 0) {
      const latLngs = routeGeometry.map(p => [p.lat, p.lng]);
      L.polyline(latLngs, { 
        color: '#6d23f9', 
        weight: 6, 
        opacity: 0.9, 
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Glow border underlay
      L.polyline(latLngs, { 
        color: '#b084ff', 
        weight: 10, 
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routeGeometry.forEach(p => boundsPoints.push([p.lat, p.lng]));
    }

    // Origin marker
    if (origin) {
      boundsPoints.push([origin.lat, origin.lng]);
      const originIcon = createCustomIcon('#059669', startLabel || 'Origin', '🟢', true);
      L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase;">Route Start</div>
            <div style="font-size: 14px; font-weight: 800; color: #111827; margin: 2px 0;">${startLabel}</div>
            <div style="font-size: 11px; color: #4b5563;">Verified Step-Free Starting Access</div>
          </div>
        `)
        .addTo(map);
    }

    // Intermediate Stops markers
    if (intermediatePoints && intermediatePoints.length > 0) {
      intermediatePoints.forEach((stop, idx) => {
        boundsPoints.push([stop.lat, stop.lng]);
        const stopIcon = createCustomIcon('#7c3aed', `${idx + 1}. ${stop.name}`, '📍', false);
        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <div style="font-size: 10px; color: #7c3aed; font-weight: 800; text-transform: uppercase;">Intermediate Stop ${idx + 1}</div>
              <div style="font-size: 13px; font-weight: 800; color: #111827; margin: 2px 0;">${stop.name}</div>
            </div>
          `)
          .addTo(map);
      });
    }

    // Destination marker
    if (destination) {
      boundsPoints.push([destination.lat, destination.lng]);
      const destIcon = createCustomIcon('#dc2626', endLabel || 'Destination', '🏁', true);
      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 10px; color: #dc2626; font-weight: 800; text-transform: uppercase;">Destination</div>
            <div style="font-size: 14px; font-weight: 800; color: #111827; margin: 2px 0;">${endLabel}</div>
            <div style="font-size: 11px; color: #4b5563;">Step-Free Entry & Accessible Facilities</div>
          </div>
        `)
        .addTo(map);
    }

    // Real-Time User GPS Location marker
    if (userLocation) {
      boundsPoints.push([userLocation.lat, userLocation.lng]);
      const userLocationIcon = L.divIcon({
        className: 'user-gps-pulse',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: 0; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 4px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userLocationIcon })
        .bindPopup('<b>📍 Your Real-Time Location</b>')
        .addTo(map);
    }

    // Places of Interest Markers
    places.forEach(p => {
      const isOrigin = origin && Math.abs(p.lat - origin.lat) < 0.001 && Math.abs(p.lng - origin.lng) < 0.001;
      const isDest = destination && Math.abs(p.lat - destination.lat) < 0.001 && Math.abs(p.lng - destination.lng) < 0.001;
      if (isOrigin || isDest) return;

      const color = p.accessible === 'HIGH' ? '#10b981' : p.accessible === 'MEDIUM' ? '#f59e0b' : '#ef4444';
      L.circleMarker([p.lat, p.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95
      }).bindTooltip(`<b>${p.name}</b><br/><span style="font-size:10px; color:${color}; font-weight:bold;">Accessibility: ${p.accessible}</span>`)
        .on('click', () => onPlaceSelect?.(p.id))
        .addTo(map);
    });

    // Barriers
    barriers.forEach(b => {
      L.circleMarker([b.lat, b.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 1.5,
        fillColor: '#e11d48',
        fillOpacity: 0.9
      }).bindTooltip(`⚠️ <b>Barrier</b>: ${b.title} (${b.severity})`).addTo(map);
    });

    // Assistance Hubs
    assistancePoints.forEach(ap => {
      L.circleMarker([ap.lat, ap.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 1.5,
        fillColor: '#2563eb',
        fillOpacity: 0.9
      }).bindTooltip(`♿ <b>Assistance</b>: ${ap.name}`).addTo(map);
    });

    // Automatically fit bounds to encompass the entire route & landmarks
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [45, 45], maxZoom: 15 });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, [
    leafletLoaded, 
    useVectorMap, 
    origin, 
    destination, 
    startLabel, 
    endLabel, 
    intermediatePoints, 
    userLocation, 
    routeGeometry, 
    places, 
    barriers, 
    assistancePoints
  ]);

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

  const handleLocateMeClick = () => {
    if (onLocateMe) {
      onLocateMe();
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (leafletInstanceRef.current) {
            leafletInstanceRef.current.setView([coords.lat, coords.lng], 15);
          }
        },
        () => {
          alert("Location access denied or unavailable. Defaulting to live Delhi map.");
        }
      );
    }
  };

  return (
    <div className={`relative flex flex-col w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors ${className || 'h-[460px]'}`}>

      {/* Dynamic Map Title Pill matching current Origin & Destination */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 shadow-md flex items-center gap-1.5 animate-fade-in pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[11px] font-black text-violet-700 dark:text-violet-400 truncate max-w-[120px] sm:max-w-[160px]">{startLabel || 'Start'}</span>
        <span className="text-[11px] text-slate-400 font-bold mx-0.5">→</span>
        <span className="text-[11px] font-black text-violet-700 dark:text-violet-400 truncate max-w-[120px] sm:max-w-[160px]">{endLabel || 'Destination'}</span>
      </div>

      {/* Map Controls: Zoom & GPS Locate Me & Map Style Toggle */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        <div className="flex flex-col rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700" />
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Real-Time GPS Locate Me Button */}
        <button
          onClick={handleLocateMeClick}
          title="Track Live GPS Location"
          className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-105 transition-all cursor-pointer"
        >
          <Crosshair className="h-4 w-4" />
        </button>

        <button
          onClick={() => setUseVectorMap(prev => !prev)}
          className="bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg shadow-md hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
        >
          {useVectorMap ? '🗺️ OSM Tiles' : '🎨 Vector View'}
        </button>
      </div>

      {/* Floating Info Tooltip */}
      {hoveredItem && (
        <div className="absolute top-14 right-3 z-10 rounded-xl bg-slate-900/95 text-white p-3 shadow-xl backdrop-blur-sm max-w-[220px] animate-fade-in border border-slate-700">
          <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">{hoveredItem.type}</p>
          <h5 className="text-xs font-bold mt-0.5">{hoveredItem.name}</h5>
          {hoveredItem.details && <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">{hoveredItem.details}</p>}
        </div>
      )}

      {/* Live Route Navigation Banner */}
      <div className={`absolute ${showLegend ? 'bottom-12' : 'bottom-3'} left-3 z-10 rounded-full bg-violet-600/95 backdrop-blur-md text-white px-3.5 py-1.5 text-[11px] font-bold shadow-lg flex items-center gap-1.5 border border-violet-400/30`}>
        <Navigation className="h-3.5 w-3.5 rotate-45 text-[#4ffbe6]" />
        <span>{language === 'HI' ? 'सक्रिय सुलभ मार्ग' : 'Active Accessible Path'}</span>
      </div>

      {/* Real Leaflet Map View */}
      {!useVectorMap && leafletLoaded && (
        <div ref={mapRef} className="flex-1 w-full h-full z-0 min-h-[440px]" />
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
            
            {/* Active route path */}
            {routeGeometry && routeGeometry.length > 1 && (() => {
              const points = routeGeometry.map(p => {
                const { x, y } = getCoords(p.lat, p.lng);
                return `${x},${y}`;
              }).join(' ');
              return (
                <>
                  <polyline points={points} fill="none" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  <polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
                </>
              );
            })()}

            {/* Origin/Destination pins */}
            {origin && (() => {
              const { x, y } = getCoords(origin.lat, origin.lng);
              return (
                <g transform={`translate(${x}, ${y})`}>
                  <circle r="3" fill="#10b981" opacity="0.3" className="animate-ping" />
                  <circle r="1.5" fill="#10b981" />
                  <text y="-3" textAnchor="middle" fontSize="2.2" fontWeight="bold" fill="#065f46">{startLabel}</text>
                </g>
              );
            })()}

            {destination && (() => {
              const { x, y } = getCoords(destination.lat, destination.lng);
              return (
                <g transform={`translate(${x}, ${y})`}>
                  <circle r="3" fill="#ef4444" opacity="0.3" className="animate-ping" />
                  <circle r="1.5" fill="#ef4444" />
                  <text y="-3" textAnchor="middle" fontSize="2.2" fontWeight="bold" fill="#991b1b">{endLabel}</text>
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
        </div>
      </div>
      )}

      {/* Map Legend */}
      {showLegend && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] px-4 py-2 flex flex-wrap gap-3 items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 z-10 transition-colors">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{language === 'HI' ? 'उच्च' : 'High Access'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{language === 'HI' ? 'मध्यम' : 'Medium'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>{language === 'HI' ? 'बाधा' : 'Barrier'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Accessibility className="h-3.5 w-3.5 text-emerald-600" />
              <span>{language === 'HI' ? 'सहायता' : 'Assistance'}</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-violet-500" />
            <span>Interactive Map</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
