'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Accessibility, 
  Eye, 
  CheckCircle2, 
  Save, 
  Compass,
  Award,
  Gift,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function AccessibilityProfilePage() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileId, setProfileId] = useState('default');
  
  // Loyalty Points state
  const [loyaltyPoints, setLoyaltyPoints] = useState(350);
  const [loyaltyLevel, setLoyaltyLevel] = useState('Level 2 Accessibility Champion');

  // Profile settings
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [preferStepFree, setPreferStepFree] = useState(true);
  const [preferRestStops, setPreferRestStops] = useState(false);
  const [walkingLimit, setWalkingLimit] = useState(500);
  const [routeStyle, setRouteStyle] = useState('MOST_ACCESSIBLE');
  
  // Nested checkboxes
  const [highContrast, setHighContrast] = useState(false);
  const [brailleSigns, setBrailleSigns] = useState(false);
  const [audioDescriptions, setAudioDescriptions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.profiles.get('default');
        setProfileId(data.id);
        setAvoidStairs(data.avoid_stairs);
        setPreferStepFree(data.prefer_step_free);
        setPreferRestStops(data.prefer_rest_stops);
        setWalkingLimit(data.walking_limit_meters || 500);
        setRouteStyle(data.preferred_route_style);
        setHighContrast(data.vision_preferences?.high_contrast || false);
        setBrailleSigns(data.vision_preferences?.braille_signs || false);
        setAudioDescriptions(data.hearing_preferences?.audio_descriptions || false);
      } catch (err) {
        console.log('No backend profile found, using client defaults.');
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setLoading(true);

    try {
      await api.profiles.update(profileId, {
        avoid_stairs: avoidStairs,
        prefer_step_free: preferStepFree,
        prefer_rest_stops: preferRestStops,
        walking_limit_meters: walkingLimit,
        preferred_route_style: routeStyle as any,
        vision_preferences: { high_contrast: highContrast, braille_signs: brailleSigns },
        hearing_preferences: { audio_descriptions: audioDescriptions }
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <User className="h-7 w-7 text-[#6b21a8] dark:text-purple-400" />
                {language === 'HI' ? 'पहुंच प्रोफ़ाइल व लॉयल्टी रिवार्ड्स' : 'Accessibility Profile & Loyalty Rewards'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {language === 'HI' 
                  ? 'अपनी व्यक्तिगत गतिशीलता सहायता सेटिंग्स और अर्जित YatraPoints प्रबंधित करें।' 
                  : 'Manage your personal mobility preferences and track your earned YatraPoints rewards.'
                }
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[#6b21a8] dark:text-purple-300 text-xs font-extrabold shrink-0">
              <Sparkles className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
              <span>{language === 'HI' ? 'व्यक्तिगत यात्रा प्रोफ़ाइल' : 'Personalized Travel Profile'}</span>
            </div>
          </div>

          {/* 2-COLUMN FULL PAGE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ACCESSIBILITY PREFERENCES FORM (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {success && (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 shadow-xs animate-fade-in">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">{language === 'HI' ? 'पहुंच सेटिंग्स सहेजी गईं' : 'Profile Settings Saved'}</h4>
                    <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-1">
                      {language === 'HI' 
                        ? 'आपके मार्ग एल्गोरिदम और नक्शे आपके अद्यतन सहायता मापदंडों के अनुरूप तैयार किए गए हैं।' 
                        : 'Your routing algorithms and maps have been tailored to your updated assistance parameters.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 text-rose-700 dark:text-rose-455 flex items-center gap-3">
                  <Save className="h-6 w-6 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">{language === 'HI' ? 'सहेजने में त्रुटि' : 'Save Error'}</h4>
                    <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* PROFILE SETTINGS FORM */}
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. Mobility Preferences */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 transition-colors">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <Accessibility className="h-5 w-5 text-[#6b21a8] dark:text-purple-400" />
                    {language === 'HI' ? 'गतिशीलता सहायता सेटिंग्स' : 'Mobility Assistance Settings'}
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={avoidStairs}
                        onChange={(e) => setAvoidStairs(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'सीढ़ियों से बचें' : 'Avoid Stairs'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'पैदल चलने के मार्गों पर सीढ़ियों, सीढ़ियों या ऊंचे फुटपाथों से बचें।' : 'Bypass any stairs, ladders or high curbs along walking routes.'}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={preferStepFree}
                        onChange={(e) => setPreferStepFree(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'सीढ़ी-मुक्त मार्ग आवश्यक हैं' : 'Require Step-Free Paths'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'व्हीलचेयर-अनुकूल रैंप, एस्केलेटर और समतल रास्तों को प्राथमिकता दें।' : 'Prioritize wheelchair-friendly ramps, escalators, and flat walkways.'}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={preferRestStops}
                        onChange={(e) => setPreferRestStops(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'नियमित विश्राम स्टॉप को प्राथमिकता दें' : 'Prefer Regular Rest Stops'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'पैदल चलने वाले रास्तों पर आराम करने वाले बेंचों या सहायता कियोस्क को उजागर करें।' : 'Highlight rest benches or assistance kiosks along walking paths.'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Walking limit input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {language === 'HI' ? 'अधिकतम निरंतर पैदल चलने की सीमा (मीटर)' : 'Maximum Continuous Walk Limit (meters)'}
                    </label>
                    <input
                      type="number"
                      value={walkingLimit}
                      onChange={(e) => setWalkingLimit(Number(e.target.value))}
                      min={50}
                      max={10000}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* 2. Routing Styles */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <Compass className="h-5 w-5 text-[#6b21a8] dark:text-purple-400" />
                    {language === 'HI' ? 'पसंदीदा मार्ग शैली' : 'Preferred Routing Style'}
                  </h3>
                  
                  <select
                    value={routeStyle}
                    onChange={(e) => setRouteStyle(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-3.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="MOST_ACCESSIBLE">{language === 'HI' ? 'सबसे सुलभ मार्ग (न्यूनतम बाधाएं)' : 'Most Accessible Path (Lowest barriers)'}</option>
                    <option value="LEAST_WALKING">{language === 'HI' ? 'न्यूनतम पैदल दूरी' : 'Least Walking Distance'}</option>
                    <option value="FASTEST_ACCESSIBLE">{language === 'HI' ? 'सबसे तेज सुलभ मार्ग' : 'Fastest Accessible Path'}</option>
                    <option value="BALANCED">{language === 'HI' ? 'संतुलित मार्ग (इष्टतम दूरी और पहुंच)' : 'Balanced Route (Optimal distance & access)'}</option>
                  </select>
                </div>

                {/* 3. Vision & Auditory Assistance */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <Eye className="h-5 w-5 text-[#6b21a8] dark:text-purple-400" />
                    {language === 'HI' ? 'संवेदी सहायता साधन' : 'Sensory Assistance Aids'}
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'हाई कंट्रास्ट इंटरफ़ेस' : 'High Contrast Interface'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'पूरे डैशबोर्ड में उच्च रंग कंट्रास्ट और पठनीय फ़ॉन्ट सक्षम करें।' : 'Enable high color contrast and readable typography across the dashboard.'}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={brailleSigns}
                        onChange={(e) => setBrailleSigns(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'ब्रेल साइनेज वाले स्थानों को फ़िल्टर करें' : 'Filter places with Braille signage'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'गंतव्य स्थानों पर स्पर्शनीय संकेतकों और ब्रेल विवरणों की उपस्थिति सत्यापित करें।' : 'Verify presence of tactile indicators and Braille descriptions at destinations.'}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                      <input
                        type="checkbox"
                        checked={audioDescriptions}
                        onChange={(e) => setAudioDescriptions(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-[#6b21a8] focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200">{language === 'HI' ? 'ऑडियो वर्णनात्मक अलर्ट' : 'Audio Descriptive Alerts'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {language === 'HI' ? 'नेविगेशन मार्गदर्शन के दौरान श्रवण घोषणाएं प्राप्त करें।' : 'Receive auditory screen reader announcements during navigation guidance.'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#6b21a8] text-white rounded-full py-4 text-xs font-black hover:bg-[#581c87] hover:shadow-xl disabled:opacity-60 transition-all cursor-pointer shadow-purple-200"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'HI' ? 'सहेजा जा रहा है...' : 'Saving Profile...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{language === 'HI' ? 'पहुंच सेटिंग्स सहेजें' : 'Save Accessibility Settings'}</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* RIGHT COLUMN: LOYALTY REWARDS CENTER & BADGES (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* LOYALTY POINTS DISPLAY CARD */}
              <div className="rounded-3xl bg-gradient-to-r from-[#6b21a8] via-[#7e22ce] to-[#581c87] p-6 text-white shadow-xl relative overflow-hidden space-y-5">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/20">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    {language === 'HI' ? 'कम्युनिटी रिवार्ड्स बैलेंस' : 'Loyalty Rewards Center'}
                  </div>
                  <span className="text-[9.5px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                    Level 2 Champion
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">
                    {language === 'HI' ? 'आपका YatraPoints बैलेंस' : 'Your YatraPoints Balance'}
                  </p>
                  <div className="text-4xl font-black text-amber-300 my-1 flex items-center gap-2">
                    <Award className="w-8 h-8 text-amber-300 fill-amber-300/30" />
                    <span>{loyaltyPoints}</span>
                    <span className="text-sm font-extrabold text-white">pts</span>
                  </div>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">
                    {language === 'HI'
                      ? 'बाधाओं की रिपोर्ट करने और समुदाय सत्यापन में भाग लेने से अर्जित।'
                      : 'Earned by reporting barriers, photo evidence, community posts & audits.'
                    }
                  </p>
                </div>

                {/* Earned Badges Grid */}
                <div className="pt-2 space-y-2 border-t border-white/15">
                  <h4 className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider">
                    {language === 'HI' ? 'अर्जित उपलब्धियां' : 'Unlocked Perks & Badges'}
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-black text-sm">
                        🏆
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white">Barrier Scout Badge</p>
                        <p className="text-[10px] text-purple-200">5 Community obstacle reports verified</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 font-black text-sm">
                        📸
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white">Photo Auditor Badge</p>
                        <p className="text-[10px] text-purple-200">100% Photo evidence verification accuracy</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-200 flex items-center justify-center shrink-0 font-black text-sm">
                        🎁
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-amber-300">15% Transit Pass Voucher</p>
                        <p className="text-[10px] text-purple-200">Redeemable at 500 YatraPoints target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HOW TO EARN REWARDS */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {language === 'HI' ? 'और अधिक अंक कैसे अर्जित करें' : 'How to Earn More YatraPoints'}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center justify-center">+50</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Standard Barrier Report</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Per report</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-black text-xs flex items-center justify-center">+100</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Photo Evidence Upload</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Double Pts</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-black text-xs flex items-center justify-center">+25</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Write Community Post</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">Per post</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-black text-xs flex items-center justify-center">+10</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Community Audit Vote</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Per vote</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
