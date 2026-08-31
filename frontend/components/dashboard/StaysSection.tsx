'use client';

import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';
import DatePickerModal from '../common/DatePickerModal';
import { useAuth } from '../../context/AuthContext';

export interface StayProperty {
  id: string;
  name: string;
  stars: number;
  neighborhood: string;
  distance: string;
  score: number;
  scoreLabel: string;
  reviewsCount: number;
  locationScore?: number;
  isFeatured?: boolean;
  isGetawayDeal?: boolean;
  isNewToBooking?: boolean;
  roomType: string;
  bedConfig: string;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  noPrepayment?: boolean;
  originalPrice?: number;
  currentPrice: number;
  taxAmount: number;
  image: string;
  accessibilityFeatures: string[];
  propertyType: string;
  lat: number;
  lng: number;
}

// EXACTLY THREE STAYS MATCHING THE USER'S SCREENSHOT SPECIFICATIONS WITH REAL COORDINATES
export const ONLY_THREE_STAYS: StayProperty[] = [
  {
    id: 'stay-elysian',
    name: 'Hotel Elysian By G K Group Near IGI Delhi Airport',
    stars: 4,
    neighborhood: 'Mahipalpur, New Delhi',
    distance: '14.8 km from downtown',
    score: 9.2,
    scoreLabel: 'Wonderful',
    reviewsCount: 88,
    locationScore: 9.5,
    isFeatured: true,
    isGetawayDeal: true,
    roomType: 'Superior King Room',
    bedConfig: '1 king bed',
    breakfastIncluded: true,
    freeCancellation: true,
    noPrepayment: true,
    originalPrice: 1954,
    currentPrice: 1563,
    taxAmount: 78,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    accessibilityFeatures: ['100% Step-Free Entrance', 'Roll-in Shower', 'Elevator Access', 'Grab Rails in Toilet'],
    propertyType: 'Hotels',
    lat: 28.5492,
    lng: 77.1231
  },
  {
    id: 'stay-parktree',
    name: 'Hotel Park Tree Igi Airport Delhi',
    stars: 4,
    neighborhood: 'Mahipalpur, New Delhi',
    distance: '13.8 km from downtown',
    score: 7.5,
    scoreLabel: 'Good',
    reviewsCount: 199,
    roomType: 'Deluxe King Room',
    bedConfig: '1 king bed',
    breakfastIncluded: false,
    freeCancellation: true,
    noPrepayment: false,
    currentPrice: 3499,
    taxAmount: 175,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    accessibilityFeatures: ['Wheelchair Accessible', 'Paved Ramp Access', 'Raised Toilet', 'Lowered Sink'],
    propertyType: 'Hotels',
    lat: 28.5524,
    lng: 77.1205
  },
  {
    id: 'stay-ecg',
    name: 'Hotel Ecg Grand Inn - Near IGI Delhi Airport',
    stars: 4,
    neighborhood: 'New Delhi',
    distance: '14.8 km from downtown',
    score: 8.9,
    scoreLabel: 'Excellent',
    reviewsCount: 23,
    isFeatured: true,
    isGetawayDeal: true,
    isNewToBooking: true,
    roomType: 'Standard King Room',
    bedConfig: '1 king bed',
    breakfastIncluded: false,
    freeCancellation: true,
    noPrepayment: true,
    originalPrice: 1679,
    currentPrice: 1343,
    taxAmount: 67,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    accessibilityFeatures: ['Roll-in Shower', 'Shower Chair Available', 'Elevator Access', 'Emergency Cord in Bathroom'],
    propertyType: 'Hotels',
    lat: 28.5461,
    lng: 77.1254
  }
];

