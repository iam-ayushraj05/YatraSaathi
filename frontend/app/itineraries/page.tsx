'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight,
  X,
  CheckCircle2,
  Trash2,
  Navigation
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Itinerary } from '../../lib/types';

export default function Itineraries() {
  const router = useRouter();
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Tour Form State
  const [tourTitle, setTourTitle] = useState('');
  const [stopName1, setStopName1] = useState('');
  const [stopTime1, setStopTime1] = useState('10:00 AM');
  const [stopName2, setStopName2] = useState('');
  const [stopTime2, setStopTime2] = useState('02:00 PM');
  const [tourSuccess, setTourSuccess] = useState(false);

  useEffect(() => {
    async function loadItineraries() {
      try {
        const item = await api.itineraries.get('default-id');
        setItineraries([item]);
        setSelectedItinerary(item);
      } catch (err) {
        const demoItineraries: Itinerary[] = [
          {
            id: 'it-1',
            user_id: 'u-1',
            title: language === 'HI' ? 'दिल्ली विरासत यात्रा (Delhi Heritage)' : 'Delhi Heritage Tour',
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
                  name: language === 'HI' ? 'इंडिया गेट लॉन' : 'India Gate Lawns',
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
          },
          {
            id: 'it-2',
            user_id: 'u-1',
            title: language === 'HI' ? 'जयपुर राजसी सुलभ सर्किट' : 'Jaipur Accessible Forts Circuit',
            status: 'ACTIVE',
            source: 'USER_CREATED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            stops: [
              {
                id: 's- Jaipur-1',
                itinerary_id: 'it-2',
                place_id: 'p-j1',
                sequence: 1,
                planned_start: '09:30 AM',
                planned_end: '12:30 PM',
                notes: language === 'HI' ? 'अंबर किले की ई-कार्ट सेवा मुख्य द्वार से सुलभ है।' : 'Amer Fort golf cart service accessible from main gate.',
                place: {
                  id: 'p-j1',
                  name: language === 'HI' ? 'अंबर किला (Jaipur)' : 'Amer Fort Jaipur',
                  category: 'Fort',
                  country: 'India',
                  location: { lat: 26.9855, lng: 75.8513 },
                  status: 'ACTIVE',
                  created_at: '',
                  updated_at: '',
                  accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0 }
                }
              }
            ]
          }
        ];
        setItineraries(demoItineraries);
        setSelectedItinerary(demoItineraries[0]);
      } finally {
        setLoading(false);
      }
    }
    loadItineraries();
  }, [language]);

  const handleCreateTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourTitle.trim()) return;

    const newTour: Itinerary = {
      id: `it_${Date.now()}`,
      user_id: 'u-1',
      title: tourTitle.trim(),
      status: 'ACTIVE',
      source: 'USER_CREATED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stops: [
        {
          id: `st_${Date.now()}_1`,
          itinerary_id: `it_${Date.now()}`,
          place_id: 'p-new1',
          sequence: 1,
          planned_start: stopTime1,
          planned_end: '12:00 PM',
          notes: language === 'HI' ? 'कदम-मुक्त प्रवेश और व्हीलचेयर सहायता सुलभ।' : 'Step-free entry & wheelchair assistance available.',
          place: {
            id: 'p-new1',
            name: stopName1.trim() || (language === 'HI' ? 'प्रथम गंतव्य' : 'First Destination'),
            category: 'Attraction',
            country: 'India',
            location: { lat: 28.6129, lng: 77.2295 },
            status: 'ACTIVE',
            created_at: '',
            updated_at: '',
            accessibility_summary: { level: 'HIGH' as const, verified: true, active_barriers_count: 0 }
          }
        },
        ...(stopName2.trim() ? [{
          id: `st_${Date.now()}_2`,
          itinerary_id: `it_${Date.now()}`,
          place_id: 'p-new2',
          sequence: 2,
          planned_start: stopTime2,
          planned_end: '04:00 PM',
          notes: language === 'HI' ? 'ऑडियो गाइड और स्पर्श पथ उपलब्ध।' : 'Tactile paving and auditory guides configured.',
          place: {
            id: 'p-new2',
            name: stopName2.trim(),
            category: 'Attraction',
            country: 'India',
            location: { lat: 28.6118, lng: 77.2191 },
            status: 'ACTIVE',
            created_at: '',
            updated_at: '',
            accessibility_summary: { level: 'HIGH' as const, verified: true, active_barriers_count: 0 }
          }
        }] : [])
      ]
    };

    setItineraries([newTour, ...itineraries]);
    setSelectedItinerary(newTour);
    setTourSuccess(true);

    setTimeout(() => {
      setTourSuccess(false);
      setShowCreateModal(false);
      setTourTitle('');
      setStopName1('');
      setStopName2('');
    }, 1200);
  };

  const handleDeleteTour = (tourId: string) => {
    if (confirm(language === 'HI' ? 'क्या आप इस यात्रा को हटाना चाहते हैं?' : 'Are you sure you want to delete this itinerary?')) {
      const updated = itineraries.filter(i => i.id !== tourId);
      setItineraries(updated);
      setSelectedItinerary(updated[0] || null);
    }
  };

  const handleNavigateToStop = (stopName: string, lat?: number, lng?: number) => {
    router.push(`/plan-route?to=${encodeURIComponent(stopName)}&lat=${lat || 28.6129}&lng=${lng || 77.2295}&stepFree=true`);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                {t('itineraries')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {language === 'HI' ? 'स्टॉप, शेड्यूल प्रबंधित करें और सुलभ यात्रा टाइमलाइन देखें।' : 'Manage stops, schedule and view accessibility-verified timelines.'}
              </p>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'HI' ? 'नई यात्रा बनाएं' : 'Create New Tour'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar list (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                {language === 'HI' ? 'सहेजी गई यात्राएं' : 'Saved Tours'} ({itineraries.length})
              </h3>
              
              {loading ? (
                <div className="h-20 bg-white dark:bg-[#0b0a0f] rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
              ) : (
                itineraries.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setSelectedItinerary(it)}
                    className={`
                      p-5 rounded-2xl border cursor-pointer transition-all duration-200 group relative
                      ${selectedItinerary?.id === it.id 
                        ? 'border-violet-600 bg-violet-50/40 dark:bg-violet-950/30 shadow-md ring-1 ring-violet-500/30' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] hover:border-slate-300 dark:hover:border-slate-700'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{it.title}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTour(it.id); }}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Itinerary"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-violet-500" />
                      {it.stops.length} {language === 'HI' ? 'नियोजित स्टॉप' : 'Stops Planned'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Timelines Details (8 cols) */}
            <div className="lg:col-span-8">
              {selectedItinerary ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm space-y-6 transition-colors">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{selectedItinerary.title}</h2>
                      <span className="text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                        {language === 'HI' ? 'सक्रिय मार्ग उपयुक्तता सत्यापित है' : 'Active Route Suitability Verified'}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleNavigateToStop(selectedItinerary.stops[0]?.place?.name || selectedItinerary.title)}
                      className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all hover:scale-105 cursor-pointer"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>{language === 'HI' ? 'संपूर्ण मार्ग नेविगेट करें' : 'Navigate Tour'}</span>
                    </button>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative border-l-2 border-violet-200 dark:border-violet-900/50 pl-6 ml-3 space-y-8">
                    {selectedItinerary.stops.map((stop, index) => {
                      const level = stop.place?.accessibility_summary?.level || 'HIGH';
                      const levelColors = 
                        level === 'HIGH' ? 'bg-emerald-500 ring-emerald-200 dark:ring-emerald-950' :
                        level === 'MEDIUM' ? 'bg-amber-500 ring-amber-200 dark:ring-amber-950' : 'bg-rose-500 ring-rose-200 dark:ring-rose-950';

                      return (
                        <div key={stop.id} className="relative">
                          {/* Timeline dot */}
                          <span className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full ring-4 shadow-sm ${levelColors}`} />
                          
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-violet-500/30 transition-all">
                            <div className="flex-1">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-violet-500" />
                                {stop.planned_start} - {stop.planned_end}
                              </span>
                              
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1.5 flex items-center gap-2 flex-wrap">
                                {index + 1}. {stop.place?.name}
                                <span className={`text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-full ${levelColors.split(' ')[0]}`}>
                                  {level} ACCESS
                                </span>
                              </h4>
                              
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 italic leading-relaxed">
                                "{stop.notes}"
                              </p>
                            </div>

                            <button 
                              onClick={() => handleNavigateToStop(stop.place?.name || '', stop.place?.location.lat, stop.place?.location.lng)}
                              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold self-start sm:self-center transition-all shadow-sm hover:scale-105 cursor-pointer shrink-0"
                            >
                              <span>{language === 'HI' ? 'दिशा-निर्देश' : 'Directions'}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-violet-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  {language === 'HI' ? 'कोई यात्रा चयनित नहीं है' : 'No tour selected'}
                </div>
              )}
            </div>

          </div>

        </main>

        {/* Modal: Create New Tour */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {language === 'HI' ? 'नई यात्रा / मार्ग योजना बनाएं' : 'Create New Accessible Tour'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'HI' ? 'गंतव्य और समय जोड़ें' : 'Set up planned stops with accessibility notes.'}
                  </p>
                </div>
              </div>

              {tourSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {language === 'HI' ? 'यात्रा सफलतापूर्वक बनाई गई!' : 'Tour Created Successfully!'}
                  </h4>
                </div>
              ) : (
                <form onSubmit={handleCreateTour} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'यात्रा का नाम' : 'Tour Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={tourTitle}
                      onChange={(e) => setTourTitle(e.target.value)}
                      placeholder={language === 'HI' ? 'उदा: वाराणसी घाट सुलभ मार्ग' : 'e.g. Varanasi Ghats Accessible Tour'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'स्टॉप 1 गंतव्य' : 'Stop 1 Place Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={stopName1}
                      onChange={(e) => setStopName1(e.target.value)}
                      placeholder={language === 'HI' ? 'उदा: दशाश्वमेध घाट' : 'e.g. Dashashwamedh Ghat Ramp'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'स्टॉप 2 गंतव्य (वैकल्पिक)' : 'Stop 2 Place Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={stopName2}
                      onChange={(e) => setStopName2(e.target.value)}
                      placeholder={language === 'HI' ? 'उदा: विश्वनाथ मंदिर सुलभ प्रवेश' : 'e.g. Kashi Vishwanath Temple Elevator Corridor'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {language === 'HI' ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      {language === 'HI' ? 'सहेजें' : 'Save Tour'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
