'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Eye, 
  Check, 
  Zap, 
  Award, 
  ChevronRight,
  Clock,
  XCircle,
  Filter,
  History,
  FileCheck2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FaqSection from '../../components/common/FaqSection';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

interface BarrierHistoryItem {
  id: string;
  title: string;
  place: string;
  type: string;
  date: string;
  status: 'VERIFIED' | 'UNDER_VERIFICATION' | 'REJECTED';
  statusNote: string;
  resolutionNote?: string;
  points: string;
  hasPhoto: boolean;
}

export default function Reports() {
  const { t, language } = useApp();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reportType, setReportType] = useState('BARRIER');
  const [severity, setSeverity] = useState('MODERATE');
  const [accessibilityImpact, setAccessibilityImpact] = useState('PARTIAL');
  const [placeName, setPlaceName] = useState('Qutub Minar Courtyard');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'VERIFIED' | 'UNDER_VERIFICATION' | 'REJECTED'>('ALL');

  // Report History State
  const [reportsHistory, setReportsHistory] = useState<BarrierHistoryItem[]>([
    {
      id: 'rep-101',
      title: 'Broken Elevator at Platform 2 Ramp',
      place: 'Rajiv Chowk Metro Station',
      type: 'BARRIER',
      date: '18 Aug 2026, 03:20 PM',
      status: 'VERIFIED',
      statusNote: 'Verified by AI (96% confidence) & 4 Community Auditors',
      resolutionNote: 'Station maintenance crew dispatched. Live accessible maps rerouted to alternate ramp #4.',
      points: '+100 pts Credited',
      hasPhoto: true
    },
    {
      id: 'rep-102',
      title: 'Tactile Paving Damaged near Exit Gate 3',
      place: 'India Gate Central Park',
      type: 'BARRIER',
      date: '19 Aug 2026, 09:45 AM',
      status: 'UNDER_VERIFICATION',
      statusNote: 'AI Photo Inspection Completed (89% score) • Awaiting 1 more peer confirmation vote',
      resolutionNote: 'Currently under active review by nearby verified accessibility volunteers.',
      points: '+100 pts Pending',
      hasPhoto: true
    },
    {
      id: 'rep-103',
      title: 'Steep Incline without Wheelchair Grab Rails',
      place: 'Qutub Minar Courtyard',
      type: 'BARRIER',
      date: '16 Aug 2026, 01:10 PM',
      status: 'VERIFIED',
      statusNote: 'Verified by Archaeological Survey & Municipal Auditor',
      resolutionNote: 'Low-gradient detour path marked as recommended route for mobility aid users.',
      points: '+100 pts Credited',
      hasPhoto: true
    },
    {
      id: 'rep-104',
      title: 'Temporary Vendor Stall Blocking Step-Free Entry',
      place: 'Lotus Temple Lawns',
      type: 'BARRIER',
      date: '14 Aug 2026, 05:30 PM',
      status: 'REJECTED',
      statusNote: 'Dismissed by Community Reviewers',
      resolutionNote: 'Obstacle was already cleared by venue security prior to auditor inspection.',
      points: '0 pts (Cleared)',
      hasPhoto: false
    },
    {
      id: 'rep-105',
      title: 'Accessible Restroom Locked During Operating Hours',
      place: 'Kashmere Gate ISBT',
      type: 'FACILITY',
      date: '12 Aug 2026, 11:00 AM',
      status: 'VERIFIED',
      statusNote: 'Verified by Station Superintendent',
      resolutionNote: 'Restroom unlocked; permanent keyholder assigned at station assistance booth.',
      points: '+50 pts Credited',
      hasPhoto: false
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const defaultPlaceId = 'cc9ffe31-8212-42c8-8da6-735f0ba296d8'; // default place from seed
      
      const report = await api.reports.create({
        place_id: defaultPlaceId,
        report_type: reportType,
        title: `${title} [${severity}]`,
        description: `Severity: ${severity} | Accessibility Impact: ${accessibilityImpact} | ${desc}`,
        location: { lat: 28.5244, lng: 77.1855 } // Qutub Minar center
      });

      if (file) {
        await api.reports.uploadEvidence(report.id, file);
      }

      // Add to live history state
      const newReport: BarrierHistoryItem = {
        id: `rep-${Date.now().toString().slice(-4)}`,
        title,
        place: placeName,
        type: reportType,
        date: 'Just now',
        status: 'UNDER_VERIFICATION',
        statusNote: file 
          ? 'AI Photo Inspection Processing (Triggers +100 YatraPoints upon confirmation)'
          : 'Standard Report Filed (Triggers +50 YatraPoints upon confirmation)',
        resolutionNote: 'Submitted to municipal auditors and nearby peer reviewers for instant verification.',
        points: file ? '+100 pts Pending' : '+50 pts Pending',
        hasPhoto: !!file
      };

      setReportsHistory(prev => [newReport, ...prev]);
      setSuccess(true);
      setTitle('');
      setDesc('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = reportsHistory.filter(item => {
    if (historyFilter === 'ALL') return true;
    return item.status === historyFilter;
  });

  const countVerified = reportsHistory.filter(i => i.status === 'VERIFIED').length;
  const countPending = reportsHistory.filter(i => i.status === 'UNDER_VERIFICATION').length;
  const countRejected = reportsHistory.filter(i => i.status === 'REJECTED').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7FC] dark:bg-[#0c0e17] transition-colors">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* PAGE TITLE BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <AlertTriangle className="h-7 w-7 text-[#6b21a8] dark:text-purple-400" />
              {language === 'HI' ? 'बाधा रिपोर्ट करें' : 'Report Barrier'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {language === 'HI' 
                ? 'बाधाओं की रिपोर्ट करें और साथी यात्रियों के लिए सुलभ मार्गों को तुरंत अपडेट करें।' 
                : 'Report physical barriers, broken lifts, or obstacles to keep accessible routes updated in real time.'
              }
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[#6b21a8] dark:text-purple-300 text-xs font-extrabold shrink-0">
            <Sparkles className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
            <span>{language === 'HI' ? '100% कम्युनिटी सत्यापित' : '100% Community Verified'}</span>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: REPORT FORM ON LEFT, REWARDS & GUIDELINES ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: REPORT BARRIER FORM (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* SUCCESS NOTIFICATION */}
            {success && (
              <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-5 text-emerald-800 dark:text-emerald-300 space-y-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{language === 'HI' ? 'बाधा रिपोर्ट सफलतापूर्वक सबमिट की गई!' : 'Barrier Report Submitted Successfully!'}</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {language === 'HI' 
                        ? 'आपकी रिपोर्ट नीचे इतिहास में जोड़ दी गई है और नगर निगम परीक्षकों को सूचित कर दिया गया है।' 
                        : 'Your report has been added to your history below and queued for municipal & peer verification.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 text-rose-700 dark:text-rose-450 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{language === 'HI' ? 'सबमिशन त्रुटि' : 'Submission Error'}</h4>
                  <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* REPORT FORM CARD */}
            <form onSubmit={handleSubmit} className="flex-1 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between transition-colors">
              
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'HI' ? 'बाधा विवरण दर्ज करें' : 'Submit Obstacle Details'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {language === 'HI' 
                      ? 'सटीक जानकारी प्रदान करें ताकि अन्य यात्रियों को बाधा से पहले सचेत किया जा सके।' 
                      : 'Provide accurate details to alert other travelers and update step-free paths.'
                    }
                  </p>
                </div>

                {/* 1. Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {language === 'HI' ? 'रिपोर्ट श्रेणी' : 'Report Category'}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['BARRIER', 'FACILITY', 'ASSISTANCE'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setReportType(type)}
                        className={`
                          py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
                          ${reportType === type 
                            ? 'border-[#6b21a8] bg-purple-50/70 dark:bg-purple-950/40 text-[#6b21a8] dark:text-purple-300 font-black shadow-xs' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Obstacle Severity & Wheelchair Impact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {language === 'HI' ? 'गंभीरता स्तर' : 'Obstacle Severity'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'LOW', label: 'Low', color: 'text-emerald-700 dark:text-emerald-300 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' },
                        { id: 'MODERATE', label: 'Moderate', color: 'text-amber-700 dark:text-amber-300 border-amber-300 bg-amber-50 dark:bg-amber-950/30' },
                        { id: 'CRITICAL', label: 'Critical', color: 'text-rose-700 dark:text-rose-300 border-rose-300 bg-rose-50 dark:bg-rose-950/30' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSeverity(item.id)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                            severity === item.id 
                              ? `${item.color} font-black shadow-2xs` 
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {language === 'HI' ? 'व्हीलचेयर प्रभाव' : 'Mobility Aid Impact'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'PASSABLE', label: 'Passable' },
                        { id: 'PARTIAL', label: 'Partial' },
                        { id: 'BLOCKED', label: 'Blocked' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAccessibilityImpact(item.id)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                            accessibilityImpact === item.id 
                              ? 'border-[#6b21a8] bg-purple-50 dark:bg-purple-950/40 text-[#6b21a8] dark:text-purple-300 font-black shadow-2xs' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'HI' ? 'बाधा का नाम / लघु सारांश' : 'Obstacle Title / Short Summary'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={language === 'HI' ? 'उदा. प्लेटफॉर्म पर टूटी हुई लिफ्ट, बंद रैंप' : 'e.g. Broken elevator at platforms, Blocked wheelchair ramp'} 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                {/* 4. Location Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'HI' ? 'स्थान / स्मारक' : 'Location / Monument'}
                  </label>
                  <div className="relative">
                    <select
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 py-3 pl-10 pr-4 text-xs font-medium text-slate-700 dark:text-slate-350 focus:border-purple-600 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Qutub Minar Courtyard">{language === 'HI' ? 'कुतुब मीनार प्रांगण' : 'Qutub Minar Courtyard'}</option>
                      <option value="India Gate Central Park">{language === 'HI' ? 'इंडिया गेट सेंट्रल पार्क' : 'India Gate Central Park'}</option>
                      <option value="Lotus Temple Lawns">{language === 'HI' ? 'लोटस टेम्पल पार्क' : 'Lotus Temple Lawns'}</option>
                      <option value="Rajiv Chowk Metro Station">{language === 'HI' ? 'राजीव चौक मेट्रो स्टेशन' : 'Rajiv Chowk Metro Station'}</option>
                    </select>
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'HI' ? 'विस्तृत विवरण' : 'Detailed Description'}
                  </label>
                  <textarea 
                    placeholder={language === 'HI' ? 'कृपया जो देखा उसका वर्णन करें, यह व्हीलचेयर उपयोगकर्ताओं के लिए कितना गंभीर है, और संभावित वैकल्पिक रास्ते।' : 'Please describe what you observed, how severe it is for mobility aids, and possible detours.'} 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-600 leading-relaxed font-medium"
                  />
                </div>

                {/* 6. Evidence File Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'HI' ? 'फोटो साक्ष्य संलग्न करें' : 'Attach Photo Evidence (Recommended)'}
                    </label>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                      Instant AI Verification
                    </span>
                  </div>

                  <div className="mt-1 flex justify-center rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 px-6 py-5 transition-all hover:bg-purple-50/40 dark:hover:bg-purple-950/30">
                    <div className="text-center space-y-2">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 text-[#6b21a8] dark:text-purple-300 shadow-sm">
                        <Camera className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-xs text-slate-500">
                        <label className="relative cursor-pointer rounded-md font-extrabold text-[#6b21a8] dark:text-purple-300 hover:underline">
                          <span>{language === 'HI' ? 'एक फ़ाइल अपलोड करें' : 'Upload photo evidence'}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="sr-only" 
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG up to 10MB</p>
                      </div>
                      {file && (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900 inline-block">
                          ✓ Attached: {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-full py-3.5 text-xs font-extrabold hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer shadow-purple-200"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'HI' ? 'रिपोर्ट सबमिट की जा रही है...' : 'Submitting Report...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{language === 'HI' ? 'बाधा रिपोर्ट सबमिट करें' : 'Submit Barrier Report'}</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: YATRAPOINTS REWARDS, TRAVELER IMPACT & VERIFICATION PIPELINE (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* 1. HOW TO EARN YATRAPOINTS REWARDS CARD */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 sm:p-6 shadow-xs space-y-3.5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400/20" />
                  {language === 'HI' ? 'YATRAPOINTS कैसे अर्जित करें' : 'HOW TO EARN YATRAPOINTS'}
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  Earn Rewards
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-amber-200 dark:hover:border-amber-900/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                      +50
                    </span>
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200">{language === 'HI' ? 'मानक बाधा रिपोर्ट' : 'Standard Barrier Report'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Per report submitted</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Base</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                      +100
                    </span>
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200">{language === 'HI' ? 'फोटो साक्ष्य अपलोड' : 'Photo Evidence Upload'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Clear photo of obstacle</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">2x Pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                      +50
                    </span>
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200">{language === 'HI' ? 'समीक्षक सत्यापन बोनस' : 'Auditor Verification Bonus'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">When confirmed by reviewers</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Bonus</span>
                </div>
              </div>

              <Link
                href="/rewards"
                className="mt-1 w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-950/40 dark:to-amber-950/30 border border-purple-200/60 dark:border-purple-900/50 text-[#6b21a8] dark:text-purple-300 hover:brightness-105 transition-all text-xs font-black shadow-2xs group cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {language === 'HI' ? 'लॉयल्टी रिवार्ड्स केंद्र देखें' : 'View Rewards Centre & Redeem Perks'}
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 2. REAL-TIME TRAVELER IMPACT CARD */}
            <div className="rounded-3xl bg-gradient-to-br from-[#6b21a8] via-[#7e22ce] to-[#581c87] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden space-y-3">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-purple-200" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  {language === 'HI' ? 'रिपोर्टिंग का प्रभाव' : 'Real-Time Traveler Impact'}
                </h3>
              </div>

              <p className="text-xs text-purple-100 font-medium leading-relaxed">
                {language === 'HI'
                  ? 'आपकी रिपोर्ट की गई बाधाएं तुरंत व्हीलचेयर उपयोगकर्ताओं के सक्रिय नेविगेशन एल्गोरिदम को सुरक्षित वैकल्पिक मार्गों पर भेज देती हैं।'
                  : 'Your reported obstacles immediately update routing algorithms, redirecting wheelchair users and visually impaired travelers toward safe, step-free alternatives.'
                }
              </p>

              <div className="space-y-1.5 pt-1.5 border-t border-white/15">
                <div className="flex items-center gap-2 text-xs text-purple-100">
                  <div className="w-4.5 h-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">
                    ✓
                  </div>
                  <span>Instant rerouting on live accessible maps</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-100">
                  <div className="w-4.5 h-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">
                    ✓
                  </div>
                  <span>Direct alerts sent to station accessibility staff</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-100">
                  <div className="w-4.5 h-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">
                    ✓
                  </div>
                  <span>Automated AI verification for fast approval</span>
                </div>
              </div>
            </div>

            {/* 3. COMMUNITY VERIFICATION & RESOLUTION PIPELINE CARD (UNDER REAL-TIME TRAVELER IMPACT) */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 sm:p-6 shadow-xs space-y-3.5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
                  {language === 'HI' ? 'सत्यापन व समाधान प्रक्रिया' : 'Verification Pipeline'}
                </h4>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-900/60">
                  3-Tier Validation
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300 font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">1</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">AI Evidence Inspection</h5>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Uploaded photos are analyzed for wheelchair obstacle severity.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">2</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Peer Community Audit</h5>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Nearby travelers & verified volunteers confirm ground status.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">3</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Authority Resolution</h5>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Station superintendents and municipal teams dispatch repairs.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BARRIER REPORTS HISTORY SECTION */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
          
          {/* Header & Status Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#6b21a8] dark:text-purple-400" />
                {language === 'HI' ? 'मेरी सबमिट की गई बाधा रिपोर्टों का इतिहास' : 'My Reported Barriers History'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {language === 'HI' 
                  ? 'अपनी सभी सबमिट की गई बाधाओं की लाइव सत्यापन स्थिति, अंक और समाधान ट्रैक करें।' 
                  : 'Track the real-time validation status, resolution details, and earned YatraPoints for all your reported obstacles.'
                }
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setHistoryFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'ALL'
                    ? 'bg-[#6b21a8] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>All Reports</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {reportsHistory.length}
                </span>
              </button>

              <button
                onClick={() => setHistoryFilter('VERIFIED')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified / Resolved</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  {countVerified}
                </span>
              </button>

              <button
                onClick={() => setHistoryFilter('UNDER_VERIFICATION')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'UNDER_VERIFICATION'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Under Verification</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  {countPending}
                </span>
              </button>

              <button
                onClick={() => setHistoryFilter('REJECTED')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejected</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                  {countRejected}
                </span>
              </button>
            </div>
          </div>

          {/* History List Items */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <FileCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No barrier reports in this category.</p>
              </div>
            ) : (
              filteredHistory.map((report) => {
                const isVerified = report.status === 'VERIFIED';
                const isPending = report.status === 'UNDER_VERIFICATION';
                const isRejected = report.status === 'REJECTED';

                return (
                  <div
                    key={report.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                      isVerified
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-300'
                        : isPending
                          ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/40 hover:border-amber-300'
                          : 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/40 opacity-80'
                    }`}
                  >
                    {/* Top row: Title, Badges, Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300 uppercase">
                          {report.type}
                        </span>

                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {report.title}
                        </h4>

                        {report.hasPhoto && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <Camera className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            Photo Attached
                          </span>
                        )}
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>VERIFIED & RESOLVED</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 shadow-2xs animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>UNDER VERIFICATION</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>REJECTED / DISMISSED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Info: Location, Timestamp, Points */}
                    <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs border-y border-slate-100 dark:border-slate-800/80 py-2.5">
                      <div className="flex items-center gap-4 flex-wrap text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          {report.place}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">Reported: {report.date}</span>
                      </div>

                      <div className="font-black text-xs">
                        <span className={`px-2.5 py-0.5 rounded-lg ${
                          isVerified 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : isPending 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {report.points}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Info: Live Verification Status & Resolution Detail */}
                    <div className="space-y-1 text-xs">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Status Note: {report.statusNote}</span>
                      </p>
                      {report.resolutionNote && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-3 font-medium">
                          Action: {report.resolutionNote}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Barrier Reporting FAQ Section */}
        <div className="max-w-5xl mx-auto mt-12">
          <FaqSection 
            title={language === 'HI' ? 'बाधा रिपोर्टिंग FAQ' : 'Barrier Reporting FAQs'}
            subtitle={language === 'HI' 
              ? 'जानिए आपकी सबमिट की गई रिपोर्ट से साथी यात्रियों को कैसे सुरक्षित मार्गदर्शन मिलता है' 
              : 'Learn how reported obstacles verify routes, update maps in real-time, and ensure accessibility for all'
            }
            customFaqs={[
              {
                category: 'Verification Model',
                badge: 'Auditor Reviews',
                question: language === 'HI' 
                  ? 'मेरी सबमिट की गई रिपोर्ट का सत्यापन कौन करता है?' 
                  : 'Who verifies and approves submitted barrier reports?',
                answer: language === 'HI'
                  ? 'रिपोर्ट का सत्यापन 3 परतों में होता है: 1) AI इमेज साक्ष्य जांच 2) समुदाय के विश्वसनीय समीक्षक और 3) स्थानीय नगर निगम/स्टेशन प्राधिकरण।'
                  : 'Reports undergo a 3-tier verification model: 1) Automated AI photo verification, 2) Trusted community reviewer votes, and 3) Station/municipal auditor sign-offs.'
              },
              {
                category: 'Trust & Verification',
                badge: 'Photo Evidence',
                question: language === 'HI' 
                  ? 'रिपोर्ट के साथ फोटो साक्ष्य अपलोड करने का क्या महत्व है?' 
                  : 'Why is uploading photo evidence important for barrier reports?',
                answer: language === 'HI'
                  ? 'फोटो साक्ष्य से बैकएंड AI वेरिफिकेशन तुरंत रिपोर्ट की प्रामाणिकता की जांच करता है। फोटो संलग्न होने से कॉन्फिडेंस स्कोर 85%+ हो जाता है जिससे अन्य व्हीलचेयर यात्रियों के नक्शे तुरंत री-रूट हो जाते हैं।'
                  : 'Photo evidence lets automated AI & community auditors validate the barrier instantly. Reports with photos achieve an 85%+ confidence score, enabling real-time map rerouting for wheelchair users.'
              },
              {
                category: 'Live Rerouting',
                badge: 'Navigation',
                question: language === 'HI' 
                  ? 'बाधा रिपोर्ट करने के बाद नक्शों पर क्या बदलाव होता है?' 
                  : 'What happens to live route guidance once an obstacle is reported?',
                answer: language === 'HI'
                  ? 'जैसे ही कोई बाधा दर्ज होती है, डायनामिक रूट इंजन प्रभावित मार्ग को "अवरुद्ध" चिह्नित कर देता है और स्टेप-फ्री यात्रियों को स्वचालित रूप से निकटतम लिफ्ट या ढलान की ओर मोड़ देता है।'
                  : 'As soon as an obstacle is recorded, the Dynamic Route Engine marks the path as hindered and immediately calculates alternative step-free paths with working elevators and low-incline ramps.'
              }
            ]}
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}
