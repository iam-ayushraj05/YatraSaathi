'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Gift, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Coins,
  Ticket,
  Bot,
  Users,
  Compass
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FaqSection from '../../components/common/FaqSection';
import { useApp } from '../../context/AppContext';

export default function LoyaltyRewardsPage() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [points, setPoints] = useState(350);

  const earnRules = [
    {
      pts: '+50',
      title: language === 'HI' ? 'मानक बाधा रिपोर्ट' : 'Standard Barrier Report',
      desc: language === 'HI' ? 'सत्यापित बाधा, टूटी लिफ्ट या सीढ़ी अवरोध सबमिट करें।' : 'Submit a verified obstacle, broken elevator, or ramp blockage.',
      badge: 'Per Report',
      color: 'amber',
      link: '/reports'
    },
    {
      pts: '+100',
      title: language === 'HI' ? 'फोटो साक्ष्य अपलोड' : 'Photo Evidence Upload',
      desc: language === 'HI' ? 'AI और समुदाय समीक्षा के लिए स्पष्ट फोटो प्रमाण संलग्न करें।' : 'Attach clear photo proof for automated AI and community verification.',
      badge: 'Double Pts',
      color: 'emerald',
      link: '/reports'
    },
    {
      pts: '+25',
      title: language === 'HI' ? 'कम्युनिटी पोस्ट / यात्रा गाइड' : 'Community Post / Guide',
      desc: language === 'HI' ? 'सुलभ यात्रा सुझाव और विस्तृत स्टेशन अनुभव साझा करें।' : 'Share accessible travel tips and step-free navigation experiences.',
      badge: 'Per Post',
      color: 'indigo',
      link: '/community'
    },
    {
      pts: '+10',
      title: language === 'HI' ? 'कम्युनिटी ऑडिट व वोटिंग' : 'Community Audit & Vote',
      desc: language === 'HI' ? 'साथी यात्रियों द्वारा रिपोर्ट की गई बाधाओं की स्थिति की पुष्टि करें।' : 'Confirm or dispute live obstacle statuses reported by fellow travelers.',
      badge: 'Per Vote',
      color: 'purple',
      link: '/community'
    },
    {
      pts: '+150',
      title: language === 'HI' ? 'स्टेशन पूर्ण सुलभता ऑडिट' : 'Full Station Wheelchair Audit',
      desc: language === 'HI' ? 'मेट्रो/रेलवे स्टेशन के सभी रैंप और लिफ्टों का संपूर्ण सर्वेक्षण करें।' : 'Complete an end-to-end accessibility and tactile route checklist for a transit hub.',
      badge: 'Special Bonus',
      color: 'pink',
      link: '/reports'
    }
  ];

  const badges = [
    {
      icon: '🏆',
      title: 'Barrier Scout',
      desc: '5 Verified obstacle contributions',
      unlocked: true,
      date: 'Unlocked 12 Aug 2026'
    },
    {
      icon: '📸',
      title: 'Photo Auditor',
      desc: '100% High confidence photo uploads',
      unlocked: true,
      date: 'Unlocked 15 Aug 2026'
    },
    {
      icon: '🛡️',
      title: 'Route Sentinel',
      desc: '10+ Community route votes validated',
      unlocked: true,
      date: 'Unlocked 18 Aug 2026'
    },
    {
      icon: '🌟',
      title: 'Station Pioneer',
      desc: 'First to audit a newly mapped transit hub',
      unlocked: false,
      progress: '2 / 3 stations mapped'
    },
    {
      icon: '👑',
      title: 'Accessibility Champion',
      desc: 'Top 5% contributor in Delhi NCR region',
      unlocked: false,
      progress: '350 / 500 YatraPoints'
    }
  ];

  const rewardsCatalog = [
    {
      id: 'r1',
      title: language === 'HI' ? '15% सुलभ मेट्रो पास छूट' : '15% Accessible Metro Pass Voucher',
      desc: language === 'HI' ? 'DMRC और सहयोगी नेटवर्क पर मासिक पास पर 15% छूट।' : '15% discount on accessible monthly smart card recharge across DMRC & partner transit.',
      cost: 500,
      category: 'Transit Pass',
      icon: Ticket,
      status: 'locked'
    },
    {
      id: 'r2',
      title: language === 'HI' ? 'YatraMitra AI असीमित वॉइस पास' : 'YatraMitra AI Voice Guidance Pass',
      desc: language === 'HI' ? '1 महीने के लिए असीमित रियल-टाइम वॉइस कॉपायलट नेविगेशन।' : 'Unlimited real-time hands-free voice copilot navigation for 30 days.',
      cost: 250,
      category: 'AI Assistant',
      icon: Bot,
      status: 'claimed'
    },
    {
      id: 'r3',
      title: language === 'HI' ? 'प्राथमिकता स्टेशन सहायक डिस्पैच' : 'Priority Station Assistant Dispatch',
      desc: language === 'HI' ? 'प्रमुख रेलवे स्टेशनों पर सुलभता सहायक की गारंटीकृत बुकिंग।' : 'Guaranteed priority assistance porter & wheelchair escort at major junctions.',
      cost: 400,
      category: 'Support',
      icon: Users,
      status: 'available'
    },
    {
      id: 'r4',
      title: language === 'HI' ? '25% इंटरसिटी सुलभ बस कूपन' : '25% Intercity Accessible Bus Ticket',
      desc: language === 'HI' ? 'राज्य सड़क परिवहन सुलभ वोल्वो बसों पर 25% की छूट।' : '25% off on state road transport wheelchair-lift equipped intercity buses.',
      cost: 800,
      category: 'Transit Pass',
      icon: Compass,
      status: 'locked'
    }
  ];

  const activityHistory = [
    {
      id: 'h1',
      title: language === 'HI' ? 'फोटो साक्ष्य रिपोर्ट स्वीकृत' : 'Photo evidence report approved',
      detail: language === 'HI' ? 'कुतुब मीनार मुख्य द्वार रैंप बाधा' : 'Qutub Minar main gate ramp obstacle',
      pts: '+100',
      date: 'Today, 02:40 PM',
      type: 'earn'
    },
    {
      id: 'h2',
      title: language === 'HI' ? 'मानक बाधा रिपोर्ट दर्ज' : 'Standard barrier report submitted',
      detail: language === 'HI' ? 'इंडिया गेट लिफ्ट #2 मरम्मत' : 'India Gate lift #2 maintenance notice',
      pts: '+50',
      date: 'Yesterday, 11:15 AM',
      type: 'earn'
    },
    {
      id: 'h3',
      title: language === 'HI' ? 'कम्युनिटी पोस्ट प्रकाशित' : 'Community accessibility guide published',
      detail: language === 'HI' ? 'राजीव चौक से कनाट प्लेस स्टेप-फ्री गाइड' : 'Rajiv Chowk to CP Step-Free Corridor Guide',
      pts: '+25',
      date: '17 Aug 2026',
      type: 'earn'
    },
    {
      id: 'h4',
      title: language === 'HI' ? 'कम्युनिटी ऑडिट वोट' : 'Community audit vote submitted',
      detail: language === 'HI' ? 'कश्मीरी गेट एस्केलेटर चालू स्थिति की पुष्टि' : 'Kashmere Gate escalator operational status verified',
      pts: '+10',
      date: '16 Aug 2026',
      type: 'earn'
    },
    {
      id: 'h5',
      title: language === 'HI' ? 'रिवार्ड भुनाया गया' : 'Reward perk redeemed',
      detail: language === 'HI' ? 'YatraMitra AI असीमित वॉइस पास' : 'YatraMitra AI Voice Guidance Pass (30 Days)',
      pts: '-250',
      date: '14 Aug 2026',
      type: 'spend'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-[#0c0e17] transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* TOP PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Award className="h-7 w-7 text-amber-500 fill-amber-400/20" />
                {language === 'HI' ? 'लॉयल्टी रिवार्ड्स केंद्र' : 'Loyalty Rewards Centre'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {language === 'HI' 
                  ? 'बाधाओं की रिपोर्ट करें, सुलभ मार्गों को सत्यापित करें, और रोमांचक यात्रा छूट व लाभ भुनाएं।' 
                  : 'Report obstacles, verify accessible routes, and redeem your earned YatraPoints for transit discounts & perks.'
                }
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold shrink-0">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Level 2 Champion (Top 10% Contributor)</span>
            </div>
          </div>

          {/* HERO BANNER: POINTS BALANCE & TIER PROGRESS */}
          <div className="rounded-3xl bg-gradient-to-r from-[#581c87] via-[#6b21a8] to-[#7e22ce] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-12 w-80 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left: Total Points & Tier */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider border border-white/20">
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>{language === 'HI' ? 'सक्रिय लॉयल्टी बैलेंस' : 'Active Loyalty Balance'}</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black text-amber-300 tracking-tight">
                    {points}
                  </span>
                  <span className="text-xl font-bold text-purple-200">YatraPoints</span>
                </div>

                <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed max-w-xl">
                  {language === 'HI'
                    ? 'शानदार काम! आपने बाधा रिपोर्ट और समुदाय सत्यापन से 350 अंक अर्जित किए हैं।'
                    : 'Great job, Aarav! You have earned 350 points by contributing obstacle reports and verifying step-free transit corridors.'
                  }
                </p>

                {/* Progress to Next Reward */}
                <div className="pt-2 max-w-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-200 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-300" />
                      Next Perk: 15% Metro Pass Voucher
                    </span>
                    <span className="text-amber-300">350 / 500 pts (70%)</span>
                  </div>
                  <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/15">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: '70%' }}
                    />
                  </div>
                  <p className="text-[11px] text-purple-200">
                    Earn 150 more points with 2 photo barrier reports to unlock your metro discount!
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Cards */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href="/reports"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all hover:scale-102 group text-white cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      +100
                    </div>
                    <div>
                      <h4 className="text-xs font-black group-hover:text-amber-300 transition-colors">
                        {language === 'HI' ? 'बाधा की फोटो रिपोर्ट करें' : 'Report Barrier with Photo'}
                      </h4>
                      <p className="text-[11px] text-purple-200">Earn +100 YatraPoints instantly</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-300 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/community"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all hover:scale-102 group text-white cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      +25
                    </div>
                    <div>
                      <h4 className="text-xs font-black group-hover:text-indigo-300 transition-colors">
                        {language === 'HI' ? 'कम्युनिटी पोस्ट लिखें' : 'Write Community Travel Post'}
                      </h4>
                      <p className="text-[11px] text-purple-200">Share tips & earn +25 points</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>

          {/* MAIN 2-COLUMN CONTENT: HOW TO EARN & BADGES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: HOW TO EARN POINTS & REDEEM VOUCHERS (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* HOW TO EARN SECTION */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    {language === 'HI' ? 'YatraPoints कैसे अर्जित करें' : 'How You Earn YatraPoints'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    5 Active Earning Activities
                  </span>
                </div>

                <div className="space-y-3">
                  {earnRules.map((rule, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-900/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1 mr-3">
                        <div className={`
                          w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs
                          ${rule.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300' :
                            rule.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' :
                            rule.color === 'indigo' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300' :
                            rule.color === 'pink' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                          }
                        `}>
                          {rule.pts}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#6b21a8] dark:group-hover:text-purple-300 transition-colors">
                              {rule.title}
                            </h4>
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {rule.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {rule.desc}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={rule.link}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-[#6b21a8] hover:text-white hover:border-[#6b21a8] transition-all shrink-0 inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* REDEEMABLE VOUCHERS CATALOG */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[#6b21a8] dark:text-purple-400" />
                    {language === 'HI' ? 'रिवार्ड्स व कूपन कैटलॉग' : 'Redeemable Rewards & Transit Perks'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    Transit & AI Benefits
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rewardsCatalog.map((reward) => {
                    const Icon = reward.icon;
                    const canAfford = points >= reward.cost;
                    const isClaimed = reward.status === 'claimed';

                    return (
                      <div 
                        key={reward.id}
                        className={`
                          p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3
                          ${isClaimed 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' 
                            : canAfford 
                              ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50 hover:shadow-md' 
                              : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 opacity-80'
                          }
                        `}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                              {reward.cost} pts
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                            {reward.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {reward.desc}
                          </p>
                        </div>

                        <div>
                          {isClaimed ? (
                            <span className="w-full py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active / Claimed
                            </span>
                          ) : canAfford ? (
                            <button
                              onClick={() => {
                                setPoints(prev => prev - reward.cost);
                              }}
                              className="w-full py-2 rounded-xl bg-[#6b21a8] hover:bg-[#581c87] text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                            >
                              Redeem ({reward.cost} Pts)
                            </button>
                          ) : (
                            <span className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center">
                              Need {reward.cost - points} more pts
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: RECENT ACTIVITY & UNLOCKED BADGES (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* POINTS RECENT ACTIVITY LOG */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-xs space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    {language === 'HI' ? 'हाल की पॉइंट गतिविधि' : 'Recent Points Activity'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Last 30 Days</span>
                </div>

                <div className="space-y-2.5">
                  {activityHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          {item.detail}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {item.date}
                        </span>
                      </div>

                      <span className={`
                        text-xs font-black px-2.5 py-1 rounded-lg shrink-0
                        ${item.type === 'earn' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                        }
                      `}>
                        {item.pts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* UNLOCKED PERKS & BADGES */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-xs space-y-5 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
                    {language === 'HI' ? 'अर्जित उपलब्धियां व बैज' : 'Unlocked Perks & Badges'}
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300">
                    3 Unlocked
                  </span>
                </div>

                <div className="space-y-3">
                  {badges.map((badge, i) => (
                    <div 
                      key={i}
                      className={`
                        p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all
                        ${badge.unlocked 
                          ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800' 
                          : 'bg-slate-50/40 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                        }
                      `}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
                        {badge.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">{badge.title}</h5>
                          {badge.unlocked ? (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              ✓ Active
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">Locked</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {badge.desc}
                        </p>
                        {badge.date && (
                          <p className="text-[9.5px] text-purple-600 dark:text-purple-400 font-bold mt-1">
                            {badge.date}
                          </p>
                        )}
                        {badge.progress && (
                          <p className="text-[9.5px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                            Progress: {badge.progress}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* FAQS SECTION */}
          <div className="max-w-5xl mx-auto mt-12">
            <FaqSection 
              title={language === 'HI' ? 'लॉयल्टी रिवार्ड्स व YatraPoints FAQ' : 'Loyalty Rewards & YatraPoints FAQs'}
              subtitle={language === 'HI' 
                ? 'जानिए आपकी सबमिट की गई बाधा रिपोर्ट से आपको अंक कैसे मिलते हैं और वे यात्रा छूट में कैसे भुनाए जाते हैं' 
                : 'Learn how reporting barriers and community audits earn YatraPoints redeemable for transit discounts'
              }
              customFaqs={[
                {
                  category: 'Rewards Program',
                  badge: 'Loyalty Points',
                  question: language === 'HI' 
                    ? 'बाधाओं की रिपोर्ट करने पर मुझे कितने YatraPoints मिलते हैं?' 
                    : 'How many YatraPoints do I earn for reporting accessibility obstacles?',
                  answer: language === 'HI'
                    ? 'प्रत्येक बुनियादी बाधा रिपोर्ट पर 50 YatraPoints मिलते हैं। यदि आप फोटो साक्ष्य संलग्न करते हैं, तो +100 YatraPoints मिलते हैं! नगर निगम परीक्षकों द्वारा सत्यापन के बाद अतिरिक्त 50 बोनस पॉइंट दिए जाते हैं।'
                    : 'You earn +50 YatraPoints for a standard report. Adding photo evidence doubles your reward to +100 YatraPoints! Once verified by municipal auditors, an extra +50 bonus is credited.'
                },
                {
                  category: 'Redemption',
                  badge: 'Travel Perks',
                  question: language === 'HI' 
                    ? 'मैं अपने YatraPoints का उपयोग कहाँ और कैसे कर सकता हूँ?' 
                    : 'How and where can I redeem my earned YatraPoints?',
                  answer: language === 'HI'
                    ? 'आप अपने YatraPoints को सुलभ मेट्रो/बस पास पर 15%-25% की छूट, मुफ़्त YatraMitra AI वॉइस गाइडेंस सेशन्स, और पार्टनर एक्सेसिबिलिटी किट्स के लिए भुना सकते हैं।'
                    : 'YatraPoints can be redeemed for 15%-25% discounts on accessible transit passes, unlocked YatraMitra AI voice sessions, and priority community verifier badges.'
                },
                {
                  category: 'Trust & Verification',
                  badge: 'Photo Evidence',
                  question: language === 'HI' 
                    ? 'रिपोर्ट के साथ फोटो साक्ष्य अपलोड करने पर बोनस पॉइंट क्यों मिलते हैं?' 
                    : 'Why does uploading photo evidence earn double Loyalty Points?',
                  answer: language === 'HI'
                    ? 'फोटो साक्ष्य से बैकएंड AI वेरिफिकेशन तुरंत रिपोर्ट की प्रामाणिकता की जांच करता है। फोटो संलग्न होने से कॉन्फिडेंस स्कोर 85%+ हो जाता है जिससे अन्य व्हीलचेयर यात्रियों के नक्शे तुरंत री-रूट हो जाते हैं।'
                    : 'Photo evidence lets automated AI & community auditors validate the barrier instantly. Reports with photos achieve an 85%+ confidence score, enabling real-time map rerouting for wheelchair users.'
                },
                {
                  category: 'Badges & Tiers',
                  badge: 'Champion Levels',
                  question: language === 'HI' 
                    ? 'लॉयल्टी लेवल कैसे बढ़ता है और क्या लाभ होते हैं?' 
                    : 'How do loyalty tier levels advance and what are the benefits?',
                  answer: language === 'HI'
                    ? 'जैसे ही आप अधिक बाधाओं की रिपोर्ट और सत्यापन करते हैं, आपका स्तर Level 1 से Level 2 Champion और अंततः Level 3 Master Guardian में अपग्रेड होता है, जिससे विशेष छूट और स्टेशन प्राथमिक सेवाएं अनलॉक होती हैं।'
                    : 'As you earn points, your contributor tier advances from Level 1 Scout to Level 2 Champion and Level 3 Master Guardian, unlocking elevated transit discounts and priority support dispatch.'
                }
              ]}
            />
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
