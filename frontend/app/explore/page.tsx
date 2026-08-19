'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FaqSection from '../../components/common/FaqSection';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Place } from '../../lib/types';

const PLACE_IMAGES: Record<string, string> = {
  'Lotus Temple': '/images/places/lotus-temple.jpg',
  'Akshardham Temple': '/images/places/akshardham.jpg',
  'Red Fort': '/images/places/red-fort.jpg',
  'India Gate': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  "Humayun's Tomb": 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80',
  'National Museum': '/images/places/national-museum.jpg',
  'Connaught Place': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  'Lodhi Gardens': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'Qutub Minar': 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
  'Jantar Mantar': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80';

const FALLBACK_PLACES: Place[] = [
  { id:'p1', name:'India Gate', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.6129,lng:77.2295}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p2', name:'Lotus Temple', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.5535,lng:77.2588}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p3', name:'Red Fort', category:'Monument', country:'India', city:'New Delhi', location:{lat:28.6562,lng:77.2410}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'LOW',verified:false,active_barriers_count:2} },
  { id:'p4', name:'National Museum', category:'Museum', country:'India', city:'New Delhi', location:{lat:28.6118,lng:77.2191}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p5', name:'Akshardham Temple', category:'Temple', country:'India', city:'New Delhi', location:{lat:28.6127,lng:77.2773}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p6', name:'Lodhi Gardens', category:'Park', country:'India', city:'New Delhi', location:{lat:28.5931,lng:77.2197}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'HIGH',verified:true,active_barriers_count:0} },
  { id:'p7', name:"Humayun's Tomb", category:'Monument', country:'India', city:'New Delhi', location:{lat:28.5933,lng:77.2507}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'MEDIUM',verified:false,active_barriers_count:1} },
  { id:'p8', name:'Connaught Place', category:'Station', country:'India', city:'New Delhi', location:{lat:28.6304,lng:77.2177}, status:'ACTIVE', created_at:'', updated_at:'', accessibility_summary:{level:'MEDIUM',verified:true,active_barriers_count:0} },
];

