'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, CheckCircle2, AlertTriangle, Shield, Star, Accessibility,
  ArrowLeft, Navigation, Loader2, ChevronRight, Phone, Clock, ExternalLink
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { PlaceDetails } from '../../../lib/types';

const PLACE_IMAGES: Record<string, string> = {
  'Qutub Minar': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  'Qutub Minar Complex': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  'Red Fort': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  'India Gate': 'https://images.unsplash.com/photo-1597040663342-45b6ba68fa2b?auto=format&fit=crop&w=1200&q=80',
  "Humayun's Tomb": 'https://images.unsplash.com/photo-1585135497273-1a86d9d25c2e?auto=format&fit=crop&w=1200&q=80',
  'Lotus Temple': 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=1200&q=80',
  'National Museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1200&q=80',
  'Connaught Place': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  'Lodhi Gardens': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
  'Jantar Mantar': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  'Akshardham Temple': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useApp();
  const hi = language === 'HI';
  const placeId = params.placeId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true);
    setError(null);
    api.places.getDetails(placeId)
      .then(data => setDetails(data))
      .catch(err => setError(err.message || 'Failed to load place details'))
      .finally(() => setLoading(false));
  }, [placeId]);

  const getImg = (name: string) => PLACE_IMAGES[name] || DEFAULT_IMG;

  const lvlColor = (l: string) =>
    l === 'HIGH' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
    : l === 'MEDIUM' ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';

  const lvlLabel = (l: string) =>
    hi ? (l === 'HIGH' ? 'अत्यधिक सुलभ' : l === 'MEDIUM' ? 'मध्यम सुलभ' : 'सीमित सुलभता')
    : (l === 'HIGH' ? 'Highly Accessible' : l === 'MEDIUM' ? 'Moderately Accessible' : 'Limited Accessibility');

  const severityColor = (s: string) =>
    s === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
    : s === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
            </div>
          ) : error || !details ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 px-4">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{hi ? 'स्थान लोड नहीं हो सका' : 'Could not load place'}</h2>
              <p className="text-xs text-slate-500 text-center">{error || 'Unknown error'}</p>
              <button onClick={() => router.back()} className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />{hi ? 'वापस जाएं' : 'Go Back'}
              </button>
            </div>
          ) : (
            <>
              {/* Hero Image */}
              <div className="relative w-full h-56 md:h-72 overflow-hidden">
                <img src={getImg(details.place.name)} alt={details.place.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button onClick={() => router.push('/explore')} className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white transition-colors shadow-sm" aria-label="Back to explore">
                  <ArrowLeft className="h-3.5 w-3.5" />{hi ? 'वापस' : 'Back'}
                </button>
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                  <span className="text-[9px] font-bold uppercase bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md tracking-wider">{details.place.category}</span>
                  <h1 className="text-2xl md:text-3xl font-black mt-2 flex items-center gap-2.5 drop-shadow-lg">
                    {details.place.name}
                    {details.accessibility_summary?.verified && <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />}
                  </h1>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{details.place.city || details.place.address || 'New Delhi, India'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

                {/* Quick Badges Row */}
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-xs font-bold ${lvlColor(details.accessibility_summary?.level || 'UNKNOWN')}`}>
                    <Star className="h-3.5 w-3.5" />
                    {lvlLabel(details.accessibility_summary?.level || 'UNKNOWN')}
                  </div>
                  <div className="flex items-center gap-1.5 border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 rounded-lg px-3 py-2 text-xs font-bold text-violet-700 dark:text-violet-400">
                    <Shield className="h-3.5 w-3.5" />
                    {hi ? 'विश्वास:' : 'Trust:'} {details.trust_score || 'N/A'}
                  </div>
                  {details.accessibility_summary?.verified && (
                    <div className="flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {hi ? 'YatraSaathi द्वारा प्रमाणित' : 'Verified by YatraSaathi'}
                    </div>
                  )}
                  {details.accessibility_summary?.active_barriers_count > 0 && (
                    <div className="flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {details.accessibility_summary.active_barriers_count} {hi ? 'सक्रिय बाधाएं' : 'Active Barriers'}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{hi ? 'विवरण' : 'About this Place'}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {details.place.description || (hi ? 'यह स्थान पहुंच सुविधाओं के साथ प्रमाणित है।' : 'This place has been verified for accessibility features including ramped entrances, braille signage, and dedicated accessible restrooms.')}
                  </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Accessibility Records */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <Accessibility className="h-4 w-4 text-violet-600" />
                      {hi ? 'पहुंच सुविधाएं' : 'Accessibility Features'}
                    </h3>
                    {details.accessibility_records?.length > 0 ? (
                      <div className="space-y-2">
                        {details.accessibility_records.map((r, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2.5">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${r.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <div className="min-w-0">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate">{r.feature}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{r.confidence} confidence</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">{hi ? 'डेटा जल्द उपलब्ध होगा' : 'Data coming soon'}</p>
                    )}
                  </div>

                  {/* Facilities */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      {hi ? 'सुविधाएं' : 'Facilities'}
                    </h3>
                    {details.facilities?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {details.facilities.map((f, i) => (
                          <span key={i} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${f.is_operational ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 line-through'}`}>
                            {f.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">{hi ? 'कोई सुविधा सूचीबद्ध नहीं' : 'No facilities listed'}</p>
                    )}
                  </div>
                </div>

                {/* Assistance Points */}
                {details.assistance_points?.length > 0 && (
                  <div className="rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 p-5">
                    <h3 className="text-xs font-bold text-violet-800 dark:text-violet-300 mb-3 flex items-center gap-1.5">
                      <Accessibility className="h-4 w-4" />
                      {hi ? 'सहायता केंद्र' : 'Assistance Points'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {details.assistance_points.map((ap, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-900/30 rounded-lg px-3 py-2.5">
                          <Navigation className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 block">{ap.name}</span>
                            <span className="text-[9px] text-slate-500 capitalize block">{ap.assistance_type} · {ap.availability_status}</span>
                            {ap.description && <span className="text-[9px] text-slate-400 block mt-0.5">{ap.description}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Barriers */}
                {details.active_barriers?.length > 0 && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5">
                    <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      {hi ? 'सक्रिय बाधाएं' : 'Active Barriers'}
                    </h3>
                    <div className="space-y-2">
                      {details.active_barriers.map((b, i) => (
                        <div key={i} className={`flex items-start gap-2.5 border rounded-lg px-3 py-2.5 ${severityColor(b.severity)}`}>
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold block">{b.title}</span>
                            <span className="text-[9px] block mt-0.5">{b.description}</span>
                            <span className="text-[8px] font-bold uppercase mt-1 block opacity-70">{b.severity} · {b.barrier_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/plan-route?destination=${placeId}&name=${encodeURIComponent(details.place.name)}&lat=${details.place.location.lat}&lng=${details.place.location.lng}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    id="plan-route-cta"
                  >
                    <Navigation className="h-4 w-4" />
                    {hi ? 'सुलभ मार्ग की योजना बनाएं →' : 'Plan Accessible Route →'}
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center justify-center gap-2 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
                    id="report-barrier-cta"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {hi ? 'बाधा रिपोर्ट करें' : 'Report a Barrier'}
                  </Link>
                </div>

              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
