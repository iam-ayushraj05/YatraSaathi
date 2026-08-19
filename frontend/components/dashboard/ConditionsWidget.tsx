'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Users,
  MapPin,
  RefreshCw,
  AlertCircle,
  Thermometer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUserLocation, UserLocation } from '../../lib/location';
import { api } from '../../lib/api';
import { WeatherSnapshot } from '../../lib/types';

type StatusState = 'loading_loc' | 'loading_weather' | 'success' | 'loc_denied' | 'loc_unavailable' | 'weather_failed';

const WEATHER_CACHE_KEY = 'yatrasaathi_weather_cache';

interface CachedWeatherData {
  weather: WeatherSnapshot;
  userLoc: UserLocation;
  timestamp: number;
}

export default function ConditionsWidget() {
  const { language } = useApp();
  const isHindi = language === 'HI';

  const [status, setStatus] = useState<StatusState>('loading_loc');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherSnapshot | null>(null);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    // 1. Check cache if not forcing refresh
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cachedStr = localStorage.getItem(WEATHER_CACHE_KEY);
        if (cachedStr) {
          const cached: CachedWeatherData = JSON.parse(cachedStr);
          const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
          if (ageMinutes < 15 && cached.weather && cached.userLoc) {
            setWeatherData(cached.weather);
            setUserLoc(cached.userLoc);
            setStatus('success');
            return;
          }
        }
      } catch {}
    }

    setStatus('loading_loc');
    setErrorMessage('');

    let loc: UserLocation;
    try {
      loc = await getUserLocation(forceRefresh);
      setUserLoc(loc);
    } catch (err: any) {
      if (err?.code === 1 || err?.message?.includes('denied')) {
        setStatus('loc_denied');
        setErrorMessage(isHindi ? 'स्थान की अनुमति आवश्यक है' : 'Location permission required');
      } else {
        setStatus('loc_unavailable');
        setErrorMessage(isHindi ? 'स्थान अनुपलब्ध है' : 'Location unavailable');
      }
      return;
    }

    // 2. Fetch weather from backend
    setStatus('loading_weather');
    try {
      const weather = await api.context.getWeather(loc.lat, loc.lng);
      if (!weather) {
        setStatus('weather_failed');
        setErrorMessage(isHindi ? 'मौसम अनुपलब्ध है' : 'Weather unavailable');
        return;
      }

      setWeatherData(weather);
      setStatus('success');

      // Save to cache
      if (typeof window !== 'undefined') {
        try {
          const cachePayload: CachedWeatherData = {
            weather,
            userLoc: loc,
            timestamp: Date.now()
          };
          localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cachePayload));
        } catch {}
      }
    } catch (err: any) {
      setStatus('weather_failed');
      setErrorMessage(isHindi ? 'मौसम अनुपलब्ध है' : 'Weather unavailable');
    }
  }, [isHindi]);

  useEffect(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  // Helper to choose condition icon
  const renderWeatherIcon = (condition: string = '') => {
    const c = condition.toUpperCase();
    if (c.includes('RAIN') || c.includes('DRIZZLE')) {
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    }
    if (c.includes('STORM') || c.includes('THUNDER')) {
      return <CloudLightning className="h-4 w-4 text-purple-500" />;
    }
    if (c.includes('FOG') || c.includes('MIST')) {
      return <CloudFog className="h-4 w-4 text-slate-400" />;
    }
    if (c.includes('CLOUD')) {
      return <Cloud className="h-4 w-4 text-indigo-400" />;
    }
    return <Sun className="h-4 w-4 fill-amber-400 text-amber-500" />;
  };

  const raw = weatherData?.raw_metadata || {};
  const tempC = weatherData?.temperature_c ?? weatherData?.temp ?? null;
  const feelsLike = raw.feels_like_c ?? tempC;
  const humidity = raw.humidity_percent ?? weatherData?.humidity ?? null;
  const windKph = weatherData?.wind_speed_kph ?? weatherData?.wind_speed ?? null;
  const precip = raw.precipitation_mm ?? (weatherData?.rain_probability ? Math.round(weatherData.rain_probability * 100) : null);

  const cityName = userLoc?.city || raw.city_name || (isHindi ? 'वर्तमान स्थान' : 'Current Location');
  const isApproximate = userLoc?.isFallback || false;

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121420] p-5 shadow-sm space-y-4 transition-colors">
      {/* Header with Title and Refresh Button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
            <span>{isHindi ? "आज की स्थितियां" : "Today's Conditions"}</span>
          </h3>
          {status === 'success' && cityName && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                {cityName}
              </span>
              {isApproximate && (
                <span className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1 rounded border border-amber-200/50">
                  {isHindi ? 'अनुमानित' : 'Approximate'}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fetchWeather(true)}
          disabled={status === 'loading_loc' || status === 'loading_weather'}
          title={isHindi ? "मौसम ताज़ा करें" : "Refresh weather"}
          className="flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 transition"
        >
          <RefreshCw className={`h-3 w-3 ${(status === 'loading_loc' || status === 'loading_weather') ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'ताज़ा करें' : 'Refresh'}</span>
        </button>
      </div>

      {/* Body States */}
      {(status === 'loading_loc' || status === 'loading_weather') && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <RefreshCw className="h-5 w-5 text-purple-600 animate-spin" />
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {status === 'loading_loc'
              ? (isHindi ? 'स्थान प्राप्त किया जा रहा है...' : 'Getting location...')
              : (isHindi ? 'मौसम प्राप्त किया जा रहा है...' : 'Getting weather...')}
          </p>
        </div>
      )}

      {(status === 'loc_denied' || status === 'loc_unavailable' || status === 'weather_failed') && (
        <div className="py-5 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {status === 'loc_denied' && (isHindi ? 'स्थान अनुमति आवश्यक है' : 'Location permission required')}
            {status === 'loc_unavailable' && (isHindi ? 'स्थान अनुपलब्ध है' : 'Location unavailable')}
            {status === 'weather_failed' && (isHindi ? 'मौसम अनुपलब्ध है' : 'Weather unavailable')}
          </p>
          <button
            onClick={() => fetchWeather(true)}
            className="text-[10px] font-bold text-purple-600 dark:text-purple-400 underline hover:text-purple-700"
          >
            {isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
          </button>
        </div>
      )}

      {status === 'success' && weatherData && (
        <div className="space-y-3">
          {/* Weather Main Item */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100/80 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                {renderWeatherIcon(weatherData.condition)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isHindi ? 'मौसम' : 'Weather'}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {tempC !== null ? `${Math.round(tempC)}°C` : '--'}
                  </p>
                  {feelsLike !== null && feelsLike !== tempC && (
                    <span className="text-[9px] text-slate-400 font-semibold">
                      (Feels {Math.round(feelsLike)}°)
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize">
                  {raw.description || weatherData.condition.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Details Row: Humidity & Wind */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Humidity */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
              <Droplets className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{isHindi ? 'नमी' : 'Humidity'}</p>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                  {humidity !== null ? `${Math.round(humidity)}%` : '--'}
                </p>
              </div>
            </div>

            {/* Wind */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
              <Wind className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{isHindi ? 'हवा' : 'Wind'}</p>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                  {windKph !== null ? `${Math.round(windKph)} km/h` : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Rain / Precipitation (when available or > 0) */}
          {precip !== null && precip !== 0 && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl text-blue-700 dark:text-blue-300 text-[10px] font-bold">
              <span className="flex items-center gap-1.5">
                <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                <span>{isHindi ? 'बारिश का पूर्वाभास' : 'Rain / Precip'}</span>
              </span>
              <span>{typeof precip === 'number' && precip < 1 ? `${Math.round(precip * 100)}% chance` : `${precip} mm`}</span>
            </div>
          )}

          {/* Crowd Level Item */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isHindi ? 'भीड़ का स्तर' : 'Crowd Level'}</p>
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Low</p>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold">{isHindi ? 'सामान्य' : 'Normal'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