export default function Explore() {
  const { language } = useApp();
  const hi = language === 'HI';
  const [places, setPlaces] = useState<Place[]>(FALLBACK_PLACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (searchQuery) params.q = searchQuery;
      if (activeFilter === 'STEP_FREE') params.step_free = true;
      if (activeFilter === 'VERIFIED') params.verified_only = true;
      const data = await api.places.search(params);
      setPlaces(data && data.length > 0 ? data : FALLBACK_PLACES);
    } catch {
      setPlaces(FALLBACK_PLACES);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchPlaces();
  }, [activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces();
  };

  const getImg = (name: string) => PLACE_IMAGES[name] || DEFAULT_IMG;

  // Filtered places based on client search query & active filter
  const displayedPlaces = places.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.city?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeFilter === 'WHEELCHAIR' && p.accessibility_summary?.level === 'LOW') return false;
    if (activeFilter === 'STEP_FREE' && (p.accessibility_summary?.active_barriers_count || 0) > 0) return false;
    if (activeFilter === 'VERIFIED' && !p.accessibility_summary?.verified) return false;
    return true;
  });

  return (
    <div className="bg-[#f8f9ff] dark:bg-[#0c0e17] text-[#191c20] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col selection:bg-[#6200ee]/20 selection:text-[#4800b2]">
      {/* Unified Global Header (Constant across all pages) */}
      <Header />

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-10 text-center md:text-left relative rounded-3xl overflow-hidden min-h-[220px] flex items-center p-8 md:p-12 bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white shadow-xl border border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80')" }}
          />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-md mb-3 border border-white/20">
              <span className="material-symbols-outlined text-sm">explore</span> Verified Accessibility
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              {hi ? 'सुलभ स्थानों की खोज करें' : 'Explore Accessible Places'}
            </h1>
            <p className="text-base md:text-lg text-violet-100 font-medium leading-relaxed">
              {hi ? 'भारत भर में सुलभ और सत्यापित यात्रा गंतव्यों की खोज करें।' : 'Discover verified destinations designed for accessible journeys across India.'}
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-8 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={hi ? "स्थान, स्मारक, संग्रहालय खोजें..." : "Search places, monuments, museums..."}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#cbc3d9]/50 dark:border-slate-800 bg-white dark:bg-[#151824] text-slate-900 dark:text-white focus:border-[#4800b2] focus:ring-2 focus:ring-[#4800b2]/20 focus:outline-none text-base shadow-sm transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] hover:opacity-95 text-white px-8 py-4 rounded-2xl font-bold text-sm min-h-[48px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              <span>{hi ? 'खोजें' : 'Search'}</span>
            </button>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'ALL', label: hi ? 'सभी स्थान' : 'All Places', icon: null },
              { id: 'WHEELCHAIR', label: hi ? 'व्हीलचेयर' : 'Wheelchair', icon: 'accessible' },
              { id: 'STEP_FREE', label: hi ? 'सीढ़ी-मुक्त' : 'Step-Free', icon: 'directions_walk' },
              { id: 'HEARING', label: hi ? 'श्रवण सहायता' : 'Hearing Assist', icon: 'hearing' },
              { id: 'VISION', label: hi ? 'कम दृष्टि' : 'Low Vision', icon: 'visibility' },
              { id: 'VERIFIED', label: hi ? 'केवल प्रमाणित' : 'Verified Only', icon: 'verified' },
            ].map(f => {
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] text-white shadow-md'
                      : 'bg-white dark:bg-[#151824] text-slate-700 dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {f.icon && <span className="material-symbols-outlined text-base">{f.icon}</span>}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4800b2] dark:text-[#4ffbe6]">category</span>
            {hi ? 'प्रमुख श्रेणियां' : 'Featured Categories'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category 1: Accessible Heritage */}
            <div className="group relative h-44 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col justify-end text-white cursor-pointer border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" 
                alt="Accessible Heritage" 
                className="absolute inset-0 w-full h-full object-cover blur-[1.5px] scale-105 group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b5c]/90 via-[#4800b2]/60 to-[#2a0b5c]/40" />
              <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl fill">account_balance</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-200 drop-shadow-sm">12 Verified Sites</span>
                <h3 className="text-xl font-black mt-1 drop-shadow-md">Accessible Heritage</h3>
              </div>
            </div>

            {/* Category 2: Beach Getaways */}
            <div className="group relative h-44 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col justify-end text-white cursor-pointer border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" 
                alt="Beach Getaways" 
                className="absolute inset-0 w-full h-full object-cover blur-[1.5px] scale-105 group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003d29]/90 via-[#006e4a]/60 to-[#003d29]/40" />
              <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl fill">beach_access</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 drop-shadow-sm">Ramped Promenades</span>
                <h3 className="text-xl font-black mt-1 drop-shadow-md">Beach Getaways</h3>
              </div>
            </div>

            {/* Category 3: City Tours */}
            <div className="group relative h-44 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col justify-end text-white cursor-pointer border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80" 
                alt="City Tours" 
                className="absolute inset-0 w-full h-full object-cover blur-[1.5px] scale-105 group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5a0c17]/90 via-[#8f121d]/60 to-[#5a0c17]/40" />
              <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl fill">location_city</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200 drop-shadow-sm">Low Floor Transit</span>
                <h3 className="text-xl font-black mt-1 drop-shadow-md">City Tours</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Trending This Week (Horizontal Scroll) */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6]">Popular</span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Trending This Week</h2>
            </div>
            <button 
              onClick={() => setActiveFilter('ALL')}
              className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {/* Trending Card 1: Lotus Temple */}
            <Link 
              href="/explore/p2"
              className="min-w-[280px] max-w-[280px] bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shrink-0 no-underline"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Lotus Temple"
                  src={getImg('Lotus Temple')}
                />
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Verified
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                  Lotus Temple
                </h3>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                  <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> New Delhi
                </div>
                <div className="mt-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Highly Visited • Step-Free
                </div>
              </div>
            </Link>

            {/* Trending Card 2: National Museum */}
            <Link 
              href="/explore/p4"
              className="min-w-[280px] max-w-[280px] bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shrink-0 no-underline"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="National Museum"
                  src={getImg('National Museum')}
                />
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Verified
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                  National Museum
                </h3>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                  <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> New Delhi
                </div>
                <div className="mt-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Tactile Path & Lift
                </div>
              </div>
            </Link>

            {/* Trending Card 3: India Gate */}
            <Link 
              href="/explore/p1"
              className="min-w-[280px] max-w-[280px] bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shrink-0 no-underline"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="India Gate"
                  src={getImg('India Gate')}
                />
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Verified
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                  India Gate
                </h3>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                  <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> New Delhi
                </div>
                <div className="mt-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Wide Paved Boulevard
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Results Header & Map Toggle */}
        <div className="mb-6 border-b border-[#cbc3d9]/30 dark:border-slate-800 pb-3 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {displayedPlaces.length} places found
          </span>
          <button 
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-1.5 text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:bg-violet-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-[#cbc3d9]/40 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12">
          {/* Large Featured Card: India Gate (Spans 8 columns on lg) */}
          <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-64 md:h-auto md:w-1/2 overflow-hidden shrink-0">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="India Gate"
                src={getImg('India Gate')}
              />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                MONUMENT
              </div>
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black">
                HIGH ACCESSIBILITY
              </div>
              <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Verified
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow justify-center">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                India Gate
              </h3>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3 font-medium">
                <span className="material-symbols-outlined text-base text-[#4800b2]">location_on</span> New Delhi, Central Vista
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Verified accessibility including ramped entrances, braille signage, and dedicated restrooms. This iconic war memorial features expansive, smooth pathways ideal for wheelchair navigation, with well-maintained surroundings ensuring a comfortable visit for everyone.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  <span className="material-symbols-outlined text-lg">check_circle</span> No barriers detected
                </div>
                <Link 
                  href="/explore/p1"
                  className="bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] hover:opacity-90 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1 shadow-sm no-underline cursor-pointer"
                >
                  View Details <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Standard Card 1: Lotus Temple */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Lotus Temple"
                src={getImg('Lotus Temple')}
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                MONUMENT
              </div>
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black">
                HIGH
              </div>
              <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-xs">verified</span> Verified
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                Lotus Temple
              </h3>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> New Delhi
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                Verified accessibility including ramped entrances, braille signage, and dedicated restrooms with level flooring throughout the prayer hall.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">check_circle</span> No barriers
                </div>
                <Link href="/explore/p2" className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-0.5">
                  View Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Standard Card 2: Red Fort */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Red Fort"
                src={getImg('Red Fort')}
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                MONUMENT
              </div>
              <div className="absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black">
                LOW ACCESSIBILITY
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                Red Fort
              </h3>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> Old Delhi
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                Historic fort complex with some cobblestone pathways and stepped thresholds near inner courtyards. Wheelchair assistants available at Lahori Gate.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">warning</span> 2 barriers
                </div>
                <Link href="/explore/p3" className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-0.5">
                  View Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Standard Card 3: National Museum */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="National Museum"
                src={getImg('National Museum')}
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                MUSEUM
              </div>
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black">
                HIGH
              </div>
              <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-xs">verified</span> Verified
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                National Museum
              </h3>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> Janpath, New Delhi
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                State-of-the-art tactile exhibits, audio visual guides in multiple languages, fully elevator-equipped galleries, and loaner wheelchairs at entrance.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">check_circle</span> No barriers
                </div>
                <Link href="/explore/p4" className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-0.5">
                  View Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Standard Card 4: Akshardham Temple */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Akshardham Temple"
                src={getImg('Akshardham Temple')}
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                TEMPLE
              </div>
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black">
                HIGH
              </div>
              <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-xs">verified</span> Verified
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                Akshardham Temple
              </h3>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> East Delhi, NH 24
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                Magnificent spiritual campus with expansive ramps, motorized wheelchairs, tactile paths, water show seating, and comprehensive barrier-free navigation throughout.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">check_circle</span> No barriers
                </div>
                <Link href="/explore/p5" className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-0.5">
                  View Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Accessibility FAQ Section */}
        <FaqSection 
          title={hi ? 'स्थान खोज व सुगमता रेटिंग FAQ' : 'Accessible Place Discovery & Venue Rating FAQs'}
          subtitle={hi 
            ? 'जानिए स्थानों के सुगमता स्तर (High, Medium, Low), रैंप व व्हीलचेयर टॉयलेट वेरिफिकेशन की प्रक्रिया' 
            : 'Understand venue accessibility tiers, wheelchair washroom availability, and verified barrier-free badges'
          }
          customFaqs={[
            {
              category: 'Monitoring',
              badge: 'Accessibility Tiers',
              question: hi 
                ? 'स्थानों के लिए High, Medium और Low Accessibility रेटिंग का क्या अर्थ है?' 
                : 'What do High, Medium, and Low Accessibility ratings indicate?',
              answer: hi
                ? 'High का अर्थ है पूर्णतः बाधा-मुक्त (रैंप, लिफ्ट, सुलभ टॉयलेट और स्पर्श पथ उपलब्ध)। Medium में आंशिक रैंप हैं। Low में सीढ़ियाँ या सकड़े द्वार हैं जहां सहायता की आवश्यकता हो सकती है।'
                : 'High indicates 100% barrier-free facilities (ramps, elevators, accessible toilets, tactile paths). Medium indicates partial ramp access. Low indicates steps or narrow doors requiring assistance.'
            },
            {
              category: 'Trust & Verification',
              badge: 'Verified Badge',
              question: hi 
                ? 'स्थानों पर "Verified" बैज का क्या मतलब है?' 
                : 'What does the "Verified" badge on a monument or venue signify?',
              answer: hi
                ? 'Verified का अर्थ है कि उस स्थान की सुगमता सुविधाओं का भौतिक रूप से ऑडिट किया गया है या समुदाय और आधिकारिक प्रतिनिधियों द्वारा हाल ही में पुष्टि की गई है।'
                : 'A Verified badge confirms that accessibility facilities (ramp inclines, door widths, elevator dimensions) have been physically audited or validated by trusted reviewers.'
            },
            {
              category: 'Enhancing',
              badge: 'Amenity Filters',
              question: hi 
                ? 'क्या मैं केवल व्हीलचेयर टॉयलेट या रैंप वाले स्थानों को फ़िल्टर कर सकता हूँ?' 
                : 'Can I filter places by specific amenities like accessible restrooms or tactile paving?',
              answer: hi
                ? 'हाँ! आप खोज बार और फ़िल्टर बटन का उपयोग करके केवल वही स्थान देख सकते हैं जिनमें व्हीलचेयर रैंप, सुलभ शौचालय, ऑडियो गाइड या दृष्टि सहायता उपलब्ध हो।'
                : 'Yes! Use the filter pills at the top to display venues with verified step-free ramps, accessible washrooms, tactile ground indicators, or braille signs.'
            },
            {
              category: 'Enhancing',
              badge: 'Place Navigation',
              question: hi 
                ? 'किसी स्थान को चुनने के बाद मैं वहाँ का सुलभ मार्ग कैसे देख सकता हूँ?' 
                : 'How can I launch navigation to an explored venue directly?',
              answer: hi
                ? 'किसी भी स्थान कार्ड पर "View Details" दबाने से आप उस स्थान के सुगम प्रवेश द्वार, पार्किंग स्थल और लाइव नेविगेशन रूट को तुरंत शुरू कर सकते हैं।'
                : 'Clicking "View Details" on any place card opens its full accessibility audit breakdown and lets you launch step-free GPS routing with a single click.'
            }
          ]}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

