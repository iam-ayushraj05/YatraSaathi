'use client';

import React, { useState, useMemo } from 'react';
import DatePickerModal from '../common/DatePickerModal';
import { useApp } from '../../context/AppContext';

export interface FlightOption {
  id: string;
  badges: string[];
  outbound: {
    depTime: string;
    depAirport: string;
    depDate: string;
    arrTime: string;
    arrAirport: string;
    arrDate: string;
    duration: string;
    stops: string;
  };
  inbound: {
    depTime: string;
    depAirport: string;
    depDate: string;
    arrTime: string;
    arrAirport: string;
    arrDate: string;
    duration: string;
    stops: string;
  };
  airline: string;
  classType: string;
  price: number;
  accessibilityFeatures: string[];
}

export const SAMPLE_FLIGHTS: FlightOption[] = [
  {
    id: 'flight-1',
    badges: ['Best', 'Flexible ticket upgrade available'],
    outbound: {
      depTime: '1:25 PM',
      depAirport: 'PAT',
      depDate: 'Sep 19',
      arrTime: '3:20 PM',
      arrAirport: 'DEL',
      arrDate: 'Sep 19',
      duration: '1h 55m',
      stops: 'Direct'
    },
    inbound: {
      depTime: '2:40 PM',
      depAirport: 'DEL',
      depDate: 'Sep 26',
      arrTime: '4:25 PM',
      arrAirport: 'PAT',
      arrDate: 'Sep 26',
      duration: '1h 45m',
      stops: 'Direct'
    },
    airline: 'Air India, operated by IX',
    classType: 'Eco Value',
    price: 13911,
    accessibilityFeatures: ['Free Airport Wheelchair Ramp Assist', 'Priority Boarding', 'Aisle Chair Onboard']
  },
  {
    id: 'flight-2',
    badges: ['Flexible ticket upgrade available'],
    outbound: {
      depTime: '8:25 AM',
      depAirport: 'PAT',
      depDate: 'Sep 19',
      arrTime: '10:15 AM',
      arrAirport: 'DEL',
      arrDate: 'Sep 19',
      duration: '1h 50m',
      stops: 'Direct'
    },
    inbound: {
      depTime: '2:40 PM',
      depAirport: 'DEL',
      depDate: 'Sep 26',
      arrTime: '4:25 PM',
      arrAirport: 'PAT',
      arrDate: 'Sep 26',
      duration: '1h 45m',
      stops: 'Direct'
    },
    airline: 'Air India, operated by IX',
    classType: 'Eco Value',
    price: 13911,
    accessibilityFeatures: ['Wheelchair Ramp Assist', 'Step-Free Gate Access']
  },
  {
    id: 'flight-3',
    badges: ['Flexible ticket upgrade available'],
    outbound: {
      depTime: '4:55 PM',
      depAirport: 'PAT',
      depDate: 'Sep 19',
      arrTime: '6:40 PM',
      arrAirport: 'DEL',
      arrDate: 'Sep 19',
      duration: '1h 45m',
      stops: 'Direct'
    },
    inbound: {
      depTime: '2:40 PM',
      depAirport: 'DEL',
      depDate: 'Sep 26',
      arrTime: '4:25 PM',
      arrAirport: 'PAT',
      arrDate: 'Sep 26',
      duration: '1h 45m',
      stops: 'Direct'
    },
    airline: 'Air India, operated by IX',
    classType: 'Eco Value',
    price: 13911,
    accessibilityFeatures: ['100% Step-Free Airport Shuttle', 'Priority Boarding']
  },
  {
    id: 'flight-4',
    badges: ['Cheapest', 'Flexible ticket upgrade available'],
    outbound: {
      depTime: '11:10 AM',
      depAirport: 'PAT',
      depDate: 'Sep 19',
      arrTime: '1:00 PM',
      arrAirport: 'DEL',
      arrDate: 'Sep 19',
      duration: '1h 50m',
      stops: 'Direct'
    },
    inbound: {
      depTime: '2:40 PM',
      depAirport: 'DEL',
      depDate: 'Sep 26',
      arrTime: '4:25 PM',
      arrAirport: 'PAT',
      arrDate: 'Sep 26',
      duration: '1h 45m',
      stops: 'Direct'
    },
    airline: 'IndiGo 6E-2105',
    classType: 'Saver',
    price: 11900,
    accessibilityFeatures: ['100% Step-Free Gate Access', 'Free Wheelchair Assist']
  }
];

