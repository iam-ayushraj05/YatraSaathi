'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Users, Filter, ChevronRight, Sparkles, ShieldCheck, Heart, ArrowLeft, Check, SlidersHorizontal } from 'lucide-react';
import DatePickerModal from '../common/DatePickerModal';
import { useApp } from '../../context/AppContext';

export interface HolidayPackage {
  id: string;
  title: string;
  nightsDays: string;
  nightsText: string;
  badge?: string;
  moreOptionsCount?: number;
  img: string;
  hotelStar: string;
  inclusions: string[];
  emiText?: string;
  pricePerPerson: number;
  totalPrice: number;
  accessibilityFeatures: string[];
  category: 'all' | 'honeymoon' | 'last_minute' | 'beach';
}

export const SAMPLE_HOLIDAYS: HolidayPackage[] = [
  {
    id: 'pkg-1',
    title: 'Super Saver Goa',
    nightsDays: '3N/4D',
    nightsText: '3N Goa',
    badge: 'Deal of the day',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    hotelStar: '4 Star Hotel',
    inclusions: ['4 Star Hotel', 'Airport Pickup & Drop', 'Selected Meals', 'North Goa Sightseeing'],
    emiText: 'No Cost EMI at ₹2,469/month',
    pricePerPerson: 7407,
    totalPrice: 14814,
    accessibilityFeatures: ['♿ Step-Free Hotel Entrance & Elevator', '♿ Accessible Airport Van Pickup'],
    category: 'all'
  },
  {
    id: 'pkg-2',
    title: 'Most Wanted Goa Package',
    nightsDays: '4N/5D',
    nightsText: '4N Goa',
    badge: 'Best Seller',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    hotelStar: '3 Star Hotel',
    inclusions: ['3 Star Hotel', 'Airport Pickup & Drop', 'Selected Meals', 'Goa Bike Rental'],
    emiText: 'This is the best price we have seen in September',
    pricePerPerson: 6880,
    totalPrice: 13760,
    accessibilityFeatures: ['♿ Roll-in Shower Available', '♿ Ramp Access Beach Deck'],
    category: 'all'
  },
  {
    id: 'pkg-3',
    title: 'All-Inclusive 4N Holiday',
    nightsDays: '4N/5D',
    nightsText: '4N Goa',
    badge: 'Trending',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80',
    hotelStar: '4 Star Hotel',
    inclusions: ['Round Trip Flights', '4 Star Resort', 'Airport Transfers', 'All Meals Included'],
    emiText: 'No Cost EMI at ₹3,498/month',
    pricePerPerson: 10493,
    totalPrice: 20986,
    accessibilityFeatures: ['♿ Verified Wheelchair Ramp', '♿ Accessible Beach Buggy Shuttle'],
    category: 'beach'
  },
  {
    id: 'pkg-4',
    title: 'North Goa Beach Escape',
    nightsDays: '3N/4D',
    nightsText: '3N Goa',
    badge: 'Honeymoon Special',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
    hotelStar: '5 Star Resort',
    inclusions: ['5 Star Resort', 'Private Sunset Cruise', 'Airport Transfers', 'Candlelight Dinner'],
    emiText: 'No Cost EMI at ₹12,308/month',
    pricePerPerson: 36923,
    totalPrice: 73846,
    accessibilityFeatures: ['♿ Luxury Accessible Suite', '♿ VIP Ramp Transfer Service'],
    category: 'honeymoon'
  },
  {
    id: 'pkg-5',
    title: 'Hyatt Centric Candolim Goa',
    nightsDays: '3N/4D',
    nightsText: '3N Goa',
    badge: 'Luxury Deal',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    hotelStar: '5 Star Hotel',
    inclusions: ['5 Star Hotel', 'Airport Pickup & Drop', 'Selected Meals', 'Crafted Just for You'],
    emiText: 'Book this package @ ₹1',
    pricePerPerson: 14190,
    totalPrice: 28380,
    accessibilityFeatures: ['♿ Hyatt Verified Step-Free Property', '♿ Braille Elevator Buttons'],
    category: 'last_minute'
  },
  {
    id: 'pkg-6',
    title: 'Luxurious Stay at Fortune Select Candolim',
    nightsDays: '3N/4D',
    nightsText: '3N Goa',
    badge: 'Exclusive',
    moreOptionsCount: 2,
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    hotelStar: '5 Star Hotel',
    inclusions: ['Round Trip Flights', '5 Star Hotel', 'Airport Transfers', 'Selected Meals'],
    emiText: 'No Cost EMI at ₹13,871/month',
    pricePerPerson: 41614,
    totalPrice: 83228,
    accessibilityFeatures: ['♿ Roll-in Shower & Grab Bars', '♿ Step-Free Dining Areas'],
    category: 'all'
  }
];

