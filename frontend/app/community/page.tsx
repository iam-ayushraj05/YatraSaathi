'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MapPin, 
  Plus
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';

export default function Community() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const posts = [
    {
      id: 'po1',
      author: 'Kabir Mehta',
      role: language === 'HI' ? 'व्हीलचेयर यात्री' : 'Wheelchair Traveller',
      avatar: 'KM',
      title: language === 'HI' ? 'दिल्ली मेट्रो रेड लाइन पहुंच गाइड' : 'Guide to Delhi Metro Red Line Accessibility',
      content: language === 'HI' 
        ? 'अधिकांश रेड लाइन स्टेशनों पर स्पर्शनीय टाइलें अपडेट की गई हैं। कनॉट प्लेस में लिफ्ट पूरी तरह से चालू हैं, लेकिन ध्यान रखें कि गेट 3 लिफ्ट को सहायता कार्ड टैप की आवश्यकता होती है।'
        : 'Most Red Line stations now have tactile paving updated. Elevators at Connaught Place are fully operational, but keep in mind that the gate 3 lift needs assistance card tap.',
      likes: 24,
      replies: 7,
      place: language === 'HI' ? 'कनॉट प्लेस मेट्रो स्टेशन' : 'Connaught Place Station',
      date: language === 'HI' ? '2 घंटे पहले' : '2 hours ago'
    },
    {
      id: 'po2',
      author: 'Elena Rostova',
      role: language === 'HI' ? 'लेखा परीक्षक साथी' : 'Auditor Fellow',
      avatar: 'ER',
      title: language === 'HI' ? 'लोधी गार्डन शौचालय ऑडिट विवरण' : 'Lodhi Gardens Restrooms Audited',
      content: language === 'HI'
        ? 'हमने आज लोधी गार्डन का पहुंच ऑडिट पूरा किया। गेट 2 पूरी तरह से बाधा मुक्त है। रैंप मानक 1:12 ढलान के हैं। दो सुलभ वाशरूम चालू पाए गए।'
        : 'We finished an accessibility audit of Lodhi Gardens today. Entrance 2 is completely barrier-free. Ramps are standard 1:12 slope. Two accessible washrooms found operational.',
      likes: 42,
      replies: 12,
      place: language === 'HI' ? 'लोधी गार्डन' : 'Lodhi Gardens',
      date: language === 'HI' ? '1 दिन पहले' : '1 day ago'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6 text-violet-650 dark:text-violet-400" />
                {t('community')}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                {language === 'HI' 
                  ? 'सहयात्रियों से जुड़ें, अनुभव साझा करें और सत्यापित समीक्षाएं पढ़ें।' 
                  : 'Connect with fellow travelers, share experiences, and read verified reviews.'
                }
              </p>
            </div>
            
            <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4" />
              <span>{language === 'HI' ? 'नया पोस्ट' : 'New Post'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Posts feed (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-750 dark:text-violet-300 font-bold flex items-center justify-center">
                        {post.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{post.role} • {post.date}</p>
                      </div>
                    </div>

                    {post.place && (
                      <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 px-2.5 py-1 rounded-lg border border-violet-100/50 dark:border-violet-900/30 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.place}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-4">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mt-2.5">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-900 pt-4 mt-5 text-[11px] text-slate-400 dark:text-slate-550 font-semibold">
                    <button className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes} {language === 'HI' ? 'पसंद' : 'Likes'}</span>
                    </button>
                    
                    <button className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies} {language === 'HI' ? 'उत्तर' : 'Replies'}</span>
                    </button>

                    <button className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors ml-auto">
                      <Share2 className="h-4 w-4" />
                      <span>{language === 'HI' ? 'साझा करें' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Guidelines/Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 shadow-sm space-y-4 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  {language === 'HI' ? 'समुदाय की स्थिति' : 'Community Standings'}
                </h4>
                <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-2">
                    <span>{language === 'HI' ? 'सत्यापित समीक्षक' : 'Verified Reviewers'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">142</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-2">
                    <span>{language === 'HI' ? 'सक्रिय ऑडिटेड स्मारक' : 'Active Audited Monuments'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'HI' ? 'सफल वैकल्पिक मार्ग' : 'Successful Detours Reported'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">308</span>
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
