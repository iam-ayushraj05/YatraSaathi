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
  'Connaught Place': '/images/places/connaught-place.jpg',
  'Lodhi Gardens': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'Qutub Minar': '/images/places/qutub-minar.jpg',
  'Taj Mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'Udaipur City Palace': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
  'City Palace, Udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
  'Juhu Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'Kovalam Lighthouse Beach Deck': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
  'Miramar Beach': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'Vidhana Soudha': '/images/places/vidhana-soudha.jpg',
  'Birla Planetarium': '/images/places/birla-planetarium.jpg',
  'M. P. Birla Planetarium': '/images/places/birla-planetarium.jpg',
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80';

export interface PlaceItem {
  id: string;
  name: string;
  category: 'Heritage' | 'Beach' | 'City' | 'Museum' | 'Temple' | 'Park' | 'Station';
  categoryGroup: 'HERITAGE' | 'BEACH' | 'CITY';
  country: string;
  city: string;
  location: { lat: number; lng: number };
  status: string;
  description: string;
  accessibility_summary: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    verified: boolean;
    active_barriers_count: number;
    hasRamps?: boolean;
    hasTactile?: boolean;
    hasAudio?: boolean;
    hasLowVision?: boolean;
  };
  tags: string[];
}

const ALL_PLACES: PlaceItem[] = [
  { 
    id: 'p1', 
    name: 'India Gate', 
    category: 'Heritage', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'New Delhi', 
    location: { lat: 28.6129, lng: 77.2295 }, 
    status: 'ACTIVE', 
    description: 'Iconic national memorial with wide paved boulevards, smooth step-free walkways, dedicated accessible parking, and level access to all central vista plazas.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Monument', 'Wide Paved Boulevard', 'Wheelchair Ramped', 'Step-Free']
  },
  { 
    id: 'p2', 
    name: 'Lotus Temple', 
    category: 'Temple', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'New Delhi', 
    location: { lat: 28.5535, lng: 77.2588 }, 
    status: 'ACTIVE', 
    description: 'Serene Bahai House of Worship with gradual ramped approaches, smooth marble prayer hall, loaned manual wheelchairs, and tactile orientation guides.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Temple', 'Heritage', 'Step-Free', 'Tactile Path']
  },
  { 
    id: 'p3', 
    name: 'Red Fort', 
    category: 'Heritage', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'Old Delhi', 
    location: { lat: 28.6562, lng: 77.2410 }, 
    status: 'ACTIVE', 
    description: 'Historic Mughal fort with partial ramped paths at Lahori Gate, wheelchair assistants available on demand, and some historic cobblestone courtyards.',
    accessibility_summary: { level: 'LOW', verified: false, active_barriers_count: 2, hasRamps: true, hasTactile: false, hasAudio: false, hasLowVision: false },
    tags: ['Monument', 'Heritage', 'Historic Incline', 'Assistant Available']
  },
  { 
    id: 'p4', 
    name: 'National Museum', 
    category: 'Museum', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'Janpath, New Delhi', 
    location: { lat: 28.6118, lng: 77.2191 }, 
    status: 'ACTIVE', 
    description: 'Fully accessible national gallery with tactile braille art exhibits, audio narration headsets, elevator access to all floors, and low-gradient entry ramps.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Museum', 'Braille Signage', 'Audio Tour', 'Elevators']
  },
  { 
    id: 'p5', 
    name: 'Akshardham Temple', 
    category: 'Temple', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'East Delhi', 
    location: { lat: 28.6127, lng: 77.2773 }, 
    status: 'ACTIVE', 
    description: 'Expansive spiritual campus with motorized wheelchair loans, wide gentle ramps, tactile stone walkways, and priority step-free exhibition corridors.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Temple', 'Heritage', 'Motorized Wheelchair', 'Step-Free']
  },
  { 
    id: 'p9', 
    name: 'Qutub Minar', 
    category: 'Heritage', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'Mehrauli, New Delhi', 
    location: { lat: 28.5244, lng: 77.1855 }, 
    status: 'ACTIVE', 
    description: 'UNESCO World Heritage site featuring stone-paved accessible paths connecting the Iron Pillar, Alai Darwaza, and main courtyard gardens.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Monument', 'Heritage', 'UNESCO', 'Ramped Access']
  },
  { 
    id: 'p10', 
    name: 'Taj Mahal', 
    category: 'Heritage', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'Agra, Uttar Pradesh', 
    location: { lat: 27.1751, lng: 78.0421 }, 
    status: 'ACTIVE', 
    description: 'Dedicated electric golf-cart transit from ticketing gates, custom ramped wooden pathways over marble plinth, and tactile tactile scale model at visitor center.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Heritage', 'UNESCO', 'Golf Cart Assist', 'Marble Ramps']
  },
  { 
    id: 'p11', 
    name: 'Udaipur City Palace', 
    category: 'Heritage', 
    categoryGroup: 'HERITAGE', 
    country: 'India', 
    city: 'Udaipur, Rajasthan', 
    location: { lat: 24.5764, lng: 73.6835 }, 
    status: 'ACTIVE', 
    description: 'Magnificent lakeside palace complex featuring battery-operated golf-cart shuttle transit, ramped courtyards, ground-level museum exhibits, and tactile heritage scale models overlooking Lake Pichola.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['Heritage', 'Lakeside Palace', 'Golf Cart Shuttle', 'Ramped Access']
  },
  { 
    id: 'b2', 
    name: 'Juhu Beach', 
    category: 'Beach', 
    categoryGroup: 'BEACH', 
    country: 'India', 
    city: 'Mumbai, Maharashtra', 
    location: { lat: 19.0988, lng: 72.8267 }, 
    status: 'ACTIVE', 
    description: 'Ramped concrete promenade connecting the main road to the high-tide viewing deck, tactile guiding tiles, and accessible washroom facilities at entry.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: false, hasLowVision: true },
    tags: ['Beach', 'Ramped Promenade', 'Accessible Washroom', 'Sea View Deck']
  },
  { 
    id: 'b3', 
    name: 'Kovalam Lighthouse Beach Deck', 
    category: 'Beach', 
    categoryGroup: 'BEACH', 
    country: 'India', 
    city: 'Thiruvananthapuram, Kerala', 
    location: { lat: 8.3988, lng: 76.9785 }, 
    status: 'ACTIVE', 
    description: 'Level paved promenade with scenic ramped decks, gentle sloping access to the southern rock formations, and certified beach accessibility assistants.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: false, hasAudio: true, hasLowVision: true },
    tags: ['Beach', 'Scenic Ramp', 'Kerala Coast', 'Step-Free Deck']
  },
  { 
    id: 'b4', 
    name: 'Miramar Beach', 
    category: 'Beach', 
    categoryGroup: 'BEACH', 
    country: 'India', 
    city: 'Panaji, Goa', 
    location: { lat: 15.4820, lng: 73.8078 }, 
    status: 'ACTIVE', 
    description: 'Illuminated wide tiled promenade along the Mandovi river mouth with zero-step entry, shaded wheelchair rest points, and accessible food kiosk access.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: false, hasLowVision: true },
    tags: ['Beach', 'Promenade', 'Goa', 'Shaded Rest Zones']
  },
  { 
    id: 'c1', 
    name: 'Connaught Place', 
    category: 'Station', 
    categoryGroup: 'CITY', 
    country: 'India', 
    city: 'New Delhi', 
    location: { lat: 28.6304, lng: 77.2177 }, 
    status: 'ACTIVE', 
    description: 'Major transit and shopping hub with elevator-linked metro gates, continuous level colonnades, dropped curbs at all inner circle pedestrian crossings, and low-floor electric feeder buses.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['City Tour', 'Metro Corridor', 'Low Floor Transit', 'Tactile Paving']
  },
  { 
    id: 'c3', 
    name: 'Vidhana Soudha', 
    category: 'City', 
    categoryGroup: 'CITY', 
    country: 'India', 
    city: 'Bengaluru, Karnataka', 
    location: { lat: 12.9797, lng: 77.5907 }, 
    status: 'ACTIVE', 
    description: 'Grand legislative heritage precinct connected via Namma Metro underground accessible station with dual elevators and wide sidewalk corridors.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['City Tour', 'Namma Metro', 'Dual Elevators', 'Wide Sidewalks']
  },
  { 
    id: 'c4', 
    name: 'Birla Planetarium', 
    category: 'Museum', 
    categoryGroup: 'CITY', 
    country: 'India', 
    city: 'Kolkata, West Bengal', 
    location: { lat: 22.5448, lng: 88.3475 }, 
    status: 'ACTIVE', 
    description: 'Landmark astronomical observatory featuring ramped entrance, wheelchair-accessible cosmic sky show dome seating, audio induction loops, and tactile galaxy exhibits.',
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, hasRamps: true, hasTactile: true, hasAudio: true, hasLowVision: true },
    tags: ['City Tour', 'Planetarium', 'Accessible Dome', 'Induction Loops']
  }
];

