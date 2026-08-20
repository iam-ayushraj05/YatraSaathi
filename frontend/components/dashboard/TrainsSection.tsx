'use client';

import React, { useState, useMemo } from 'react';
import DatePickerModal from '../common/DatePickerModal';
import { useApp } from '../../context/AppContext';

export interface SeatClassOption {
  className: string;
  isTatkal?: boolean;
  price: number;
  status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'FEW_SEATS';
  seatsLeft?: number;
  lastUpdated: string;
}

export interface TrainOption {
  id: string;
  trainNumber: string;
  trainName: string;
  rating: number;
  hasPantry: boolean;
  depTime: string;
  depStation: string;
  arrTime: string;
  arrStation: string;
  duration: string;
  seatClasses: SeatClassOption[];
  accessibilityFeatures: string[];
}

export const SAMPLE_TRAINS: TrainOption[] = [
  {
    id: 'train-1',
    trainNumber: '13052',
    trainName: 'Netaji Express',
    rating: 4.1,
    hasPantry: true,
    depTime: '06:15 DLI',
    depStation: 'Old Delhi (DLI)',
    arrTime: '08:05 HWH',
    arrStation: 'Howrah Jn (HWH)',
    duration: '25h 50m',
    accessibilityFeatures: ['Divyangjan Accessible Coach (SL/3A)', 'Wheelchair Ramp & Wide Doorway', 'Accessible Toilet with Grab Bars'],
    seatClasses: [
      { className: 'SL', price: 650, status: 'NOT_AVAILABLE', lastUpdated: '16 mins ago' },
      { className: 'SL', isTatkal: true, price: 840, status: 'NOT_AVAILABLE', lastUpdated: '8 mins ago' },
      { className: '3A', price: 1680, status: 'NOT_AVAILABLE', lastUpdated: '8 mins ago' },
      { className: '3A', isTatkal: true, price: 2100, status: 'NOT_AVAILABLE', lastUpdated: '8 mins ago' },
      { className: '2A', price: 2450, status: 'AVAILABLE', seatsLeft: 4, lastUpdated: '9 mins ago' },
      { className: '1A', price: 3890, status: 'AVAILABLE', seatsLeft: 2, lastUpdated: '5 mins ago' }
    ]
  },
  {
    id: 'train-2',
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express',
    rating: 4.6,
    hasPantry: true,
    depTime: '16:55 NDLS',
    depStation: 'New Delhi (NDLS)',
    arrTime: '09:55 HWH',
    arrStation: 'Howrah Jn (HWH)',
    duration: '17h 00m',
    accessibilityFeatures: ['100% Step-Free Platform Access NDLS', 'Dedicated Divyangjan Coach', 'IRCTC Station Escort'],
    seatClasses: [
      { className: '3A', price: 2890, status: 'AVAILABLE', seatsLeft: 18, lastUpdated: '2 mins ago' },
      { className: '3A', isTatkal: true, price: 3450, status: 'FEW_SEATS', seatsLeft: 3, lastUpdated: '1 min ago' },
      { className: '2A', price: 3980, status: 'AVAILABLE', seatsLeft: 12, lastUpdated: '4 mins ago' },
      { className: '1A', price: 5490, status: 'AVAILABLE', seatsLeft: 6, lastUpdated: '3 mins ago' }
    ]
  },
  {
    id: 'train-3',
    trainNumber: '12274',
    trainName: 'Howrah Duronto Express',
    rating: 4.4,
    hasPantry: true,
    depTime: '12:40 NDLS',
    depStation: 'New Delhi (NDLS)',
    arrTime: '06:00 HWH',
    arrStation: 'Howrah Jn (HWH)',
    duration: '17h 20m',
    accessibilityFeatures: ['Wheelchair Ramp Assist', 'Braille Signage in Coaches'],
    seatClasses: [
      { className: 'SL', price: 780, status: 'NOT_AVAILABLE', lastUpdated: '12 mins ago' },
      { className: '3A', price: 2150, status: 'AVAILABLE', seatsLeft: 9, lastUpdated: '7 mins ago' },
      { className: '2A', price: 3120, status: 'AVAILABLE', seatsLeft: 5, lastUpdated: '6 mins ago' },
      { className: '1A', price: 4780, status: 'FEW_SEATS', seatsLeft: 1, lastUpdated: '2 mins ago' }
    ]
  },
  {
    id: 'train-4',
    trainNumber: '12382',
    trainName: 'Poorva Express (via Patna)',
    rating: 4.2,
    hasPantry: true,
    depTime: '17:40 NDLS',
    depStation: 'New Delhi (NDLS)',
    arrTime: '17:00 HWH',
    arrStation: 'Howrah Jn (HWH)',
    duration: '23h 20m',
    accessibilityFeatures: ['Divyangjan Berth Guarantee', 'Accessible Toilet'],
    seatClasses: [
      { className: 'SL', price: 670, status: 'NOT_AVAILABLE', lastUpdated: '20 mins ago' },
      { className: '3A', price: 1750, status: 'FEW_SEATS', seatsLeft: 2, lastUpdated: '10 mins ago' },
      { className: '2A', price: 2590, status: 'AVAILABLE', seatsLeft: 8, lastUpdated: '5 mins ago' }
    ]
  }
];

