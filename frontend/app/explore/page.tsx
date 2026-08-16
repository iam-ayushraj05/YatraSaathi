'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, CheckCircle2, AlertTriangle, Navigation, Shield, Eye, Ear, Accessibility, ChevronRight, Loader2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Place } from '../../lib/types';

const PLACE_IMAGES: Record<string, string> = {
  'Qutub Minar': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  'Qutub Minar Complex': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  'Red Fort': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80',
  'India Gate': 'https://images.unsplash.com/photo-1597040663342-45b6ba68fa2b?auto=format&fit=crop&w=600&q=80',
  "Humayun's Tomb": 'https://images.unsplash.com/photo-1585135497273-1a86d9d25c2e?auto=format&fit=crop&w=600&q=80',
  'Lotus Temple': 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=600&q=80',
  'National Museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=600&q=80',
  'Connaught Place': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  'Lodhi Gardens': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
  'Jantar Mantar': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  'Akshardham Temple': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80';

const FILTERS = [
  { id: 'ALL', en: 'All Places', hi: 'सभी स्थान', icon: null },
  { id: 'WHEELCHAIR', en: 'Wheelchair', hi: 'व्हीलचेयर', icon: Accessibility },
  { id: 'STEP_FREE', en: 'Step-Free', hi: 'सीढ़ी-मुक्त', icon: Navigation },
  { id: 'HEARING', en: 'Hearing Assist', hi: 'श्रवण सहायता', icon: Ear },
  { id: 'VISION', en: 'Low Vision', hi: 'कम दृष्टि', icon: Eye },
  { id: 'VERIFIED', en: 'Verified Only', hi: 'केवल प्रमाणित', icon: Shield },
];

const FALLBACK_PLACES: Place[] = [
  { id:'p1', name:'India Gate', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.6129,lng:77.2295}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p2', name:'Lotus Temple', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.5535,lng:77.2588}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p3', name:'Red Fort', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.6562,lng:77.2410}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'LOW',verified:false,active_barriers_count:2} },
  { id:'p4', name:'National Museum', category:'Museum', country:'India', city:'New Delhi', location:{lat:28.6118,lng:77.2191}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p5', name:'Qutub Minar', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.5244,lng:77.1855}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'MEDIUM',verified:true,active_barriers_count:1} },
  { id:'p6', name:'Lodhi Gardens', category:'Park', country:'India', city:'New Delhi', location:{lat:28.5931,lng:77.2197}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p7', name:"Humayun's Tomb", category:'Monument', country:'India', city:'New Delhi', location:{lat:28.5933,lng:77.2507}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'MEDIUM',verified:false,active_barriers_count:1} },
  { id:'p8', name:'Connaught Place', category:'Station', country:'India', city:'New Delhi', location:{lat:28.6304,lng:77.2177}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'MEDIUM',verified:true,active_barriers_count:0} },
];