export default function StaysSection() {
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [destination, setDestination] = useState('New Delhi, India');
  const { isAuthenticated, openAuthModal } = useAuth();
  const [datesStr, setDatesStr] = useState(getTodayFormatted());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [occupancyStr, setOccupancyStr] = useState('2 adults · 0 children · 1 room');

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [smartFilterQuery, setSmartFilterQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState(8000);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [selectedStayId, setSelectedStayId] = useState<string>('stay-elysian');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [bookingStay, setBookingStay] = useState<StayProperty | null>(null);
  const [guestName, setGuestName] = useState('Aarav Sharma');
  const [requestAccessibleRoom, setRequestAccessibleRoom] = useState(true);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmStayBooking = () => {
    if (!bookingStay) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal('login', 'booking', { 
        type: 'complete_booking', 
        data: { stay: bookingStay, guestName, dates: datesStr } 
      });
      return;
    }

    const bookingId = 'YS-HTL' + Math.floor(100000 + Math.random() * 900000);
    setBookingSuccessMsg(`Hotel Booking Confirmed! ID: ${bookingId} for ${guestName} at ${bookingStay.name}. Step-free room assigned.`);
    setBookingStay(null);
    setTimeout(() => setBookingSuccessMsg(null), 8000);
  };

  const selectedStay = ONLY_THREE_STAYS.find(s => s.id === selectedStayId) || ONLY_THREE_STAYS[0];

  const filteredStays = ONLY_THREE_STAYS.filter(stay => {
    if (stay.currentPrice > maxBudget) return false;
    if (smartFilterQuery.trim()) {
      const q = smartFilterQuery.toLowerCase();
      const nameMatch = stay.name.toLowerCase().includes(q);
      const accMatch = stay.accessibilityFeatures.some(f => f.toLowerCase().includes(q));
      if (!nameMatch && !accMatch) return false;
    }
    return true;
  });

  const mapPlaces = ONLY_THREE_STAYS.map(s => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    type: 'hotel' as const,
    accessible: 'HIGH' as const
  }));

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Breadcrumb Trail */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-1">
        <span className="hover:text-blue-600 cursor-pointer">Home</span>
        <span>›</span>
        <span className="hover:text-blue-600 cursor-pointer">India</span>
        <span>›</span>
        <span className="hover:text-blue-600 cursor-pointer">Delhi NCR</span>
        <span>›</span>
        <span className="hover:text-blue-600 cursor-pointer">New Delhi</span>
        <span>›</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">Search results</span>
      </div>

      {/* CLEAN WHITE & GLASSMORPHISM STAYS SEARCH HEADER */}
      <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">bed</span>
              Find your next stay
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Search low prices on hotels, homes and much more with step-free accessibility confirmation
            </p>
          </div>
          <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
            yatrasaathi Verified Stays
          </span>
        </div>

        {/* Popular Destination Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
          <span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Popular Destinations:</span>
          {['New Delhi, India', 'Patna, Bihar', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Goa, India', 'Manali, Himachal Pradesh'].map((city, cIdx) => (
            <button
              key={cIdx}
              type="button"
              onClick={() => setDestination(city)}
              className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-bold border border-blue-200/60 dark:border-blue-800/40 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🏨</span> {city}
            </button>
          ))}
        </div>

        {/* Clean White Input Box Row */}
        <div className="bg-[#f4f7fc] dark:bg-[#181a2a] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* Destination */}
            <div className="md:col-span-4 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-blue-600 text-xl">bed</span>
              <div className="flex-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">
                  ENTER DESTINATION
                </label>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div 
              onClick={() => setShowCalendarModal(true)}
              className="md:col-span-4 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
            >
              <span className="material-symbols-outlined text-blue-600 text-xl">calendar_month</span>
              <div className="flex-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5 cursor-pointer">
                  SELECT DATES
                </label>
                <input 
                  type="text" 
                  readOnly
                  value={datesStr}
                  className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Occupancy */}
            <div className="md:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-blue-600 text-xl">person</span>
              <div className="flex-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">
                  SELECT OCCUPANCY
                </label>
                <input 
                  type="text" 
                  value={occupancyStr}
                  onChange={(e) => setOccupancyStr(e.target.value)}
                  className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none truncate"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1">
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs py-3 px-3 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer uppercase tracking-wider">
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          {/* 📍 REAL INTERACTIVE MAP CARD ON LEFT SIDEBAR */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-2 space-y-2">
            <div className="relative h-44 rounded-xl overflow-hidden group">
              {/* Interactive Map Component focused on selected stay */}
              <InteractiveMap 
                origin={{ lat: selectedStay.lat, lng: selectedStay.lng }}
                destination={{ lat: selectedStay.lat, lng: selectedStay.lng }}
                startLabel={selectedStay.name}
                endLabel={selectedStay.neighborhood}
                places={mapPlaces}
                onPlaceSelect={(id) => setSelectedStayId(id)}
                className="h-full w-full"
              />

              {/* Overlay Button */}
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-10">
                <button 
                  onClick={() => setIsMapExpanded(true)}
                  className="pointer-events-auto bg-[#0071c2] hover:bg-[#005999] text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/40"
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Show on map
                </button>
              </div>
            </div>

            {/* Selected Hotel Map Quick Pill */}
            <div className="bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
              <div className="font-black text-[#0071c2] dark:text-blue-400 truncate">
                📍 {selectedStay.name}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex justify-between mt-1">
                <span>{selectedStay.neighborhood}</span>
                <span className="font-black text-emerald-600">₹{selectedStay.currentPrice} /night</span>
              </div>
            </div>
          </div>

          {/* Filter by Section */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Filter by:
            </h3>

            {/* Your budget slider */}
            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Your budget (per night)</h4>
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                ₹ 400 — ₹ {maxBudget.toLocaleString()}+
              </div>
              <input 
                type="range" 
                min="400" 
                max="10000" 
                step="200"
                value={maxBudget} 
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full accent-[#0071c2] cursor-pointer"
              />
            </div>

            {/* Smart Filters Prompt */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-[#0071c2] dark:text-[#4ffbe6]">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Smart filters
              </div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                What are you looking for?
              </label>
              <textarea 
                rows={2}
                value={smartFilterQuery}
                onChange={(e) => setSmartFilterQuery(e.target.value)}
                placeholder="Example: I want a place with great reviews and free cancellation"
                className="w-full text-xs bg-white dark:bg-[#1a1d2e] border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#0071c2]"
              />
              <button 
                onClick={() => setSmartFilterQuery('')}
                className="w-full text-center text-xs font-black text-[#0071c2] hover:underline"
              >
                Find properties
              </button>
            </div>

            {/* Review Score Filter */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Review score</h4>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Wonderful: 9+</span><span className="text-slate-400 font-mono">290</span></div>
                <div className="flex justify-between"><span>Very Good: 8+</span><span className="text-slate-400 font-mono">722</span></div>
                <div className="flex justify-between"><span>Good: 7+</span><span className="text-slate-400 font-mono">1131</span></div>
                <div className="flex justify-between"><span>Pleasant: 6+</span><span className="text-slate-400 font-mono">1405</span></div>
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Property Type</h4>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white"><span>Hotels</span><span className="text-slate-400 font-mono">1561</span></div>
                <div className="flex justify-between"><span>Entire homes &amp; apartments</span><span className="text-slate-400 font-mono">520</span></div>
                <div className="flex justify-between"><span>Apartments</span><span className="text-slate-400 font-mono">460</span></div>
                <div className="flex justify-between"><span>Guesthouses</span><span className="text-slate-400 font-mono">94</span></div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Header Row with properties found & View toggle */}
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{destination}:</span>
                <span className="text-blue-600 dark:text-blue-400">{filteredStays.length} properties found</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Showing verified accessible stays matching your search
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">View:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#0071c2] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  List
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#0071c2] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Stays List */}
          <div className="space-y-4">
            {filteredStays.map((stay) => {
              const isSelected = stay.id === selectedStayId;
              return (
                <div 
                  key={stay.id}
                  onClick={() => setSelectedStayId(stay.id)}
                  className={`bg-white dark:bg-[#121420] border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isSelected ? 'border-[#0071c2] ring-2 ring-[#0071c2]/20 dark:border-blue-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                    
                    {/* Hotel Image with Badges */}
                    <div className="md:col-span-5 relative h-56 md:h-full min-h-[220px]">
                      <img 
                        src={stay.image} 
                        alt={stay.name}
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(stay.id); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {favorites[stay.id] ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      {stay.isGetawayDeal && (
                        <div className="absolute bottom-3 left-3 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md shadow">
                          Getaway Deal
                        </div>
                      )}
                    </div>

                    {/* Hotel Details */}
                    <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                      
                      <div className="space-y-2">
                        {/* Title & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug hover:text-blue-600 transition-colors">
                              {stay.name}
                            </h3>
                            <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                              {Array.from({ length: stay.stars }).map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-right shadow-sm flex-shrink-0">
                            <div>
                              <div className="text-[10px] font-bold leading-none">{stay.scoreLabel}</div>
                              <div className="text-[9px] text-blue-200">{stay.reviewsCount} reviews</div>
                            </div>
                            <span className="text-sm font-black bg-blue-700 px-1.5 py-0.5 rounded">
                              {stay.score}
                            </span>
                          </div>
                        </div>

                        {/* Location & Show on map link */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            {stay.neighborhood}
                          </span>
                          <span>•</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedStayId(stay.id); }}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Show on map
                          </button>
                          <span>•</span>
                          <span>{stay.distance}</span>
                        </div>

                        {/* Room Type & Perks */}
                        <div className="space-y-1 pt-1">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {stay.roomType} — <span className="text-slate-500 font-normal">{stay.bedConfig}</span>
                          </div>
                          
                          {stay.breakfastIncluded && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              ✓ Breakfast included
                            </div>
                          )}

                          {stay.freeCancellation && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              ✓ Free cancellation
                            </div>
                          )}

                          {stay.noPrepayment && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              ✓ No prepayment needed – pay at the property
                            </div>
                          )}
                        </div>

                        {/* Accessibility Features */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {stay.accessibilityFeatures.map((acc, i) => (
                            <span 
                              key={i}
                              className="bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">accessible</span>
                              {acc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing & Availability Button */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">1 night, 2 adults</div>
                          <div className="flex items-baseline gap-2">
                            {stay.originalPrice && (
                              <span className="text-xs text-rose-500 line-through font-bold">
                                ₹{stay.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              ₹{stay.currentPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">+ ₹{stay.taxAmount} taxes and fees</div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingStay(stay);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>See availability</span>
                          <span>›</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Stay Booking Modal with Login Guard */}
      {bookingStay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">hotel</span>
                Reserve Accessible Room
              </h3>
              <button 
                onClick={() => setBookingStay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#1a1d2e] p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-black text-sm text-blue-600">{bookingStay.name}</div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Room: {bookingStay.roomType}</span>
                <span>Price: ₹{bookingStay.currentPrice.toLocaleString()} /night</span>
              </div>
              <div className="text-slate-400">Dates: {datesStr} • {occupancyStr}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Guest Full Name
                </label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="font-bold text-purple-700 dark:text-purple-400">♿ Accessibility &amp; Special Assistance:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={requestAccessibleRoom}
                    onChange={(e) => setRequestAccessibleRoom(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Guaranteed Ground Floor / Elevator Step-Free Room</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setBookingStay(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStayBooking}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                Confirm Stay Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {bookingSuccessMsg && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span>{bookingSuccessMsg}</span>
        </div>
      )}

      {/* Expanded Map Modal */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">map</span>
                Full Stays Location Map — New Delhi
              </h3>
              <button 
                onClick={() => setIsMapExpanded(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 w-full rounded-2xl overflow-hidden">
              <InteractiveMap 
                origin={{ lat: selectedStay.lat, lng: selectedStay.lng }}
                destination={{ lat: selectedStay.lat, lng: selectedStay.lng }}
                startLabel={selectedStay.name}
                endLabel={selectedStay.neighborhood}
                places={mapPlaces}
                onPlaceSelect={(id) => setSelectedStayId(id)}
                className="h-full w-full"
                showLegend={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking.com Calendar Picker Modal */}
      <DatePickerModal 
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDates={(dStr) => setDatesStr(dStr)}
      />
    </div>
  );
}
