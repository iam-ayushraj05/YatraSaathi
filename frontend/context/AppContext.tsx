'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useCurrentLocation, LocationState } from '../hooks/useCurrentLocation';

type Theme = 'light' | 'dark';
export type Language = 'EN' | 'HI' | 'BN' | 'OR' | 'TA' | 'TE' | 'MR' | 'GU';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  userLocation: LocationState;
  refreshLocation: () => void;
  requestLocationPermission: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  EN: {
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

    explore_world: 'YOUR DESTINATION, YOUR NEEDS.',
    explore_world_us: 'THE JOURNEY TAILORED FOR YOU',
    hero_desc: 'Let us take the hassle out of travel planning, so you can focus on the adventure ahead.',
    discover_now: 'Discover Now',
    explore_more: 'Explore More',
    india: 'India',
    france: 'France',
    turkey: 'Turkey',
    taj_mahal: 'Taj Mahal Ramps',
    eiffel_tower: 'Eiffel Tower Lift',
    cappadocia: 'Cappadocia Balloons',

    flights: 'Flights',
    stays: 'Stays',
    hotels: 'Stays',
    tours: 'Tours',
    packages: 'Packages',
    from: 'From',
    to: 'To',
    depart: 'Depart',
    return_date: 'Return',
    travelers: 'Travelers',

    best_price: 'Best Price Guarantee',
    best_price_desc: 'We ensure you get the best deals always.',
    customer_support: '24/7 Customer Support',
    customer_support_desc: "We're here to help you anytime, anywhere.",
    secure_bookings: 'Secure Bookings',
    secure_bookings_desc: 'Your data and payments are 100% safe.',
    experiences: 'Handpicked Experiences',
    experiences_desc: 'Curated tours for unforgettable trips.',

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

    responsibilities_title: 'Our Responsibilities',
    responsibilities_desc: 'Your safety, access, and comfort are our top priorities',
    always_available: 'Always Available',
    always_available_desc: 'For your assistance and safety needs.',
    free_cancel: 'Cancel Free of Charge',
    free_cancel_desc: 'Flexible booking with yatrasaathi Flex Tarif*.',
    train_flight: 'Train to Flight',
    train_flight_desc: 'Seamless transit transfer tickets*.',
    offers: 'yatrasaathi Angebote',
    offers_desc: 'Exclusive discounts on verified accessible tours.',

    hot_deals: 'Hot Deals',
    hot_deals_desc: 'Fire up your savings with our hot deals',
    discover_deal: 'Discover Now',

    top_destination: 'Top Destination',
    top_destination_desc: 'Experience the world\'s top destinations like never before',
    pakistan: 'Pakistan',
    hiran_minar: 'Hiran Minar Sheikhupura',
    italy: 'Italy',
    colosseum: 'Colosseum Access Lift',
    hagia_sophia: 'Hagia Sophia Museum',
    canada: 'Canada',
    gooderham: 'Gooderham Building',

    footer_desc: 'Empowering everyone to explore the world with confidence and comfort.',
    quick_links: 'Quick Links',
    support: 'Support',
    newsletter: 'Newsletter',
    newsletter_desc: 'Subscribe for travel tips, deals and accessibility updates.',
    subscribe: 'Subscribe',
    rights: 'All rights reserved.'
  },
  HI: {
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

    explore_world: 'आपकी मंजिल, आपकी जरूरतें',
    explore_world_us: 'आपके लिए अनुकूलित यात्रा',
    hero_desc: 'यात्रा नियोजन की परेशानी हमें संभालने दें, ताकि आप आने वाले साहसिक कार्य पर ध्यान केंद्रित कर सकें।',
    discover_now: 'अभी खोजें',
    explore_more: 'अधिक खोजें',
    india: 'भारत',
    france: 'फ्रांस',
    turkey: 'तुर्की',
    taj_mahal: 'ताज महल रैंप',
    eiffel_tower: 'एफिल टॉवर लिफ्ट',
    cappadocia: 'कप्पाडोसिया गुब्बारे',

    flights: 'उड़ानें',
    stays: 'स्टे (Stays)',
    hotels: 'स्टे (Stays)',
    tours: 'दौरे',
    packages: 'पैकेज',
    from: 'कहां से',
    to: 'कहां तक',
    depart: 'प्रस्थान तिथि',
    return_date: 'वापसी तिथि',
    travelers: 'यात्री संख्या',

    best_price: 'सर्वोत्तम मूल्य गारंटी',
    best_price_desc: 'हम सुनिश्चित करते हैं कि आपको हमेशा बेहतरीन सौदे मिलें।',
    customer_support: '24/7 ग्राहक सहायता',
    customer_support_desc: 'हम आपकी सहायता के लिए कभी भी, कहीं भी मौजूद हैं।',
    secure_bookings: 'सुरक्षित बुकिंग',
    secure_bookings_desc: 'आपका डेटा और भुगतान 100% सुरक्षित हैं।',
    experiences: 'चुनिंदा अनुभव',
    experiences_desc: 'अविस्मरणीय यात्राओं के लिए चुनिंदा दौरे।',

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

    hot_deals: 'हॉट डील्स',
    hot_deals_desc: 'हमारे हॉट डील्स के साथ अपनी बचत बढ़ाएं',
    discover_deal: 'अभी खोजें',

    top_destination: 'शीर्ष गंतव्य',
    top_destination_desc: 'दुनिया के शीर्ष गंतव्यों का ऐसा अनुभव करें जैसा पहले कभी नहीं हुआ',
    pakistan: 'पाकिस्तान',
    hiran_minar: 'हिरन मीनार शेखूपुरा',
    italy: 'इटली',
    colosseum: 'कोलोसियम एक्सेस लिफ्ट',
    hagia_sophia: 'हागिया सोफिया संग्रहालय',
    canada: 'कनाडा',
    gooderham: 'गुडरहम बिल्डिंग',

    footer_desc: 'सभी को विश्वास और आराम के साथ दुनिया का पता लगाने के लिए सशक्त बनाना।',
    quick_links: 'त्वरित लिंक',
    support: 'सहायता',
    newsletter: 'न्यूज़लेटर',
    newsletter_desc: 'यात्रा टिप्स, सौदों और सुलभता अपडेट के लिए सदस्यता लें।',
    subscribe: 'सदस्यता लें',
    rights: 'सर्वाधिकार सुरक्षित।'
  },
  BN: {
    dashboard: 'ড্যাশবোর্ড',
    explore: 'স্থান অন্বেষণ',
    plan_route: 'পথ পরিকল্পনা',
    itineraries: 'ভ্রমণসূচি',
    reports: 'রিপোর্ট',
    community: 'কমিউনিটি',
    copilot: 'ভ্রমণ কোপাইলট',
    profile: 'অ্যাক্সেসিবিলিটি প্রোফাইল',
    tagline: 'সবার জন্য সহজগম্য ভ্রমণ',
    plan_trips: 'সহজগম্য ট্রিপ পরিকল্পনা করুন',
    plan_desc: 'সিঁড়ি-মুক্ত পথ, সহজগম্য স্থান এবং সহায়তার বিবরণ খুঁজুন।',
    explore_now: 'এখনই অন্বেষণ করুন',
    flights: 'ফ্লাইট',
    stays: 'হোটেল ও স্টে',
    find_route: 'আপনার সেরা রুট খুঁজুন',
    start_loc: 'বর্তমান স্থান / শুরু',
    dest_loc: 'গন্তব্য / শেষ',
    quick_pref: 'দ্রুত পছন্দ',
    wheelchair: 'হুইলচেয়ার',
    step_free: 'সিঁড়ি-মুক্ত',
    elevators: 'লিফট',
    plan_button: 'আমার রুট তৈরি করুন →',
    today_conditions: 'আজকের আবহাওয়া ও পরিস্থিতি',
    weather: 'আবহাওয়া',
    crowd_level: 'ভিড়ের মাত্রা',
    footer_desc: 'সবাইকে আত্মবিশ্বাসের সাথে বিশ্ব ঘুরে দেখার শক্তি প্রদান।'
  },
  OR: {
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    explore: 'ସ୍ଥାନ ଅନ୍ୱେଷଣ',
    plan_route: 'ମାର୍ଗ ଯୋଜନା',
    itineraries: 'ଯାତ୍ରା କାର୍ଯ୍ୟକ୍ରମ',
    reports: 'ରିପୋର୍ଟ',
    community: 'ସମ୍ପ୍ରଦାୟ',
    copilot: 'ଯାତ୍ରା କୋପାଇଲଟ',
    profile: 'ସୁଗମତା ପ୍ରୋଫାଇଲ୍',
    tagline: 'ସମସ୍ତଙ୍କ ପାଇଁ ସୁଗମ ଯାତ୍ରା',
    plan_trips: 'ସୁଗମ ଯାତ୍ରା ଯୋଜନା କରନ୍ତୁ',
    plan_desc: 'ସିଡ଼ି-ମୁକ୍ତ ରାସ୍ତା, ସୁଗମ ସ୍ଥାନ ଏବଂ ସହାୟତା ଖୋଜନ୍ତୁ।',
    explore_now: 'ବର୍ତ୍ତମାନ ଖୋଜନ୍ତୁ',
    flights: 'ବିମାନ ଯାତ୍ରା',
    stays: 'ହୋଟେଲ ଓ ରହିବା ସ୍ଥାନ',
    find_route: 'ଆପଣଙ୍କର ଉତ୍ତମ ମାର୍ଗ ଖୋଜନ୍ତୁ',
    start_loc: 'ବର୍ତ୍ତମାନ ସ୍ଥାନ / ଆରମ୍ଭ',
    dest_loc: 'ଗନ୍ତବ୍ୟ ସ୍ଥଳ / ଶେଷ',
    quick_pref: 'ଦ୍ରୁତ ପସନ୍ଦ',
    wheelchair: 'ହୁଇଲଚେୟାର',
    step_free: 'ସିଡ଼ି-ମୁକ୍ତ',
    elevators: 'ଲିଫ୍ଟ',
    plan_button: 'ମୋର ମାର୍ଗ ଯୋଜନା କରନ୍ତୁ →',
    today_conditions: 'ଆଜିର ପରିସ୍ଥିତି',
    weather: 'ପାଣିପାଗ',
    crowd_level: 'ଗହଳି ସ୍ତର',
    footer_desc: 'ସମସ୍ତଙ୍କୁ ଆତ୍ମବିଶ୍ୱାସ ସହିତ ବିଶ୍ୱ ଭ୍ରମଣ କରିବାକୁ ସକ୍ଷମ କରିବା।'
  },
  TA: {
    dashboard: 'டாஷ்போர்டு',
    explore: 'இடங்களை ஆராய்க',
    plan_route: 'பாதை திட்டம்',
    itineraries: 'பயணத் திட்டம்',
    reports: 'அறிக்கைகள்',
    community: 'சமூகம்',
    copilot: 'பயணக் கோபைலட்',
    profile: 'அணுகல்தன்மை சுயவிவரம்',
    tagline: 'அனைவருக்கும் அணுகக்கூடிய பயணம்',
    plan_trips: 'எளிதான பயணங்களைத் திட்டமிடுங்கள்',
    plan_desc: 'படி அற்ற பாதைகள் மற்றும் அணுகக்கூடிய இடங்களைக் கண்டறியவும்.',
    explore_now: 'இப்போது ஆராய்க',
    flights: 'விமானங்கள்',
    stays: 'தங்கும் இடங்கள்',
    find_route: 'உங்கள் சிறந்த பாதையைக் கண்டறியவும்',
    start_loc: 'தற்போதைய இடம் / தொடக்கம்',
    dest_loc: 'செல்லும் இடம் / முடிவு',
    quick_pref: 'விரைவு விருப்பங்கள்',
    wheelchair: 'சக்கர நாற்காலி',
    step_free: 'படிகள் அற்ற வழி',
    elevators: 'மின் தூக்கி (Lift)',
    plan_button: 'எனது பாதையைத் திட்டமிடு →',
    today_conditions: 'இன்றைய வானிலை நிலைமை',
    weather: 'வானிலை',
    crowd_level: 'கூட்ட நெரிசல்',
    footer_desc: 'நம்பிக்கையுடன் உலகை ஆராய அனைவருக்கும் அதிகாரம் அளித்தல்.'
  },
  TE: {
    dashboard: 'డాష్‌బోర్డ్',
    explore: 'ప్రదేశాలను అన్వేషించండి',
    plan_route: 'మార్గ ప్రణాళిక',
    itineraries: 'ప్రయాణ ప్రణాళిక',
    reports: 'నివేదికలు',
    community: 'కమ్యూనిటీ',
    copilot: 'ట్రావెల్ కోపైలట్',
    profile: 'యాక్సెసిబిలిటీ ప్రొఫైల్',
    tagline: 'అందరికీ సులభమైన ప్రయాణం',
    plan_trips: 'సులభమైన ప్రయాణాలను ప్లాన్ చేయండి',
    plan_desc: 'మెట్లు లేని మార్గాలు, అనుకూలమైన ప్రదేశాలను కనుగొనండి.',
    explore_now: 'ఇప్పుడే అన్వేషించండి',
    flights: 'విమానాలు',
    stays: 'హోటళ్ళు & బస',
    find_route: 'మీ సరైన మార్గాన్ని కనుగొనండి',
    start_loc: 'ప్రస్తుత స్థానం / ప్రారంభం',
    dest_loc: 'గమ్యస్థానం / ముగింపు',
    quick_pref: 'త్వరిత ప్రాధాన్యతలు',
    wheelchair: 'వీల్‌చైర్',
    step_free: 'మెట్లు లేని మార్గం',
    elevators: 'లిఫ్ట్',
    plan_button: 'నా మార్గాన్ని ప్రారంభించండి →',
    today_conditions: 'నేటి వాతావరణ సమాచారం',
    weather: 'వాతావరణం',
    crowd_level: 'జనసంద్రత',
    footer_desc: 'నమ్మకంతో ప్రపంచాన్ని అన్వేషించడానికి ప్రయాణికులను సక్రియం చేయడం.'
  },
  MR: {
    dashboard: 'डॅशबोर्ड',
    explore: 'ठिकाणे शोधा',
    plan_route: 'मार्ग नियोजन',
    itineraries: 'प्रवास कार्यक्रम',
    reports: 'रिपोर्ट्स',
    community: 'समुदाय',
    copilot: 'ट्रॅव्हल कोपायलट',
    profile: 'सुलभता प्रोफाईल',
    tagline: 'सर्वांसाठी सुलभ आणि सुरक्षित प्रवास',
    plan_trips: 'सुलभ प्रवासाचे नियोजन करा',
    plan_desc: 'पायऱ्यांशिवाय सुलभ मार्ग आणि लिफ्टची माहिती शोधा.',
    explore_now: 'आता शोधा',
    flights: 'विमान प्रवास',
    stays: 'हॉटेल आणि मुक्काम',
    find_route: 'तुमचा उत्तम मार्ग शोधा',
    start_loc: 'सध्याचे स्थान / सुरुवात',
    dest_loc: 'गंतव्य स्थान / शेवट',
    quick_pref: 'जलद प्राधान्ये',
    wheelchair: 'व्हीलचेअर',
    step_free: 'पायऱ्यांशिवाय',
    elevators: 'लिफ्ट',
    plan_button: 'माझा मार्ग आखा →',
    today_conditions: 'आजची हवामान स्थिती',
    weather: 'हवामान',
    crowd_level: 'गर्दीची पातळी',
    footer_desc: 'आत्मविश्वासाने जग शोधण्यासाठी सर्वांना सक्षम करणे.'
  },
  GU: {
    dashboard: 'ડેશબોર્ડ',
    explore: 'સ્થળો શોધો',
    plan_route: 'રૂટ પ્લાનિંગ',
    itineraries: 'મુસાફરી પ્લાન',
    reports: 'રિપોર્ટ્સ',
    community: 'સમુદાય',
    copilot: 'ટ્રાવેલ કોપાયલટ',
    profile: 'એક્સેસિબિલિટી પ્રોફાઇલ',
    tagline: 'સૌ માટે સુલભ મુસાફરી',
    plan_trips: 'સુલભ મુસાફરીનું પ્લાનિંગ કરો',
    plan_desc: 'પગથિયાં વગરના રસ્તા અને સુલભ સ્થળો શોધો.',
    explore_now: 'હમણાં શોધો',
    flights: 'ફ્લાઇટ્સ',
    stays: 'હોટેલ અને સ્ટે',
    find_route: 'તમારો શ્રેષ્ઠ રૂટ શોધો',
    start_loc: 'હાલનું સ્થળ / શરૂઆત',
    dest_loc: 'ગંતવ્ય સ્થળ / અંત',
    quick_pref: 'ઝડપી પસંદગીઓ',
    wheelchair: 'વ્હીલચેર',
    step_free: 'પગથિયાં વગરનું',
    elevators: 'લિફ્ટ',
    plan_button: 'મારો રૂટ પ્લાન કરો →',
    today_conditions: 'આજનું વાતાવરણ',
    weather: 'હવામાન',
    crowd_level: 'ભીડનું પ્રમાણ',
    footer_desc: 'વિશ્વાસ સાથે વિશ્વની મુસાફરી કરવા સૌને સક્ષમ બનાવવું.'
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

  const { location: userLocation, refreshLocation, requestLocationPermission } = useCurrentLocation();

  return (
    <AppContext.Provider value={{ 
      theme, 
      setTheme, 
      language, 
      setLanguage, 
      t, 
      userLocation, 
      refreshLocation, 
      requestLocationPermission 
    }}>
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
