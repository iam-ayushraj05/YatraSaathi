'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2,
  Award,
  Gift,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FaqSection from '../../components/common/FaqSection';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function Reports() {
  const { t, language } = useApp();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reportType, setReportType] = useState('BARRIER');
  const [placeName, setPlaceName] = useState('Qutub Minar');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userPoints, setUserPoints] = useState(350);
  const [earnedPoints, setEarnedPoints] = useState(50);

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
        title,
        description: desc,
        location: { lat: 28.5244, lng: 77.1855 } // Qutub Minar center
      });

      let added = 50; // Base loyalty points for reporting
      if (file) {
        await api.reports.uploadEvidence(report.id, file);
        added = 100; // Bonus loyalty points for photo evidence
      }

      setEarnedPoints(added);
      setUserPoints(prev => prev + added);
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
                ? 'बाधाओं की रिपोर्ट करें, यात्रियों को सुरक्षित रखें और हर रिपोर्ट पर YatraPoints कमाएं' 
                : 'Report obstacles to protect travelers & earn YatraPoints redeemable for transit discounts.'
              }
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[#6b21a8] dark:text-purple-300 text-xs font-extrabold shrink-0">
            <Sparkles className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
            <span>{language === 'HI' ? '100% कम्युनिटी सत्यापित' : '100% Community Verified'}</span>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: REPORT FORM ON LEFT, LOYALTY POINTS SYSTEM ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: REPORT BARRIER FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SUCCESS REWARD NOTIFICATION */}
            {success && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-5 text-emerald-800 dark:text-emerald-300 space-y-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{language === 'HI' ? 'रिपोर्ट सबमिट की गई व रिवार्ड्स क्रेडिट किए गए!' : 'Report Submitted & Rewards Credited!'}</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {language === 'HI' 
                        ? 'नगर निगम परीक्षकों को सूचित किया गया है। धन्यवाद!' 
                        : 'Municipal auditors and community reviewers have been notified.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      +{earnedPoints} YatraPoints Added!
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-950 px-2.5 py-1 rounded-lg shadow-xs">
                    New Balance: {userPoints} pts
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 text-rose-700 dark:text-rose-450 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{language === 'HI' ? 'सबमिशन त्रुटि' : 'Submission Error'}</h4>
                  <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* REPORT FORM CARD */}
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 transition-colors">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'HI' ? 'बाधा विवरण दर्ज करें' : 'Submit Obstacle Details'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'HI' 
                    ? 'अपनी जानकारी भरें और तुरंत YatraPoints रिवार्ड्स पाएं' 
                    : 'Fill in details below and instantly earn YatraPoints upon submission.'
                  }
                </p>
              </div>

              {/* Category */}
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

              {/* Title */}
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

              {/* Location Select */}
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
                    <option value="Qutub Minar">{language === 'HI' ? 'कुतुब मीनार प्रांगण' : 'Qutub Minar Courtyard'}</option>
                    <option value="India Gate">{language === 'HI' ? 'इंडिया गेट सेंट्रल पार्क' : 'India Gate central park'}</option>
                    <option value="Lotus Temple">{language === 'HI' ? 'लोटस टेम्पल पार्क' : 'Lotus Temple lawns'}</option>
                    <option value="Rajiv Chowk Metro">{language === 'HI' ? 'राजीव चौक मेट्रो स्टेशन' : 'Rajiv Chowk Metro Station'}</option>
                  </select>
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              {/* Description */}
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

              {/* Evidence File Picker with Loyalty Points Callout */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {language === 'HI' ? 'फोटो साक्ष्य संलग्न करें (+50 बोनस पॉइंट)' : 'Attach Photo Evidence (+50 Bonus Points)'}
                  </label>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                    Earn +100 Total Pts
                  </span>
                </div>

                <div className="mt-1 flex justify-center rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 px-6 py-6 transition-all hover:bg-purple-50/40 dark:hover:bg-purple-950/30">
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 text-[#6b21a8] dark:text-purple-300 shadow-sm">
                      <Camera className="h-5 w-5" />
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
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG up to 10MB (Triggers +100 YatraPoints)</p>
                    </div>
                    {file && (
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900 inline-block">
                        ✓ Attached: {file.name} (+100 Pts Ready)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-full py-3.5 text-xs font-extrabold hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer shadow-purple-200"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'HI' ? 'रिपोर्ट सबमिट की जा रही है...' : 'Submitting Report...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{language === 'HI' ? 'रिपोर्ट सबमिट करें और लॉयल्टी पॉइंट पाएं' : 'Submit Report & Claim Loyalty Points'}</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: LOYALTY POINTS REWARDS SYSTEM (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* LOYALTY BALANCE CARD (COMPACT SPACING) */}
            <div className="rounded-3xl bg-gradient-to-r from-[#6b21a8] via-[#7e22ce] to-[#581c87] p-4 sm:p-5 text-white shadow-xl relative overflow-hidden space-y-3">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/20">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  {language === 'HI' ? 'लॉयल्टी रिवार्ड्स' : 'Loyalty Rewards'}
                </div>
                <span className="text-[9.5px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Level 2 Champion
                </span>
              </div>

              <div>
                <p className="text-[9.5px] font-black uppercase tracking-widest text-purple-200">
                  {language === 'HI' ? 'आपका YatraPoints बैलेंस' : 'Your Loyalty Balance'}
                </p>
                <div className="text-3xl font-black text-amber-300 my-0.5 flex items-center gap-2">
                  <Award className="w-7 h-7 text-amber-300 fill-amber-300/30" />
                  <span>{userPoints}</span>
                  <span className="text-xs font-extrabold text-white">pts</span>
                </div>
                <p className="text-[11px] text-purple-100 font-medium leading-snug">
                  {language === 'HI'
                    ? 'हर सत्यापन और बाधा रिपोर्ट पर लॉयल्टी पॉइंट अर्जित होते हैं।'
                    : 'Earned by contributing obstacle reports and verifying community routes.'
                  }
                </p>
              </div>

              {/* EARNINGS RULES BREAKDOWN */}
              <div className="space-y-1.5 pt-1.5 border-t border-white/15">
                <h4 className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider">
                  {language === 'HI' ? 'पॉइंट कैसे अर्जित करें' : 'How You Earn Points'}
                </h4>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-[11px] shrink-0">
                        +50
                      </div>
                      <span className="text-[11.5px] font-bold text-white">
                        {language === 'HI' ? 'मानक रिपोर्ट' : 'Standard Barrier Report'}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-purple-200 font-bold">Per report</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-black text-[11px] shrink-0">
                        +100
                      </div>
                      <span className="text-[11.5px] font-bold text-white">
                        {language === 'HI' ? 'फोटो साक्ष्य बोनस' : 'Photo Evidence Upload'}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-emerald-300 font-bold">Double points</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-400/20 text-indigo-300 flex items-center justify-center font-black text-[11px] shrink-0">
                        +25
                      </div>
                      <span className="text-[11.5px] font-bold text-white">
                        {language === 'HI' ? 'कम्युनिटी पोस्ट / ब्लॉग' : 'Write Community Post / Blog'}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-indigo-300 font-bold">Per post</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-400/20 text-purple-200 flex items-center justify-center font-black text-[11px] shrink-0">
                        +10
                      </div>
                      <span className="text-[11.5px] font-bold text-white">
                        {language === 'HI' ? 'कम्युनिटी वोटिंग' : 'Community Vote / Audit'}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-purple-200 font-bold">Per vote</span>
                  </div>
                </div>
              </div>

              {/* REDEMPTION PERKS CARD */}
              <div className="pt-1">
                <div className="p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-amber-300" />
                      {language === 'HI' ? 'अगला रिवार्ड अनलॉक' : 'Next Perk Available'}
                    </span>
                    <span className="text-[9.5px] font-bold text-purple-200">500 pts target</span>
                  </div>
                  <p className="text-[10.5px] text-purple-100 leading-snug">
                    {language === 'HI' 
                      ? '500 YatraPoints पर सुलभ मेट्रो पास में 15% छूट कूपन पाएं!' 
                      : 'Get 15% discount voucher on accessible metro passes at 500 YatraPoints!'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* TRUST & VERIFICATION BADGES */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
                {language === 'HI' ? 'आपकी अर्जित उपलब्धियां' : 'Your Unlocked Badges'}
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center font-black shrink-0">
                    🏆
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Barrier Scout</h5>
                    <p className="text-[10px] text-slate-500 font-medium">5 Verified obstacle contributions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black shrink-0">
                    📸
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Photo Auditor</h5>
                    <p className="text-[10px] text-slate-500 font-medium">100% High confidence uploads</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Barrier Reporting & Rewards FAQ Section */}
        <div className="max-w-5xl mx-auto mt-12">
          <FaqSection 
            title={language === 'HI' ? 'बाधा रिपोर्टिंग व लॉयल्टी पॉइंट FAQ' : 'Barrier Reporting & Loyalty Rewards FAQs'}
            subtitle={language === 'HI' 
              ? 'जानिए आपकी सबमिट की गई रिपोर्ट से आपको लॉयल्टी पॉइंट कैसे मिलते हैं और वे कैसे भुनाए जाते हैं' 
              : 'Learn how reported obstacles earn YatraPoints, verified community trust scores, and transit discounts'
            }
            customFaqs={[
              {
                category: 'Rewards Program',
                badge: 'Loyalty Points',
                question: language === 'HI' 
                  ? 'बाधाओं की रिपोर्ट करने पर मुझे कितने लॉयल्टी पॉइंट (YatraPoints) मिलते हैं?' 
                  : 'How many Loyalty Points do I earn for reporting accessibility barriers?',
                answer: language === 'HI'
                  ? 'प्रत्येक बुनियादी रिपोर्ट पर आपको 50 YatraPoints मिलते हैं। यदि आप फोटो साक्ष्य संलग्न करते हैं, तो आपको +100 YatraPoints मिलते हैं! नगर निगम परीक्षकों द्वारा सत्यापन के बाद अतिरिक्त 50 बोनस पॉइंट क्रेडिट किए जाते हैं।'
                  : 'You earn +50 YatraPoints for a standard report. Adding photo evidence doubles your reward to +100 YatraPoints! Once verified by municipal auditors, an extra +50 bonus is credited.'
              },
              {
                category: 'Redemption',
                badge: 'Travel Perks',
                question: language === 'HI' 
                  ? 'मैं अपने YatraPoints का उपयोग कहाँ और कैसे कर सकता हूँ?' 
                  : 'How and where can I redeem my earned YatraPoints?',
                answer: language === 'HI'
                  ? 'आप अपने YatraPoints को एक्सेसिबल मेट्रो/बस पास पर 15%-25% की छूट, मुफ़्त YatraMitra AI वॉइस गाइडेंस सेशन्स, और पार्टनर एक्सेसिबिलिटी किट्स के लिए भुना सकते हैं।'
                  : 'YatraPoints can be redeemed for 15%-25% discounts on accessible transit passes, unlocked YatraMitra AI voice sessions, and priority community verifier badges.'
              },
              {
                category: 'Trust & Verification',
                badge: 'Photo Evidence',
                question: language === 'HI' 
                  ? 'रिपोर्ट के साथ फोटो साक्ष्य अपलोड करने पर बोनस पॉइंट क्यों मिलते हैं?' 
                  : 'Why does uploading photo evidence earn bonus Loyalty Points?',
                answer: language === 'HI'
                  ? 'फोटो साक्ष्य से बैकएंड AI वेरिफिकेशन तुरंत रिपोर्ट की प्रामाणिकता की जांच करता है। फोटो संलग्न होने से कॉन्फिडेंस स्कोर 85%+ हो जाता है जिससे अन्य व्हीलचेयर यात्रियों के नक्शे तुरंत री-रूट हो जाते हैं।'
                  : 'Photo evidence lets automated AI & community auditors validate the barrier instantly. Reports with photos achieve an 85%+ confidence score, enabling real-time map rerouting for wheelchair users.'
              },
              {
                category: 'Verification Model',
                badge: 'Auditor Reviews',
                question: language === 'HI' 
                  ? 'मेरी सबमिट की गई रिपोर्ट का सत्यापन कौन करता है?' 
                  : 'Who verifies and approves submitted barrier reports?',
                answer: language === 'HI'
                  ? 'रिपोर्ट का सत्यापन 3 परतों में होता है: 1) AI इमेज साक्ष्य जांच 2) समुदाय के विश्वसनीय समीक्षक और 3) स्थानीय नगर निगम/स्टेशन प्राधिकरण।'
                  : 'Reports undergo a 3-tier verification model: 1) Automated AI photo verification, 2) Trusted community reviewer votes, and 3) Station/municipal auditor sign-offs.'
              }
            ]}
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}
