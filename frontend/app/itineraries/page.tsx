'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Itinerary } from '../../lib/types';

export default function Itineraries() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItineraries() {
      try {
        const item = await api.itineraries.get('default-id');
        setItineraries([item]);
        setSelectedItinerary(item);
      } catch (err) {
        const demoItinerary: Itinerary = {
          id: 'it-1',
          user_id: 'u-1',
          title: language === 'HI' ? 'दिल्ली विरासत यात्रा' : 'Delhi Heritage Tour',
          status: 'ACTIVE',
          source: 'USER_CREATED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stops: [
            {
              id: 's-1',
              itinerary_id: 'it-1',
              place_id: 'p-1',
              sequence: 1,
              planned_start: '10:00 AM',
              planned_end: '12:00 PM',
              notes: language === 'HI' ? 'दक्षिण गेट रैंप के माध्यम से प्रवेश करें। शौचालय टिकट काउंटर के पास स्थित हैं।' : 'Enter via South Gate ramp. Restrooms are located near ticket counter.',
              place: {
                id: 'p-1',
                name: language === 'HI' ? 'इंडिया गेट लॉन' : 'India Gate lawns',
                category: 'Monument',
                country: 'India',
                location: { lat: 28.6129, lng: 77.2295 },
                status: 'ACTIVE',
                created_at: '',
                updated_at: '',
                accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0 }
              }
            },
            {
              id: 's-2',
              itinerary_id: 'it-1',
              place_id: 'p-2',
              sequence: 2,
              planned_start: '01:00 PM',
              planned_end: '03:30 PM',
              notes: language === 'HI' ? 'सहायता डेस्क पर श्रवण गाइड उपलब्ध हैं।' : 'Auditory guides available at helpdesk.',
              place: {
                id: 'p-2',
                name: language === 'HI' ? 'राष्ट्रीय संग्रहालय दिल्ली' : 'National Museum Delhi',
                category: 'Museum',
                country: 'India',
                location: { lat: 28.6118, lng: 77.2191 },
                status: 'ACTIVE',
                created_at: '',
                updated_at: '',
                accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0 }
              }
            },
            {
              id: 's-3',
              itinerary_id: 'it-1',
              place_id: 'p-3',
              sequence: 3,
              planned_start: '04:30 PM',
              planned_end: '06:00 PM',
              notes: language === 'HI' ? 'चेतावनी: लिफ्ट रखरखाव के अधीन है। सीढ़ी लिफ्ट अनुरोध की आवश्यकता है।' : 'Warning: Elevator undergoing maintenance. Stair lift request needed.',
              place: {
                id: 'p-3',
                name: language === 'HI' ? 'कुतुब मीनार प्रांगण' : 'Qutub Minar Courtyard',
                category: 'Monument',
                country: 'India',
                location: { lat: 28.5244, lng: 77.1855 },
                status: 'ACTIVE',
                created_at: '',
                updated_at: '',
                accessibility_summary: { level: 'MEDIUM', verified: true, active_barriers_count: 1 }
              }
            }
          ]
        };
        setItineraries([demoItinerary]);
        setSelectedItinerary(demoItinerary);
      } finally {
        setLoading(false);
      }
    }
    loadItineraries();
  }, [language]);

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-violet-650 dark:text-violet-400" />
                {t('itineraries')}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                {language === 'HI' ? 'स्टॉप, शेड्यूल प्रबंधित करें और यात्रा उपयुक्तता टाइमलाइन देखें।' : 'Manage stops, schedule and view suitability timelines.'}
              </p>
            </div>
            
            <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4" />
              <span>{language === 'HI' ? 'नई यात्रा बनाएं' : 'Create New Tour'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar list (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider px-1">
                {language === 'HI' ? 'सहेजी गई यात्राएं' : 'Saved Tours'}
              </h3>
              
              {loading ? (
                <div className="h-20 bg-white dark:bg-[#0b0a0f] rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
              ) : (
                itineraries.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setSelectedItinerary(it)}
                    className={`
                      p-5 rounded-2xl border cursor-pointer transition-all duration-200
                      ${selectedItinerary?.id === it.id 
                        ? 'border-violet-600 bg-violet-50/15 dark:bg-violet-950/20 shadow-sm' 
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] hover:border-slate-200 dark:hover:border-slate-700'
                      }
                    `}
                  >
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{it.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {it.stops.length} {language === 'HI' ? 'नियोजित स्टॉप' : 'Stops Planned'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Timelines Details (8 cols) */}
            <div className="lg:col-span-8">
              {selectedItinerary && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm space-y-6 transition-colors">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{selectedItinerary.title}</h2>
                      <span className="text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {language === 'HI' ? 'सक्रिय मार्ग उपयुक्तता सत्यापित है' : 'Active Route suitability verified'}
                      </span>
                    </div>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative border-l border-slate-100 dark:border-slate-800 pl-6 ml-3 space-y-8">
                    {selectedItinerary.stops.map((stop, index) => {
                      const level = stop.place?.accessibility_summary?.level || 'HIGH';
                      const levelColors = 
                        level === 'HIGH' ? 'bg-emerald-500' :
                        level === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500';

                      return (
                        <div key={stop.id} className="relative">
                          {/* Timeline dot */}
                          <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${levelColors}`} />
                          
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/40 p-4.5 rounded-xl border border-slate-100/50 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {stop.planned_start} - {stop.planned_end}
                              </span>
                              
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1.5 flex items-center gap-1.5">
                                {index + 1}. {stop.place?.name}
                                <span className={`text-[9px] font-bold uppercase text-white px-1.5 py-0.2 rounded-md ${levelColors}`}>
                                  {level}
                                </span>
                              </h4>
                              
                              <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 italic leading-relaxed">
                                "{stop.notes}"
                              </p>
                            </div>

                            <button className="flex items-center gap-1 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold self-start sm:self-center transition-all">
                              <span>{language === 'HI' ? 'दिशा-निर्देश' : 'Directions'}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
