'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
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

      if (file) {
        await api.reports.uploadEvidence(report.id, file);
      }

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

      <main className="flex-1 px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                {language === 'HI' ? 'पहुंच बाधा रिपोर्ट करें' : 'Report Accessibility Barrier'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                {language === 'HI' 
                  ? 'बाधाओं, टूटी हुई लिफ्टों, या उबड़-खाबड़ रास्तों का दस्तावेजीकरण करके समुदाय की सहायता करें।' 
                  : 'Help the community by documenting obstacles, broken elevators, or unpaved pathways.'
                }
              </p>
            </div>

            {success && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{language === 'HI' ? 'रिपोर्ट सफलतापूर्वक सबमिट की गई' : 'Report Submitted Successfully'}</h4>
                  <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-1">
                    {language === 'HI' 
                      ? 'हमारे नगर निगम लेखा परीक्षकों और समुदाय के समीक्षाकर्ताओं को सूचित कर दिया गया है। धन्यवाद!' 
                      : 'Our municipal auditors and community trusted reviewers have been notified. Thank you!'
                    }
                  </p>
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

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm space-y-5 transition-colors">
              
              {/* Type select */}
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
                        py-2.5 rounded-xl border text-xs font-bold transition-all
                        ${reportType === type 
                          ? 'border-violet-650 bg-violet-50/20 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300' 
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
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Location Select (Demo placeholder) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === 'HI' ? 'स्थान / स्मारक' : 'Location / Monument'}
                </label>
                <div className="relative">
                  <select
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 py-3 pl-10 pr-4 text-xs font-medium text-slate-700 dark:text-slate-350 focus:border-violet-500 focus:outline-none appearance-none"
                  >
                    <option value="Qutub Minar">{language === 'HI' ? 'कुतुब मीनार प्रांगण' : 'Qutub Minar Courtyard'}</option>
                    <option value="India Gate">{language === 'HI' ? 'इंडिया गेट सेंट्रल पार्क' : 'India Gate central park'}</option>
                    <option value="Lotus Temple">{language === 'HI' ? 'लोटस टेम्पल पार्क' : 'Lotus Temple lawns'}</option>
                  </select>
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-405 dark:text-slate-500" />
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
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              {/* Evidence File Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === 'HI' ? 'फोटो साक्ष्य संलग्न करें (वैकल्पिक)' : 'Attach Photo Evidence (Optional)'}
                </label>
                <div className="mt-1 flex justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 shadow-sm animate-none">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-slate-500">
                      <label className="relative cursor-pointer rounded-md font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-750">
                        <span>{language === 'HI' ? 'एक फ़ाइल अपलोड करें' : 'Upload a file'}</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="sr-only" 
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                    {file && (
                      <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-md border border-violet-100/50 dark:border-violet-900/30 inline-block">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-violet-650 hover:bg-violet-700 text-white rounded-xl py-3.5 text-xs font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'HI' ? 'रिपोर्ट सबमिट की जा रही है...' : 'Submitting Report...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{language === 'HI' ? 'सत्यापन रिपोर्ट सबमिट करें' : 'Submit Verification Report'}</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </main>

        <Footer />
    </div>
  );
}
