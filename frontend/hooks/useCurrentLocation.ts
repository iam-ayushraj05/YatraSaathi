'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserLocation, UserLocation } from '../lib/location';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'reverse_geocoding'
  | 'success'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported'
  | 'error';

export interface LocationState {
  lat: number;
  lng: number;
  city: string;
  stateName?: string;
  displayName: string;
  formattedLocation: string;
  isFallback: boolean;
  status: GeolocationStatus;
  errorMessage?: string;
  lastUpdated?: number;
}

const DEFAULT_LOCATION: LocationState = {
  lat: 28.6139,
  lng: 77.2090,
  city: 'New Delhi',
  stateName: 'Delhi',
  displayName: 'Current Location (New Delhi)',
  formattedLocation: 'New Delhi, Delhi',
  isFallback: true,
  status: 'idle',
};

export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const hasRequestedRef = useRef(false);

  const fetchLocation = useCallback(async (forceRefresh = false) => {
    if (typeof window === 'undefined') return;

    setLocation((prev) => ({ ...prev, status: 'requesting' }));

    try {
      const userLoc: UserLocation = await getUserLocation(forceRefresh);
      const city = userLoc.city || 'Detected Location';
      const stateName = userLoc.state;
      const formattedLocation = [city, stateName].filter(Boolean).join(', ');
      const displayName = `Current Location (${formattedLocation || 'Detected'})`;

      setLocation({
        lat: userLoc.lat,
        lng: userLoc.lng,
        city,
        stateName,
        displayName,
        formattedLocation: formattedLocation || 'Detected Location',
        isFallback: false,
        status: 'success',
        lastUpdated: Date.now(),
      });
    } catch (err: any) {
      setLocation({
        ...DEFAULT_LOCATION,
        status: 'error',
        errorMessage: err?.message || 'Location unavailable',
        lastUpdated: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      fetchLocation(false);
    }
  }, [fetchLocation]);

  return {
    location,
    refreshLocation: () => fetchLocation(true),
    requestLocationPermission: () => fetchLocation(true),
  };
}
