'use client';

import React, { useRef } from 'react';
import { 
  Sparkles, 
  Accessibility, 
  AlertTriangle, 
  Mic, 
  ShieldCheck, 
  BadgePercent,
  Award,
  Headphones,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Whyyatrasaathi() {
  const { language } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getHeading = () => {
    switch (language) {
      case 'HI': return 'yatrasaathi क्यों चुनें?';
      case 'BN': return 'কেন yatrasaathi বেছে নেবেন?';
      case 'OR': return 'yatrasaathi କାହିଁକି ବାଛିବେ?';
      case 'TA': return 'ஏன் yatrasaathi ஐ தேர்ந்தெடுக்க வேண்டும்?';
      case 'TE': return 'ఎందుకు yatrasaathi ఎంచుకోవాలి?';
      case 'MR': return 'yatrasaathi का निवडावे?';
      case 'GU': return 'શા માટે yatrasaathi પસંદ કરશો?';
      default: return 'Why yatrasaathi?';
    }
  };

  const getSubheading = () => {
    switch (language) {
      case 'HI': return 'बाधा-मुक्त, पारदर्शी और AI-संचालित सुरक्षित यात्रा का एकमात्र सुलभ साथी';
      case 'BN': return 'এআই এবং লাইভ অ্যাক্সেসিবিলিটি সহ বাধা-মুক্ত ভ্রমণের একমাত্র সঙ্গী';
      case 'OR': return 'AI ଏବଂ ଲାଇଭ୍ ସୁଗମତା ସହିତ ବାଧା-ମୁକ୍ତ ଯାତ୍ରାର ସାଥୀ';
      case 'TA': return 'AI மற்றும் நேரலை அணுகல்தன்மையுடன் தடையற்ற பயணத்தின் ஒரே துணை';
      case 'TE': return 'AI మరియు లైవ్ యాక్సెసిబిలిటీతో అడ్డంకులు లేని ప్రయాణ భాగస్వామి';
      case 'MR': return 'एआय आणि सुलभतेसह अडथळा-मुक्त प्रवासाचा एकमेव साथी';
      case 'GU': return 'AI અને સુલભતા સાથે અડચણ મુક્ત પ્રવાસનો સાથી';
      default: return 'Empowering barrier-free travel through AI, real-time obstacle tracking, and verified accessibility.';
    }
  };

  const getBadge = () => {
    switch (language) {
      case 'HI': return '100% सुलभ गारंटी';
      case 'BN': return '১০০% অ্যাক্সেসযোগ্য সুবিধা';
      case 'OR': return '୧୦୦% ସୁଗମ ଗାରେଣ୍ଟି';
      case 'TA': return '100% அணுகல் உத்தரவாதம்';
      case 'TE': return '100% యాక్సెస్ గ్యారెంటీ';
      case 'MR': return '१००% सुलभता हमी';
      case 'GU': return '૧૦૦% સુલભ ગેરંટી';
      default: return '100% Verified Access';
    }
  };

  const getUSPTitle = (index: number) => {
    const titles: Record<string, string[]> = {
      HI: [
        'सर्वोत्तम मूल्य गारंटी (Best Price)',
        'व्यक्तिगत सुगमता इंजन (Personalized Access)',
        'रियल-टाइम बाधा ट्रैक (Dynamic Barriers)',
        'वॉइस-फर्स्ट यात्रा मित्र (Voice AI Copilot)',
        'लॉयल्टी रिवार्ड्स (YatraPoints)',
        '24/7 सुलभ सहायता (Access Support)'
      ],
      BN: [
        'সেরা মূল্যের নিশ্চয়তা (Best Price)',
        'ব্যক্তিগত অ্যাক্সেসিবিলিটি ইঞ্জিন',
        'রিয়েল-টাইম বাধা ট্র্যাকিং',
        'ভয়েস-ফার্স্ট যাত্রা মিত্র এআই',
        'লয়্যালটি পুরস্কার (YatraPoints)',
        '২৪/৭ অ্যাক্সেস সহায়তা'
      ],
      OR: [
        'ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ ଗାରେଣ୍ଟି (Best Price)',
        'ବ୍ୟକ୍ତିଗତ ସୁଗମତା ଇଞ୍ଜିନ୍',
        'ରିଏଲ-ଟାଇମ୍ ବାଧା ଟ୍ରାକିଂ',
        'ଭଏସ୍-ଫର୍ଷ୍ଟ ଯାତ୍ରା ମିତ୍ର AI',
        'ଲୟାଲଟି ପୁରସ୍କାର (YatraPoints)',
        '୨୪/୭ ସୁଗମ ସହାୟତା'
      ],
      TA: [
        'சிறந்த விலை உத்தரவாதம்',
        'தனிப்பயனாக்கப்பட்ட அணுகல் இயந்திரம்',
        'நேரலை தடை கண்காணிப்பு',
        'குரல்-முதல் யாத்ராமித்ரா AI',
        'நம்பிக்கை புள்ளிகள் (YatraPoints)',
        '24/7 அணுகல் உதவி'
      ],
      TE: [
        'ఉత్తమ ధర హామీ (Best Price)',
        'వ్యక్తిగత యాక్సెసిబిలిటీ ఇంజిన్',
        'రియల్-టైమ్ అడ్డంకుల ట్రాకింగ్',
        'వాయిస్-ఫస్ట్ యాత్రామిత్ర AI',
        'లాయల్టీ రివార్డ్స్ (YatraPoints)',
        '24/7 యాక్సెస్ సహాయం'
      ],
      MR: [
        'सर्वोत्तम किंमत हमी (Best Price)',
        'वैयक्तिक सुलभता इंजिन',
        'रिअल-टाइम अडथळा ट्रॅकिंग',
        'व्हॉइस-फर्स्ट यात्रा मित्र AI',
        'लॉयल्टी रिवॉर्ड्स (YatraPoints)',
        '२४/७ सुलभ सहाय्य'
      ],
      GU: [
        'શ્રેષ્ઠ કિંમત ગેરંટી (Best Price)',
        'વ્યક્તિગત સુલભતા એન્જિન',
        'રિયલ-ટાઇમ અડચણ ટ્રેકિંગ',
        'વોઇસ-ફર્સ્ટ યાત્રા મિત્ર AI',
        'લોયલ્ટી રિવોર્ડ્સ (YatraPoints)',
        '24/7 સુલભ સહાય'
      ],
      EN: [
        'Best Price Guarantee',
        'Personalized Accessibility Engine',
        'Real-Time Dynamic Barriers',
        'Voice-First YatraMitra AI',
        'Loyalty Rewards (YatraPoints)',
        '24/7 Access Support'
      ]
    };
    const list = titles[language] || titles.EN;
    return list[index];
  };

  const getUSPDesc = (index: number) => {
    const descs: Record<string, string[]> = {
      HI: [
        'हमेशा सर्वोत्तम सौदे और 0% अतिरिक्त बुकिंग शुल्क के साथ सत्यापित यात्रा।',
        'आपकी व्यक्तिगत प्रोफाइल (व्हीलचेयर, दृष्टि, सुनने में सहायता) के अनुसार 100% सुलभ मार्ग।',
        'टूटी लिफ्टों व अवरुद्ध रास्तों के लाइव अपडेट और कम्युनिटी सत्यापन टाइमस्टैम्प।',
        'हिन्दी व अंग्रेज़ी में बोलकर सुलभ मार्ग खोजें और "Why this route?" पारदर्शी AI कारण जानें।',
        'बाधाओं की रिपोर्ट करें और हर रिपोर्ट पर +50 से +100 YatraPoints कमाएं, जिन्हें यात्रा पास में भुनाया जा सकता है।',
        'चौबीसों घंटे लाइव सहायता, हेल्पलाइन समर्थन और आपातकालीन SOS अलर्ट।'
      ],
      BN: [
        'সর্বোত্তম চুক্তি এবং 0% অতিরিক্ত বুকিং ফি সহ যাচাইকৃত ভ্রমণ।',
        'হুইলচেয়ার এবং দৃষ্টি সহায়তার জন্য ১০০% সিঁড়ি-মুক্ত পথ।',
        'ভাঙা লিফট এবং বাধাযুক্ত রাস্তার লাইভ আপডেট ও সম্প্রদায় যাচাই।',
        'ভয়েসের মাধ্যমে সহজে অ্যাক্সেসযোগ্য রুট খুঁজুন এবং এআই কারণ জানুন।',
        'বাধার রিপোর্ট করুন এবং প্রতি রিপোর্টে +50 থেকে +100 YatraPoints অর্জন করুন।',
        '২৪ ঘণ্টা লাইভ সাহায্য, হেল্পলাইন সাপোর্ট এবং ইমার্জেন্সি এসওএস।'
      ],
      OR: [
        'ସର୍ବୋତ୍ତମ ସୌଦା ଏବଂ ୦% ଅତିରିକ୍ତ ବୁକିଂ ଫି ସହିତ ଯାତ୍ରା।',
        'ହୁଇଲଚେୟାର ଏବଂ ଦୃଷ୍ଟି ସହାୟତା ପାଇଁ ସୁଗମ ମାର୍ଗ।',
        'ଭଙ୍ଗା ଲିଫ୍ଟ ଏବଂ ଅବରୋଧିତ ରାସ୍ତାର ଲାଇଭ୍ ଅପଡେଟ୍।',
        'ଭଏସ୍ ମାଧ୍ୟମରେ ସୁଗମ ରାସ୍ତା ଖୋଜନ୍ତୁ ଏବଂ AI କାରଣ ଜାଣନ୍ତୁ।',
        'ବାଧାର ରିପୋର୍ଟ କରନ୍ତୁ ଏବଂ +50 ରୁ +100 YatraPoints ଅର୍ଜନ କରନ୍ତୁ।',
        '୨୪ ଘଣ୍ଟିଆ ଲାଇଭ୍ ସହାୟତା, ହେଲ୍ପଲାଇନ୍ ଏବଂ ଜରୁରୀକାଳୀନ SOS ।'
      ],
      TA: [
        'சிறந்த ஒப்பந்தங்கள் மற்றும் பூஜ்ஜிய கூடுதல் கட்டணத்துடன் சரிபார்க்கப்பட்ட பயணம்.',
        'சக்கர நாற்காலி மற்றும் பார்வை ஆதரவுக்கான 100% படிகளற்ற வழிகள்.',
        'உடைந்த மின்தூக்கிகள் மற்றும் தடைபட்ட பாதைகளின் நேரலை தகவல்கள்.',
        'குரல் மூலம் எளிதாக வழிகளைக் கண்டறிந்து AI விளக்கத்தைப் பெறுங்கள்.',
        'தடைகளைப் புகாரளித்து ஒவ்வொரு அறிக்கையிலும் +50 முதல் +100 YatraPoints பெறுங்கள்.',
        '24 மணி நேர நேரலை உதவி, உதவி எண் மற்றும் அவசர கால SOS.'
      ],
      TE: [
        'ఉత్తమ డీల్స్ మరియు 0% అదనపు బుకింగ్ రుసుముతో ప్రయాణం.',
        'వీల్‌చైర్ మరియు దృష్టి సహాయం కోసం 100% మెట్లు లేని మార్గాలు.',
        'విరిగిన లిఫ్ట్‌లు మరియు నిరోధించిన మార్గాల లైవ్ సమాచారం.',
        'వాయిస్ ద్వారా సులభంగా మార్గాలను కనుగొనండి మరియు AI కారణాలు తెలుసుకోండి.',
        'అడ్డంకులను నివేదించి ప్రతి నివేదికపై +50 నుండి +100 YatraPoints పొందండి.',
        '24 గంటల లైవ్ సహాయం, హెల్ప్‌లైన్ మద్దతు మరియు అత్యవసర SOS.'
      ],
      MR: [
        'सर्वोत्तम सौदे आणि ०% अतिरिक्त बुकिंग शुल्कासह सत्यापित प्रवास.',
        'व्हीलचेअर आणि दृष्टी सहाय्यासाठी १००% पायऱ्यांशिवाय मार्ग.',
        'बंद लिफ्ट आणि अडथळा असलेल्या रस्त्यांचे लाईव्ह अपडेट्स.',
        'व्हॉइसद्वारे सुलभ मार्ग शोधा आणि AI कारणे जाणून घ्या.',
        'अडथळ्यांची नोंद करा आणि प्रत्येक रिपोर्टवर +50 ते +100 YatraPoints मिळवा.',
        '२४ तास लाईव्ह मदत, हेल्पलाइन सपोर्ट आणि आणीबाणी SOS.'
      ],
      GU: [
        'શ્રેષ્ઠ ડીલ્સ અને 0% વધારાની બુકિંગ ફી સાથે પ્રમાણિત મુસાફરી.',
        'વ્હીલચેર અને દ્રષ્ટિ સહાય માટે 100% પગથિયાં વગરના રસ્તાઓ.',
        'બંધ લિફ્ટ અને અડચણવાળા રસ્તાના લાઇન અપડેટ્સ.',
        'વોઇસ દ્વારા સરળતાથી રૂટ શોધો અને AI કારણો જાણો.',
        'અડચણો રિપોર્ટ કરો અને દરેક રિપોર્ટ પર +50 થી +100 YatraPoints મેળવો.',
        '24 કલાક લાઈવ મદદ, હેલ્પલાઈન સપોર્ટ અને ઈમરજન્સી SOS.'
      ],
      EN: [
        'We ensure you get the best deals always with zero extra booking fee.',
        'Routes customized for wheelchair, vision, and hearing preferences with 100% step-free scoring.',
        'Live updates for broken elevators or blocked ramps with verified community timestamps.',
        'Plan hands-free in Hindi or English with Explainable AI transparency ("Why this route?").',
        'Earn +50 to +100 YatraPoints per reported barrier & redeemable for transit discounts.',
        'Round-the-clock live assistance, hotline support, and emergency SOS routing.'
      ]
    };
    const list = descs[language] || descs.EN;
    return list[index];
  };

  const usps = [
    {
      icon: BadgePercent,
      iconBg: 'from-amber-100 to-amber-200 dark:from-amber-950/60 dark:to-amber-900/40 text-amber-600 dark:text-amber-300',
      title: getUSPTitle(0),
      description: getUSPDesc(0)
    },
    {
      icon: Accessibility,
      iconBg: 'from-purple-100 to-purple-200 dark:from-purple-950/60 dark:to-purple-900/40 text-[#6b21a8] dark:text-purple-300',
      title: getUSPTitle(1),
      description: getUSPDesc(1)
    },
    {
      icon: AlertTriangle,
      iconBg: 'from-emerald-100 to-emerald-200 dark:from-emerald-950/60 dark:to-emerald-900/40 text-emerald-600 dark:text-emerald-300',
      title: getUSPTitle(2),
      description: getUSPDesc(2)
    },
    {
      icon: Mic,
      iconBg: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/60 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-300',
      title: getUSPTitle(3),
      description: getUSPDesc(3)
    },
    {
      icon: Award,
      iconBg: 'from-yellow-100 to-amber-200 dark:from-amber-950/70 dark:to-yellow-900/40 text-amber-600 dark:text-amber-300',
      title: getUSPTitle(4),
      description: getUSPDesc(4)
    },
    {
      icon: Headphones,
      iconBg: 'from-rose-100 to-pink-200 dark:from-rose-950/70 dark:to-pink-900/40 text-rose-600 dark:text-rose-300',
      title: getUSPTitle(5),
      description: getUSPDesc(5)
    }
  ];

  return (
    <section className="w-full my-5">
      <div className="rounded-3xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#0d0c12] p-5 sm:p-6 shadow-xs relative">
        
        {/* Section Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6b21a8] dark:text-purple-300">
              <Sparkles className="h-3.5 w-3.5 text-[#6b21a8] dark:text-purple-400" />
              yatrasaathi USPs
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {getHeading()}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {getSubheading()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => handleScroll('left')}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-[#6b21a8] dark:hover:text-purple-300 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleScroll('right')}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-[#6b21a8] dark:hover:text-purple-300 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/80 dark:bg-purple-950/30 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-[#6b21a8] dark:text-purple-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6b21a8] dark:text-purple-300">
                {getBadge()}
              </span>
            </div>
          </div>
        </div>

        {/* HORIZONTAL CAROUSEL OF ALL 6 CARDS WITH OPTIMIZED CARD SIZE & SPACING */}
        <div 
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto scroll-smooth custom-scrollbar pb-3 pt-1 px-1 -mx-1"
        >
          {usps.map((usp, index) => {
            const Icon = usp.icon;

            return (
              <div 
                key={index}
                className="w-[275px] sm:w-[295px] shrink-0 group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#12111a] p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${usp.iconBg} shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-[#6b21a8] dark:group-hover:text-purple-300 transition-colors leading-tight mb-1.5">
                      {usp.title}
                    </h3>
                    <p className="text-[11px] sm:text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                      {usp.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
