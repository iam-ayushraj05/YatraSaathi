'use client';

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  displayName?: string;
  isFallback?: boolean;
  error?: string;
}

const STORAGE_KEY = 'yatrasaathi_user_location';

/**
 * Gets the current latitude and longitude using the browser's Geolocation API.
 */
export function getCurrentPosition(options?: PositionOptions): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by this browser.'));
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied by user.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location position unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while retrieving location.'));
            break;
        }
      },
      defaultOptions
    );
  });
}

/**
 * Reverse-geocodes lat and lng to human-readable address components.
 * Tries BigDataCloud first, then OpenStreetMap Nominatim.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city?: string; state?: string; country?: string; displayName?: string }> {
  // 1. Primary reverse geocoding via BigDataCloud client API
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const state = data.principalSubdivision !== city ? data.principalSubdivision : undefined;
      const country = data.countryName || 'India';
      
      const parts = [city, state, country].filter(Boolean);
      const displayName = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      return { city, state, country, displayName };
    }
  } catch (_) {
    // Ignore and proceed to secondary fallback
  }

  // 2. Secondary fallback via OpenStreetMap Nominatim API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'User-Agent': 'YatraSaathi-AccessibleTravel/1.0' },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district;
      const state = addr.state;
      const country = addr.country || 'India';
      
      const parts = [city, state, country].filter(Boolean);
      const displayName = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      return { city, state, country, displayName };
    }
  } catch (_) {
    // Ignore and fallback
  }

  return {
    displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
  };
}

/**
 * Gets the user's location, utilizing localStorage caching.
 * Set forceRefresh to true to bypass cache and query GPS again.
 */
export async function getUserLocation(forceRefresh = false): Promise<UserLocation> {
  if (typeof window === 'undefined') {
    throw new Error('getUserLocation can only be called on the client side.');
  }

  // Check cached location
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: UserLocation = JSON.parse(cached);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch (_) {}
  }

  try {
    const coords = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
    const geocoded = await reverseGeocode(coords.lat, coords.lng);

    const userLoc: UserLocation = {
      lat: coords.lat,
      lng: coords.lng,
      city: geocoded.city,
      state: geocoded.state,
      country: geocoded.country,
      displayName: geocoded.displayName,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
    } catch (_) {}

    return userLoc;
  } catch (error: any) {
    // Secondary fallback: Try IP-based location before giving error
    try {
      const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (ipRes.ok) {
        const data = await ipRes.json();
        if (data.latitude && data.longitude) {
          const userLoc: UserLocation = {
            lat: data.latitude,
            lng: data.longitude,
            city: data.city,
            state: data.region,
            country: data.country_name || 'India',
            displayName: [data.city, data.region, data.country_name].filter(Boolean).join(', '),
            isFallback: true,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
          } catch (_) {}
          return userLoc;
        }
      }
    } catch (_) {}

    const errMessage = error?.message || 'Location unavailable';
    throw new Error(errMessage);
  }
}

/**
 * Clears stored location from localStorage.
 */
export function clearStoredLocation(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }
}