export default function FlightsSection() {
  const { userLocation } = useApp();
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [tripType, setTripType] = useState('one-way');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [directOnly, setDirectOnly] = useState(false);

  const [fromAirport, setFromAirport] = useState('PAT - Jayprakash Narayan Airport, Patna');
  const [toAirport, setToAirport] = useState('DEL - Indira Gandhi Intl Airport, New Delhi');
  const [travelDates, setTravelDates] = useState(getTodayFormatted());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [travelers, setTravelers] = useState('1 adult');

  const [selectedStops, setSelectedStops] = useState('any');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(['IndiGo', 'Air India', 'SpiceJet', 'Akasa Air', 'Air India Express']);
  const [sortBy, setSortBy] = useState('best');

  // Interactive Booking Modal state
  const [selectedBookingFlight, setSelectedBookingFlight] = useState<FlightOption | null>(null);
  const [passengerName, setPassengerName] = useState('Ayush Raj');
  const [requestWheelchair, setRequestWheelchair] = useState(true);
  const [requestPriorityBoarding, setRequestPriorityBoarding] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const handleSwap = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const toggleAirline = (name: string) => {
    setSelectedAirlines(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  // Filtered & Sorted Flights
  const filteredFlights = useMemo(() => {
    return SAMPLE_FLIGHTS.filter(flight => {
      if (directOnly && flight.outbound.stops !== 'Direct') return false;
      if (selectedStops === 'direct' && flight.outbound.stops !== 'Direct') return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.some(a => flight.airline.toLowerCase().includes(a.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return parseFloat(a.outbound.duration) - parseFloat(b.outbound.duration);
      return 0;
    });
  }, [directOnly, selectedStops, selectedAirlines, sortBy]);

  // Helper to extract 3-letter IATA code or name prefix
  const getAirportCode = (input: string, fallback: string) => {
    if (!input || !input.trim()) return fallback;
    const match = input.match(/([A-Z]{3})/);
    if (match) return match[1];
    return input.substring(0, 3).toUpperCase();
  };

  const currentFromCode = useMemo(() => getAirportCode(fromAirport, 'PAT'), [fromAirport]);
  const currentToCode = useMemo(() => getAirportCode(toAirport, 'DEL'), [toAirport]);

  const handleConfirmBooking = () => {
    if (!selectedBookingFlight) return;
    const pnr = 'YS-FL' + Math.floor(100000 + Math.random() * 900000);
    setBookingSuccess(`Flight Ticket Confirmed! PNR: ${pnr} for ${passengerName}. Access assistance requested.`);
    setSelectedBookingFlight(null);
    setTimeout(() => setBookingSuccess(null), 8000);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans text-slate-900 dark:text-slate-100 relative">
      
      {/* Toast Notification */}
      {bookingSuccess && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* ── CLEAN WHITE FLIGHT SEARCH HEADER CONTAINER ── */}
      <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl text-slate-900 dark:text-white space-y-4">
        
        {/* Top Controls Bar */}
        <div className="bg-[#f4f7fc] dark:bg-[#181a2a] rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          
          <div className="bg-white dark:bg-[#151824] rounded-xl px-4 py-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="tripType" 
                checked={tripType === 'round'} 
                onChange={() => setTripType('round')}
                className="accent-blue-600 w-4 h-4"
              />
              <span>Round-trip</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="tripType" 
                checked={tripType === 'one-way'} 
                onChange={() => setTripType('one-way')}
                className="accent-blue-600 w-4 h-4"
              />
              <span>One-way</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="tripType" 
                checked={tripType === 'multi'} 
                onChange={() => setTripType('multi')}
                className="accent-blue-600 w-4 h-4"
              />
              <span>Multi-city</span>
            </label>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <select 
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="bg-transparent border-none font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>

            <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
              <input 
                type="checkbox" 
                checked={directOnly}
                onChange={(e) => setDirectOnly(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Direct flights only</span>
            </label>
          </div>

          {/* Quick Popular Route Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Popular Routes:</span>
            {[
              { from: 'PAT - Jayprakash Narayan Airport, Patna', to: 'DEL - Indira Gandhi Intl Airport, New Delhi', label: 'Patna (PAT) ➔ Delhi (DEL)' },
              { from: 'DEL - Indira Gandhi Intl Airport, New Delhi', to: 'BOM - Chhatrapati Shivaji Maharaj Intl, Mumbai', label: 'Delhi (DEL) ➔ Mumbai (BOM)' },
              { from: 'BLR - Kempegowda Intl Airport, Bengaluru', to: 'DEL - Indira Gandhi Intl Airport, New Delhi', label: 'Bengaluru (BLR) ➔ Delhi (DEL)' },
              { from: 'CCU - Netaji Subhash Chandra Bose Intl, Kolkata', to: 'DEL - Indira Gandhi Intl Airport, New Delhi', label: 'Kolkata (CCU) ➔ Delhi (DEL)' },
            ].map((route, rIdx) => (
              <button
                key={rIdx}
                type="button"
                onClick={() => {
                  setFromAirport(route.from);
                  setToAirport(route.to);
                }}
                className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-bold border border-blue-200/60 dark:border-blue-800/40 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>✈</span> {route.label}
              </button>
            ))}
          </div>

          {/* Main Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            
            {/* Leaving from */}
            <div className="md:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                LEAVING FROM
              </label>
              <input 
                type="text" 
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none truncate"
              />
              <button 
                type="button" 
                onClick={handleSwap}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow cursor-pointer"
                title="Swap origin and destination"
              >
                ⇄
              </button>
            </div>

            {/* Going to */}
            <div className="md:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                GOING TO
              </label>
              <input 
                type="text" 
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none truncate"
              />
            </div>

            {/* Travel dates */}
            <div 
              onClick={() => setShowCalendarModal(true)}
              className="md:col-span-3 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
            >
              <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1 cursor-pointer">
                TRAVEL DATES
              </label>
              <input 
                type="text" 
                readOnly
                value={travelDates}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none truncate cursor-pointer"
              />
            </div>

            {/* Travelers */}
            <div className="md:col-span-2 bg-white dark:bg-[#151824] rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                TRAVELERS
              </label>
              <input 
                type="text" 
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none truncate"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-1">
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('flights-results');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs py-3 px-3 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer uppercase tracking-wider"
              >
                <span>Search</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ── MAIN DASHBOARD VIEW (SIDEBAR + FLIGHT LISTINGS) ── */}
      <div id="flights-results" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white">Filters</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Showing {filteredFlights.length} results</p>
          </div>

          {/* Stops */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Stops</h4>
            <div className="space-y-1.5 text-xs font-semibold">
              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="stopsFilter" 
                    checked={selectedStops === 'any'} 
                    onChange={() => setSelectedStops('any')}
                    className="accent-blue-600"
                  />
                  <span>Any</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">From INR13,911</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="stopsFilter" 
                    checked={selectedStops === 'direct'} 
                    onChange={() => setSelectedStops('direct')}
                    className="accent-blue-600"
                  />
                  <span>Direct only</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">From INR13,911</span>
              </label>
            </div>
          </div>

          {/* Airlines */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Airlines</h4>
            <div className="space-y-1.5 text-xs font-semibold">
              {['IndiGo', 'Air India', 'SpiceJet', 'Akasa Air', 'Air India Express'].map(airline => (
                <label key={airline} className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedAirlines.includes(airline)}
                      onChange={() => toggleAirline(airline)}
                      className="accent-blue-600 rounded"
                    />
                    <span>{airline}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">Active</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Listings Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Browse search results</h2>
              <p className="text-xs text-slate-400">We found {filteredFlights.length} flight options</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="best">Best</option>
                <option value="cheapest">Cheapest</option>
                <option value="fastest">Fastest</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="space-y-4">
            {filteredFlights.map((flight, idx) => (
              <div 
                key={flight.id}
                className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                      Flight option {idx + 1} of {filteredFlights.length}
                    </span>
                    {flight.badges.map((b, bi) => (
                      <span key={bi} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md">
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 dark:text-white">INR {flight.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Outbound */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                  <div className="sm:col-span-3 font-bold text-slate-900 dark:text-white">
                    {flight.outbound.depTime} – {flight.outbound.arrTime}
                    <div className="text-[11px] text-slate-400 font-normal">{flight.airline}</div>
                  </div>
                  <div className="sm:col-span-6 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-500">{flight.outbound.duration}</span>
                    <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative my-1">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">{flight.outbound.stops}</span>
                  </div>
                  <div className="sm:col-span-3 text-right font-black text-sm text-slate-900 dark:text-white">
                    {currentFromCode} ➔ {currentToCode}
                  </div>
                </div>

                {/* Inbound (If round trip or return flight) */}
                {tripType === 'round' && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="sm:col-span-3 font-bold text-slate-900 dark:text-white">
                      {flight.inbound.depTime} – {flight.inbound.arrTime}
                      <div className="text-[11px] text-slate-400 font-normal">{flight.airline}</div>
                    </div>
                    <div className="sm:col-span-6 flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-500">{flight.inbound.duration}</span>
                      <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative my-1">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{flight.inbound.stops}</span>
                    </div>
                    <div className="sm:col-span-3 text-right font-black text-sm text-slate-900 dark:text-white">
                      {currentToCode} ➔ {currentFromCode}
                    </div>
                  </div>
                )}

                {/* Accessibility Amenities */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {flight.accessibilityFeatures.map((feat, fi) => (
                      <span key={fi} className="bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        ♿ {feat}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => setSelectedBookingFlight(flight)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                  >
                    Select Flight
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      {selectedBookingFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Flight Ticket Booking
              </h3>
              <button 
                onClick={() => setSelectedBookingFlight(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#1a1d2e] p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-black text-sm text-blue-600">{selectedBookingFlight.airline}</div>
              <div className="flex justify-between font-bold">
                <span>Route: {selectedBookingFlight.outbound.depAirport} ➔ {selectedBookingFlight.outbound.arrAirport}</span>
                <span>Fare: INR {selectedBookingFlight.price.toLocaleString()}</span>
              </div>
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

              <div className="space-y-2 pt-1 text-xs">
                <div className="font-bold text-purple-700 dark:text-purple-400">♿ Wheelchair & Boarding Assistance:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={requestWheelchair}
                    onChange={(e) => setRequestWheelchair(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Request Airport Ramp Wheelchair & Escort</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={requestPriorityBoarding}
                    onChange={(e) => setRequestPriorityBoarding(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Request Priority Boarding & Aisle Chair</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedBookingFlight(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg"
              >
                Confirm Flight Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POPULAR FLIGHT ROUTES GRID ── */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Popular Flight Routes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { city: 'Mumbai', code: 'BOM', name: 'Mumbai Flights', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=300&q=80', to: ['Goa', 'Delhi', 'Bangalore', 'Kolkata'] },
            { city: 'Delhi', code: 'DEL', name: 'Delhi Flights', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Goa', 'Bangalore', 'Srinagar'] },
            { city: 'Kolkata', code: 'CCU', name: 'Kolkata Flights', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Delhi', 'Bangalore', 'Port Blair'] },
            { city: 'Chennai', code: 'MAA', name: 'Chennai Flights', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Delhi', 'Kolkata', 'Coimbatore'] },
            { city: 'Hyderabad', code: 'HYD', name: 'Hyderabad Flights', img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Goa', 'Bangalore', 'Delhi'] },
            { city: 'Ahmedabad', code: 'AMD', name: 'Ahmedabad Flights', img: 'https://images.unsplash.com/photo-1609946850029-7925c4856cb3?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Delhi', 'Bangalore', 'Goa'] },
            { city: 'Bangalore', code: 'BLR', name: 'Bangalore Flights', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Delhi', 'Goa', 'Kolkata'] },
            { city: 'Pune', code: 'PNQ', name: 'Pune Flights', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=300&q=80', to: ['Goa', 'Delhi', 'Bangalore', 'Kolkata'] },
            { city: 'Patna', code: 'PAT', name: 'Patna Flights', img: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=300&q=80', to: ['Delhi', 'Bangalore', 'Mumbai', 'Kolkata'] },
            { city: 'Coimbatore', code: 'CJB', name: 'Coimbatore Flights', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80', to: ['Chennai', 'Bangalore', 'Delhi', 'Hyderabad'] },
            { city: 'Kochi', code: 'COK', name: 'Kochi Flights', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80', to: ['Delhi', 'Bangalore', 'Mumbai', 'Guwahati'] },
            { city: 'Goa', code: 'GOI', name: 'Goa Flights', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=300&q=80', to: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'] },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
              onClick={() => {
                setFromAirport(`${item.code} - ${item.city} Airport`);
                setToAirport(`${item.to[0]} Airport`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative">
                <img 
                  src={item.img} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  <span className="text-slate-400 font-normal">To: </span>
                  {item.to.map((dest, dIdx) => (
                    <span 
                      key={dIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFromAirport(`${item.code} - ${item.city} Airport`);
                        setToAirport(`${dest} Airport`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {dest}{dIdx < item.to.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POPULAR DOMESTIC AIRLINES BAR ── */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Popular Domestic Airlines
        </h3>

        <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center text-center">
            {[
              { name: 'IndiGo', color: 'text-indigo-700 dark:text-indigo-400', icon: 'flight_takeoff' },
              { name: 'Air India', color: 'text-red-600 dark:text-red-400', icon: 'flight' },
              { name: 'Air India Express', color: 'text-amber-600 dark:text-amber-400', icon: 'connecting_airports' },
              { name: 'Akasa Air', color: 'text-orange-600 dark:text-orange-400', icon: 'flight_land' },
              { name: 'Alliance Air', color: 'text-blue-600 dark:text-blue-400', icon: 'travel_explore' },
              { name: 'SpiceJet', color: 'text-rose-600 dark:text-rose-400', icon: 'local_fire_department' },
            ].map((airline, aIdx) => (
              <div 
                key={aIdx}
                onClick={() => {
                  toggleAirline(airline.name);
                  const el = document.getElementById('flights-results');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <span className={`material-symbols-outlined text-2xl ${airline.color}`}>
                    {airline.icon}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                  {airline.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking.com Calendar Picker Modal */}
      <DatePickerModal 
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDates={(dStr) => setTravelDates(dStr)}
      />
    </div>
  );
}
