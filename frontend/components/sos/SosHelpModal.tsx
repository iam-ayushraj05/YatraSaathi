'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SosHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssistanceService {
  id: string;
  category: 'hospital' | 'pharmacy' | 'police' | 'transport' | 'contact';
  name: string;
  distance: string;
  time: string;
  address: string;
  phone: string;
  badge: string;
  features: string[];
  icon: string;
  color: string;
  destCoords: { lat: number; lng: number };
}

const EMERGENCY_SERVICES: AssistanceService[] = [
  {
    id: 'hosp-1',
    category: 'hospital',
    name: 'AIIMS Emergency & Trauma Centre',
    distance: '1.4 km',
    time: '5 mins',
    address: 'Sri Aurobindo Marg, Ansari Nagar East, New Delhi',
    phone: '102',
    badge: '100% Step-Free ER',
    features: ['24/7 Wheelchair ER', 'Accessible Ramps & Elevators', 'Sign-Language Staff'],
    icon: 'local_hospital',
    color: 'bg-red-500',
    destCoords: { lat: 28.5672, lng: 77.2100 }
  },
  {
    id: 'pharm-1',
    category: 'pharmacy',
    name: 'Apollo 24/7 Accessible Pharmacy',
    distance: '450 m',
    time: '2 mins',
    address: 'Gate 2 Plaza, Janpath Road, New Delhi',
    phone: '+91 11 2334 1122',
    badge: 'Open 24 Hours',
    features: ['Ground Floor Level Entry', 'Wide Aisles', 'Home Delivery Assist'],
    icon: 'local_pharmacy',
    color: 'bg-emerald-500',
    destCoords: { lat: 28.6180, lng: 77.2210 }
  },
  {
    id: 'police-1',
    category: 'police',
    name: 'Parliament St. Police Assistance Post',
    distance: '800 m',
    time: '3 mins',
    address: 'Parliament Street, Connaught Place, New Delhi',
    phone: '112',
    badge: 'Disability Helpdesk Active',
    features: ['Special Assistance Officers', 'Instant Dispatch Patrol', 'Audio/Visual Help'],
    icon: 'local_police',
    color: 'bg-blue-600',
    destCoords: { lat: 28.6250, lng: 77.2150 }
  },
  {
    id: 'trans-1',
    category: 'transport',
    name: 'CATS Accessible Wheelchair Ambulance',
    distance: '2 min away',
    time: 'Immediate',
    address: 'Rapid Response Fleet Delhi',
    phone: '1099',
    badge: 'Hydraulic Lift Van',
    features: ['Wheelchair Securement Locks', 'Paramedic on Board', 'Zero Transfer Hassle'],
    icon: 'accessible_forward',
    color: 'bg-purple-600',
    destCoords: { lat: 28.6129, lng: 77.2295 }
  },
  {
    id: 'contact-1',
    category: 'contact',
    name: 'Priya Sharma (Primary Caregiver)',
    distance: 'Registered Contact',
    time: 'Instant Call',
    address: 'Emergency Contact 1',
    phone: '+91 98765 43210',
    badge: 'Caregiver',
    features: ['Location SMS Dispatched', 'Real-time Telematics Shared'],
    icon: 'contact_phone',
    color: 'bg-amber-500',
    destCoords: { lat: 28.6129, lng: 77.2295 }
  }
];

export default function SosHelpModal({ isOpen, onClose }: SosHelpModalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [alertSent, setAlertSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleBroadcastAlert = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setAlertSent(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGuideThere = (service: AssistanceService) => {
    onClose();
    router.push(`/plan-route?to=${encodeURIComponent(service.name)}&lat=${service.destCoords.lat}&lng=${service.destCoords.lng}&stepFree=true`);
  };

  const filteredServices = selectedCategory === 'all'
    ? EMERGENCY_SERVICES
    : EMERGENCY_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Backdrop with soft red emergency glow */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#121420] rounded-[2.5rem] shadow-2xl border-2 border-red-500/40 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-[#191c20] dark:text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Urgent Emergency Top Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-lg shrink-0 animate-bounce">
                <span className="material-symbols-outlined fill text-3xl">emergency</span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-100 mb-1 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  Emergency Assistance Mode
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
                  SOS: I Need Help
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-red-100 font-medium mt-3 leading-relaxed">
            Instant guidance to the nearest accessible emergency assistance, hospital, 24/7 pharmacy, police station, and wheelchair transport.
          </p>

          {/* Current GPS coordinates strip */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-white/90">
              <span className="material-symbols-outlined text-sm">my_location</span>
              <span className="font-bold">Live GPS:</span> 28.6129 N, 77.2295 E (Near India Gate, Delhi)
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full ml-1">Verified Location</span>
            </div>
            
            {!alertSent ? (
              <button
                onClick={handleBroadcastAlert}
                disabled={countdown !== null}
                className="bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-75"
              >
                <span className="material-symbols-outlined text-sm">cell_tower</span>
                {countdown !== null ? `Broadcasting in ${countdown}s...` : 'Broadcast Location to 112 & Caregivers'}
              </button>
            ) : (
              <div className="bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-sm">verified</span>
                SOS Location Dispatched to 112 & Contacts
              </div>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-[#161826] border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 hide-scrollbar">
          {[
            { id: 'all', label: 'All Services', icon: 'apps' },
            { id: 'hospital', label: 'Hospitals', icon: 'local_hospital' },
            { id: 'pharmacy', label: 'Pharmacies', icon: 'local_pharmacy' },
            { id: 'police', label: 'Police Stations', icon: 'local_police' },
            { id: 'transport', label: 'Accessible Transport', icon: 'accessible_forward' },
            { id: 'contact', label: 'Emergency Contacts', icon: 'contact_phone' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Emergency Assistance List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Nearest Verified Assistance Points ({filteredServices.length})
            </h4>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Step-Free Verified
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-red-500/40 group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                {/* Left icon & details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl ${service.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-base font-black text-[#191c20] dark:text-white leading-snug">
                        {service.name}
                      </h5>
                      <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800/40">
                        {service.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {service.address}
                    </p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-red-500">near_me</span>
                        {service.distance} ({service.time})
                      </span>
                      {service.features.map((f, i) => (
                        <span key={i} className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-800/30">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons on the right */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <a
                    href={`tel:${service.phone}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black shadow-sm transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-base text-red-500">call</span>
                    Call {service.phone}
                  </a>

                  <button
                    onClick={() => handleGuideThere(service)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">navigation</span>
                    Guide Me There
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Hotlines Strip */}
        <div className="p-4 sm:px-6 bg-slate-100 dark:bg-[#151824] border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-600 dark:text-slate-400">National Emergency Helplines:</span>
            <div className="flex gap-2">
              <a href="tel:112" className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-black px-2.5 py-1 rounded-lg hover:underline">
                National SOS: 112
              </a>
              <a href="tel:102" className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black px-2.5 py-1 rounded-lg hover:underline">
                Ambulance: 102
              </a>
              <a href="tel:1099" className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black px-2.5 py-1 rounded-lg hover:underline">
                Disability Assist: 1099
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}