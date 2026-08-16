'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle,
  CheckCircle,
  Accessibility,
  Building
} from 'lucide-react';
import { api } from '../../lib/api';
import { Barrier, Place } from '../../lib/types';
import { useApp } from '../../context/AppContext';

export default function SummaryCards() {
  const router = useRouter();
  const { language } = useApp();
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    async function loadSummaryData() {
      try {
        const activeBarriers = await api.barriers.getNearby(28.6129, 77.2295, 5000);
        setBarriers(activeBarriers.slice(0, 2));
        const accessiblePlaces = await api.places.search({ step_free: true });
        setPlaces(accessiblePlaces.slice(0, 2));
      } catch (err) {
        setBarriers([
          {
            id: 'b1',
            place_id: 'p1',
            title: language === 'HI' ? 'लिफ्ट रखरखाव' : 'Elevator Maintenance',
            description: 'Main lift out of order',
            barrier_type: 'BROKEN_ELEVATOR',
            severity: 'HIGH',
            status: 'ACTIVE',
            location: { lat: 28.6129, lng: 77.2295 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'b2',
            place_id: 'p2',
            title: language === 'HI' ? 'निर्माण फुटपाथ' : 'Construction Sidewalk',
            description: 'Temporary bypass not wheelchair paved',
            barrier_type: 'CONSTRUCTION',
            severity: 'MEDIUM',
            status: 'ACTIVE',
            location: { lat: 28.6200, lng: 77.2300 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

        setPlaces([
          {
            id: 'p1',
            name: language === 'HI' ? 'राष्ट्रीय संग्रहालय दिल्ली' : 'National Museum Delhi',
            category: 'Museum',
            country: 'India',
            location: { lat: 28.6118, lng: 77.2191 },
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0 }
          },
          {
            id: 'p2',
            name: language === 'HI' ? 'लोटस टेम्पल पार्क' : 'Lotus Temple Lawns',
            category: 'Monument',
            country: 'India',
            location: { lat: 28.5535, lng: 77.2588 },
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0 }
          }
        ]);
      }
    }

    loadSummaryData();
  }, [language]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Nearby Assistance */}
      <div className="rounded-xl border border-slate-105 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm flex flex-col justify-between h-[180px] transition-colors">
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450">
            <Accessibility className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11.5px] mt-2">
            {language === 'HI' ? 'आसपास की सहायता' : 'Nearby Assistance'}
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
            {language === 'HI' ? '1.5 किमी के भीतर 2 सहायता डेस्क सक्रिय हैं।' : '2 help desks active within 1.5 km.'}
          </p>
        </div>
        <button 
          onClick={() => router.push('/plan-route')} 
          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 transition-colors self-start border-t border-slate-50 dark:border-slate-900 pt-2 w-full mt-2"
        >
          <span>{language === 'HI' ? 'सहायता का अनुरोध करें →' : 'Request Support →'}</span>
        </button>
      </div>

      {/* 2. Active Barriers */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm flex flex-col justify-between h-[180px] transition-colors">
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11.5px] mt-2">
            {language === 'HI' ? `सक्रिय बाधाएं (${barriers.length})` : `Active Barriers (${barriers.length})`}
          </h4>
          <div className="mt-1 space-y-1 overflow-y-auto scrollbar-none max-h-[60px]">
            {barriers.map(b => (
              <div key={b.id} className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 p-1 rounded border border-slate-100/50 dark:border-slate-800">
                <span className="h-1 w-1 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{b.title}</span>
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={() => router.push('/reports')} 
          className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:text-rose-700 transition-colors self-start border-t border-slate-50 dark:border-slate-900 pt-2 w-full mt-2"
        >
          <span>{language === 'HI' ? 'बाधा की रिपोर्ट करें →' : 'Report a Barrier →'}</span>
        </button>
      </div>

      {/* 3. Accessible Places */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm flex flex-col justify-between h-[180px] transition-colors">
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-955/20 border border-violet-100 dark:border-violet-900/30 text-violet-650 dark:text-violet-400">
            <Building className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11.5px] mt-2">
            {language === 'HI' ? 'सुलभ स्थान' : 'Accessible Places'}
          </h4>
          <div className="mt-1 space-y-1 overflow-y-auto scrollbar-none max-h-[60px]">
            {places.map(p => (
              <div key={p.id} className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 p-1 rounded border border-slate-100/50 dark:border-slate-800">
                <CheckCircle className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                <span className="truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={() => router.push('/explore')} 
          className="flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors self-start border-t border-slate-50 dark:border-slate-900 pt-2 w-full mt-2"
        >
          <span>{language === 'HI' ? 'सभी स्थानों का पता लगाएं →' : 'Explore All Places →'}</span>
        </button>
      </div>

      {/* 4. Emergency Help SOS */}
      <div className={`
        rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between h-[180px]
        ${sosActive 
          ? 'bg-rose-50 dark:bg-rose-955/15 border-rose-250 dark:border-rose-900/40' 
          : 'border-slate-105 dark:border-slate-800 bg-white dark:bg-[#0b0a0f]'
        }
      `}>
        <div>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${sosActive ? 'bg-rose-500 text-white' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'}`}>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11.5px] mt-2">
            {language === 'HI' ? 'आपातकालीन सहायता' : 'Emergency Help'}
          </h4>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
            {language === 'HI' 
              ? 'स्थानीय पारगमन नियंत्रण और व्हीलचेयर प्रेषण सेवाओं के लिए सीधा हॉटलाइन।' 
              : 'Direct hotline to local transit control and wheelchair dispatch services.'
            }
          </p>
        </div>
        
        {sosActive ? (
          <button 
            onClick={() => setSosActive(false)}
            className="w-full flex items-center justify-center bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors mt-2"
          >
            <span>{language === 'HI' ? 'एसओएस अलर्ट रद्द करें' : 'Cancel SOS Alert'}</span>
          </button>
        ) : (
          <button 
            onClick={() => setSosActive(true)}
            className="w-full flex items-center justify-center gap-1 bg-rose-605 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-rose-700 transition-colors mt-2 hover:shadow-sm"
          >
            <PhoneCall className="h-3 w-3" />
            <span>{language === 'HI' ? 'एसओएस डेस्क शुरू करें' : 'SOS Trigger Desk'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
