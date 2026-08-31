'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Users, 
  HeartHandshake, 
  Briefcase, 
  Sparkles, 
  Check, 
  Accessibility, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

interface PostSignupOnboardingModalProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function PostSignupOnboardingModal({
  onComplete,
  onSkip,
}: PostSignupOnboardingModalProps) {
  const { completeOnboarding, closeAuthModal } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [travelStyle, setTravelStyle] = useState<string>('SOLO');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Step-free routes', 'Wheelchair access']);
  const [loading, setLoading] = useState<boolean>(false);

  const travelStyles = [
    { id: 'SOLO', label: 'Solo', icon: User, desc: 'Independent exploration' },
    { id: 'FAMILY', label: 'Family', icon: Users, desc: 'Traveling with kids or elders' },
    { id: 'FRIENDS', label: 'Friends', icon: Users, desc: 'Group travel & sightseeing' },
    { id: 'BUSINESS', label: 'Business', icon: Briefcase, desc: 'Work trips with quick routes' },
    { id: 'ASSISTED', label: 'Assisted Travel', icon: HeartHandshake, desc: 'Requires companion or transit aid' },
  ];

  const accessibilityOptions = [
    'Wheelchair access',
    'Step-free routes',
    'Elevators',
    'Accessible toilets',
    'Reduced walking',
    'Visual assistance',
    'Hearing assistance'
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        travel_style: travelStyle,
        accessibility_features: selectedFeatures,
      });
      onComplete?.();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    closeAuthModal();
    onSkip?.();
  };

  return (
    <div className="w-full space-y-5">
      {/* Progress Dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-2 rounded-full transition-all ${step === 1 ? 'bg-[#6b21a8]' : 'bg-purple-200 dark:bg-purple-900'}`} />
          <div className={`w-8 h-2 rounded-full transition-all ${step === 2 ? 'bg-[#6b21a8]' : 'bg-purple-200 dark:bg-purple-900'}`} />
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6b21a8] dark:text-purple-400">Step 1 of 2</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              Tell us how you travel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              We&apos;ll tailor route planning, stops, and crowd alerts based on your travel style.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {travelStyles.map((item) => {
              const Icon = item.icon;
              const isSelected = travelStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTravelStyle(item.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#6b21a8] dark:border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#6b21a8] text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Next: Accessibility Needs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6b21a8] dark:text-purple-400">Step 2 of 2</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              What accessibility features matter to you?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Select any requirements so YatraSaathi and YatraMitra can automatically prioritize them.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {accessibilityOptions.map((opt) => {
              const isSelected = selectedFeatures.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleFeature(opt)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#6b21a8] bg-[#6b21a8] text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-purple-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Personalize My YatraSaathi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