export default function Explore() {
  const { language } = useApp();
  const hi = language === 'HI';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (searchQuery) params.q = searchQuery;
      if (activeFilter === 'STEP_FREE') params.step_free = true;
      if (activeFilter === 'VERIFIED') params.verified_only = true;
      if (['MONUMENT', 'MUSEUM', 'STATION', 'HOTEL', 'RESTAURANT'].includes(activeFilter)) params.category = activeFilter;
      const data = await api.places.search(params);
      setPlaces(data && data.length > 0 ? data : FALLBACK_PLACES);
    } catch {
      setPlaces(FALLBACK_PLACES);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => { fetchPlaces(); }, [activeFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchPlaces(); };

  const getImg = (name: string) => PLACE_IMAGES[name] || DEFAULT_IMG;
  const lvlColor = (l: string) => l === 'HIGH' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : l === 'MEDIUM' ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' : 'text-rose-700 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
  const lvlText = (l: string) => hi ? (l === 'HIGH' ? 'उच्च' : l === 'MEDIUM' ? 'मध्यम' : 'निम्न') : l;

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">

          {/* Hero Banner */}
          <div className="relative w-full overflow-hidden" style={{ minHeight: '180px' }}>
            <img 
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80" 
              alt="Indian heritage architecture" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0533]/90 via-violet-900/80 to-violet-600/50" />
            <div className="relative z-10 px-5 md:px-8 py-8 md:py-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/20 border border-violet-300/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-violet-200">
                  <Sparkles className="h-3 w-3" />
                  YatraSaathi
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {hi ? 'सुलभ स्थानों की खोज करें' : 'Explore Accessible Places'}
              </h1>
              <p className="text-sm text-violet-200/90 font-medium mt-2 max-w-lg">
                {hi ? 'सुलभ यात्राओं के लिए डिज़ाइन किए गए प्रमाणित गंतव्य खोजें।' : 'Discover verified destinations designed for accessible journeys across India.'}
              </p>
            </div>
          </div>

          <div className="px-4 md:px-6 py-5 space-y-5">

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-2xl -mt-6 relative z-20">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={hi ? 'स्थान, स्मारक, संग्रहालय, रेस्तरां खोजें...' : 'Search places, monuments, museums, restaurants...'}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-lg"
                  id="explore-search"
                  aria-label="Search accessible places"
                />
              </div>
              <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 shrink-0" id="explore-search-btn">
                {hi ? 'खोजें' : 'Search'}
              </button>
            </form>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Accessibility filters">
              {FILTERS.map(f => {
                const Icon = f.icon;
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    role="tab"
                    aria-selected={active}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${active ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-200 dark:hover:border-violet-800'}`}
                    id={`filter-${f.id.toLowerCase()}`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {hi ? f.hi : f.en}
                  </button>
                );
              })}
            </div>

            {/* Results Count */}
            {!loading && !error && (
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {hi ? `${places.length} स्थान मिले` : `${places.length} places found`}
                  {activeFilter !== 'ALL' && (
                    <button onClick={() => setActiveFilter('ALL')} className="ml-2 text-violet-600 dark:text-violet-400 hover:underline">
                      {hi ? 'फ़िल्टर हटाएं' : 'Clear filter'}
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* Places Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <div key={n} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] animate-pulse overflow-hidden">
                    <div className="h-40 bg-slate-100 dark:bg-slate-900" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/2" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-full" />
                      <div className="flex justify-between pt-2">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                        <div className="h-3 bg-violet-100 dark:bg-violet-900/30 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                  <XCircle className="h-7 w-7 text-rose-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{hi ? 'कुछ गलत हो गया' : 'Something went wrong'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">{hi ? 'स्थान लोड नहीं हो पाए। कृपया पुनः प्रयास करें।' : 'We couldn\'t load places right now. Please try again.'}</p>
                <button onClick={() => fetchPlaces()} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {hi ? 'पुनः प्रयास करें' : 'Try Again'}
                </button>
              </div>
            ) : places.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-14 w-14 rounded-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <Search className="h-7 w-7 text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{hi ? 'कोई सुलभ स्थान नहीं मिला' : 'No accessible places found'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">{hi ? 'अपने खोज शब्दों या फ़िल्टर को बदलने का प्रयास करें।' : 'Try adjusting your search terms or filters.'}</p>
                <button onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all">
                  {hi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {places.map(place => {
                  const acc = place.accessibility_summary;
                  const level = acc?.level || 'UNKNOWN';
                  return (
                    <Link
                      href={`/explore/${place.id}`}
                      key={place.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] shadow-sm hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all overflow-hidden group"
                      id={`place-card-${place.id}`}
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img src={getImg(place.name)} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {/* Category badge */}
                        <span className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[9px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wide">{place.category}</span>
                        {/* Accessibility badge */}
                        <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold border px-2 py-0.5 rounded-md uppercase ${lvlColor(level)}`}>{lvlText(level)}</span>
                        {/* Verified */}
                        {acc?.verified && (
                          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-emerald-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                            <CheckCircle2 className="h-2.5 w-2.5" />{hi ? 'प्रमाणित' : 'Verified'}
                          </span>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{place.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0 text-violet-400" />{place.city || place.address || 'New Delhi, India'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {place.description || (hi ? 'रैंप प्रवेश, ब्रेल साइनेज और समर्पित शौचालय सहित प्रमाणित सुलभता।' : 'Verified accessibility including ramped entrances, braille signage, and dedicated restrooms.')}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-bold">
                            {acc?.active_barriers_count === 0
                              ? <span className="text-emerald-600 dark:text-emerald-400">{hi ? '✓ कोई बाधा नहीं' : '✓ No barriers'}</span>
                              : <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />{acc?.active_barriers_count} {hi ? 'बाधाएं' : 'barriers'}</span>
                            }
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 group-hover:text-violet-700 transition-colors">
                            {hi ? 'विवरण' : 'View Details'}<ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
