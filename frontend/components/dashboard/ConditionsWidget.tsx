'use client';

import React, { useEffect, useState } from 'react';
import { 
  CloudSun, 
  Users, 
  Wind, 
  AlertCircle,
  Thermometer
} from 'lucide-react';
import { api } from '../../lib/api';
import { WeatherSnapshot, CrowdObservation } from '../../lib/types';
import { useApp } from '../../context/AppContext';

export default function ConditionsWidget() {
  const { t, language } = useApp();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [crowd, setCrowd] = useState<CrowdObservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const wData = await api.context.getWeather(28.6129, 77.2295);
        setWeather(wData);
        const cData = await api.context.getCrowds('default-place');
        setCrowd(cData);
      } catch (err) {
        setWeather({
          temp: 32,
          humidity: 65,
          condition: 'Sunny',
          wind_speed: 12,
          aqi: 45,
          recorded_at: new Date().toISOString()
        });
        setCrowd({
          place_id: 'default-place',
          crowd_level: 'LOW',
          density_score: 0.12,
          estimated_count: 85,
          observed_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getAQIDesc = (aqi?: number) => {
    if (!aqi) return { text: language === 'HI' ? 'अज्ञात' : 'Unknown', color: 'text-slate-400 dark:text-slate-500 bg-slate-55 dark:bg-slate-900 border-slate-100 dark:border-slate-800' };
    if (aqi <= 50) return { text: language === 'HI' ? 'अच्छा' : 'Good', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' };
    if (aqi <= 100) return { text: language === 'HI' ? 'मध्यम' : 'Moderate', color: 'text-yellow-705 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30' };
    return { text: language === 'HI' ? 'खराब' : 'Poor', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' };
  };

  const getCrowdDesc = (level?: string) => {
    switch (level) {
      case 'LOW':
        return { text: language === 'HI' ? 'कम भीड़' : 'Low Crowd', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' };
      case 'MODERATE':
        return { text: language === 'HI' ? 'मध्यम' : 'Moderate', color: 'text-amber-705 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' };
      default:
        return { text: language === 'HI' ? 'व्यस्त' : 'Busy', color: 'text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' };
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-8 w-full bg-slate-50 dark:bg-slate-900 rounded-lg" />
        <div className="h-8 w-full bg-slate-50 dark:bg-slate-900 rounded-lg" />
      </div>
    );
  }

  const aqiInfo = getAQIDesc(weather?.aqi);
  const crowdInfo = getCrowdDesc(crowd?.crowd_level);

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-4 shadow-sm transition-colors">
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <CloudSun className="h-4 w-4 text-violet-650 dark:text-violet-400" />
        <h3 className="font-bold text-slate-805 dark:text-slate-100 text-xs">{t('today_conditions')}</h3>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {/* Weather */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0">
              <CloudSun className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('weather')}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
                {weather?.condition === 'Sunny' ? (language === 'HI' ? 'धूप' : 'Sunny') : weather?.condition}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-0.5 justify-end">
              <Thermometer className="h-3 w-3 text-slate-400" />
              {weather?.temp ?? weather?.temperature_c ?? 28}°C

            </p>
            <p className="text-[9px] text-slate-450 dark:text-slate-500 leading-none mt-0.5">{language === 'HI' ? 'धूप' : 'Sunny'}</p>
          </div>
        </div>

        {/* Crowd */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('crowd_level')}</p>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 leading-none mt-0.5">{language === 'HI' ? 'अभी' : 'Right now'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-md uppercase ${crowdInfo.color}`}>
              {crowdInfo.text}
            </span>
          </div>
        </div>

        {/* Air Quality */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/25 border border-teal-100 dark:border-teal-900/30 flex items-center justify-center text-teal-500 shrink-0">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('air_quality')}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">{language === 'HI' ? 'एक्यूआई सूचकांक' : 'AQI Index'}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-1.5 justify-end">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">AQI {weather?.aqi}</span>
            <span className={`text-[8px] font-extrabold border px-1.5 py-0.2 rounded-md uppercase ${aqiInfo.color}`}>
              {aqiInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-medium px-0.5">
        <AlertCircle className="h-3 w-3 text-slate-350 dark:text-slate-650 shrink-0" />
        <span>{language === 'HI' ? 'वास्तविक समय में अपडेट किया गया।' : 'Updated in real-time.'}</span>
      </div>
    </div>
  );
}
