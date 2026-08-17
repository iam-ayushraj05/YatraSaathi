'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HotDeals from '@/components/dashboard/HotDeals';
import TopDestinations from '@/components/dashboard/TopDestinations';

export default function Dashboard() {
  // Search Tabs State
  const [activeSearchTab, setActiveSearchTab] = useState('Accessible Routes');

  // Route Start and End Selection State
  const [routeStart, setRouteStart] = useState('India Gate');
  const [routeEnd, setRouteEnd] = useState('Lotus Temple');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Intermediate Stops State for Route
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [showAddStopDropdown, setShowAddStopDropdown] = useState(false);

  const ACCESSIBLE_PLACES = [
    { name: 'India Gate', area: 'Central Delhi', level: 'High Access', icon: 'account_balance' },
    { name: 'Lotus Temple', area: 'Kalkaji', level: 'High Access', icon: 'nature_people' },
    { name: 'National Museum', area: 'Janpath', level: 'High Access', icon: 'museum' },
    { name: 'Qutub Minar', area: 'Mehrauli', level: 'Medium Access', icon: 'temple_buddhist' },
    { name: 'Red Fort', area: 'Old Delhi', level: '2 Barriers', icon: 'fort' },
    { name: 'Lodhi Gardens', area: 'Lodhi Colony', level: 'High Access', icon: 'park' },
    { name: 'Connaught Place', area: 'Central Delhi', level: 'Step-Free Ramps', icon: 'storefront' },
    { name: 'Akshardham Temple', area: 'East Delhi', level: 'Wheelchair Lift', icon: 'temple_hindu' },
  ];

  const DEMO_PLACES = [
    { name: 'National Museum', location: 'Janpath', icon: 'account_balance', badge: '100% Step-Free' },
    { name: 'Qutub Minar', location: 'Mehrauli', icon: 'temple_buddhist', badge: 'Paved Ramps' },
    { name: 'Red Fort', location: 'Old Delhi', icon: 'fort', badge: 'Tactile Paths' },
    { name: 'Lodhi Gardens', location: 'Lodhi Colony', icon: 'park', badge: 'Smooth Trails' },
  ];

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
      fromDefault: 'Delhi (DEL)',
      fromPlaceholder: 'Origin city or address',
      toLabel: 'To',
      toDefault: 'Lotus Temple, Delhi',
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
    'Hotels': {
      fromLabel: 'Destination City',
      fromDefault: 'New Delhi, India',
      fromPlaceholder: 'City or Area',
      toLabel: 'Hotel Preference',
      toDefault: 'Taj Palace • Ramps & Lifts',
      toPlaceholder: 'Hotel Name or Accessibility Type',
      departLabel: 'Check-In',
      departDefault: 'Aug 21, 2024',
      returnLabel: 'Check-Out',
      returnDefault: 'Aug 24, 2024 (3 N)',
      travelersLabel: 'Rooms & Guests',
      travelersDefault: '1 Room, 2 Guests • Roll-in Shower',
      searchBtnText: 'Find Hotels',
      toastMsg: 'Found 12 Wheelchair-Friendly Hotels with Roll-in Showers'
    },
    'Tours': {
      fromLabel: 'Tour Region',
      fromDefault: 'North India Cultural Circuit',
      fromPlaceholder: 'Destination or Circuit',
      toLabel: 'Tour Package',
      toDefault: 'Golden Triangle Accessible Heritage',
      toPlaceholder: 'Tour Type / Experience',
      departLabel: 'Start Date',
      departDefault: 'Sep 05, 2024',
      returnLabel: 'Duration',
      returnDefault: '5 Days / 4 Nights',
      travelersLabel: 'Travelers & Guide',
      travelersDefault: '2 Travelers • Audio Guide + Coach Ramp',
      searchBtnText: 'Explore Tours',
      toastMsg: 'Found 4 Curated Step-Free Heritage Tours'
    },
    'Packages': {
      fromLabel: 'Departure City',
      fromDefault: 'New Delhi (DEL)',
      fromPlaceholder: 'Starting City',
      toLabel: 'Holiday Package',
      toDefault: 'Goa Accessible Beach Holiday',
      toPlaceholder: 'Package Name',
      departLabel: 'Travel Dates',
      departDefault: 'Sep 15, 2024',
      returnLabel: 'Return Date',
      returnDefault: 'Sep 22, 2024 (7 Days)',
      travelersLabel: 'Travelers & Gear',
      travelersDefault: '2 Guests • Beach Wheelchair Included',
      searchBtnText: 'Search Packages',
      toastMsg: 'Found 3 All-Inclusive Accessible Holiday Packages'
    }
  };

  const [fromCity, setFromCity] = useState('Delhi (DEL)');
  const [toCity, setToCity] = useState('Lotus Temple, Delhi');
  const [departDate, setDepartDate] = useState('Today, Aug 17');
  const [returnDate, setReturnDate] = useState('Aug 24, 2024');
  const [showDatesPicker, setShowDatesPicker] = useState(false);

  // Travelers & Assistance Count State
  const [wheelchairCount, setWheelchairCount] = useState(1);
  const [asstCount, setAsstCount] = useState(1);
  const [visualAssist, setVisualAssist] = useState(false);
  const [showTravelersPicker, setShowTravelersPicker] = useState(false);

  // Search Action State
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccessToast, setSearchSuccessToast] = useState(false);
  const [toastContent, setToastContent] = useState('');

  const handleTabChange = (tabId: string) => {
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
    setIsSearching(true);
    const config = TAB_CONFIG[activeSearchTab] || TAB_CONFIG['Accessible Routes'];
    setTimeout(() => {
      setIsSearching(false);
      if (fromCity) setRouteStart(fromCity.split('(')[0].split(',')[0].trim() || 'India Gate');
      if (toCity) setRouteEnd(toCity.split('(')[0].split(',')[0].trim() || 'Lotus Temple');
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

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 space-y-16">
        {/* Hero Section */}
        <section 
          className="relative rounded-[2.5rem] overflow-hidden bg-cover bg-center text-white p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl min-h-[560px]" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCSk8YNgUrkqzXV3TzKDej_kPbF9WHLig0XjK2flJkv-1itekCByohQV2wNDxk9L1BO8od3r3iuCycw7jnyUh84X6y8G3cs63Z6OKQIrgr7nZr6PvpC0xGmGT7YUjWCpGtpVW49JYPOZtyk9HMSemnBDuYBTj07eYpoBK8A1w2P8WVka1i3MXptuoPXCc0Pjd-eqwF5K9Epgjso5bfUNL2MHiGZhRyt5oGYU_0zlhLQSd6hGbBJrtV2kg')" }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0b2e]/90 via-[#2a0b5c]/70 to-transparent z-0"></div>
          <div className="absolute inset-0 bg-[#4800b2]/20 mix-blend-multiply z-0"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>

          <div className="relative z-10 lg:w-5/12 space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2.5 bg-white/10 px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-glass hover:bg-white/20 transition-colors cursor-default">
              <span className="material-symbols-outlined text-sm text-[#4ffbe6]">explore</span>
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#4ffbe6] font-bold">
                Hodophile&apos;s Accessible Journey
              </span>
            </div>

            <h2 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tighter text-white drop-shadow-2xl">
              EXPLORE<br />BEAUTIFUL<br />WORLD WITH US
            </h2>

            <p className="text-lg text-white/90 max-w-md font-medium leading-relaxed drop-shadow-md">
              &ldquo;Let us take the hassle out of travel planning, so you can focus on the adventure ahead.&rdquo;
            </p>

            <div className="flex items-center gap-5 py-2">
              <div className="flex -space-x-3">
                <img alt="User 1" className="w-12 h-12 rounded-full border-2 border-[#4800b2] shadow-sm hover:z-10 hover:scale-110 transition-transform object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcwb1GyIlwDWo7DvLeU1BSZ1XFTu_Do4F_wRqVBiMkE8DdjCkWdMb3mjjclluUpStb04-QHIW8_1KpnSdQlEbf1zHyfSrjSYsfQtPeufqtuw66OQu1gTRUjEQojudH2H1qP6NIF_folmByiJkYGO-tOCejMFaCfgOMSWZOy9O81DMNysyhezvfgyz-STMBrV8wfN9HXjScXEp7dkZlD7fMq-ORgnwhR7IXArOJDExUXaKrTvPVPChgaA" />
                <img alt="User 2" className="w-12 h-12 rounded-full border-2 border-[#4800b2] shadow-sm hover:z-10 hover:scale-110 transition-transform object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjaYSQpyQ0wGUITTAU7Y8QcFuAmpBLvxcukdhxAAjvq7N3Ecwp8Y5-HcCsiOBpG2FypYwCqtWs3GhimnYn2XCe_Fz5YKsLjkBexcA7n4hsCbZ6uLc_xSQ2wPGSr4butPy1n-Q8OD2M_LQkDwnvQwHQI1y0mefbfni8SSrJc2B2lMMz4kwgAXWQ_adYw8PK3Evp6BD7wXcsn5IQK5DRAcMzscrQQtlnMkyP8S4XDIpSbeG0seQNVoOZwg" />
                <img alt="User 3" className="w-12 h-12 rounded-full border-2 border-[#4800b2] shadow-sm hover:z-10 hover:scale-110 transition-transform object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMSGHMchZ8sgvu_9NmluhEwxNxbWPbH7f-aTAf49dE81aZejPR6WqK4wi-lJx0ycIW2gbXIR56drtosmeGdiv-I9GS4QPyy_mLdEHV6gHU-F5eJnfvQSNE5A7mwWC2Wp6hi4UQ4Q0c31scc-ICtyrkx5RxRxO7bDppA4MWJd8ECsLRRApuTPXA-4pDWylL8BLPL_kIdGZymSX3M5dER62a4XrEjNlPz11O15Szq3hsYvTkZIwt_E5CZA" />
              </div>
              <div className="flex items-center gap-1.5 text-[#FFD700]">
                <span className="material-symbols-outlined fill text-xl animate-[pulse_2s_ease-in-out_infinite]">star</span>
                <span className="material-symbols-outlined fill text-xl animate-[pulse_2s_ease-in-out_infinite_0.2s]">star</span>
                <span className="material-symbols-outlined fill text-xl animate-[pulse_2s_ease-in-out_infinite_0.4s]">star</span>
                <span className="material-symbols-outlined fill text-xl animate-[pulse_2s_ease-in-out_infinite_0.6s]">star</span>
                <span className="material-symbols-outlined fill text-xl animate-[pulse_2s_ease-in-out_infinite_0.8s]">star_half</span>
              </div>
              <span className="text-sm text-white/90 font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 hover:bg-black/30 transition-colors cursor-default">
                4.9/5 • 50k+ Trips
              </span>
            </div>

            <div className="flex flex-wrap gap-5 pt-6">
              <button 
                onClick={() => {
                  const el = document.getElementById('search-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="shimmer-btn text-base font-bold px-10 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-glow hover:shadow-glow-lg cursor-pointer"
              >
                Discover Now
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <Link 
                href="/plan-route" 
                className="bg-white/10 border border-white/20 text-white text-base font-bold px-10 py-4 rounded-full flex items-center gap-2 hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-xl cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">route</span>
                Plan Route
              </Link>
            </div>
          </div>

          {/* Featured Destinations Cards */}
          <div className="relative z-10 lg:w-7/12 flex gap-6 mt-12 lg:mt-0 overflow-x-auto pb-8 pt-4 hide-scrollbar snap-x snap-mandatory pr-8 -mr-8 pl-4 lg:pl-12">
            {/* Card 1: Taj Mahal */}
            <div className="shrink-0 w-[260px] h-[380px] rounded-3xl overflow-hidden relative group snap-center cursor-pointer shadow-2xl border border-white/10 hover-card animate-fade-in-up fade-in-up-stagger">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Taj Mahal at sunrise" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNU9JLCPEzIJGyCWGwk36K6XDYSmhZq8ce78ErG3CBraefo2tWoksZK3pGNHmIKReoSlBCPp4G2_KLXIBufaB1V8tf01KlbBv4aBEn13XsWPy3q3NU9n3vbkBAa977IyLvl3X_63YpPCz0BakKwoTqa5QN4zNvmGfJK3zyKpj3dM9dH3znczTbs8UTvqdZOyqi3pXzP5Gn_Rp3eWq9nY5eXBk1cC_DeFrMhitDCTVvMhueoYX2YJTEmA" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              {/* Sign-only Accessibility Icon */}
              <div className="absolute top-5 left-5 w-9 h-9 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg" title="Wheelchair Accessible">
                <span className="material-symbols-outlined text-[20px] text-[#4ffbe6]">accessible</span>
              </div>
              <div className="absolute top-5 right-5 bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xl shadow-lg border border-white/20 z-20">
                Adventurer&apos;s Choice
              </div>
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[11px] text-[#4ffbe6] uppercase tracking-[0.2em] font-bold mb-2 drop-shadow-md">India</p>
                <h3 className="text-3xl text-white font-black tracking-tight leading-tight mb-3">Taj Mahal</h3>
                <Link href="/explore/taj-mahal" className="block text-center w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl text-sm font-bold backdrop-blur-xl transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-100 hover:shadow-glow">
                  View Accessibility
                </Link>
              </div>
            </div>

            {/* Card 2: Eiffel Tower */}
            <div className="shrink-0 w-[260px] h-[380px] rounded-3xl overflow-hidden relative group snap-center cursor-pointer shadow-2xl border border-white/10 hover-card animate-fade-in-up fade-in-up-stagger">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Eiffel Tower" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9Jz6DP4u3YZzKNZsvqlflzI4fgAEi0ZhVL7ViHscoMQvsD4dWBexdc1LsS-UguijOfSIgzluQmNt0U4F-bX-b1QDpKHIh-BW9IUxBVlvFrrITPp4roQT6JzcplppuFLm3M4kjCE7gTMHH6GzLOfe7vUgIUdsxhokb-v6HyI7h0O-Srw5M-NcGsariB2wThP_4AbhPfcGmYs2gu8BWABGAIFCsC2dfvxEkmXFxdb78k7gvISI8gnCcZw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              {/* Sign-only Elevator Icon */}
              <div className="absolute top-5 left-5 w-9 h-9 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg" title="Elevator Access">
                <span className="material-symbols-outlined text-[20px] text-[#cfbdff]">elevator</span>
              </div>
              <div className="absolute top-5 right-5 bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xl shadow-lg border border-white/20 z-20">
                Hodophile&apos;s Pick
              </div>
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[11px] text-[#cfbdff] uppercase tracking-[0.2em] font-bold mb-2 drop-shadow-md">France</p>
                <h3 className="text-3xl text-white font-black tracking-tight leading-tight mb-3">Eiffel Tower</h3>
                <Link href="/explore/eiffel-tower" className="block text-center w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl text-sm font-bold backdrop-blur-xl transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-100 hover:shadow-glow">
                  View Accessibility
                </Link>
              </div>
            </div>

            {/* Card 3: Cappadocia */}
            <div className="shrink-0 w-[260px] h-[380px] rounded-3xl overflow-hidden relative group snap-center cursor-pointer shadow-2xl border border-white/10 hover-card animate-fade-in-up fade-in-up-stagger">
              <img 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Hot air balloons over Cappadocia, Turkey" 
                src="https://images.unsplash.com/photo-1570939274717-7eda2999eccf?auto=format&fit=crop&w=800&q=80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              {/* Sign-only Guided Assist Icon */}
              <div className="absolute top-5 left-5 w-9 h-9 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg" title="Guided Assistance">
                <span className="material-symbols-outlined text-[20px] text-[#4ffbe6]">support_agent</span>
              </div>
              <div className="absolute top-5 right-5 bg-gradient-to-r from-[#2a0b5c] to-[#6d23f9] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xl shadow-lg border border-white/20 z-20">
                Scenic Tour
              </div>
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[11px] text-[#4ffbe6] uppercase tracking-[0.2em] font-bold mb-2 drop-shadow-md">Turkey</p>
                <h3 className="text-3xl text-white font-black tracking-tight leading-tight mb-3">Cappadocia</h3>
                <Link href="/explore/cappadocia" className="block text-center w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl text-sm font-bold backdrop-blur-xl transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-100 hover:shadow-glow">
                  View Accessibility
                </Link>
              </div>
            </div>

            {/* Explore More Card */}
            <Link href="/explore" className="shrink-0 w-[140px] h-[380px] rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-4 snap-center cursor-pointer hover:bg-white/10 transition-colors shadow-inner group hover-card animate-fade-in-up fade-in-up-stagger">
              <div className="w-16 h-16 bg-white text-[#4800b2] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">arrow_forward</span>
              </div>
              <span className="text-sm font-bold text-white tracking-wider">Explore More</span>
            </Link>
          </div>
        </section>

        {/* Search/Filter Banner */}
        <section id="search-section" className="bg-white/95 dark:bg-[#121420]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 dark:border-slate-800 relative z-20 -mt-24 mx-2 md:mx-6 lg:mx-10 p-6 lg:p-8 animate-fade-in-up transition-colors">
          {/* Tabs */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 hide-scrollbar mb-6 border-b border-[#cbc3d9]/20 dark:border-slate-800">
            {[
              { id: 'Accessible Routes', icon: 'route' },
              { id: 'Flights', icon: 'flight' },
              { id: 'Hotels', icon: 'hotel' },
              { id: 'Tours', icon: 'tour' },
              { id: 'Packages', icon: 'inventory_2' }
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

          {/* Search Fields Row */}
          {(() => {
            const currentConfig = TAB_CONFIG[activeSearchTab] || TAB_CONFIG['Accessible Routes'];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-center">
                {/* From & To with embedded Swap button (Spans 5 cols on xl) */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 relative">
                  {/* From Input */}
                  <div className="relative border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm transition-all group">
                    <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                      {currentConfig.fromLabel}
                    </label>
                    <input 
                      className="bg-transparent border-none p-0 focus:ring-0 text-[#191c20] dark:text-white w-full font-black text-xs lg:text-sm outline-none truncate" 
                      placeholder={currentConfig.fromPlaceholder} 
                      type="text" 
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                    />
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
                  <div className="relative border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm transition-all group">
                    <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                      {currentConfig.toLabel}
                    </label>
                    <input 
                      className="bg-transparent border-none p-0 focus:ring-0 text-[#191c20] dark:text-white w-full font-black text-xs lg:text-sm outline-none truncate" 
                      placeholder={currentConfig.toPlaceholder} 
                      type="text" 
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dates Picker (Spans 3 cols on xl) */}
                <div className="xl:col-span-3 relative">
                  <div 
                    onClick={() => {
                      setShowDatesPicker(!showDatesPicker);
                      setShowTravelersPicker(false);
                    }}
                    className="border border-[#cbc3d9]/50 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-[#4800b2] focus-within:border-[#4800b2] focus-within:ring-2 focus-within:ring-[#4800b2]/20 bg-slate-50/70 dark:bg-[#1a1d2e]/80 shadow-sm flex transition-all cursor-pointer group"
                    title="Click to select Dates"
                  >
                    <div className="flex-1 border-r border-[#cbc3d9]/40 dark:border-slate-700 pr-2">
                      <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                        {currentConfig.departLabel}
                      </label>
                      <div className="text-[#191c20] dark:text-white font-black text-xs lg:text-sm truncate group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                        {departDate}
                      </div>
                    </div>
                    <div className="flex-1 pl-3">
                      <label className="block text-[10px] text-[#4800b2] dark:text-[#4ffbe6] font-bold uppercase tracking-wider mb-1">
                        {currentConfig.returnLabel}
                      </label>
                      <div className="text-[#191c20] dark:text-white font-black text-xs lg:text-sm truncate group-hover:text-[#4800b2] dark:group-hover:text-[#4ffbe6] transition-colors">
                        {returnDate}
                      </div>
                    </div>
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
                          {activeSearchTab === 'Hotels' ? [
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

        {/* Value Props Cards (Benefits) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 shadow-sm transition-all group hover-card animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fff4e5] to-[#ffecb3] text-[#f57c00] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#191c20] dark:text-white mb-1 group-hover:text-[#4800b2] transition-colors">Best Price Guarantee</h4>
              <p className="text-xs text-[#494456] dark:text-slate-400 leading-relaxed">We ensure you get the best deals always.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 shadow-sm transition-all group hover-card animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] text-[#1976d2] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#191c20] dark:text-white mb-1 group-hover:text-[#4800b2] transition-colors">24/7 Customer Support</h4>
              <p className="text-xs text-[#494456] dark:text-slate-400 leading-relaxed">We&apos;re here to help you anytime, anywhere.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 shadow-sm transition-all group hover-card animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] text-[#388e3c] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#191c20] dark:text-white mb-1 group-hover:text-[#4800b2] transition-colors">Secure Bookings</h4>
              <p className="text-xs text-[#494456] dark:text-slate-400 leading-relaxed">Your data and payments are 100% safe.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 shadow-sm transition-all group hover-card animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] text-[#7b1fa2] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#191c20] dark:text-white mb-1 group-hover:text-[#4800b2] transition-colors">Handpicked Experiences</h4>
              <p className="text-xs text-[#494456] dark:text-slate-400 leading-relaxed">Curated tours for unforgettable trips.</p>
            </div>
          </div>
        </section>

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
                        Add Demo Stop
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
                    onClick={() => setSelectedRoute(1)}
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
                        <span className="material-symbols-outlined text-sm text-[#4800b2]">schedule</span> 45 mins • 12.4 km
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
                        <span className="material-symbols-outlined text-sm text-[#7a7488]">schedule</span> 32 mins • 14.1 km
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-700">Some Stairs</span>
                        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#494456] dark:text-slate-300 border border-[#cbc3d9]/40 dark:border-slate-700">Uneven Brick</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Interactive Map (md:col-span-7) */}
              <div className="md:col-span-7 min-h-[480px] md:min-h-[520px] bg-white dark:bg-[#121420] rounded-[2.5rem] border border-[#cbc3d9]/30 dark:border-slate-800 overflow-hidden relative shadow-lg animate-fade-in-up flex flex-col justify-between">
                {/* Map Canvas Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9ff]/50 dark:from-[#121420]/50 to-transparent pointer-events-none"></div>

                {/* SVG Map Lines & Landmarks */}
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out origin-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 1000">
                    <path d="M100 800 L400 500 L600 550 L900 200" fill="none" stroke="#e1e2e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                    <path d="M200 200 L400 500 L500 800" fill="none" stroke="#e1e2e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                    <path d="M700 800 L600 550 L800 400" fill="none" stroke="#e1e2e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                    <path d="M300 400 L600 300 L800 400" fill="none" stroke="#e1e2e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"></path>

                    {/* Highlighted Route */}
                    <path className="drop-shadow-lg" d="M400 500 L600 550 L900 200" fill="none" stroke="#B026FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></path>
                    <path d="M400 500 L600 550 L900 200" fill="none" stroke="#B026FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" strokeOpacity="0.25"></path>
                  </svg>

                  {/* Destination Point (End Place) */}
                  <div className="absolute top-[20%] right-[10%] flex flex-col items-center z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-[#2e7d32] text-[10px] font-black shadow-md border border-[#a5d6a7] mb-1.5 whitespace-nowrap">
                      {routeEnd}
                    </div>
                    <div className="w-8 h-8 bg-[#2e7d32] rounded-full border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-[#2e7d32]/20">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Origin Point (Start Place) */}
                  <div className="absolute top-[50%] left-[38%] flex flex-col items-center z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-[#4800b2] dark:text-[#4ffbe6] text-[10px] font-black shadow-md border border-[#cbc3d9]/40 mb-1.5 whitespace-nowrap">
                      {routeStart}
                    </div>
                    <div className="w-8 h-8 bg-[#4800b2] rounded-full border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-[#4800b2]/20">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Intermediate Waypoints */}
                  {intermediateStops.map((stop, i) => (
                    <div 
                      key={stop}
                      style={{ top: `${45 + (i * 8)}%`, left: `${52 + (i * 6)}%` }}
                      className="absolute flex flex-col items-center z-10 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="bg-violet-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-md mb-1 whitespace-nowrap">
                        Stop: {stop}
                      </div>
                      <div className="w-6 h-6 bg-violet-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[12px]">place</span>
                      </div>
                    </div>
                  ))}

                  {/* Construction Warning Marker */}
                  <div className="absolute top-[40%] left-[50%] flex flex-col items-center z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg text-[#ef6c00] text-[10px] font-black shadow-md border border-[#ffcc80] mb-1">
                      Construction
                    </div>
                    <div className="w-7 h-7 bg-[#ef6c00] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white ring-2 ring-[#ef6c00]/20 animate-pulse">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                    </div>
                  </div>

                  {/* Accessibility Markers */}
                  <div className="absolute top-[30%] left-[70%] w-9 h-9 bg-white/90 dark:bg-slate-800 backdrop-blur-md rounded-xl shadow-md flex items-center justify-center text-[#4800b2] dark:text-[#4ffbe6] border border-[#cbc3d9]/30 z-10 hover:scale-110 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-lg">elevator</span>
                  </div>
                  <div className="absolute top-[60%] right-[30%] w-9 h-9 bg-white/90 dark:bg-slate-800 backdrop-blur-md rounded-xl shadow-md flex items-center justify-center text-[#2e7d32] border border-[#cbc3d9]/30 z-10 hover:scale-110 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-lg">accessible</span>
                  </div>
                </div>

                {/* Map UI Overlay: Zoom Buttons (Top-Right) */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.0))}
                    title="Zoom in"
                    className="w-9 h-9 bg-white/95 dark:bg-slate-800 backdrop-blur-md rounded-xl shadow-md border border-[#cbc3d9]/30 flex items-center justify-center text-slate-800 dark:text-white hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))}
                    title="Zoom out"
                    className="w-9 h-9 bg-white/95 dark:bg-slate-800 backdrop-blur-md rounded-xl shadow-md border border-[#cbc3d9]/30 flex items-center justify-center text-slate-800 dark:text-white hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                </div>

                {/* Map Legend at the BOTTOM */}
                <div className="mt-auto m-3 bg-white/95 dark:bg-[#1a1d2e]/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-xl border border-white/80 dark:border-slate-700 flex flex-wrap items-center justify-between z-20 gap-2">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#2e7d32] shadow-sm"></div>
                      <span>High Access</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff9800] shadow-sm"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ef5350] border border-[#ffcdd2] shadow-sm"></div>
                      <span>Barrier</span>
                    </div>
                    <div className="flex items-center gap-1 border-l border-[#cbc3d9]/40 dark:border-slate-700 pl-2">
                      <span className="material-symbols-outlined text-sm text-[#00bcd4]">info</span>
                      <span>Assistance</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setZoom(1)}
                    className="text-[#4800b2] dark:text-[#4ffbe6] text-[10px] font-black uppercase flex items-center gap-1 hover:underline bg-[#4800b2]/5 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">layers</span> Interactive Map
                  </button>
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

        {/* Hot Deals Section */}
        <HotDeals />

        {/* Top Destinations Section */}
        <TopDestinations />

        {/* Our Responsibilities Banner */}
        <section className="mt-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#2a0b5c] via-[#4800b2] to-[#6d23f9] text-white relative shadow-2xl border border-white/20 px-8 py-16 md:p-20 text-center animate-fade-in-up">
          {/* Abstract map lines background overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4ffbe6]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h3 className="text-4xl font-black tracking-tighter uppercase tracking-[0.15em] mb-4 drop-shadow-lg">
              OUR RESPONSIBILITIES
            </h3>
            <p className="text-base text-[#e8ddff] font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Your safety, access, and comfort are our top priorities. We are committed to making every journey accessible.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Card 1 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-3 cursor-pointer group hover:shadow-glow">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[28px]">support_agent</span>
                </div>
                <h4 className="text-lg font-black mb-2 text-white group-hover:text-[#4ffbe6] transition-colors">Always Available</h4>
                <p className="text-sm text-[#e8ddff] leading-relaxed">For your assistance and safety needs at any time.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-3 cursor-pointer group hover:shadow-glow">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[28px]">credit_card_off</span>
                </div>
                <h4 className="text-lg font-black mb-2 text-white group-hover:text-[#4ffbe6] transition-colors">Cancel Free</h4>
                <p className="text-sm text-[#e8ddff] leading-relaxed">Flexible booking with YatraSaathi flex Tariff+</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-3 cursor-pointer group hover:shadow-glow">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[28px]">flight_takeoff</span>
                </div>
                <h4 className="text-lg font-black mb-2 text-white group-hover:text-[#4ffbe6] transition-colors">Taxis to Flight</h4>
                <p className="text-sm text-[#e8ddff] leading-relaxed">Seamless transit transfer for continuous mobility.</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 hover:bg-white/20 transition-all shadow-glass hover:-translate-y-3 cursor-pointer group hover:shadow-glow">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[28px]">accessible_forward</span>
                </div>
                <h4 className="text-lg font-black mb-2 text-white group-hover:text-[#4ffbe6] transition-colors">Verified Access</h4>
                <p className="text-sm text-[#e8ddff] leading-relaxed">Exclusive discounts on 100% verified accessible tours.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
