'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HotDeals from '@/components/dashboard/HotDeals';
import TopDestinations from '@/components/dashboard/TopDestinations';
import DatePickerModal from '@/components/common/DatePickerModal';
import FaqSection from '@/components/common/FaqSection';
import Whyyatrasaathi from '@/components/dashboard/Whyyatrasaathi';
import { INDIAN_CITIES, INDIAN_AIRPORTS, INDIAN_TRAIN_STATIONS } from '@/lib/locationData';
import { useApp } from '@/context/AppContext';

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] flex items-center justify-center text-slate-400 font-bold">
      Loading Real Leaflet Map...
    </div>
  )
});

export default function Dashboard() {
  // Search Tabs State
  const [activeSearchTab, setActiveSearchTab] = useState('Accessible Routes');

  // Route Start and End Selection State (Lotus Temple to National Museum by default)
  const [routeStart, setRouteStart] = useState('Lotus Temple');
  const [routeEnd, setRouteEnd] = useState('National Museum');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Intermediate Stops State for Route
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [showAddStopDropdown, setShowAddStopDropdown] = useState(false);

  // Live GPS Tracking State
  const [userLiveLocation, setUserLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Full Landmark Coordinates Directory
  const DELHI_LOCATIONS: Record<string, { lat: number; lng: number; area: string; level: string; icon: string }> = {
    'Lotus Temple': { lat: 28.5535, lng: 77.2588, area: 'Kalkaji', level: 'High Access', icon: 'nature_people' },
    'National Museum': { lat: 28.6118, lng: 77.2191, area: 'Janpath', level: 'High Access', icon: 'museum' },
    'India Gate': { lat: 28.6129, lng: 77.2295, area: 'Central Delhi', level: 'High Access', icon: 'account_balance' },
    'Qutub Minar': { lat: 28.5244, lng: 77.1855, area: 'Mehrauli', level: 'Medium Access', icon: 'temple_buddhist' },
    'Red Fort': { lat: 28.6562, lng: 77.2410, area: 'Old Delhi', level: '2 Barriers', icon: 'fort' },
    'Lodhi Gardens': { lat: 28.5931, lng: 77.2197, area: 'Lodhi Colony', level: 'High Access', icon: 'park' },
    'Connaught Place': { lat: 28.6304, lng: 77.2177, area: 'Central Delhi', level: 'Step-Free Ramps', icon: 'storefront' },
    'Akshardham Temple': { lat: 28.6127, lng: 77.2773, area: 'East Delhi', level: 'Wheelchair Lift', icon: 'temple_hindu' },
    'Humayun\'s Tomb': { lat: 28.5933, lng: 77.2507, area: 'Nizamuddin', level: 'High Access', icon: 'account_balance' },
    'Rashtrapati Bhavan': { lat: 28.6143, lng: 77.1994, area: 'Raisina Hill', level: 'High Access', icon: 'account_balance' },
    'Dilli Haat INA': { lat: 28.5732, lng: 77.2083, area: 'INA Colony', level: 'Step-Free Ramps', icon: 'storefront' },
    'Safdarjung Tomb': { lat: 28.5893, lng: 77.2106, area: 'Safdarjung', level: 'Medium Access', icon: 'account_balance' },
    'Raj Ghat': { lat: 28.6406, lng: 77.2495, area: 'Ring Road', level: 'High Access', icon: 'nature_people' },
    'Chandni Chowk': { lat: 28.6560, lng: 77.2300, area: 'Old Delhi', level: 'Medium Access', icon: 'storefront' },
    'Delhi (DEL)': { lat: 28.5562, lng: 77.1000, area: 'Airport Terminal 3', level: 'High Access', icon: 'flight' }
  };

  const ACCESSIBLE_PLACES = [
    { name: 'Lotus Temple', area: 'Kalkaji', level: 'High Access', icon: 'nature_people' },
    { name: 'National Museum', area: 'Janpath', level: 'High Access', icon: 'museum' },
    { name: 'India Gate', area: 'Central Delhi', level: 'High Access', icon: 'account_balance' },
    { name: 'Qutub Minar', area: 'Mehrauli', level: 'Medium Access', icon: 'temple_buddhist' },
    { name: 'Red Fort', area: 'Old Delhi', level: '2 Barriers', icon: 'fort' },
    { name: 'Lodhi Gardens', area: 'Lodhi Colony', level: 'High Access', icon: 'park' },
    { name: 'Connaught Place', area: 'Central Delhi', level: 'Step-Free Ramps', icon: 'storefront' },
    { name: 'Akshardham Temple', area: 'East Delhi', level: 'Wheelchair Lift', icon: 'temple_hindu' },
    { name: 'Humayun\'s Tomb', area: 'Nizamuddin', level: 'High Access', icon: 'account_balance' },
    { name: 'Dilli Haat INA', area: 'INA Colony', level: 'Step-Free Ramps', icon: 'storefront' }
  ];

  const DEMO_PLACES = [
    { name: 'National Museum', location: 'Janpath', icon: 'account_balance', badge: '100% Step-Free' },
    { name: 'Qutub Minar', location: 'Mehrauli', icon: 'temple_buddhist', badge: 'Paved Ramps' },
    { name: 'Red Fort', location: 'Old Delhi', icon: 'fort', badge: 'Tactile Paths' },
    { name: 'Lodhi Gardens', location: 'Lodhi Colony', icon: 'park', badge: 'Smooth Trails' },
  ];

  const getCoordsForPlace = (name: string): { lat: number; lng: number } => {
    if (name.includes('Live Location') || name.includes('Real-Time')) {
      return userLiveLocation || { lat: 28.6139, lng: 77.2090 };
    }
    const cleanName = name.split(',')[0].trim();
    if (DELHI_LOCATIONS[cleanName]) return DELHI_LOCATIONS[cleanName];
    for (const [k, v] of Object.entries(DELHI_LOCATIONS)) {
      if (cleanName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cleanName.toLowerCase())) {
        return v;
      }
    }
    return { lat: 28.5830, lng: 77.2400 };
  };

  // Generate smooth street-aligned polyline waypoints between points
  const generateRoutePath = (start: { lat: number; lng: number }, stops: { lat: number; lng: number }[], end: { lat: number; lng: number }) => {
    const allKeyPoints = [start, ...stops, end];
    const path: { lat: number; lng: number }[] = [];

    for (let i = 0; i < allKeyPoints.length - 1; i++) {
      const p1 = allKeyPoints[i];
      const p2 = allKeyPoints[i + 1];
      const steps = 8;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        // Add subtle road-network curve simulation
        const lat = p1.lat + (p2.lat - p1.lat) * t + Math.sin(t * Math.PI) * ((p2.lng - p1.lng) * 0.15);
        const lng = p1.lng + (p2.lng - p1.lng) * t - Math.sin(t * Math.PI) * ((p2.lat - p1.lat) * 0.15);
        path.push({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
      }
    }
    return path;
  };

  // Distance calculation helper (Haversine formula in km)
  const calculateDistanceKm = (start: { lat: number; lng: number }, stops: { lat: number; lng: number }[], end: { lat: number; lng: number }) => {
    const points = [start, ...stops, end];
    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const lat1 = points[i].lat * Math.PI / 180;
      const lat2 = points[i + 1].lat * Math.PI / 180;
      const deltaLat = (points[i + 1].lat - points[i].lat) * Math.PI / 180;
      const deltaLng = (points[i + 1].lng - points[i].lng) * Math.PI / 180;
      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDist += 6371 * c;
    }
    return Math.max(1.5, totalDist * 1.35); // Road network coefficient
  };

  const startCoords = getCoordsForPlace(routeStart);
  const endCoords = getCoordsForPlace(routeEnd);
  const stopCoords = intermediateStops.map(s => getCoordsForPlace(s));
  const currentRouteGeometry = generateRoutePath(startCoords, stopCoords, endCoords);
  const routeDistKm = calculateDistanceKm(startCoords, stopCoords, endCoords);
  const route1DurationMin = Math.round(routeDistKm * 3.4);
  const route2DistKm = (routeDistKm * 1.12).toFixed(1);
  const route2DurationMin = Math.round(routeDistKm * 2.6);

  const handleRequestLiveLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLiveLocation(coords);
          setRouteStart('My Real-Time Location');
          setToastContent(`Live GPS location acquired: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
          setSearchSuccessToast(true);
          setTimeout(() => setSearchSuccessToast(false), 4500);
        },
        () => {
          setIsLocating(false);
          const fallbackDelhiLive = { lat: 28.6139, lng: 77.2090 };
          setUserLiveLocation(fallbackDelhiLive);
          setRouteStart('My Real-Time Location');
          setToastContent('Live Real-Time GPS location activated.');
          setSearchSuccessToast(true);
          setTimeout(() => setSearchSuccessToast(false), 4500);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleAddStop = (placeName: string) => {
    if (!intermediateStops.includes(placeName)) {
      setIntermediateStops(prev => [...prev, placeName]);
    }
    setShowAddStopDropdown(false);
  };

  const handleRemoveStop = (placeName: string) => {
    setIntermediateStops(prev => prev.filter(p => p !== placeName));
  };

  // Tab Config & Demo Defaults
  const TAB_CONFIG: Record<string, {
    fromLabel: string;
    fromDefault: string;
    fromPlaceholder: string;
    toLabel: string;
    toDefault: string;
    toPlaceholder: string;
    departLabel: string;
    departDefault: string;
    returnLabel: string;
    returnDefault: string;
    travelersLabel: string;
    travelersDefault: string;
    searchBtnText: string;
    toastMsg: string;
  }> = {
    'Accessible Routes': {
      fromLabel: 'From',
      fromDefault: 'Lotus Temple, Delhi',
      fromPlaceholder: 'Origin city or address',
      toLabel: 'To',
      toDefault: 'National Museum, Delhi',
      toPlaceholder: 'Destination landmark',
      departLabel: 'Depart',
      departDefault: 'Today, Aug 17',
      returnLabel: 'Return',
      returnDefault: 'Aug 24, 2024',
      travelersLabel: 'Travelers',
      travelersDefault: '1 Wheelchair + 1 Asst',
      searchBtnText: 'Search Routes',
      toastMsg: 'Found 3 Verified Step-Free Routes'
    },
    'Flights': {
      fromLabel: 'Flying From',
      fromDefault: 'DEL - New Delhi (IGI Airport)',
      fromPlaceholder: 'Departure Airport',
      toLabel: 'Flying To',
      toDefault: 'BOM - Mumbai (CSMIA Airport)',
      toPlaceholder: 'Arrival Airport',
      departLabel: 'Departure',
      departDefault: 'Aug 22, 2024',
      returnLabel: 'Return',
      returnDefault: 'Aug 29, 2024',
      travelersLabel: 'Passengers & Assist',
      travelersDefault: '1 Adult • WCHR Ramp Assist',
      searchBtnText: 'Search Flights',
      toastMsg: 'Found 6 Flights with Free Airport Wheelchair Assist'
    },
    'Trains': {
      fromLabel: 'From Station',
      fromDefault: 'New Delhi (NDLS)',
      fromPlaceholder: 'Departure Station',
      toLabel: 'To Station',
      toDefault: 'Howrah Jn (HWH)',
      toPlaceholder: 'Arrival Station',
      departLabel: 'Departure Date',
      departDefault: 'Wed, 19 Aug',
      returnLabel: 'Quota',
      returnDefault: 'General / Tatkal / Divyangjan',
      travelersLabel: 'Passengers & Class',
      travelersDefault: '1 Adult • 3A AC / SL Divyangjan Coach',
      searchBtnText: 'Search Trains',
      toastMsg: 'Found 5 Trains with Verified Divyangjan Accessibility'
    },
    'Stays': {
      fromLabel: 'Destination City',
      fromDefault: 'New Delhi, India',
      fromPlaceholder: 'City or Area',
      toLabel: 'Stay Preference',
      toDefault: 'Accessible Hotels & Homestays',
      toPlaceholder: 'Stay Name or Accessibility Type',
      departLabel: 'Check-In',
      departDefault: 'Thu, Sep 10',
      returnLabel: 'Check-Out',
      returnDefault: 'Fri, Sep 11 (1 N)',
      travelersLabel: 'Rooms & Guests',
      travelersDefault: '1 Room, 2 Guests • Roll-in Shower',
      searchBtnText: 'Find Stays',
      toastMsg: 'Found 2,315 Accessible Stays in New Delhi'
    },
    'Holidays': {
      fromLabel: 'From City',
      fromDefault: 'New Delhi, India',
      fromPlaceholder: 'Departure City',
      toLabel: 'To Destination',
      toDefault: 'Goa Accessible Beach Resort Package',
      toPlaceholder: 'Category / Destination',
      departLabel: 'Departure Date',
      departDefault: '3 Sept, 2026',
      returnLabel: 'Duration',
      returnDefault: '5 Days / 4 Nights',
      travelersLabel: 'Rooms & Guests',
      travelersDefault: '2 Adults (1 Room)',
      searchBtnText: 'Search Holidays',
      toastMsg: 'Found 120+ Holiday Packages with Step-Free Transfers'
    }
  };

  // Present / Today Date formatting helper
  const getTodayFormatted = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getNextWeekFormatted = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const { userLocation, refreshLocation } = useApp();
  const [fromCity, setFromCity] = useState(userLocation.displayName);
  const [toCity, setToCity] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    if (fromCity === 'New Delhi' || fromCity.startsWith('Current Location') || fromCity.endsWith('(Default)')) {
      setFromCity(userLocation.displayName);
    }
  }, [userLocation.displayName]);

  const fromInputContainerRef = useRef<HTMLDivElement>(null);
  const toInputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromInputContainerRef.current && !fromInputContainerRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toInputContainerRef.current && !toInputContainerRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [departDate, setDepartDate] = useState(getTodayFormatted());
  const [returnDate, setReturnDate] = useState('');
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [showDatesPicker, setShowDatesPicker] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [targetDateField, setTargetDateField] = useState<'depart' | 'return'>('depart');

  // Travelers & Assistance Count State
  const [wheelchairCount, setWheelchairCount] = useState(1);
  const [asstCount, setAsstCount] = useState(1);
  const [visualAssist, setVisualAssist] = useState(false);
  const [showTravelersPicker, setShowTravelersPicker] = useState(false);

  // Search Action State
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccessToast, setSearchSuccessToast] = useState(false);
  const [toastContent, setToastContent] = useState('');

  // 3 Project Lines Rotating at Equal 3-second Intervals
  const projectLines = [
    { icon: '👍', text: 'Hassle-Free Bookings' },
    { icon: '♿', text: '100% Step-Free Confirmations' },
    { icon: '⚡', text: 'Instant Assistance Guarantee' }
  ];
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const router = useRouter();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'Holidays') {
      router.push('/holidays');
      return;
    }
    setActiveSearchTab(tabId);
    const config = TAB_CONFIG[tabId];
    if (config) {
      setFromCity(config.fromDefault);
      setToCity(config.toDefault);
      setDepartDate(config.departDefault);
      setReturnDate(config.returnDefault);
    }
  };

  const handlePerformSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeSearchTab === 'Stays') {
      router.push('/stays');
      return;
    }
    if (activeSearchTab === 'Flights') {
      router.push('/flights');
      return;
    }
    if (activeSearchTab === 'Trains') {
      router.push('/trains');
      return;
    }
    if (activeSearchTab === 'Holidays') {
      router.push('/holidays');
      return;
    }
    setIsSearching(true);
    const config = TAB_CONFIG[activeSearchTab] || TAB_CONFIG['Accessible Routes'];
    setTimeout(() => {
      setIsSearching(false);
      if (fromCity) setRouteStart(fromCity.split('(')[0].split(',')[0].trim() || 'Lotus Temple');
      if (toCity) setRouteEnd(toCity.split('(')[0].split(',')[0].trim() || 'National Museum');
      setToastContent(`${config.toastMsg} from ${fromCity} to ${toCity}`);
      setSearchSuccessToast(true);
      setTimeout(() => setSearchSuccessToast(false), 5000);
      const target = document.getElementById('routes-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // Swap From & To
  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // Preference Filter State
  const [riderPref, setRiderPref] = useState('Wheelchair');
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [preferStepFree, setPreferStepFree] = useState(true);
  const [requireElevators, setRequireElevators] = useState(false);

  // Route Selection
  const [selectedRoute, setSelectedRoute] = useState(1);

  // Quick Toggles
  const [stepFreePath, setStepFreePath] = useState(true);
  const [accessibleToilets, setAccessibleToilets] = useState(false);

  // Map Zoom
  const [zoom, setZoom] = useState(1);

  // AI Copilot Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: "Hi Aarav! I'm your AI travel assistant. How can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: msg
    };
    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      let reply = "I can help you check monuments, find step-free paths, or design an accessible itinerary.";
      const lower = msg.toLowerCase();
      if (lower.includes('hotel') || lower.includes('accessible')) {
        reply = "Here are 3 verified step-free hotels near your route with roll-in showers.";
      } else if (lower.includes('wheelchair') || lower.includes('nearby')) {
        reply = "Nearby wheelchair rental & assistance point is available 200m away at Gate 3.";
      } else if (lower.includes('tips') || lower.includes('route')) {
        reply = "Tip: Route 1 offers full elevator access and wide paved footpaths.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'copilot',
          text: reply
        }
      ]);
    }, 600);
  };

  return (
    <div className="bg-[#f8f9ff] dark:bg-[#0c0e17] text-[#191c20] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col selection:bg-[#6200ee]/20 selection:text-[#4800b2]">
      {/* Top Navigation */}
      <Header />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* Hero Section */}
        <section 
          className="relative rounded-[2.5rem] overflow-hidden bg-cover bg-center text-white p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between shadow-2xl min-h-[460px] border border-white/10" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80')" }}
        >
          {/* Dark Violet Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d071a]/95 via-[#1d0a3d]/85 to-[#0b0518]/90 z-0"></div>
          <div className="absolute inset-0 bg-purple-950/30 mix-blend-overlay z-0"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>

          {/* Left Text Content */}
          <div className="relative z-10 lg:w-5/12 space-y-6 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-white drop-shadow-2xl uppercase">
              YOUR DESTINATION,<br />
              YOUR NEEDS.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b084ff] via-[#d0a7ff] to-[#4ffbe6]">
                THE JOURNEY TAILORED FOR YOU
              </span>
            </h2>

            <p className="text-sm sm:text-base text-white/80 max-w-md font-medium leading-relaxed drop-shadow-md">
              &ldquo;Let us take the hassle out of travel planning, so you can focus on the adventure ahead.&rdquo;
            </p>

            <div className="pt-2">
              <Link 
                href="/explore"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl text-sm font-black px-8 py-3 rounded-full inline-flex items-center gap-2 transition-all hover:scale-105 shadow-lg cursor-pointer"
              >
                Discover Now
              </Link>
            </div>
          </div>

          {/* Right Destination Cards (3 Cards + Explore More) */}
          <div className="relative z-10 lg:w-7/12 flex items-center justify-end gap-4 mt-8 lg:mt-0 overflow-x-auto pb-4 pt-2 hide-scrollbar w-full">
            {/* Card 1: India - Taj Mahal */}
            <div className="shrink-0 w-[170px] sm:w-[190px] h-[270px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Taj Mahal" src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">India</p>
                <h4 className="text-base font-black text-white leading-tight">Taj Mahal</h4>
              </div>
            </div>

            {/* Card 2: France - Eiffel Tower */}
            <div className="shrink-0 w-[170px] sm:w-[190px] h-[270px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Eiffel Tower" src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">France</p>
                <h4 className="text-base font-black text-white leading-tight">Eiffel Tower</h4>
              </div>
            </div>

            {/* Card 3: Turkey - Cappadocia */}
            <div className="shrink-0 w-[170px] sm:w-[190px] h-[270px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cappadocia" src="https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Turkey</p>
                <h4 className="text-base font-black text-white leading-tight">Cappadocia</h4>
              </div>
            </div>

            {/* Explore More Button */}
            <Link 
              href="/explore" 
              className="shrink-0 w-[110px] h-[270px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:scale-105 group text-white text-center p-3"
            >
              <span className="text-xs font-bold leading-tight">Explore<br />More</span>
              <div className="w-10 h-10 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </div>
            </Link>
          </div>
        </section>


        {/* Search/Filter Banner */}
        <section id="search-section" className="bg-white/95 dark:bg-[#121420]/95 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white/60 dark:border-slate-800 relative z-20 p-6 lg:p-8 animate-fade-in-up transition-colors">
          {/* Tabs & Top Right Rotating Project Feature Lines */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#cbc3d9]/20 dark:border-slate-800">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scrollbar">
              {[
                { id: 'Accessible Routes', icon: 'route' },
                { id: 'Flights', icon: 'flight' },
                { id: 'Trains', icon: 'train' },
                { id: 'Stays', icon: 'bed' },
                { id: 'Holidays', icon: 'beach_access' }
              ].map(tab => {
                const active = activeSearchTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white shadow-md hover:scale-105'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span> {tab.id}
                  </button>
                );
              })}
            </div>

            {/* Top Right Project Feature Text Only (Up-to-Down Slide Animation) */}
            <div className="overflow-hidden h-7 flex items-center justify-end px-2">
              <div 
                key={currentLineIndex} 
                className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 animate-slide-down"
              >
                <span className="text-base">{projectLines[currentLineIndex].icon}</span>
                <span>{projectLines[currentLineIndex].text}</span>
              </div>
            </div>
          </div>

          {/* Search Fields Row */}
          {(() => {
            const currentConfig = TAB_CONFIG[activeSearchTab] || TAB_CONFIG['Accessible Routes'];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-center">
                {/* From & To with embedded Swap button (Spans 5 cols on xl) */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 relative">
                  {/* From Input */}
                  <div ref={fromInputContainerRef} className="relative border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm transition-all group">
                    <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                      {currentConfig.fromLabel}
                    </label>
                    <input 
                      className="bg-transparent border-none p-0 focus:ring-0 text-[#191c20] dark:text-white w-full font-black text-xs lg:text-sm outline-none truncate" 
                      placeholder={currentConfig.fromPlaceholder} 
                      type="text" 
                      value={fromCity}
                      onFocus={(e) => { 
                        e.target.select(); 
                        setShowFromDropdown(true); 
                        setShowToDropdown(false); 
                      }}
                      onChange={(e) => setFromCity(e.target.value)}
                    />

                    {/* From Searchable Dropdown */}
                    {showFromDropdown && (() => {
                      const searchKey = (fromCity === userLocation.displayName || fromCity === 'New Delhi' || fromCity.startsWith('Current Location')) ? '' : fromCity.toLowerCase();
                      return (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowFromDropdown(false)} />
                          <div className="absolute left-0 top-full mt-2 w-72 max-h-64 overflow-y-auto bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="p-2 text-[10px] font-black uppercase text-[#4800b2] dark:text-[#4ffbe6] tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">my_location</span>
                              {activeSearchTab === 'Flights' ? 'All Indian Airports' : activeSearchTab === 'Trains' ? 'All Railway Stations' : 'Current & Indian Cities'}
                            </div>
                            
                            {/* Current Location Option */}
                            <div 
                              onClick={() => {
                                setFromCity(
                                  activeSearchTab === 'Flights' 
                                    ? `DEL - Indira Gandhi Intl Airport, New Delhi` 
                                    : activeSearchTab === 'Trains' 
                                    ? `NDLS - New Delhi Railway Station` 
                                    : userLocation.displayName
                                );
                                setShowFromDropdown(false);
                              }}
                              className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-emerald-500 text-base ${userLocation.status === 'requesting' || userLocation.status === 'reverse_geocoding' ? 'animate-spin' : ''}`}>
                                  {userLocation.status === 'requesting' || userLocation.status === 'reverse_geocoding' ? 'sync' : 'near_me'}
                                </span>
                                <div>
                                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    {userLocation.isFallback ? 'Default Location (New Delhi)' : 'Detected Current Location'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold">
                                    {userLocation.formattedLocation}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    refreshLocation();
                                  }}
                                  title="Update Location"
                                  className="text-[9px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded font-bold transition-colors"
                                >
                                  🔄 Refresh
                                </button>
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                  {userLocation.status === 'requesting' || userLocation.status === 'reverse_geocoding' ? 'Locating...' : userLocation.isFallback ? 'Fallback' : 'GPS'}
                                </span>
                              </div>
                            </div>

                            {/* Filtered items based on tab */}
                            {activeSearchTab === 'Flights' ? (
                              INDIAN_AIRPORTS.filter(a => 
                                !searchKey ||
                                a.city.toLowerCase().includes(searchKey) || 
                                a.code.toLowerCase().includes(searchKey) ||
                                a.name.toLowerCase().includes(searchKey)
                              ).map((ap) => (
                                <div
                                  key={ap.code}
                                  onClick={() => {
                                    setFromCity(`${ap.code} - ${ap.city} (${ap.name})`);
                                    setShowFromDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{ap.city} ({ap.code})</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{ap.name}</div>
                                  </div>
                                  <span className="font-mono text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">{ap.code}</span>
                                </div>
                              ))
                            ) : activeSearchTab === 'Trains' ? (
                              INDIAN_TRAIN_STATIONS.filter(s => 
                                !searchKey ||
                                s.city.toLowerCase().includes(searchKey) || 
                                s.code.toLowerCase().includes(searchKey) ||
                                s.name.toLowerCase().includes(searchKey)
                              ).map((st) => (
                                <div
                                  key={st.code}
                                  onClick={() => {
                                    setFromCity(`${st.code} - ${st.name}`);
                                    setShowFromDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{st.city} ({st.code})</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{st.name}</div>
                                  </div>
                                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{st.code}</span>
                                </div>
                              ))
                            ) : (
                              INDIAN_CITIES.filter(c => 
                                !searchKey ||
                                c.name.toLowerCase().includes(searchKey) || 
                                c.state.toLowerCase().includes(searchKey)
                              ).map((c) => (
                                <div
                                  key={c.name}
                                  onClick={() => {
                                    setFromCity(c.name);
                                    setShowFromDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{c.name}</div>
                                    <div className="text-[10px] text-slate-400">{c.state}</div>
                                  </div>
                                  {c.popular && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Popular</span>}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Swap Button (Only shown on Routes and Flights) */}
                  {(activeSearchTab === 'Accessible Routes' || activeSearchTab === 'Flights') && (
                    <button 
                      type="button"
                      onClick={handleSwap}
                      title="Swap From & To"
                      className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-[#cbc3d9]/60 dark:border-slate-600 items-center justify-center text-[#4800b2] dark:text-[#4ffbe6] hover:bg-[#4800b2] hover:text-white dark:hover:bg-[#6d23f9] transition-all shadow-md hover:scale-110 hover:rotate-180 duration-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">sync_alt</span>
                    </button>
                  )}

                  {/* To Input */}
                  <div ref={toInputContainerRef} className="relative border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm transition-all group">
                    <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                      {currentConfig.toLabel}
                    </label>
                    <input 
                      className="bg-transparent border-none p-0 focus:ring-0 text-[#191c20] dark:text-white w-full font-black text-xs lg:text-sm outline-none truncate" 
                      placeholder={currentConfig.toPlaceholder} 
                      type="text" 
                      value={toCity}
                      onFocus={(e) => { 
                        e.target.select(); 
                        setShowToDropdown(true); 
                        setShowFromDropdown(false); 
                      }}
                      onChange={(e) => setToCity(e.target.value)}
                    />

                    {/* To Searchable Dropdown */}
                    {showToDropdown && (() => {
                      const searchKey = toCity.toLowerCase();
                      return (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowToDropdown(false)} />
                          <div className="absolute right-0 top-full mt-2 w-72 max-h-64 overflow-y-auto bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="p-2 text-[10px] font-black uppercase text-[#4800b2] dark:text-[#4ffbe6] tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">location_city</span>
                              {activeSearchTab === 'Flights' ? 'All Indian Airports' : activeSearchTab === 'Trains' ? 'All Railway Stations' : 'Select Destination'}
                            </div>

                            {/* Filtered items based on tab */}
                            {activeSearchTab === 'Flights' ? (
                              INDIAN_AIRPORTS.filter(a => 
                                !searchKey ||
                                a.city.toLowerCase().includes(searchKey) || 
                                a.code.toLowerCase().includes(searchKey) ||
                                a.name.toLowerCase().includes(searchKey)
                              ).map((ap) => (
                                <div
                                  key={ap.code}
                                  onClick={() => {
                                    setToCity(`${ap.code} - ${ap.city} (${ap.name})`);
                                    setShowToDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{ap.city} ({ap.code})</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{ap.name}</div>
                                  </div>
                                  <span className="font-mono text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">{ap.code}</span>
                                </div>
                              ))
                            ) : activeSearchTab === 'Trains' ? (
                              INDIAN_TRAIN_STATIONS.filter(s => 
                                !searchKey ||
                                s.city.toLowerCase().includes(searchKey) || 
                                s.code.toLowerCase().includes(searchKey) ||
                                s.name.toLowerCase().includes(searchKey)
                              ).map((st) => (
                                <div
                                  key={st.code}
                                  onClick={() => {
                                    setToCity(`${st.code} - ${st.name}`);
                                    setShowToDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{st.city} ({st.code})</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{st.name}</div>
                                  </div>
                                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{st.code}</span>
                                </div>
                              ))
                            ) : (
                              INDIAN_CITIES.filter(c => 
                                !searchKey ||
                                c.name.toLowerCase().includes(searchKey) || 
                                c.state.toLowerCase().includes(searchKey)
                              ).map((c) => (
                                <div
                                  key={c.name}
                                  onClick={() => {
                                    setToCity(c.name);
                                    setShowToDropdown(false);
                                  }}
                                  className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                                >
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white">{c.name}</div>
                                    <div className="text-[10px] text-slate-400">{c.state}</div>
                                  </div>
                                  {c.popular && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Popular</span>}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Dates Picker (Spans 3 cols on xl) */}
                <div className="xl:col-span-3 relative">
                  <div 
                    className="border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm flex transition-all group"
                  >
                    <div 
                      onClick={() => {
                        setTargetDateField('depart');
                        setShowCalendarModal(true);
                        setShowTravelersPicker(false);
                      }}
                      className="flex-1 border-r border-[#cbc3d9]/40 dark:border-slate-700 pr-2 cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click to select Departure Date"
                    >
                      <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1 cursor-pointer">
                        {currentConfig.departLabel}
                      </label>
                      <div className="text-[#191c20] dark:text-white font-black text-xs lg:text-sm truncate group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                        {departDate}
                      </div>
                    </div>
                    {activeSearchTab === 'Trains' ? (
                      <div className="flex-1 pl-3 flex flex-col justify-center">
                        <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-0.5">
                          QUOTA
                        </label>
                        <select 
                          value={selectedQuota}
                          onChange={(e) => setSelectedQuota(e.target.value)}
                          className="bg-transparent text-[#191c20] dark:text-white font-black text-xs lg:text-sm outline-none cursor-pointer w-full font-mono"
                        >
                          <option value="GENERAL" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">GENERAL</option>
                          <option value="LADIES" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">LADIES</option>
                          <option value="LOWER BERTH/SR.CITIZEN" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">LOWER BERTH/SR.CITIZEN</option>
                          <option value="PERSON WITH DISABILITY" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">PERSON WITH DISABILITY</option>
                          <option value="DUTY PASS" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">DUTY PASS</option>
                          <option value="TATKAL" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">TATKAL</option>
                          <option value="PREMIUM TATKAL" className="bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white font-bold">PREMIUM TATKAL</option>
                        </select>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setTargetDateField('return');
                          setShowCalendarModal(true);
                          setShowTravelersPicker(false);
                        }}
                        className="flex-1 pl-3 cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to select Return Date"
                      >
                        <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1 cursor-pointer">
                          {currentConfig.returnLabel}
                        </label>
                        <div className="text-[#191c20] dark:text-white font-black text-xs lg:text-sm truncate group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors min-h-[20px]">
                          {returnDate}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dates Popover */}
                  {showDatesPicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDatesPicker(false)} />
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-3.5 z-50 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            {currentConfig.departLabel} &amp; {currentConfig.returnLabel}
                          </span>
                          <button onClick={() => setShowDatesPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {activeSearchTab === 'Stays' ? [
                            { label: 'Weekend Getaway (3 Nights)', dep: 'Aug 21, 2024', ret: 'Aug 24, 2024 (3 N)' },
                            { label: 'Vacation Stay (5 Nights)', dep: 'Aug 25, 2024', ret: 'Aug 30, 2024 (5 N)' },
                            { label: 'Weekly Extended (7 Nights)', dep: 'Sep 01, 2024', ret: 'Sep 08, 2024 (7 N)' },
                            { label: 'Tonight (1 Night)', dep: 'Tonight', ret: 'Tomorrow (1 N)' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => {
                                setDepartDate(preset.dep);
                                setReturnDate(preset.ret);
                                setShowDatesPicker(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                                departDate === preset.dep 
                                  ? 'bg-violet-50 dark:bg-violet-950/50 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{preset.label}</div>
                                <div className="text-[10px] text-slate-400">{preset.dep} ➔ {preset.ret}</div>
                              </div>
                              {departDate === preset.dep && <span className="material-symbols-outlined text-emerald-500 text-base">check</span>}
                            </button>
                          )) : activeSearchTab === 'Flights' ? [
                            { label: 'This Weekend Trip', dep: 'Aug 22, 2024', ret: 'Aug 25, 2024' },
                            { label: '1 Week Roundtrip', dep: 'Aug 22, 2024', ret: 'Aug 29, 2024' },
                            { label: 'Next Month Getaway', dep: 'Sep 10, 2024', ret: 'Sep 17, 2024' },
                            { label: 'One-Way Direct', dep: 'Tomorrow, Aug 19', ret: 'One Way' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => {
                                setDepartDate(preset.dep);
                                setReturnDate(preset.ret);
                                setShowDatesPicker(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                                departDate === preset.dep 
                                  ? 'bg-violet-50 dark:bg-violet-950/50 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{preset.label}</div>
                                <div className="text-[10px] text-slate-400">{preset.dep} ➔ {preset.ret}</div>
                              </div>
                              {departDate === preset.dep && <span className="material-symbols-outlined text-emerald-500 text-base">check</span>}
                            </button>
                          )) : [
                            { label: 'Today (1 Week)', dep: 'Today, Aug 17', ret: 'Aug 24, 2024' },
                            { label: 'Tomorrow (Quick Trip)', dep: 'Tomorrow, Aug 18', ret: 'Aug 21, 2024' },
                            { label: 'This Weekend', dep: 'Fri, Aug 22', ret: 'Sun, Aug 24, 2024' },
                            { label: 'Next Month (Extended)', dep: 'Mon, Sep 01', ret: 'Wed, Sep 10, 2024' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => {
                                setDepartDate(preset.dep);
                                setReturnDate(preset.ret);
                                setShowDatesPicker(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                                departDate === preset.dep 
                                  ? 'bg-violet-50 dark:bg-violet-950/50 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{preset.label}</div>
                                <div className="text-[10px] text-slate-400">{preset.dep} ➔ {preset.ret}</div>
                              </div>
                              {departDate === preset.dep && <span className="material-symbols-outlined text-emerald-500 text-base">check</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Travelers & Assistance Needs (Spans 2 cols on xl) */}
                <div className="xl:col-span-2 relative">
                  <div 
                    onClick={() => {
                      setShowTravelersPicker(!showTravelersPicker);
                      setShowDatesPicker(false);
                    }}
                    className="border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm transition-all cursor-pointer group"
                    title="Click to adjust Travelers & Accessibility Needs"
                  >
                    <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                      {currentConfig.travelersLabel}
                    </label>
                    <div className="text-[#191c20] dark:text-white font-black text-xs lg:text-sm truncate flex items-center justify-between group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                      <span>{wheelchairCount} Wheelchair + {asstCount} Asst</span>
                      <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-[#4800b2] transition-colors">expand_more</span>
                    </div>
                  </div>

                  {/* Travelers Popover */}
                  {showTravelersPicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowTravelersPicker(false)} />
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-3.5 z-50 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">accessible_forward</span>
                            {currentConfig.travelersLabel}
                          </span>
                          <button onClick={() => setShowTravelersPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>

                        {/* Wheelchair Counter */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">Wheelchair Users</div>
                            <div className="text-[10px] text-slate-400">Step-free required</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setWheelchairCount(Math.max(0, wheelchairCount - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900 dark:text-white">{wheelchairCount}</span>
                            <button
                              onClick={() => setWheelchairCount(wheelchairCount + 1)}
                              className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Assistants Counter */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">Caregivers / Asst</div>
                            <div className="text-[10px] text-slate-400">Companion traveler</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAsstCount(Math.max(0, asstCount - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900 dark:text-white">{asstCount}</span>
                            <button
                              onClick={() => setAsstCount(asstCount + 1)}
                              className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Visual / Hearing Toggle */}
                        <div className="flex items-center justify-between py-2 text-xs">
                          <span className="font-bold text-slate-800 dark:text-white">Guide Dog / Audio Guide</span>
                          <button
                            onClick={() => setVisualAssist(!visualAssist)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${visualAssist ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${visualAssist ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>

                        <button
                          onClick={() => setShowTravelersPicker(false)}
                          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 rounded-xl transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Button (Spans 2 cols on xl) */}
                <div className="xl:col-span-2">
                  <button 
                    type="button"
                    onClick={() => handlePerformSearch()}
                    disabled={isSearching}
                    className="w-full h-[58px] bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white text-xs lg:text-sm font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.02] transition-all shadow-md hover:shadow-xl cursor-pointer disabled:opacity-75"
                  >
                    {isSearching ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">search</span>
                        <span className="truncate">{currentConfig.searchBtnText}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Search Result Toast Alert */}
          {searchSuccessToast && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                <span>{toastContent || `Found verified results for ${fromCity} to ${toCity}`}</span>
              </div>
              <button onClick={() => setSearchSuccessToast(false)} className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                View ↓
              </button>
            </div>
          )}

          {/* Guarantees Bar */}
          <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-[#cbc3d9]/20 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 gap-4">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-default">
                <span className="material-symbols-outlined text-emerald-500 text-base bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-full">verified</span>
                <span className="font-bold">100% Step-Free Confirmations</span>
              </div>
              <div className="flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-default">
                <span className="material-symbols-outlined text-[#4800b2] dark:text-[#4ffbe6] text-base bg-[#4800b2]/10 dark:bg-[#4ffbe6]/10 p-1.5 rounded-full">credit_card_off</span>
                <span className="font-bold">Zero Booking Fee</span>
              </div>
              <div className="flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-default">
                <span className="material-symbols-outlined text-[#4800b2] dark:text-[#4ffbe6] text-base bg-[#4800b2]/10 dark:bg-[#4ffbe6]/10 p-1.5 rounded-full">support_agent</span>
                <span className="font-bold">Instant Assistance Guarantee</span>
              </div>
            </div>
            <Link className="text-[#4800b2] dark:text-[#4ffbe6] font-bold hover:underline flex items-center gap-1 bg-[#4800b2]/5 dark:bg-slate-800 px-3.5 py-1.5 rounded-full hover:bg-[#4800b2]/10 transition-colors ml-auto sm:ml-0" href="/accessibility-profile">
              Know My Accessibility Partner <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </section>

        {/* Why yatrasaathi? (4 Best Core USPs Section) */}
        <Whyyatrasaathi />

        {/* Header for Main Content Area (Compact Spacing & Interactive + Sign) */}
        <div id="routes-section" className="flex flex-col md:flex-row justify-between items-center gap-3 pb-3 border-b border-[#cbc3d9]/30 dark:border-slate-800 mt-3 animate-fade-in-up relative z-30 scroll-mt-24">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#191c20] dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#4800b2]/10 dark:bg-violet-900/30 flex items-center justify-center text-[#4800b2] dark:text-[#4ffbe6] transition-transform hover:scale-110">
              <span className="material-symbols-outlined text-lg">location_on</span>
            </div>
            Find Your Perfect Route
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Interactive Route Pill with Start/End Place Selectors & Demo Stops */}
            <div className="relative z-40">
              <div className="bg-white dark:bg-[#151824] px-4 py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-medium border border-[#cbc3d9]/40 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                {/* Start Place Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowStartPicker(!showStartPicker);
                    setShowEndPicker(false);
                    setShowAddStopDropdown(false);
                  }}
                  className="text-[#191c20] dark:text-slate-200 font-bold hover:text-[#4800b2] dark:hover:text-[#4ffbe6] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Click to change Start place"
                >
                  <span>{routeStart}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
                </button>

                <span className="material-symbols-outlined text-[14px] text-[#7a7488]">arrow_forward</span>
                
                {/* Dynamically Added Intermediate Stops */}
                {intermediateStops.map(stop => (
                  <span 
                    key={stop}
                    className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-950/50 text-[#4800b2] dark:text-[#cfbdff] px-2.5 py-0.5 rounded-full text-xs font-bold border border-violet-200 dark:border-violet-800 animate-fade-in"
                  >
                    <span>{stop}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStop(stop);
                      }}
                      title={`Remove ${stop}`}
                      className="hover:text-rose-500 rounded-full p-0.5 flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                    <span className="material-symbols-outlined text-[12px] text-[#7a7488]">arrow_forward</span>
                  </span>
                ))}

                {/* End Place Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEndPicker(!showEndPicker);
                    setShowStartPicker(false);
                    setShowAddStopDropdown(false);
                  }}
                  className="text-[#4800b2] dark:text-[#4ffbe6] font-black hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                  title="Click to change Destination"
                >
                  <span>{routeEnd}</span>
                  <span className="material-symbols-outlined text-[14px] text-[#4800b2]/70 dark:text-[#4ffbe6]/70">expand_more</span>
                </button>
                
                {/* Add Stop '+' Button with Popover */}
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddStopDropdown(!showAddStopDropdown);
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                  title="Add intermediate accessible stop"
                  className="ml-1 w-6 h-6 bg-[#eceef3] dark:bg-slate-800 hover:bg-[#4800b2] dark:hover:bg-[#6d23f9] hover:text-white text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-110"
                >
                  <span className="material-symbols-outlined text-sm font-black">add</span>
                </button>
              </div>

              {/* Start Place Selection Dropdown */}
              {showStartPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowStartPicker(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-3 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trip_origin</span>
                        Select Start Place
                      </span>
                      <button onClick={() => setShowStartPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {/* Live GPS Location Action */}
                      <button
                        onClick={() => {
                          handleRequestLiveLocation();
                          setShowStartPicker(false);
                        }}
                        className="w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-all text-xs cursor-pointer bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 mb-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-blue-600 animate-pulse">my_location</span>
                          <div>
                            <div>Use My Real-Time Location</div>
                            <div className="text-[10px] text-blue-500 font-normal">Detect current GPS position</div>
                          </div>
                        </div>
                        {routeStart === 'My Real-Time Location' && <span className="material-symbols-outlined text-blue-600 text-base">check</span>}
                      </button>

                      {ACCESSIBLE_PLACES.map(place => (
                        <button
                          key={place.name}
                          onClick={() => {
                            setRouteStart(place.name);
                            setFromCity(`${place.name}, Delhi`);
                            setShowStartPicker(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-all text-xs cursor-pointer ${
                            routeStart === place.name
                              ? 'bg-violet-50 dark:bg-violet-950/40 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#4800b2] dark:text-[#4ffbe6]">{place.icon}</span>
                            <div>
                              <div className="font-bold">{place.name}</div>
                              <div className="text-[10px] text-slate-400">{place.area} • {place.level}</div>
                            </div>
                          </div>
                          {routeStart === place.name && <span className="material-symbols-outlined text-emerald-500 text-base">check</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* End Place Selection Dropdown */}
              {showEndPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowEndPicker(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-3 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Select Destination
                      </span>
                      <button onClick={() => setShowEndPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {ACCESSIBLE_PLACES.map(place => (
                        <button
                          key={place.name}
                          onClick={() => {
                            setRouteEnd(place.name);
                            setToCity(`${place.name}, Delhi`);
                            setShowEndPicker(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-all text-xs cursor-pointer ${
                            routeEnd === place.name
                              ? 'bg-violet-50 dark:bg-violet-950/40 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#4800b2] dark:text-[#4ffbe6]">{place.icon}</span>
                            <div>
                              <div className="font-bold">{place.name}</div>
                              <div className="text-[10px] text-slate-400">{place.area} • {place.level}</div>
                            </div>
                          </div>
                          {routeEnd === place.name && <span className="material-symbols-outlined text-emerald-500 text-base">check</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Demo Stops Dropdown Menu */}
              {showAddStopDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAddStopDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-[#cbc3d9]/40 dark:border-slate-700 p-3 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add_location_alt</span>
                        Add Intermediate Stop
                      </span>
                      <button 
                        onClick={() => setShowAddStopDropdown(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {DEMO_PLACES.map(place => {
                        const isAdded = intermediateStops.includes(place.name);
                        return (
                          <button
                            key={place.name}
                            onClick={() => isAdded ? handleRemoveStop(place.name) : handleAddStop(place.name)}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-all text-xs cursor-pointer ${
                              isAdded 
                                ? 'bg-violet-50 dark:bg-violet-950/40 text-[#4800b2] dark:text-[#cfbdff] font-bold border border-violet-200 dark:border-violet-800' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-[#4800b2] dark:text-[#4ffbe6]">{place.icon}</span>
                              <div>
                                <div className="font-bold text-xs">{place.name}</div>
                                <div className="text-[10px] text-slate-400">{place.location} • {place.badge}</div>
                              </div>
                            </div>
                            <span className={`material-symbols-outlined text-base ${isAdded ? 'text-emerald-500' : 'text-slate-400'}`}>
                              {isAdded ? 'check_circle' : 'add_circle'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-[#cbc3d9]/40 dark:bg-slate-800 hidden md:block"></div>
            <Link href="/accessibility-profile" className="flex items-center gap-2.5 hidden md:flex bg-white dark:bg-[#151824] px-4 py-2 rounded-full border border-[#cbc3d9]/40 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group no-underline">
              <span className="material-symbols-outlined text-[#4800b2] dark:text-[#4ffbe6] bg-[#4800b2]/10 dark:bg-violet-900/30 p-1 rounded-full group-hover:scale-110 transition-transform text-sm">person</span>
              <span className="text-xs md:text-sm font-bold text-[#191c20] dark:text-slate-200 group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">Your Accessibility Profile</span>
              <span className="text-[#4800b2] dark:text-[#cfbdff] text-xs font-black uppercase ml-2 hover:underline">Edit</span>
            </Link>
          </div>
        </div>

        {/* Main Content Layout (9 cols for Routes+Map+Snapshot, 3 cols for Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start relative z-10">
          {/* Left 9-Column Group (Preferences + Map + Accessibility Snapshot) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Preferences & Routes (md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col gap-6 animate-fade-in-up">
                {/* Preferences Panel */}
                <div className="glass-panel rounded-3xl p-6 shadow-sm border border-white hover:border-[#4800b2]/30 transition-colors">
                  <p className="text-[11px] text-[#4800b2] font-black uppercase tracking-widest mb-4 opacity-80">Rider Preference</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Wheelchair', 'Step-free', 'Elevators', 'More'].map(pref => {
                      const active = riderPref === pref;
                      return (
                        <button
                          key={pref}
                          onClick={() => setRiderPref(pref)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white shadow-md hover:scale-105'
                              : 'bg-white text-[#191c20] border border-[#cbc3d9]/40 hover:bg-[#eceef3] hover:border-[#4800b2] shadow-sm'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-[#4800b2] font-black uppercase tracking-widest mb-3 opacity-80">Accessibility Requirements</p>
                  <div className="space-y-2.5 mb-5">
                    <label 
                      onClick={() => setAvoidStairs(!avoidStairs)}
                      className="flex items-center gap-3 cursor-pointer group select-none text-xs"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                        avoidStairs ? 'border-[#4800b2] bg-[#4800b2]' : 'border-[#cbc3d9] bg-white'
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${avoidStairs ? 'text-white' : 'text-transparent'}`}>check</span>
                      </div>
                      <span className="font-bold text-[#191c20] dark:text-slate-200 group-hover:text-[#4800b2] transition-colors">Avoid Stairs</span>
                    </label>

                    <label 
                      onClick={() => setPreferStepFree(!preferStepFree)}
                      className="flex items-center gap-3 cursor-pointer group select-none text-xs"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                        preferStepFree ? 'border-[#4800b2] bg-[#4800b2]' : 'border-[#cbc3d9] bg-white'
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${preferStepFree ? 'text-white' : 'text-transparent'}`}>check</span>
                      </div>
                      <span className="font-bold text-[#191c20] dark:text-slate-200 group-hover:text-[#4800b2] transition-colors">Prefer Step-Free Paths</span>
                    </label>

                    <label 
                      onClick={() => setRequireElevators(!requireElevators)}
                      className="flex items-center gap-3 cursor-pointer group select-none text-xs"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all group-hover:scale-110 ${
                        requireElevators ? 'border-[#4800b2] bg-[#4800b2]' : 'border-[#cbc3d9] bg-white group-hover:border-[#4800b2]'
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${requireElevators ? 'text-white' : 'text-transparent group-hover:text-[#4800b2]/50'} transition-colors`}>check</span>
                      </div>
                      <span className="font-bold text-[#494456] dark:text-slate-400 group-hover:text-[#191c20] transition-colors">Require Elevators / Lifts</span>
                    </label>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedRoute(1);
                      setToastContent(`Calculating real-time accessible route from ${routeStart} to ${routeEnd}...`);
                      setSearchSuccessToast(true);
                      setTimeout(() => setSearchSuccessToast(false), 3000);
                    }}
                    className="w-full bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white text-xs md:text-sm font-black py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">route</span> Plan My Accessible Route
                  </button>
                </div>

                {/* Recommended Routes List */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <h4 className="text-sm font-black text-[#191c20] dark:text-white flex items-center gap-1.5 border-b-2 border-[#4800b2] pb-1 inline-block">
                      <span className="material-symbols-outlined text-base text-[#4800b2]">timeline</span> Recommended Routes
                    </h4>
                    <span className="text-[10px] text-[#494456] uppercase tracking-widest font-bold">Suggested Options</span>
                  </div>
                  <div className="space-y-3">
                    {/* Route 1 (Active) */}
                    <div 
                      onClick={() => setSelectedRoute(1)}
                      className={`rounded-2xl p-4 cursor-pointer shadow-sm relative overflow-hidden transform hover:-translate-y-0.5 transition-all ${
                        selectedRoute === 1 ? 'bg-white dark:bg-[#151824] border-2 border-[#4800b2]' : 'glass-panel border border-[#cbc3d9]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <h5 className="text-sm font-black text-[#4800b2] dark:text-[#4ffbe6] flex items-center gap-1">
                            Route 1 <span className="material-symbols-outlined text-sm">verified</span>
                          </h5>
                          <p className="text-[10px] text-[#494456] dark:text-slate-400 uppercase tracking-widest font-bold">Most Accessible • {routeStart} ➔ {routeEnd}</p>
                        </div>
                        <div className="bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 rounded-md text-xs font-black border border-[#a5d6a7]">
                          98 / 100
                        </div>
                      </div>
                      <p className="text-xs text-[#191c20] dark:text-slate-200 font-bold mb-2.5 flex items-center gap-1.5 bg-[#f2f3f9] dark:bg-slate-800 w-fit px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm text-[#4800b2]">schedule</span> {route1DurationMin} mins • {routeDistKm.toFixed(1)} km
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-[#eceef3] dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300">No Stairs</span>
                        <span className="bg-[#eceef3] dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300">Smooth Sidewalks</span>
                        <span className="bg-[#eceef3] dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300">Less Crowd</span>
                      </div>
                    </div>

                    {/* Route 2 */}
                    <div 
                      onClick={() => setSelectedRoute(2)}
                      className={`rounded-2xl p-4 cursor-pointer hover:border-[#4800b2]/50 transition-all ${
                        selectedRoute === 2 ? 'bg-white dark:bg-[#151824] border-2 border-[#4800b2]' : 'glass-panel border border-[#cbc3d9]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-sm font-bold text-[#191c20] dark:text-white">Route 2</h5>
                          <p className="text-[10px] text-[#494456] dark:text-slate-400 uppercase tracking-widest font-bold">Faster but less accessible</p>
                        </div>
                        <div className="bg-[#fff3e0] text-[#ef6c00] px-2 py-0.5 rounded-md text-xs font-black border border-[#ffcc80]">
                          82 / 100
                        </div>
                      </div>
                      <p className="text-xs text-[#191c20] dark:text-slate-200 font-bold mb-2.5 flex items-center gap-1.5 bg-[#f2f3f9] dark:bg-slate-800 w-fit px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm text-[#7a7488]">schedule</span> {route2DurationMin} mins • {route2DistKm} km
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-700">Some Stairs</span>
                        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-700">Uneven Brick</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Real Interactive Map (md:col-span-7) */}
              <div className="md:col-span-7 min-h-[500px] md:min-h-[560px] bg-white dark:bg-[#121420] rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-md animate-fade-in-up flex flex-col justify-between p-2">
                <div className="flex-1 w-full h-full min-h-[460px] relative rounded-[1.5rem] overflow-hidden flex flex-col">
                  <InteractiveMap 
                    origin={startCoords}
                    destination={endCoords}
                    startLabel={routeStart}
                    endLabel={routeEnd}
                    intermediatePoints={intermediateStops.map(s => ({ name: s, ...getCoordsForPlace(s) }))}
                    userLocation={userLiveLocation}
                    routeGeometry={currentRouteGeometry}
                    onLocateMe={handleRequestLiveLocation}
                    showLegend={false}
                    className="w-full h-full flex-1 min-h-[460px]"
                  />
                </div>
                
                {/* Reference-Matching Map Legend Bar at the Bottom */}
                <div className="mt-2 bg-white/95 dark:bg-[#1a1d2e]/95 backdrop-blur-xl px-5 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                      <span>High Access</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span>
                      <span>Barrier</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
                      <span>Assistance</span>
                    </div>
                  </div>

                  <Link 
                    href="/plan-route"
                    className="text-[#6d23f9] hover:underline text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">explore</span>
                    INTERACTIVE MAP
                  </Link>
                </div>
              </div>

            </div>

            {/* ACCESSIBILITY SNAPSHOT Card (Fills the blank space seamlessly!) */}
            <div className="bg-white dark:bg-[#121420] rounded-[2rem] p-6 lg:p-7 shadow-lg border border-[#cbc3d9]/30 dark:border-slate-800 animate-fade-in-up">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm lg:text-base font-black text-[#4800b2] dark:text-[#4ffbe6] tracking-wider uppercase flex items-center gap-1.5">
                  Accessibility Snapshot
                  <span className="material-symbols-outlined text-base text-slate-400 cursor-help" title="Everything you need to know before you go">info</span>
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">Everything you need to know before you go.</p>

              {/* 6 Grid Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-5">
                {/* 1. Wheelchair Access */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 text-[#4800b2] dark:text-[#cfbdff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">accessible</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Wheelchair Access</div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">Available</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Step-free routes found</div>
                  </div>
                </div>

                {/* 2. Elevators */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">elevator</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Elevators</div>
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">2 available</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Along the selected route</div>
                  </div>
                </div>

                {/* 3. Accessible Toilets */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">wc</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Accessible Toilets</div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">3 nearby</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Within 1 km of your route</div>
                  </div>
                </div>

                {/* 4. Rest Areas */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">chair</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Rest Areas</div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400">5 available</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Places to sit and relax</div>
                  </div>
                </div>

                {/* 5. Walking Difficulty */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">directions_walk</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Walking Difficulty</div>
                    <div className="text-sm font-black text-teal-600 dark:text-teal-400">Easy</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Smooth paths and sidewalks</div>
                  </div>
                </div>

                {/* 6. Crowd Level */}
                <div className="bg-slate-50/90 dark:bg-[#1a1d2e]/80 rounded-2xl p-4 border border-[#cbc3d9]/30 dark:border-slate-700/60 flex items-start gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Crowd Level</div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400">Moderate</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Live crowd update</div>
                  </div>
                </div>
              </div>

              {/* Live Alerts Banner */}
              <div className="bg-violet-50/80 dark:bg-violet-950/40 rounded-2xl p-3.5 border border-violet-200/80 dark:border-violet-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/60 text-[#4800b2] dark:text-[#cfbdff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">notifications</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4800b2] dark:text-[#cfbdff]">Live Alerts</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">1 construction block reported 500m ahead on Route 2.</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRoute(2)}
                  className="px-4 py-1.5 bg-white dark:bg-slate-800 text-[#4800b2] dark:text-white text-xs font-bold rounded-xl border border-violet-200 dark:border-slate-700 shadow-sm hover:bg-violet-50 transition-colors shrink-0 cursor-pointer"
                >
                  View Alerts
                </button>
              </div>

              {/* View Full Accessibility Details Button */}
              <Link
                href="/accessibility-profile"
                className="w-full bg-[#4800b2] hover:bg-[#3b0091] text-white py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group no-underline cursor-pointer"
              >
                <span>View Full Accessibility Details</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Profile, Conditions, AI */}
          <div className="lg:col-span-3 flex flex-col gap-8 animate-fade-in-up">
            {/* Quick Toggles */}
            <div className="glass-panel rounded-3xl border border-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-black text-[#191c20] flex items-center gap-2 border-b-2 border-[#4800b2] pb-1 inline-block">
                  <span className="material-symbols-outlined text-[#4800b2]">tune</span> Quick Toggles
                </h4>
              </div>
              <div className="space-y-5">
                <div 
                  onClick={() => setStepFreePath(!stepFreePath)}
                  className="flex justify-between items-center group cursor-pointer select-none"
                >
                  <span className="text-sm font-bold text-[#191c20] group-hover:text-[#4800b2] transition-colors">Requires Step-Free Path</span>
                  <div className={`w-12 h-7 rounded-full relative shadow-inner transition-transform group-hover:scale-105 ${
                    stepFreePath ? 'bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9]' : 'bg-[#e1e2e8] border border-[#cbc3d9]/50'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-transform ${
                      stepFreePath ? 'right-1' : 'left-1'
                    }`}></div>
                  </div>
                </div>

                <div 
                  onClick={() => setAccessibleToilets(!accessibleToilets)}
                  className="flex justify-between items-center group cursor-pointer select-none"
                >
                  <span className="text-sm font-bold text-[#191c20] group-hover:text-[#4800b2] transition-colors">Accessible Toilets Filter</span>
                  <div className={`w-12 h-7 rounded-full relative shadow-inner border transition-all group-hover:border-[#4800b2] group-hover:scale-105 ${
                    accessibleToilets ? 'bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] border-transparent' : 'bg-[#e1e2e8] border-[#cbc3d9]/50'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-transform ${
                      accessibleToilets ? 'right-1' : 'left-1'
                    }`}></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-[#4800b2]/5 p-4 rounded-2xl flex gap-3 items-start border border-[#4800b2]/20 hover:bg-[#4800b2]/10 transition-colors">
                <span className="material-symbols-outlined text-[#4800b2] text-[20px] shrink-0 mt-0.5">auto_awesome</span>
                <p className="text-[12px] text-[#191c20] font-medium leading-relaxed">These settings automatically customize all routing search algorithms and highlight potential barrier warnings.</p>
              </div>
            </div>

            {/* Live Conditions */}
            <div className="glass-panel rounded-3xl border border-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-base font-black text-[#191c20] mb-6 flex items-center gap-2 border-b-2 border-[#4800b2] pb-1 inline-block">
                <span className="material-symbols-outlined text-[#4800b2]">sensors</span> Today&apos;s Conditions
              </h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#cbc3d9]/30 pb-4 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#fff8e1] flex items-center justify-center text-[#ffb300] shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">light_mode</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#494456] uppercase tracking-widest font-bold">Weather</p>
                      <p className="text-base font-black group-hover:text-[#4800b2] transition-colors">Sunny</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#191c20] group-hover:text-[#ffb300] transition-colors">32°C</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-[#cbc3d9]/30 pb-4 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e3f2fd] flex items-center justify-center text-[#1e88e5] shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">groups</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#494456] uppercase tracking-widest font-bold">Crowd Level</p>
                      <p className="text-base font-black text-[#191c20] group-hover:text-[#4800b2] transition-colors">Right now</p>
                    </div>
                  </div>
                  <div className="bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm group-hover:shadow-md transition-shadow">
                    Low Crowd
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e0f2f1] flex items-center justify-center text-[#00897b] shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">air</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#494456] uppercase tracking-widest font-bold">Air Quality</p>
                      <p className="text-base font-black text-[#191c20] group-hover:text-[#4800b2] transition-colors">Moderate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black group-hover:text-[#00897b] transition-colors">AQI 68</span>
                    <div className="bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-3 py-1.5 rounded-lg text-[11px] font-black uppercase shadow-sm group-hover:shadow-md transition-shadow">
                      Good
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#cbc3d9]/30 flex items-center gap-2 text-[#494456] justify-center bg-[#f2f3f9] rounded-xl py-2 hover:bg-[#eceef3] transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500">sync</span>
                <span className="text-[11px] uppercase tracking-widest font-bold group-hover:text-[#191c20] transition-colors">Updated in real-time</span>
              </div>
            </div>

            {/* AI Copilot Widget */}
            <div className="glass-panel rounded-3xl border border-white shadow-sm overflow-hidden flex flex-col h-[380px] hover:shadow-md transition-shadow">
              <div className="bg-white/80 p-5 border-b border-[#cbc3d9]/30 flex items-center justify-between backdrop-blur-md">
                <h4 className="text-base font-black text-[#191c20] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4800b2] bg-[#4800b2]/10 p-1 rounded-full">smart_toy</span> Travel Copilot
                </h4>
                <button className="text-[#7a7488] hover:text-[#4800b2] transition-colors bg-[#f2f3f9] p-1.5 rounded-full hover:bg-[#4800b2]/10">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto bg-[#f8f9ff]/50 flex flex-col gap-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 max-w-[95%] group ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    {msg.sender === 'copilot' ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a0b5c] to-[#6d23f9] flex items-center justify-center text-white shrink-0 mt-1 shadow-md group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#4800b2] flex items-center justify-center text-white shrink-0 mt-1 font-bold text-xs">
                        A
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                      msg.sender === 'copilot'
                        ? 'bg-white border border-[#cbc3d9]/30 text-[#191c20] rounded-tl-sm hover:border-[#4800b2]/30 transition-colors'
                        : 'bg-[#4800b2] text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2.5 mt-auto pt-2">
                  {[
                    'Find accessible hotels',
                    'Nearby wheelchair...',
                    'Route tips'
                  ].map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendMessage(chip)}
                      className="bg-white border border-[#cbc3d9]/40 text-[#494456] px-4 py-2 rounded-full text-[11px] font-bold hover:border-[#4800b2] hover:text-[#4800b2] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/80 border-t border-[#cbc3d9]/30 backdrop-blur-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center group"
                >
                  <input 
                    className="w-full bg-[#f8f9ff] border border-[#cbc3d9]/50 rounded-full pl-5 pr-14 py-3.5 text-sm font-medium focus:border-[#4800b2] focus:ring-2 focus:ring-[#4800b2]/20 transition-all shadow-inner hover:border-[#4800b2]/50 outline-none" 
                    placeholder="Ask me anything..." 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-1.5 w-10 h-10 bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] text-white rounded-full flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Why YatraSaathi USPs Section */}
        <WhyYatraSaathi />

        {/* Hot Deals Section */}
        <HotDeals />

        {/* Top Destinations Section */}
        <TopDestinations />

        {/* Our Responsibilities Banner */}
        <section className="mt-8 rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white relative shadow-xl border border-white/20 px-6 py-8 md:px-10 md:py-9 text-center animate-fade-in-up">
          {/* Abstract map lines background overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4ffbe6]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase tracking-[0.15em] mb-1.5 drop-shadow-md">
              OUR RESPONSIBILITIES
            </h3>
            <p className="text-xs sm:text-sm text-[#e8ddff] font-medium mb-6 max-w-2xl mx-auto leading-relaxed">
              Your safety, access, and comfort are our top priorities. We are committed to making every journey accessible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Card 1 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-1.5 cursor-pointer group hover:shadow-glow">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[22px]">support_agent</span>
                </div>
                <h4 className="text-sm font-black mb-1 text-white group-hover:text-[#4ffbe6] transition-colors">Always Available</h4>
                <p className="text-xs text-[#e8ddff] leading-relaxed">For your assistance and safety needs at any time.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-1.5 cursor-pointer group hover:shadow-glow">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[22px]">credit_card_off</span>
                </div>
                <h4 className="text-sm font-black mb-1 text-white group-hover:text-[#4ffbe6] transition-colors">Cancel Free</h4>
                <p className="text-xs text-[#e8ddff] leading-relaxed">Flexible booking with yatrasaathi flex Tariff+</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-1.5 cursor-pointer group hover:shadow-glow">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[22px]">flight_takeoff</span>
                </div>
                <h4 className="text-sm font-black mb-1 text-white group-hover:text-[#4ffbe6] transition-colors">Taxis to Flight</h4>
                <p className="text-xs text-[#e8ddff] leading-relaxed">Seamless transit transfer for continuous mobility.</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-1.5 cursor-pointer group hover:shadow-glow">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[22px]">accessible_forward</span>
                </div>
                <h4 className="text-sm font-black mb-1 text-white group-hover:text-[#4ffbe6] transition-colors">Verified Access</h4>
                <p className="text-xs text-[#e8ddff] leading-relaxed">Exclusive discounts on 100% verified accessible tours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SIH Architecture & How yatrasaathi Works FAQ Section */}
        <FaqSection />
      </main>

      {/* Booking.com Calendar Picker Modal */}
      <DatePickerModal 
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        targetField={targetDateField}
        onSelectDeparture={(dStr) => setDepartDate(dStr)}
        onSelectReturn={(rStr) => setReturnDate(rStr)}
      />

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