export default function TrainsSection() {
  const { userLocation } = useApp();
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [fromStation, setFromStation] = useState('Patna Jn (PNBE)');
  const [toStation, setToStation] = useState('New Delhi (NDLS)');
  const [departDate, setDepartDate] = useState(getTodayFormatted());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  const [fullRefundChecked, setFullRefundChecked] = useState(true);

  // Date Carousel state
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Quick filters
  const [bestAvailableOnly, setBestAvailableOnly] = useState(false);
  const [tatkalOnly, setTatkalOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);
  const [divyangjanOnly, setDivyangjanOnly] = useState(false);

  // Booking Modal State
  const [bookingTrain, setBookingTrain] = useState<TrainOption | null>(null);
  const [bookingClass, setBookingClass] = useState<SeatClassOption | null>(null);
  const [passengerName, setPassengerName] = useState('Ayush Raj');
  const [divyangjanId, setDivyangjanId] = useState('DIVY-884920');
  const [requestEscort, setRequestEscort] = useState(true);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const datesList = [
    { date: 'Wed, 19', label: 'Filling Fast', active: selectedDateIndex === 0 },
    { date: 'Thu, 20', label: 'Filling Fast', active: selectedDateIndex === 1 },
    { date: 'Fri, 21', label: 'Filling Fast', active: selectedDateIndex === 2 },
    { date: 'Sat, 22', label: 'Few Seats', active: selectedDateIndex === 3 },
    { date: 'Sun, 23', label: 'Few Seats', active: selectedDateIndex === 4 },
    { date: 'Mon, 24', label: 'Filling Fast', active: selectedDateIndex === 5 },
    { date: 'Tue, 25', label: 'Few Seats', active: selectedDateIndex === 6 }
  ];

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Filtered Trains logic
  const filteredTrains = useMemo(() => {
    return SAMPLE_TRAINS.filter(train => {
      if (bestAvailableOnly && !train.seatClasses.some(c => c.status === 'AVAILABLE' || c.status === 'FEW_SEATS')) {
        return false;
      }
      if (tatkalOnly && !train.seatClasses.some(c => c.isTatkal)) {
        return false;
      }
      if (acOnly && !train.seatClasses.some(c => ['3A', '2A', '1A'].includes(c.className))) {
        return false;
      }
      if (divyangjanOnly && !train.accessibilityFeatures.some(f => f.toLowerCase().includes('divyangjan') || f.toLowerCase().includes('wheelchair'))) {
        return false;
      }
      return true;
    });
  }, [bestAvailableOnly, tatkalOnly, acOnly, divyangjanOnly]);

  const handleConfirmTrainBooking = () => {
    if (!bookingTrain || !bookingClass) return;
    const pnr = 'IRCTC-' + Math.floor(1000000000 + Math.random() * 9000000000);
    setBookingSuccessMsg(`IRCTC Divyangjan Ticket Confirmed! PNR: ${pnr} for ${passengerName} (${bookingClass.className} - ₹${bookingClass.price})`);
    setBookingTrain(null);
    setBookingClass(null);
    setTimeout(() => setBookingSuccessMsg(null), 8000);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans text-slate-900 dark:text-slate-100 relative">
      
      {/* Toast Notification */}
      {bookingSuccessMsg && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span>{bookingSuccessMsg}</span>
        </div>
      )}

      {/* ── CLEAN WHITE TRAIN SEARCH HEADER CONTAINER ── */}
      <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff5722] text-2xl">train</span>
              Search Indian Railways &amp; Divyangjan Special Trains
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Book IRCTC train tickets with guaranteed wheelchair ramp berths &amp; free station assistance
            </p>
          </div>
          <span className="text-xs bg-orange-50 dark:bg-orange-950/60 text-[#ff5722] font-black px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
            IRCTC Authorized Partner
          </span>
        </div>

        {/* Quick Popular Train Route Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] px-1">
          <span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Popular Train Routes:</span>
          {[
            { from: 'Patna Jn (PNBE)', to: 'New Delhi (NDLS)', label: 'Patna (PNBE) ➔ New Delhi (NDLS)' },
            { from: 'New Delhi (NDLS)', to: 'Varanasi Jn (BSB)', label: 'New Delhi (NDLS) ➔ Varanasi (BSB)' },
            { from: 'Mumbai Central (MMCT)', to: 'New Delhi (NDLS)', label: 'Mumbai (MMCT) ➔ New Delhi (NDLS)' },
            { from: 'Howrah Jn (HWH)', to: 'New Delhi (NDLS)', label: 'Howrah (HWH) ➔ New Delhi (NDLS)' },
          ].map((route, rIdx) => (
            <button
              key={rIdx}
              type="button"
              onClick={() => {
                setFromStation(route.from);
                setToStation(route.to);
              }}
              className="bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/80 text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-lg font-bold border border-orange-200/60 dark:border-orange-800/40 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🚆</span> {route.label}
            </button>
          ))}
        </div>

        {/* Inputs Bar */}
        <div className="flex flex-col lg:flex-row items-center gap-3 bg-[#f4f7fc] dark:bg-[#181a2a] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          
          {/* FROM */}
          <div className="flex-1 w-full bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-[#ff5722] text-xl shrink-0">train</span>
            <div className="flex-1 min-w-0">
              <label className="block text-[9.5px] font-bold text-slate-400 uppercase leading-none mb-1">
                FROM
              </label>
              <input 
                type="text" 
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none truncate"
                placeholder="From station"
              />
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="shrink-0 flex justify-center -my-1 lg:my-0">
            <button 
              type="button"
              onClick={handleSwap}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#ff5722] hover:scale-105 transition-all shadow-sm cursor-pointer"
              title="Swap From and To"
            >
              <span className="material-symbols-outlined text-base">sync_alt</span>
            </button>
          </div>

          {/* TO */}
          <div className="flex-1 w-full bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-[#ff5722] text-xl shrink-0">train</span>
            <div className="flex-1 min-w-0">
              <label className="block text-[9.5px] font-bold text-slate-400 uppercase leading-none mb-1">
                TO
              </label>
              <input 
                type="text" 
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none truncate"
                placeholder="To station"
              />
            </div>
          </div>

          {/* DEPARTURE DATE & TATKAL BADGES */}
          <div 
            onClick={() => setShowCalendarModal(true)}
            className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#151824] rounded-xl px-4 py-2 flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex flex-col min-w-0">
              <label className="block text-[9.5px] font-bold text-slate-400 uppercase leading-none mb-1 cursor-pointer">
                DEPARTURE DATE
              </label>
              <input 
                type="text" 
                readOnly
                value={departDate}
                className="bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none truncate w-28 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                type="button" 
                onClick={() => setDepartDate('Thu, 20 Aug')}
                className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-lg p-1 text-center hover:bg-emerald-100 transition-colors"
              >
                <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Tomorrow</div>
                <div className="bg-emerald-600 text-white text-[8px] font-black px-1 rounded">Tatkal Open</div>
              </button>

              <button 
                type="button" 
                onClick={() => setDepartDate('Fri, 21 Aug')}
                className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-lg p-1 text-center hover:bg-emerald-100 transition-colors"
              >
                <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Day After</div>
                <div className="bg-emerald-600 text-white text-[8px] font-black px-1 rounded">Tatkal Open</div>
              </button>
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <div className="w-full lg:w-36 shrink-0">
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('train-results-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-gradient-to-r from-[#ff5722] to-[#ff7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white font-black text-base py-3 px-5 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 uppercase tracking-wider"
            >
              <span>Search</span>
            </button>
          </div>

        </div>

        {/* Bottom Refund Features Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer font-bold">
            <input 
              type="checkbox" 
              checked={fullRefundChecked}
              onChange={(e) => setFullRefundChecked(e.target.checked)}
              className="accent-[#ff5722] rounded w-4 h-4"
            />
            <span className="text-slate-900 dark:text-white font-black">Get a full train fare refund</span>
          </label>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">⚡ ₹0 cancellation fee</span>
            <span>•</span>
            <span className="flex items-center gap-1">🔄 Instant full train fare refunds</span>
            <span>•</span>
            <span className="flex items-center gap-1">💬 24*7 premium customer support</span>
            <span>•</span>
            <span className="flex items-center gap-1">📄 No documentation required</span>
          </div>
        </div>

      </div>

      {/* ── MAIN RESULTS DASHBOARD ── */}
      <div id="train-results-anchor" className="space-y-5">
        
        {/* Title Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {fromStation} to {toStation} Trains
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {filteredTrains.length} Trains found • <span className="text-purple-600 dark:text-purple-400 font-bold">♿ Featuring Divyangjan Accessible Coaches &amp; Station Escort</span>
          </p>
        </div>

        {/* Date Selector Carousel */}
        <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800">
            Aug
          </div>

          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto hide-scrollbar">
            {datesList.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDateIndex(idx);
                  setDepartDate(item.date + ' Aug');
                }}
                className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  item.active 
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium'
                }`}
              >
                <span className="text-xs font-bold">{item.date}</span>
                <span className={`text-[9px] ${item.label === 'Few Seats' ? 'text-amber-600' : 'text-orange-500'} font-semibold`}>
                  • {item.label}
                </span>
              </button>
            ))}
          </div>

          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
            <span className="material-symbols-outlined text-xl">calendar_month</span>
          </button>
        </div>

        {/* Quick Filters Bar */}
        <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-black text-slate-900 dark:text-white">
            Quick Filters
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={bestAvailableOnly}
                onChange={(e) => setBestAvailableOnly(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Best Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={tatkalOnly}
                onChange={(e) => setTatkalOnly(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Tatkal Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={acOnly}
                onChange={(e) => setAcOnly(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>AC Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400">
              <input 
                type="checkbox" 
                checked={divyangjanOnly}
                onChange={(e) => setDivyangjanOnly(e.target.checked)}
                className="accent-purple-600 w-4 h-4 rounded"
              />
              <span>♿ Divyangjan Accessible</span>
            </label>
          </div>
        </div>

        {/* Blue Guarantee Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={fullRefundChecked}
              onChange={(e) => setFullRefundChecked(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
            <div>
              <div className="font-black text-sm sm:text-base">Get a full train fare refund</div>
              <div className="text-xs text-blue-100">Instant full train fare refunds</div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
        </div>

        {/* Train Cards List */}
        <div className="space-y-4">
          {filteredTrains.map((train) => (
            <div 
              key={train.id}
              className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Card Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {train.trainNumber} {train.trainName}
                  </h3>
                  
                  {train.hasPantry && (
                    <span className="text-slate-400 dark:text-slate-500" title="Pantry Available">
                      <span className="material-symbols-outlined text-base">restaurant</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-black">
                    <span>☆</span>
                    <span>{train.rating}</span>
                  </div>
                </div>

                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Schedule
                </button>
              </div>

              {/* Schedule Timing Graphic */}
              <div className="flex items-center justify-between gap-4 text-xs py-1">
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{train.depTime}</span>
                  <div className="text-slate-500 text-[11px] font-semibold">{train.depStation}</div>
                </div>

                <div className="flex-1 flex flex-col items-center max-w-xs">
                  <div className="w-full flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full border-2 border-blue-600"></div>
                    <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700"></div>
                    <span className="text-[10px] font-mono text-slate-400 px-1">{train.duration}</span>
                    <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full border-2 border-blue-600"></div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{train.arrTime}</span>
                  <div className="text-slate-500 text-[11px] font-semibold">{train.arrStation}</div>
                </div>
              </div>

              {/* Seat Classes Grid */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Available Classes
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {train.seatClasses.map((cls, cidx) => {
                    const isAvailable = cls.status === 'AVAILABLE' || cls.status === 'FEW_SEATS';
                    return (
                      <div 
                        key={cidx}
                        onClick={() => {
                          setBookingTrain(train);
                          setBookingClass(cls);
                        }}
                        className={`shrink-0 w-36 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isAvailable 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:scale-102' 
                            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:opacity-80'
                        }`}
                      >
                        <div className="text-[10px] font-medium text-slate-400 mb-1">
                          {cls.lastUpdated}
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-slate-900 dark:text-white text-sm">{cls.className}</span>
                            {cls.isTatkal && (
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-1 rounded">Tatkal</span>
                            )}
                          </div>
                          <span className="font-black text-slate-900 dark:text-white text-sm">₹{cls.price}</span>
                        </div>

                        <div className={`text-xs font-black ${isAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isAvailable ? (
                            <span>CURR_AVAIL-{String(cls.seatsLeft).padStart(4, '0')}</span>
                          ) : (
                            <span>Not Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* yatrasaathi Accessibility Amenities */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {train.accessibilityFeatures.map((feat, fidx) => (
                    <span 
                      key={fidx} 
                      className="bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      ♿ {feat}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const firstAvail = train.seatClasses.find(c => c.status === 'AVAILABLE') || train.seatClasses[0];
                    setBookingTrain(train);
                    setBookingClass(firstAvail);
                  }}
                  className="bg-[#ff5722] hover:bg-[#e64a19] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow cursor-pointer ml-auto active:scale-95"
                >
                  Book Ticket
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ── BOOKING MODAL FOR TRAINS ── */}
      {bookingTrain && bookingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                IRCTC Divyangjan Ticket Booking
              </h3>
              <button 
                onClick={() => {
                  setBookingTrain(null);
                  setBookingClass(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#1a1d2e] p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-black text-sm text-[#ff5722]">{bookingTrain.trainNumber} {bookingTrain.trainName}</div>
              <div className="flex justify-between font-bold">
                <span>Class: {bookingClass.className} {bookingClass.isTatkal ? '(Tatkal)' : ''}</span>
                <span>Fare: ₹{bookingClass.price}</span>
              </div>
              <div className="text-slate-400">Timing: {bookingTrain.depTime} ➔ {bookingTrain.arrTime} ({bookingTrain.duration})</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Passenger Name
                </label>
                <input 
                  type="text" 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Divyangjan Concession Card / Unique ID
                </label>
                <input 
                  type="text" 
                  value={divyangjanId}
                  onChange={(e) => setDivyangjanId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="font-bold text-purple-700 dark:text-purple-400">♿ Free Station Assistance:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={requestEscort}
                    onChange={(e) => setRequestEscort(e.target.checked)}
                    className="accent-[#ff5722]"
                  />
                  <span>Free Station Sahayak / Wheelchair Escort at {bookingTrain.depStation}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  setBookingTrain(null);
                  setBookingClass(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmTrainBooking}
                className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs font-black shadow-lg"
              >
                Confirm IRCTC Booking
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