export default function HolidaysSection() {
  const { userLocation } = useApp();
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [activeSubTab, setActiveSubTab] = useState<'search' | 'destinations' | 'deals' | 'featured'>('search');
  
  // Search executed toggle
  const [isSearchResultsView, setIsSearchResultsView] = useState(false);

  // Search widget inputs
  const [fromCity, setFromCity] = useState(userLocation.displayName);
  const [toDestination, setToDestination] = useState('');
  const [departDate, setDepartDate] = useState(getTodayFormatted());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [guestsCount, setGuestsCount] = useState('2 Adults');

  // Sub-tab inner selections
  const [destCategory, setDestCategory] = useState<'domestic' | 'international'>('domestic');
  const [dealsCategory, setDealsCategory] = useState<'taj' | 'summer' | 'honeymoon' | 'nearby'>('taj');
  const [featuredCategory, setFeaturedCategory] = useState<'theme' | 'trending' | 'special'>('theme');

  // Categories in results page
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'honeymoon' | 'last_minute' | 'beach'>('all');
  const [selectedDurationNights, setSelectedDurationNights] = useState<number>(7);
  const [flightIncludeFilter, setFlightIncludeFilter] = useState<'all' | 'with' | 'without'>('all');
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [sortBy, setSortBy] = useState('popular');

  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState<HolidayPackage | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return SAMPLE_HOLIDAYS.filter(pkg => {
      if (activeCategoryFilter !== 'all' && pkg.category !== activeCategoryFilter) return false;
      if (pkg.pricePerPerson > maxBudget) return false;
      if (flightIncludeFilter === 'with' && !pkg.inclusions.some(i => i.toLowerCase().includes('flight'))) return false;
      if (flightIncludeFilter === 'without' && pkg.inclusions.some(i => i.toLowerCase().includes('flight'))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'cheapest') return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === 'expensive') return b.pricePerPerson - a.pricePerPerson;
      return 0;
    });
  }, [activeCategoryFilter, maxBudget, flightIncludeFilter, sortBy]);

  const handleSearchExecute = () => {
    setIsSearchResultsView(true);
  };

  const bookNowPayLaterCards = [
    { title: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', tag: 'Accessible Beaches' },
    { title: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', tag: 'Houseboats' },
    { title: 'Andaman', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80', tag: 'Island Escape' },
    { title: 'Himachal Pradesh', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', tag: 'Mountain Vistas' },
    { title: 'Thailand', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80', tag: 'Tropical Retreat' },
    { title: 'South India', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', tag: 'Temple Trails' },
    { title: 'Rajasthan', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80', tag: 'Royal Palaces' },
    { title: 'Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80', tag: 'Overwater Villas' }
  ];

  const domesticDestinations = [
    { title: 'Goa', price: '₹2,400', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
    { title: 'Kerala', price: '₹2,100', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
    { title: 'South India', price: '₹3,000', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
    { title: 'Himachal', price: '₹5,400', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
    { title: 'North-East', price: '₹3,800', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
    { title: 'Andaman', price: '₹5,200', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80' },
    { title: 'Uttarakhand', price: '₹3,600', img: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80' },
    { title: 'Kashmir', price: '₹2,800', img: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=600&q=80' }
  ];

  const internationalDestinations = [
    { title: 'Thailand', price: '₹43,100', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80' },
    { title: 'Bali', price: '₹13,300', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
    { title: 'Maldives', price: '₹11,600', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80' },
    { title: 'Singapore', price: '₹27,600', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80' },
    { title: 'Dubai', price: '₹10,200', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
    { title: 'Vietnam', price: '₹16,500', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80' },
    { title: 'Sri Lanka', price: '₹12,100', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in font-sans text-slate-900 dark:text-slate-100">
      
      {/* Toast Notification */}
      {bookingSuccessMsg && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span>{bookingSuccessMsg}</span>
        </div>
      )}

      {/* ── SEARCH RESULTS VIEW ── */}
      {isSearchResultsView ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Blue Sticky Bar */}
          <div className="bg-[#0071c2] dark:bg-[#003c73] rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button 
                onClick={() => setIsSearchResultsView(false)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors cursor-pointer"
                title="Back to search widget"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="bg-white/15 dark:bg-black/30 rounded-xl px-4 py-2 flex-1 min-w-[140px] border border-white/20">
                <label className="block text-[9px] font-black text-blue-200 uppercase tracking-wider">STARTING FROM</label>
                <input 
                  type="text" 
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="bg-transparent text-sm font-black text-white outline-none w-full truncate"
                />
              </div>

              <div className="bg-white/15 dark:bg-black/30 rounded-xl px-4 py-2 flex-1 min-w-[140px] border border-white/20">
                <label className="block text-[9px] font-black text-blue-200 uppercase tracking-wider">GOING TO</label>
                <input 
                  type="text" 
                  value={toDestination}
                  onChange={(e) => setToDestination(e.target.value)}
                  className="bg-transparent text-sm font-black text-white outline-none w-full truncate"
                />
              </div>

              <div 
                onClick={() => setShowCalendarModal(true)}
                className="bg-white/15 dark:bg-black/30 rounded-xl px-4 py-2 flex-1 min-w-[140px] border border-white/20 cursor-pointer hover:bg-white/25 transition-colors"
              >
                <label className="block text-[9px] font-black text-blue-200 uppercase tracking-wider cursor-pointer">STARTING DATE</label>
                <input 
                  type="text" 
                  readOnly
                  value={departDate}
                  className="bg-transparent text-sm font-black text-white outline-none w-full truncate cursor-pointer"
                />
              </div>

              <div className="bg-white/15 dark:bg-black/30 rounded-xl px-4 py-2 flex-1 min-w-[120px] border border-white/20">
                <label className="block text-[9px] font-black text-blue-200 uppercase tracking-wider">ROOMS & GUESTS</label>
                <input 
                  type="text" 
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="bg-transparent text-sm font-black text-white outline-none w-full truncate"
                />
              </div>

              <button 
                onClick={handleSearchExecute}
                className="bg-white hover:bg-slate-100 text-[#0071c2] font-black text-sm px-8 py-3 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                SEARCH
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-blue-100">
              <span className="material-symbols-outlined text-lg">grid_view</span>
              <span>Explore</span>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden shadow-md flex items-end p-6 sm:p-8">
            <img 
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80" 
              alt={toDestination} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10 text-white">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{toDestination} Packages</h1>
              <p className="text-sm text-slate-200 font-medium mt-1">Experience beaches, sunset, and verified accessible travel</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-6">
              <div className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                FILTERS
              </div>

              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-center font-bold text-xs">
                  <span className="text-slate-900 dark:text-white">Duration (in Nights)</span>
                  <span className="text-slate-400">▲</span>
                </div>
                <div className="space-y-1">
                  <input 
                    type="range" 
                    min="1" 
                    max="7" 
                    value={selectedDurationNights} 
                    onChange={(e) => setSelectedDurationNights(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>1N</span>
                    <span>7N</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-center font-bold text-xs">
                  <span className="text-slate-900 dark:text-white">Flights</span>
                  <span className="text-slate-400">▲</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => setFlightIncludeFilter(flightIncludeFilter === 'with' ? 'all' : 'with')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      flightIncludeFilter === 'with'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    With Flight (56)
                  </button>

                  <button 
                    onClick={() => setFlightIncludeFilter(flightIncludeFilter === 'without' ? 'all' : 'without')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      flightIncludeFilter === 'without'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Without Flight (59)
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-center font-bold text-xs">
                  <span className="text-slate-900 dark:text-white">Budget (per person)</span>
                  <span className="text-slate-400">▲</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
                    <span>₹0</span>
                    <span>₹{maxBudget.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5000" 
                    max="100000" 
                    step="5000"
                    value={maxBudget} 
                    onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-xs text-slate-900 dark:text-white cursor-pointer">
                <span>Hotel Category</span>
                <span className="text-slate-400">▲</span>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              
              <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar text-xs font-bold">
                  {['all', 'honeymoon', 'last_minute', 'beach'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategoryFilter(cat as any)}
                      className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap uppercase ${
                        activeCategoryFilter === cat
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {cat.replace('_', ' ')} PACKAGES
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Sorted By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="cheapest">Price: Low to High</option>
                    <option value="expensive">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPackages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {pkg.moreOptionsCount && (
                        <div className="absolute top-2 right-2 z-10 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-300 dark:border-blue-700 shadow-sm">
                          {pkg.moreOptionsCount} More Options Available
                        </div>
                      )}

                      {pkg.badge && (
                        <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md shadow">
                          {pkg.badge}
                        </div>
                      )}

                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {pkg.title}
                            </h3>
                            <div className="text-xs font-semibold text-slate-400">{pkg.nightsText}</div>
                          </div>
                          <span className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded">
                            {pkg.nightsDays}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {pkg.inclusions.map((inc, i) => (
                            <span key={i} className="flex items-center gap-1 truncate">• {inc}</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#181a2a] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between pt-3">
                        <div className="text-[10px] font-semibold text-slate-500 max-w-[140px] leading-tight">
                          {pkg.emiText}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            ₹{pkg.pricePerPerson.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/Person</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedPackage(pkg)}
                        className="w-full bg-[#0071c2] hover:bg-[#005999] text-white font-black text-xs py-2.5 rounded-xl transition-all shadow cursor-pointer active:scale-95 mt-2"
                      >
                        Book Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      ) : (
        
        /* ── HOLIDAYS SEARCH WIDGET CARD (EXACT MATCH TO USER SCREENSHOTS) ── */
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Outer Box */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden relative">
            
            {/* Top 4 Sub-Tabs Navigation (Search, Destinations, Super Deals, Featured) */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-[#f4f7fc] dark:bg-[#181a2a]">
              
              <button 
                onClick={() => setActiveSubTab('search')}
                className={`px-6 sm:px-8 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                  activeSubTab === 'search' 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121420]' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Search</span>
                {activeSubTab === 'search' && (
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                )}
              </button>

              <button 
                onClick={() => setActiveSubTab('destinations')}
                className={`px-6 sm:px-8 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                  activeSubTab === 'destinations' 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121420]' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🌏 Destinations</span>
                {activeSubTab === 'destinations' && (
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                )}
              </button>

              <button 
                onClick={() => setActiveSubTab('deals')}
                className={`px-6 sm:px-8 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                  activeSubTab === 'deals' 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121420]' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🏷️ Super Deals</span>
                {activeSubTab === 'deals' && (
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                )}
              </button>

              <button 
                onClick={() => setActiveSubTab('featured')}
                className={`px-6 sm:px-8 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                  activeSubTab === 'featured' 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121420]' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>✨ Featured</span>
                {activeSubTab === 'featured' && (
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                )}
              </button>
            </div>

            {/* Sub-tab 1: SEARCH Content */}
            {activeSubTab === 'search' && (
              <div className="p-5 sm:p-7 space-y-5 relative animate-fade-in">
                
                {/* Inner Tinted Blue-Gray Input Container Box */}
                <div className="bg-[#f0f4fb] dark:bg-[#181a2a] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
                    
                    {/* FROM CITY */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                        FROM CITY
                      </label>
                      <input 
                        type="text" 
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-transparent text-base font-black text-slate-900 dark:text-white outline-none truncate"
                      />
                      <span className="text-[10px] font-bold text-slate-400">India</span>
                    </div>

                    {/* TO CITY/COUNTRY/CATEGORY */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                        TO CITY/COUNTRY/CATEGORY
                      </label>
                      <input 
                        type="text" 
                        value={toDestination}
                        onChange={(e) => setToDestination(e.target.value)}
                        className="w-full bg-transparent text-base font-black text-slate-900 dark:text-white outline-none truncate"
                      />
                    </div>

                    {/* DEPARTURE DATE ▾ */}
                    <div 
                      onClick={() => setShowCalendarModal(true)}
                      className="lg:col-span-2 bg-white dark:bg-[#151824] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5 cursor-pointer">
                        DEPARTURE DATE ▾
                      </label>
                      <input 
                        type="text" 
                        readOnly
                        value={departDate}
                        className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none truncate cursor-pointer"
                      />
                    </div>

                    {/* ROOMS & GUESTS ▾ */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#151824] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                        ROOMS & GUESTS ▾
                      </label>
                      <input 
                        type="text" 
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none truncate"
                      />
                    </div>

                    {/* FILTERS ▾ */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#151824] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                        FILTERS ▾
                      </label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        Select Filters
                      </span>
                    </div>

                  </div>
                </div>

                {/* Recent Searches & Holiday Packages Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1 px-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Recent Searches:</span>
                    <button 
                      type="button"
                      onClick={() => { setFromCity('New Delhi'); setToDestination('Goa'); }}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1 rounded-full text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                    >
                      New Delhi ➔ Goa
                    </button>
                  </div>

                  <div className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                    HOLIDAY PACKAGES
                  </div>
                </div>

              </div>
            )}

            {/* Sub-tab 2: DESTINATIONS */}
            {activeSubTab === 'destinations' && (
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
                <div className="md:col-span-3 border-r border-slate-200 dark:border-slate-800 pr-4 space-y-2">
                  <button onClick={() => setDestCategory('domestic')} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between ${destCategory === 'domestic' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>Domestic</span><span>›</span>
                  </button>
                  <button onClick={() => setDestCategory('international')} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between ${destCategory === 'international' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>International</span><span>›</span>
                  </button>
                </div>

                <div className="md:col-span-5 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="space-y-3">
                    {['Goa', 'Manali', 'Kashmir', 'Jaipur/Udaipur', 'Shimla'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {['Gangtok/Darjeeling', 'Nainital/Mussoorie', 'Andaman', 'Ooty/Coorg', 'Kerala'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-3">
                  {[
                    { name: 'Andaman', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Himachal', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=300&q=80' }
                  ].map(card => (
                    <div key={card.name} onClick={() => { setToDestination(card.name); setActiveSubTab('search'); }} className="flex-1 text-center space-y-1.5 cursor-pointer group">
                      <div className="h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img src={card.img} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{card.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: SUPER DEALS */}
            {activeSubTab === 'deals' && (
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
                <div className="md:col-span-3 border-r border-slate-200 dark:border-slate-800 pr-4 space-y-2">
                  <button onClick={() => setDealsCategory('taj')} className={`w-full text-left px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-between ${dealsCategory === 'taj' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>Holidays with Taj</span><span>›</span>
                  </button>
                  <button onClick={() => setDealsCategory('summer')} className={`w-full text-left px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-between ${dealsCategory === 'summer' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>Summer Special</span><span>›</span>
                  </button>
                </div>

                <div className="md:col-span-5 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="space-y-3">
                    {['Goa', 'Kerala', 'Rajasthan', 'South India', 'Uttarakhand'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {['Madhya Pradesh', 'Uttar Pradesh'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-3">
                  {[
                    { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Rajasthan', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=300&q=80' },
                    { name: 'South India', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80' }
                  ].map(card => (
                    <div key={card.name} onClick={() => { setToDestination(card.name); setActiveSubTab('search'); }} className="flex-1 text-center space-y-1.5 cursor-pointer group">
                      <div className="h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img src={card.img} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{card.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: FEATURED */}
            {activeSubTab === 'featured' && (
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
                <div className="md:col-span-3 border-r border-slate-200 dark:border-slate-800 pr-4 space-y-2">
                  <button onClick={() => setFeaturedCategory('theme')} className={`w-full text-left px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-between ${featuredCategory === 'theme' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>Explore by theme</span><span>›</span>
                  </button>
                  <button onClick={() => setFeaturedCategory('trending')} className={`w-full text-left px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-between ${featuredCategory === 'trending' ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <span>Trending Holidays</span><span>›</span>
                  </button>
                </div>

                <div className="md:col-span-5 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="space-y-3">
                    {['Luxury', 'Unique Stays', 'Honeymoon', 'Pilgrimage', 'Adventure'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {['Offbeat'].map(item => (
                      <div key={item} onClick={() => { setToDestination(item); setActiveSubTab('search'); }} className="hover:text-blue-600 cursor-pointer">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-3">
                  {[
                    { name: 'Luxury', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Unique Stays', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Offbeat', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' }
                  ].map(card => (
                    <div key={card.name} onClick={() => { setToDestination(card.name); setActiveSubTab('search'); }} className="flex-1 text-center space-y-1.5 cursor-pointer group">
                      <div className="h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img src={card.img} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{card.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEARCH BUTTON OVERLAY AT THE BOTTOM EDGE */}
            <div className="flex justify-center -mt-5 mb-4 relative z-20">
              <button 
                type="button"
                onClick={handleSearchExecute}
                className="bg-gradient-to-r from-[#ff5722] to-[#ff7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white font-black text-base sm:text-lg py-3 px-16 sm:px-20 rounded-full transition-all shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider border-2 border-white dark:border-[#121420]"
              >
                SEARCH
              </button>
            </div>

          </div>

          {/* 1. BOOK NOW PAY LATER */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Book Now Pay Later</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {bookNowPayLaterCards.map((card, idx) => (
                <div 
                  key={idx}
                  onClick={handleSearchExecute}
                  className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm hover:scale-105 transition-all duration-300 flex flex-col justify-end p-3"
                >
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="relative z-10">
                    <span className="text-[8.5px] font-black text-amber-300 uppercase tracking-wider block">{card.tag}</span>
                    <h4 className="text-sm font-black text-white leading-tight">{card.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. TOP DOMESTIC DESTINATIONS (SCREENSHOT MATCH) */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Top Domestic Destinations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Apply code <span className="font-bold text-blue-600 dark:text-blue-400">GOOFFER</span> to unlock jaw-dropping deals!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900">‹</button>
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900">›</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {domesticDestinations.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setToDestination(item.title); handleSearchExecute(); }}
                  className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm hover:scale-105 transition-all duration-300 flex flex-col justify-end p-3"
                >
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-white leading-tight">{item.title}</h4>
                    <div className="text-[10px] text-slate-200 font-semibold mt-0.5">Starting at <span className="font-black text-white">{item.price}</span></div>
                    <div className="text-[9px] text-slate-400">Per person</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TOP INTERNATIONAL DESTINATIONS (SCREENSHOT MATCH) */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Top International Destinations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Apply code <span className="font-bold text-blue-600 dark:text-blue-400">GOOFFER</span> and grab unbelievable deals!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900">‹</button>
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900">›</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {internationalDestinations.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setToDestination(item.title); handleSearchExecute(); }}
                  className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm hover:scale-105 transition-all duration-300 flex flex-col justify-end p-3"
                >
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-white leading-tight">{item.title}</h4>
                    <div className="text-[10px] text-slate-200 font-semibold mt-0.5">Starting at <span className="font-black text-white">{item.price}</span></div>
                    <div className="text-[9px] text-slate-400">Per person</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Holiday Package Booking
              </h3>
              <button 
                onClick={() => setSelectedPackage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#1a1d2e] p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-black text-sm text-[#0071c2]">{selectedPackage.title} ({selectedPackage.nightsDays})</div>
              <div className="flex justify-between font-bold">
                <span>Hotel: {selectedPackage.hotelStar}</span>
                <span>Price: ₹{selectedPackage.pricePerPerson.toLocaleString()} /Person</span>
              </div>
              <div className="text-slate-400">Route: {fromCity} ➔ {toDestination} ({departDate})</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedPackage(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const bId = 'YS-PKG' + Math.floor(100000 + Math.random() * 900000);
                  setBookingSuccessMsg(`Holiday Package Confirmed! Booking ID: ${bId}. Access team dispatched.`);
                  setSelectedPackage(null);
                  setTimeout(() => setBookingSuccessMsg(null), 8000);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005999] text-white text-xs font-black shadow-lg"
              >
                Confirm Holiday Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking.com Calendar Picker Modal */}
      <DatePickerModal 
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDates={(dStr) => setDepartDate(dStr)}
        isRange={false}
      />
    </div>
  );
}