export default function Explore() {
  const { language } = useApp();
  const hi = language === 'HI';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HERITAGE' | 'BEACH' | 'CITY'>('ALL');
  const [showMap, setShowMap] = useState(false);
  const [selectedMapPlace, setSelectedMapPlace] = useState<PlaceItem | null>(null);

  const getImg = (name: string) => PLACE_IMAGES[name] || DEFAULT_IMG;

  const displayedPlaces = ALL_PLACES.filter(p => {
    if (selectedCategory !== 'ALL' && p.categoryGroup !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesCity = p.city.toLowerCase().includes(q);
      const matchesCategory = p.category.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchesName && !matchesCity && !matchesCategory && !matchesDesc && !matchesTags) return false;
    }
    if (activeFilter === 'WHEELCHAIR' && p.accessibility_summary.level === 'LOW') return false;
    if (activeFilter === 'STEP_FREE' && (p.accessibility_summary.active_barriers_count > 0 || !p.accessibility_summary.hasRamps)) return false;
    if (activeFilter === 'HEARING' && !p.accessibility_summary.hasAudio) return false;
    if (activeFilter === 'VISION' && !p.accessibility_summary.hasTactile && !p.accessibility_summary.hasLowVision) return false;
    if (activeFilter === 'VERIFIED' && !p.accessibility_summary.verified) return false;
    return true;
  });

  const handleCategoryClick = (category: 'HERITAGE' | 'BEACH' | 'CITY') => {
    const nextCategory = selectedCategory === category ? 'ALL' : category;
    setSelectedCategory(nextCategory);
    // Smooth auto-scroll to destinations section
    setTimeout(() => {
      const el = document.getElementById('destinations-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('ALL');
    setSelectedCategory('ALL');
  };

  return (
    <div className="bg-[#f8f9ff] dark:bg-[#0c0e17] text-[#191c20] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col selection:bg-[#6200ee]/20 selection:text-[#4800b2]">
      <Header />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <section className="mb-10 text-center md:text-left relative rounded-3xl overflow-hidden min-h-[220px] flex items-center p-8 md:p-12 bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white shadow-xl border border-white/10">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80')" }} />
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

        <section className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={hi ? "स्थान, स्मारक, समुद्र तट, संग्रहालय खोजें..." : "Search places, monuments, beaches, museums..."} className="w-full pl-12 pr-10 py-4 rounded-2xl border border-[#cbc3d9]/50 dark:border-slate-800 bg-white dark:bg-[#151824] text-slate-900 dark:text-white focus:border-[#4800b2] focus:ring-2 focus:ring-[#4800b2]/20 focus:outline-none text-base shadow-sm transition-all" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs">✕</button>}
            </div>
            <button type="button" className="bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] hover:opacity-95 text-white px-8 py-4 rounded-2xl font-bold text-sm min-h-[48px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-lg">search</span>
              <span>{hi ? 'खोजें' : 'Search'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'ALL', label: hi ? 'सभी स्थान' : 'All Places', icon: null },
              { id: 'WHEELCHAIR', label: hi ? 'व्हीलचेयर' : 'Wheelchair', icon: 'accessible' },
              { id: 'STEP_FREE', label: hi ? 'सीढ़ी-मुक्त' : 'Step-Free', icon: 'directions_walk' },
              { id: 'HEARING', label: hi ? 'श्रवण सहायता' : 'Hearing Assist', icon: 'hearing' },
              { id: 'VISION', label: hi ? 'कम दृष्टि' : 'Low Vision', icon: 'visibility' },
              { id: 'VERIFIED', label: hi ? 'केवल प्रमाणित' : 'Verified Only', icon: 'verified' },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeFilter === f.id ? 'bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] text-white shadow-md' : 'bg-white dark:bg-[#151824] text-slate-700 dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                {f.icon && <span className="material-symbols-outlined text-base">{f.icon}</span>}
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4800b2] dark:text-[#4ffbe6]">category</span>
              {hi ? 'प्रमुख श्रेणियां' : 'Featured Categories'}
            </h2>
            {selectedCategory !== 'ALL' && (
              <button onClick={() => setSelectedCategory('ALL')} className="text-xs font-bold text-[#4800b2] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer">
                <span>Reset Category Filter</span>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {['HERITAGE', 'BEACH', 'CITY'].map((cat, idx) => {
              const colors = { HERITAGE: ['from-[#2a0b5c]', 'violet', 'account_balance'], BEACH: ['from-[#003d29]', 'emerald', 'beach_access'], CITY: ['from-[#5a0c17]', 'rose', 'location_city'] };
              const [from, color, icon] = colors[cat as keyof typeof colors];
              const titles = { HERITAGE: 'Heritage Sites', BEACH: 'Beach Getaways', CITY: 'City Tours' };
              return (
                <div key={cat} onClick={() => handleCategoryClick(cat as any)} className={`group relative h-44 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col justify-end text-white cursor-pointer border ${selectedCategory === cat ? `border-4 border-${color}-400 ring-4 ring-${color}-500/30 scale-102 shadow-2xl` : 'border-white/10'}`}>
                  <img src={idx === 0 ? "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" : idx === 1 ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"} alt={cat} className="absolute inset-0 w-full h-full object-cover blur-[1.5px] scale-105 group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${from}/90 to-transparent`} />
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl fill">{icon}</span>
                  </div>
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-widest text-${color}-200 drop-shadow-sm`}>{selectedCategory === cat ? '✓ FILTER ACTIVE' : cat}</span>
                      <h3 className="text-xl font-black mt-1 drop-shadow-md">{titles[cat as keyof typeof titles]}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-end mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6]">Popular</span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Trending This Week</h2>
            </div>
            <button onClick={() => { setActiveFilter('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }} className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer">
              View All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {ALL_PLACES.slice(0, 5).map(place => (
              <Link key={place.id} href={`/explore/${place.id}`} className="min-w-[280px] max-w-[280px] bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shrink-0 no-underline">
                <div className="relative h-36 w-full overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={place.name} src={getImg(place.name)} />
                  {place.accessibility_summary.verified && <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm"><span className="material-symbols-outlined text-[13px]">verified</span> Verified</div>}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors truncate">{place.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3"><span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> {place.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-6 border-b border-[#cbc3d9]/30 dark:border-slate-800 pb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900 dark:text-white">{displayedPlaces.length} places found</span>
            {(selectedCategory !== 'ALL' || activeFilter !== 'ALL' || searchQuery) && <button onClick={handleClearFilters} className="text-xs text-[#4800b2] dark:text-purple-400 font-bold hover:underline ml-2">Clear all filters</button>}
          </div>
          <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer border ${showMap ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'text-[#4800b2] dark:text-[#4ffbe6] hover:bg-violet-50 dark:hover:bg-slate-800 border-[#cbc3d9]/40 dark:border-slate-700'}`}>
            <span className="material-symbols-outlined text-base">map</span>
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>

        {/* Interactive Map View */}
        {showMap && (
          <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl relative h-[420px]">
            {/* Map Canvas Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
            
            {/* Map Markers Overlay */}
            <div className="absolute inset-0 p-6 flex flex-wrap items-center justify-around gap-4 overflow-y-auto z-10">
              {displayedPlaces.slice(0, 8).map((place, idx) => (
                <div
                  key={place.id}
                  onClick={() => setSelectedMapPlace(place)}
                  className={`p-3 rounded-2xl backdrop-blur-md border cursor-pointer transition-all transform hover:scale-105 shadow-xl ${
                    selectedMapPlace?.id === place.id 
                      ? 'bg-purple-900/90 border-purple-400 ring-2 ring-purple-400 text-white' 
                      : 'bg-slate-900/80 border-white/20 text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#4800b2] text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black leading-tight">{place.name}</p>
                      <p className="text-[10px] text-slate-300">{place.city} • {place.accessibility_summary.level} Level</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Map Place Modal Popup */}
            {selectedMapPlace && (
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-500 shadow-2xl animate-fade-in text-slate-900 dark:text-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                      {selectedMapPlace.category}
                    </span>
                    <h4 className="text-sm font-black mt-1">{selectedMapPlace.name}</h4>
                    <p className="text-xs text-slate-500">{selectedMapPlace.city}</p>
                  </div>
                  <button onClick={() => setSelectedMapPlace(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{selectedMapPlace.description}</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span> Verified Accessible
                  </span>
                  <Link
                    href={`/explore/${selectedMapPlace.id}`}
                    className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white hover:bg-purple-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Places Section & Grid */}
        <section id="destinations-section" className="mb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6]">
                {selectedCategory === 'BEACH' ? 'Beach Destinations' : selectedCategory === 'HERITAGE' ? 'Heritage & Monuments' : selectedCategory === 'CITY' ? 'City & Transit Destinations' : 'Verified Destinations'}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {selectedCategory === 'BEACH' ? 'Accessible Beaches' : selectedCategory === 'HERITAGE' ? 'Heritage Destinations' : selectedCategory === 'CITY' ? 'City Transit Tours' : 'All Accessible Places'}
                <span className="text-sm font-semibold text-slate-500 ml-2">({displayedPlaces.length} {displayedPlaces.length === 1 ? 'place' : 'places'})</span>
              </h2>
            </div>
            {selectedCategory !== 'ALL' && (
              <button 
                onClick={() => setSelectedCategory('ALL')} 
                className="text-xs font-bold text-[#4800b2] dark:text-[#4ffbe6] hover:underline flex items-center gap-1 cursor-pointer bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/60"
              >
                <span>Show All Categories</span>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {displayedPlaces.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 mb-12 space-y-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
              location_off
            </span>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
              No accessible places found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No places matched your search query or active filter. Try resetting your filters to explore all verified destinations.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-full bg-[#4800b2] text-white text-xs font-black hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {/* First Place Featured Large (8 cols) if available */}
            {displayedPlaces.length > 0 && (
              <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-64 md:h-auto md:w-1/2 overflow-hidden shrink-0">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={displayedPlaces[0].name}
                    src={getImg(displayedPlaces[0].name)}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {displayedPlaces[0].category}
                  </div>
                  <div className={`absolute top-4 right-4 text-white px-3 py-1 rounded-full text-[10px] font-black ${
                    displayedPlaces[0].accessibility_summary.level === 'HIGH' ? 'bg-emerald-500' : displayedPlaces[0].accessibility_summary.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {displayedPlaces[0].accessibility_summary.level} ACCESSIBILITY
                  </div>
                  {displayedPlaces[0].accessibility_summary.verified && (
                    <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-sm">verified</span> Verified
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow justify-center">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                    {displayedPlaces[0].name}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3 font-medium">
                    <span className="material-symbols-outlined text-base text-[#4800b2]">location_on</span> {displayedPlaces[0].city}
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3">
                    {displayedPlaces[0].description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                      <span className="material-symbols-outlined text-lg">check_circle</span> {displayedPlaces[0].tags[0] || 'Verified Step-Free'}
                    </div>
                    <Link 
                      href={`/explore/${displayedPlaces[0].id}`}
                      className="bg-gradient-to-r from-[#2a0b5c] to-[#4800b2] hover:opacity-90 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1 shadow-sm no-underline cursor-pointer"
                    >
                      View Details <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Places in Responsive Grid (4 cols on lg) */}
            {displayedPlaces.slice(1).map((place) => {
              const isHigh = place.accessibility_summary.level === 'HIGH';
              const isMed = place.accessibility_summary.level === 'MEDIUM';

              return (
                <div 
                  key={place.id}
                  className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-[#151824] border border-[#cbc3d9]/40 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={place.name}
                      src={getImg(place.name)}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {place.category}
                    </div>
                    <div className={`absolute top-3 right-3 text-white px-2.5 py-1 rounded-full text-[10px] font-black ${
                      isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      {place.accessibility_summary.level}
                    </div>
                    {place.accessibility_summary.verified && (
                      <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs">verified</span> Verified
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
                      <span className="material-symbols-outlined text-sm text-[#4800b2]">location_on</span> {place.city}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                      {place.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">check_circle</span> {place.tags[1] || 'Step-Free'}
                      </div>
                      <Link href={`/explore/${place.id}`} className="text-[#4800b2] dark:text-[#4ffbe6] text-xs font-bold hover:underline flex items-center gap-0.5">
                        View Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </section>
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

