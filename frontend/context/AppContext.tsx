'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'EN' | 'HI';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  EN: {
    // Navigation
    dashboard: 'Dashboard',
    explore: 'Explore Places',
    plan_route: 'Plan Route',
    itineraries: 'Itineraries',
    reports: 'Reports',
    community: 'Community',
    copilot: 'Travel Copilot',
    profile: 'Accessibility Profile',
    tagline: 'Accessible Journeys for All',
    plan_trips: 'Plan Accessible Trips',
    plan_desc: 'Find step-free routes, accessible places, assistance and more.',
    explore_now: 'Explore Now',

    // Hero Section
    explore_world: 'Explore Beautiful World',
    explore_world_us: 'Explore Beautiful World With Us',
    hero_desc: 'Let us take the hassle out of travel planning, so you can focus on the adventure ahead.',
    discover_now: 'Discover Now',
    explore_more: 'Explore More',
    india: 'India',
    france: 'France',
    turkey: 'Turkey',
    taj_mahal: 'Taj Mahal Ramps',
    eiffel_tower: 'Eiffel Tower Lift',
    cappadocia: 'Cappadocia Balloons',

    // Travel Search
    flights: 'Flights',
    hotels: 'Hotels',
    tours: 'Tours',
    packages: 'Packages',
    from: 'From',
    to: 'To',
    depart: 'Depart',
    return_date: 'Return',
    travelers: 'Travelers',

    // Benefits
    best_price: 'Best Price Guarantee',
    best_price_desc: 'We ensure you get the best deals always.',
    customer_support: '24/7 Customer Support',
    customer_support_desc: "We're here to help you anytime, anywhere.",
    secure_bookings: 'Secure Bookings',
    secure_bookings_desc: 'Your data and payments are 100% safe.',
    experiences: 'Handpicked Experiences',
    experiences_desc: 'Curated tours for unforgettable trips.',

    // Dashboard
    find_route: 'Find Your Perfect Route',
    start_loc: 'Current Location / Start',
    dest_loc: 'Destination / End',
    quick_pref: 'Quick Preferences',
    wheelchair: 'Wheelchair',
    step_free: 'Step-free',
    elevators: 'Elevators',
    more: 'More',
    acc_constraints: 'Accessibility Constraints',
    avoid_stairs: 'Avoid Stairs',
    prefer_step_free: 'Prefer Step-Free Paths',
    require_elevators: 'Require Elevators / lifts',
    plan_button: 'Plan My Accessible Route →',
    recommended_routes: 'Recommended Routes',
    live_routes: 'Live Routes',
    suggested_options: 'Suggested Options',
    your_profile: 'Your Accessibility Profile',
    today_conditions: 'Today\'s Conditions',
    weather: 'Weather',
    crowd_level: 'Crowd Level',
    air_quality: 'Air Quality',
    copilot_ready: 'AI Assistant Ready',
    monitor_sos: 'Accessibility Monitor & SOS Desk',

    // Responsibilities
    responsibilities_title: 'Our Responsibilities',
    responsibilities_desc: 'Your safety, access, and comfort are our top priorities',
    always_available: 'Always Available',
    always_available_desc: 'For your assistance and safety needs.',
    free_cancel: 'Cancel Free of Charge',
    free_cancel_desc: 'Flexible booking with YatraSaathi Flex Tarif*.',
    train_flight: 'Train to Flight',
    train_flight_desc: 'Seamless transit transfer tickets*.',
    offers: 'YatraSaathi Angebote',
    offers_desc: 'Exclusive discounts on verified accessible tours.',

    // Hot Deals
    hot_deals: 'Hot Deals',
    hot_deals_desc: 'Fire up your savings with our hot deals',
    discover_deal: 'Discover Now',

    // Top Destination
    top_destination: 'Top Destination',
    top_destination_desc: 'Experience the world\'s top destinations like never before',
    pakistan: 'Pakistan',
    hiran_minar: 'Hiran Minar Sheikhupura',
    italy: 'Italy',
    colosseum: 'Colosseum Access Lift',
    hagia_sophia: 'Hagia Sophia Museum',
    canada: 'Canada',
    gooderham: 'Gooderham Building',

    // Footer
    footer_desc: 'Empowering everyone to explore the world with confidence and comfort.',
    quick_links: 'Quick Links',
    support: 'Support',
    newsletter: 'Newsletter',
    newsletter_desc: 'Subscribe for travel tips, deals and accessibility updates.',
    subscribe: 'Subscribe',
    rights: 'All rights reserved.'
  },
  HI: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    explore: 'स्थानों की खोज',
    plan_route: 'मार्ग योजना',
    itineraries: 'यात्रा कार्यक्रम',
    reports: 'रिपोर्ट',
    community: 'समुदाय',
    copilot: 'यात्रा कोपायलट',
    profile: 'पहुंच प्रोफ़ाइल',
    tagline: 'सभी के लिए सुलभ यात्राएं',
    plan_trips: 'सुलभ यात्राएं योजना',
    plan_desc: 'सीढ़ी-मुक्त मार्ग, सुलभ स्थान, सहायता और बहुत कुछ खोजें।',
    explore_now: 'अभी खोजें',

    // Hero Section
    explore_world: 'सुंदर दुनिया की खोज करें',
    explore_world_us: 'हमारे साथ सुंदर दुनिया की खोज करें',
    hero_desc: 'यात्रा नियोजन की परेशानी हमें संभालने दें, ताकि आप आने वाले साहसिक कार्य पर ध्यान केंद्रित कर सकें।',
    discover_now: 'अभी खोजें',
    explore_more: 'अधिक खोजें',
    india: 'भारत',
    france: 'फ्रांस',
    turkey: 'तुर्की',
    taj_mahal: 'ताज महल रैंप',
    eiffel_tower: 'एफिल टॉवर लिफ्ट',
    cappadocia: 'कप्पाडोसिया गुब्बारे',

    // Travel Search
    flights: 'उड़ानें',
    hotels: 'होटल',
    tours: 'दौरे',
    packages: 'पैकेज',
    from: 'कहां से',
    to: 'कहां तक',
    depart: 'प्रस्थान तिथि',
    return_date: 'वापसी तिथि',
    travelers: 'यात्री संख्या',

    // Benefits
    best_price: 'सर्वोत्तम मूल्य गारंटी',
    best_price_desc: 'हम सुनिश्चित करते हैं कि आपको हमेशा बेहतरीन सौदे मिलें।',
    customer_support: '24/7 ग्राहक सहायता',
    customer_support_desc: 'हम आपकी सहायता के लिए कभी भी, कहीं भी मौजूद हैं।',
    secure_bookings: 'सुरक्षित बुकिंग',
    secure_bookings_desc: 'आपका डेटा और भुगतान 100% सुरक्षित हैं।',
    experiences: 'चुनिंदा अनुभव',
    experiences_desc: 'अविस्मरणीय यात्राओं के लिए चुनिंदा दौरे।',

    // Dashboard
    find_route: 'अपना आदर्श मार्ग खोजें',
    start_loc: 'वर्तमान स्थान / प्रारंभ',
    dest_loc: 'गंतव्य / समाप्ति',
    quick_pref: 'त्वरित प्राथमिकताएं',
    wheelchair: 'व्हीलचेयर',
    step_free: 'सीढ़ी-मुक्त',
    elevators: 'लिफ्ट',
    more: 'अधिक',
    acc_constraints: 'पहुंच संबंधी बाधाएं',
    avoid_stairs: 'सीढ़ियों से बचें',
    prefer_step_free: 'सीढ़ी-मुक्त मार्ग को प्राथमिकता दें',
    require_elevators: 'लिफ्ट की आवश्यकता है',
    plan_button: 'मेरा सुलभ मार्ग योजना बनाएं →',
    recommended_routes: 'अनुशंसित मार्ग',
    live_routes: 'लाइव मार्ग',
    suggested_options: 'सुझाए गए विकल्प',
    your_profile: 'आपकी पहुंच प्रोफ़ाइल',
    today_conditions: 'आज की स्थिति',
    weather: 'मौसम',
    crowd_level: 'भीड़ का स्तर',
    air_quality: 'वायु गुणवत्ता',
    copilot_ready: 'एआई सहायक तैयार',
    monitor_sos: 'पहुंच मॉनिटर और एसओएस डेस्क',

    // Responsibilities
    responsibilities_title: 'हमारी जिम्मेदारियां',
    responsibilities_desc: 'आपकी सुरक्षा, पहुंच और आराम हमारी सर्वोच्च प्राथमिकताएं हैं',
    always_available: 'हमेशा उपलब्ध',
    always_available_desc: 'आपकी सहायता और सुरक्षा जरूरतों के लिए।',
    free_cancel: 'निःशुल्क रद्दीकरण',
    free_cancel_desc: 'यात्रासाथी फ्लेक्स टैरिफ* के साथ लचीली बुकिंग।',
    train_flight: 'ट्रेन से उड़ान',
    train_flight_desc: 'निर्बाध पारगमन हस्तांतरण टिकट*।',
    offers: 'यात्रासाथी विशेष ऑफर',
    offers_desc: 'सत्यापित सुलभ दौरों पर विशेष छूट।',

    // Hot Deals
    hot_deals: 'हॉट डील्स',
    hot_deals_desc: 'हमारे हॉट डील्स के साथ अपनी बचत बढ़ाएं',
    discover_deal: 'अभी खोजें',

    // Top Destination
    top_destination: 'शीर्ष गंतव्य',
    top_destination_desc: 'दुनिया के शीर्ष गंतव्यों का ऐसा अनुभव करें जैसा पहले कभी नहीं हुआ',
    pakistan: 'पाकिस्तान',
    hiran_minar: 'हिरन मीनार शेखूपुरा',
    italy: 'इटली',
    colosseum: 'कोलोसियम एक्सेस लिफ्ट',
    hagia_sophia: 'हागिया सोफिया संग्रहालय',
    canada: 'कनाडा',
    gooderham: 'गुडरहम बिल्डिंग',

    // Footer
    footer_desc: 'सभी को विश्वास और आराम के साथ दुनिया का पता लगाने के लिए सशक्त बनाना।',
    quick_links: 'त्वरित लिंक',
    support: 'सहायता',
    newsletter: 'न्यूज़लेटर',
    newsletter_desc: 'यात्रा टिप्स, सौदों और सुलभता अपडेट के लिए सदस्यता लें।',
    subscribe: 'सदस्यता लें',
    rights: 'सर्वाधिकार सुरक्षित।'
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('EN');

  useEffect(() => {
    // Load initial states from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }

    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return dict[key] || TRANSLATIONS.EN[key] || key;
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
