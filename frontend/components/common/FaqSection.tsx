'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Accessibility, 
  Navigation, 
  AlertTriangle, 
  Sparkles, 
  CloudSun,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
  badge?: string;
}

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  customFaqs?: FaqItem[];
  compact?: boolean;
}

export default function FaqSection({ 
  title, 
  subtitle, 
  customFaqs,
  compact = false 
}: FaqSectionProps) {
  const { language } = useApp();
  const isHindi = language === 'HI';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      category: 'Monitoring',
      badge: 'Personalized Profile',
      question: isHindi 
        ? 'YatraSaathi केवल "Accessible" लेबल के बजाय मेरी ज़रूरतों को कैसे अनुकूलित करता है?'
        : 'How does YatraSaathi personalize routing beyond static "Accessible" labels?',
      answer: isHindi
        ? 'पारंपरिक प्रणालियाँ स्थानों को केवल एक ही जेनेरिक "Accessible" लेबल देती हैं जो हर यात्री के लिए सही नहीं होता। YatraSaathi आपकी व्यक्तिगत प्रोफाइल (व्हीलचेयर, कम दृष्टि, सुनने में कठिनाई, स्टेप-फ्री प्राथमिकताएं) के अनुसार हर मार्ग की बाधाओं और ढलानों की गणना करके 1-100 का Compatibility Score तैयार करता है।'
        : 'Traditional systems use static "Accessible" labels that aren\'t identical for every traveler. YatraSaathi tailors routes specifically to your personalized profile (wheelchair type, vision support, hearing assistance, step-free preferences) and computes a 1-100 Traveller Compatibility Score based on verified ramp angles and elevator availability.'
    },
    {
      category: 'Monitoring',
      badge: 'Dynamic Barriers',
      question: isHindi 
        ? 'यदि लिफ्ट या रैंप अचानक खराब हो जाए तो क्या होता है?'
        : 'What happens if an elevator, lift, or ramp is temporarily broken?',
      answer: isHindi
        ? 'जब कोई यात्री या स्टेशन प्रबंधन लिफ्ट खराब होने, निर्माण कार्य या अवरुद्ध मार्ग की रिपोर्ट करता है, तो YatraSaathi का रियल-टाइम इंजन तुरंत उन यात्रियों के रूट अपडेट करता है जिन्हें स्टेप-फ्री मार्ग की आवश्यकता है, जिससे आप फँसने से बचते हैं।'
        : 'Static data misses temporary barriers. When a user or station authority reports a broken lift, ongoing construction, or blocked ramp, YatraSaathi\'s Dynamic Route Engine immediately updates live routes for travelers requiring step-free navigation.'
    },
    {
      category: 'Trust & Verification',
      badge: 'High Confidence',
      question: isHindi 
        ? 'मुझे YatraSaathi की बाधा और स्थान जानकारी पर भरोसा क्यों करना चाहिए?'
        : 'How does YatraSaathi ensure high trust and verification in reported information?',
      answer: isHindi
        ? 'हर बाधा और सुलभ स्थान की जानकारी में सत्यापन स्रोत, कम्युनिटी वोट्स और टाइमस्टैम्प प्रदर्शित होता है। उच्च आत्मविश्वास (Confidence level >= 80%) वाली रिपोर्ट सीधे मैप और रूटर द्वारा उपयोग की जाती हैं, जिससे पुरानी या गलत जानकारी दूर रहती है।'
        : 'Every accessibility point and reported barrier includes a clear verification badge, community confidence rating, and last-updated timestamp. High-confidence reports are weighted higher by our routing engine to guarantee reliable guidance.'
    },
    {
      category: 'Enhancing',
      badge: 'Explainable AI',
      question: isHindi 
        ? 'Explainable AI और "Why this route?" का क्या अर्थ है?'
        : 'What is Explainable AI and "Why this route?" transparency?',
      answer: isHindi
        ? 'YatraSaathi केवल रास्ता नहीं दिखाता, बल्कि स्पष्ट रूप से बताता है कि उसने यह मार्ग क्यों चुना (जैसे: "इस मार्ग में 0 सीढ़ियाँ हैं, केवल 2 डिग्री का रैंप है और लिफ्ट चालू है")। YatraMitra AI से आप बोलकर या लिखकर अपनी यात्रा के बारे में प्रश्न भी पूछ सकते हैं।'
        : 'YatraSaathi doesn\'t just plot lines on a map—it provides Explainable AI reasoning detailing exactly why a route was picked (e.g. "0 stairs, continuous elevator access, smooth surface"). You can also ask YatraMitra AI via voice or text.'
    },
    {
      category: 'Monitoring',
      badge: 'Weather & Crowd',
      question: isHindi 
        ? 'मौसम और भीड़ की स्थिति मार्ग चयन को कैसे प्रभावित करती है?'
        : 'How do live weather, crowds, and assistance availability affect journey planning?',
      answer: isHindi
        ? 'YatraSaathi ओपन-मेटियो लाइव मौसम डेटा और स्टेशन भीड़ स्तरों का उपयोग करता है। तेज बारिश या अत्यधिक भीड़ के दौरान, सिस्टम ढके हुए शेड वाले मार्गों और स्टेशन असिस्टेंट उपलब्धता वाले स्टेशनों को प्राथमिकता देता है।'
        : 'YatraSaathi integrates live Open-Meteo weather data and station crowd levels. During heavy rain or extreme crowds, the engine prioritizes covered walkways and stations with verified station assistant support.'
    },
    {
      category: 'Enhancing',
      badge: 'Voice Copilot',
      question: isHindi 
        ? 'क्या मैं YatraMitra AI का उपयोग बिना टाइप किए कर सकता हूँ?'
        : 'Can I interact with YatraMitra AI hands-free using my voice?',
      answer: isHindi
        ? 'हाँ! वॉइस-फर्स्ट AI Copilot आपको हिन्दी और अंग्रेज़ी में प्राकृतिक आवाज़ में सवाल पूछने देता है (जैसे: "ताजमहल के पास wheelchair toilet कहाँ है?") और तुरंत आवाज़ में उत्तर व सुलभ मार्ग दिखाता है।'
        : 'Yes! The Voice-First AI Copilot lets you speak naturally in Hindi or English (e.g., "Find step-free routes near me") and provides spoken answers along with interactive accessible maps.'
    }
  ];

  const faqsToDisplay = customFaqs && customFaqs.length > 0 ? customFaqs : defaultFaqs;

  const sectionTitle = title || (isHindi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'How YatraSaathi Works & FAQs');
  const sectionSubtitle = subtitle || (isHindi 
    ? 'जानिए कैसे YatraSaathi आपकी सुलभ और सुरक्षित यात्रा सुनिश्चित करता है' 
    : 'Discover how YatraSaathi solves scattered info, temporary barriers, and personalized accessibility');

  return (
    <section className="w-full my-6">
      <div className="rounded-3xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#0d0c12] p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6b21a8] dark:text-purple-300">
              <HelpCircle className="h-3.5 w-3.5" />
              {isHindi ? 'सुगमता मार्गदर्शन' : 'Accessibility Insights'}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {sectionTitle}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {sectionSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/20 px-3.5 py-2 shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'सत्यापित सुरक्षा मॉडल' : 'Verified Accessibility Engine'}
            </span>
          </div>
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-3">
          {faqsToDisplay.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-purple-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-900 dark:text-white transition"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#6b21a8] dark:text-purple-300 text-xs font-black">
                      ?
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        {faq.badge && (
                          <span className="rounded-md bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-[#6b21a8] dark:text-purple-300">
                            {faq.badge}
                          </span>
                        )}
                        {faq.category && (
                          <span className="text-[9px] font-bold text-slate-400">
                            • {faq.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                        {faq.question}
                      </span>
                    </div>
                  </div>

                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#6b21a8] dark:text-purple-400' : 'text-slate-400'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-purple-100 dark:border-purple-950/60 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
