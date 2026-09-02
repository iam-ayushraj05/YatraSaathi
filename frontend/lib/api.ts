import {
  User,
  AccessibilityProfile,
  Place,
  PlaceDetails,
  Barrier,
  Report,
  Route,
  Itinerary,
  WeatherSnapshot,
  CrowdObservation,
  Coordinate
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

// Safe localStorage access
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('yatrasaathi_token');
  }
  return null;
};

const getGuestToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('yatrasaathi_guest_token');
  }
  return null;
};

// Fetch wrapper with auth header & guest token
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const guestToken = getGuestToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(guestToken ? { 'X-Guest-Session-Token': guestToken } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'API request failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch (_) {}
      throw new Error(errorDetail);
    }

    const wrapper = await response.json();
    return (wrapper && wrapper.data !== undefined ? wrapper.data : wrapper) as T;
  } catch (err: any) {
    // If backend endpoint fails or network error occurs, log and handle gracefully
    console.warn(`[API] Endpoint call ${endpoint} failed:`, err.message || err);
    throw err;
  }
}

export interface GuestSessionData {
  session_token: string;
  voice_chat_count: number;
  max_free_chats: number;
  expires_at: string;
  is_authenticated: boolean;
  temporary_conversation_id?: string;
  temporary_journey_data?: any;
}

export interface VoiceAccessData {
  allowed: boolean;
  is_authenticated: boolean;
  voice_chat_count: number;
  max_free_chats: number;
  requires_auth?: boolean;
  message: string;
}

export const api = {
  // Guest Session & Voice Access Control
  guest: {
    async getSession(): Promise<GuestSessionData> {
      const data = await apiFetch<GuestSessionData>('/guest/session', {
        method: 'POST',
        body: JSON.stringify({ session_token: getGuestToken() }),
      });
      if (typeof window !== 'undefined' && data?.session_token) {
        localStorage.setItem('yatrasaathi_guest_token', data.session_token);
      }
      return data;
    },

    async checkVoiceAccess(): Promise<VoiceAccessData> {
      return apiFetch<VoiceAccessData>('/guest/voice-access');
    },

    async startVoiceSession(): Promise<any> {
      return apiFetch<any>('/guest/voice/start', {
        method: 'POST',
      });
    },

    async completeVoiceSession(params: {
      conversation_id: string;
      turns_count?: number;
      duration_seconds?: number;
      journey_data?: any;
    }): Promise<{
      voice_chat_count: number;
      max_free_chats: number;
      is_authenticated: boolean;
      remaining_free: number;
      toast_message?: string;
    }> {
      return apiFetch<any>('/guest/voice/complete', {
        method: 'POST',
        body: JSON.stringify({
          session_token: getGuestToken(),
          conversation_id: params.conversation_id,
          turns_count: params.turns_count || 1,
          duration_seconds: params.duration_seconds || 0,
          journey_data: params.journey_data,
        }),
      });
    },

    async convertSession(): Promise<any> {
      const gToken = getGuestToken();
      if (!gToken) return null;
      return apiFetch<any>('/guest/convert', {
        method: 'POST',
        body: JSON.stringify({ session_token: gToken }),
      });
    }
  },

  // Production Authentication
  auth: {
    async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: any }> {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        let errMsg = 'Incorrect email or password';
        try {
          const err = await response.json();
          errMsg = err.detail || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await response.json();
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('yatrasaathi_token', data.access_token);
      }
      return data;
    },

    async register(data: {
      email: string;
      password: string;
      display_name: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    }): Promise<any> {
      const result = await apiFetch<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (typeof window !== 'undefined' && result?.access_token) {
        localStorage.setItem('yatrasaathi_token', result.access_token);
      }
      return result;
    },

    async loginWithGoogle(data: {
      credential?: string;
      email?: string;
      name?: string;
      avatar_url?: string;
      google_id?: string;
    }): Promise<any> {
      const result = await apiFetch<any>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (typeof window !== 'undefined' && result?.access_token) {
        localStorage.setItem('yatrasaathi_token', result.access_token);
      }
      return result;
    },

    async sendPhoneOtp(phone: string): Promise<{
      status: string;
      phone: string;
      expires_in_seconds: number;
      resend_in_seconds: number;
      demo_otp_hint?: string;
      message: string;
    }> {
      return apiFetch<any>('/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    async verifyPhoneOtp(data: { phone: string; otp: string; name?: string }): Promise<any> {
      const result = await apiFetch<any>('/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (typeof window !== 'undefined' && result?.access_token) {
        localStorage.setItem('yatrasaathi_token', result.access_token);
      }
      return result;
    },

    async forgotPassword(email: string): Promise<any> {
      return apiFetch<any>('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async resetPassword(data: { token: string; new_password: string }): Promise<any> {
      return apiFetch<any>('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async saveOnboarding(data: {
      travel_style?: string;
      accessibility_features?: string[];
      walking_limit_meters?: number;
    }): Promise<any> {
      return apiFetch<any>('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getSavedJourneys(): Promise<any[]> {
      return apiFetch<any[]>('/auth/saved-journeys');
    },

    async saveJourney(journey: {
      journey_id?: string;
      title: string;
      origin: string;
      destination: string;
      accessibility_score?: number;
      route_details?: any;
    }): Promise<any> {
      return apiFetch<any>('/auth/saved-journeys', {
        method: 'POST',
        body: JSON.stringify(journey),
      });
    },

    async getSavedPlaces(): Promise<any[]> {
      return apiFetch<any[]>('/auth/saved-places');
    },

    async savePlace(place: {
      place_id: string;
      name: string;
      category?: string;
      city?: string;
      notes?: string;
    }): Promise<any> {
      return apiFetch<any>('/auth/saved-places', {
        method: 'POST',
        body: JSON.stringify(place),
      });
    },

    async getMe(): Promise<any> {
      return apiFetch<any>('/auth/me');
    },

    async logout(): Promise<void> {
      try {
        await apiFetch<any>('/auth/logout', { method: 'POST' });
      } catch (_) {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('yatrasaathi_token');
      }
    }
  },

  // Accessibility Profiles
  profiles: {
    async get(profileId: string): Promise<AccessibilityProfile> {
      return apiFetch<AccessibilityProfile>(`/profiles/${profileId}`);
    },

    async create(profile: Partial<AccessibilityProfile>): Promise<AccessibilityProfile> {
      return apiFetch<AccessibilityProfile>('/profiles', {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    },

    async update(profileId: string, profile: Partial<AccessibilityProfile>): Promise<AccessibilityProfile> {
      return apiFetch<AccessibilityProfile>(`/profiles/${profileId}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    }
  },

  // Places
  places: {
    async search(params: {
      q?: string;
      lat?: number;
      lng?: number;
      radius?: number;
      category?: string;
      step_free?: boolean;
      verified_only?: boolean;
    }): Promise<any[]> {
      const query = new URLSearchParams();
      if (params.q) query.append('q', params.q);
      if (params.lat !== undefined) query.append('lat', String(params.lat));
      if (params.lng !== undefined) query.append('lng', String(params.lng));
      if (params.radius) query.append('radius', String(params.radius));
      if (params.category) query.append('category', params.category);
      if (params.step_free) query.append('step_free', String(params.step_free));
      if (params.verified_only) query.append('verified_only', String(params.verified_only));

      return apiFetch<any[]>(`/places?${query.toString()}`);
    },

    async getDetails(placeId: string): Promise<PlaceDetails> {
      return apiFetch<PlaceDetails>(`/places/${placeId}`);
    },

    async getAccessibility(placeId: string): Promise<any> {
      return apiFetch<any>(`/places/${placeId}/accessibility`);
    },

    async getFacilities(placeId: string): Promise<any[]> {
      return apiFetch<any[]>(`/places/${placeId}/facilities`);
    }
  },

  // Barriers & Live Intelligence
  barriers: {
    async createReport(formData: FormData): Promise<any> {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE}/barriers`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to create report' }));
        throw new Error(err.detail || 'Failed to submit barrier report');
      }
      const data = await response.json();
      return data.data;
    },

    async getNearby(lat: number, lng: number, radiusMeters: number = 5000): Promise<any[]> {
      const res = await apiFetch<any>(`/barriers/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
      return res.data || [];
    },

    async vote(barrierId: string, confirmed: boolean, userLat?: number, userLng?: number): Promise<any> {
      const formData = new FormData();
      formData.append('confirmed', String(confirmed));
      if (userLat) formData.append('user_lat', String(userLat));
      if (userLng) formData.append('user_lng', String(userLng));

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE}/barriers/${barrierId}/verify`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to vote on barrier' }));
        throw new Error(err.detail || 'Failed to record vote');
      }
      const data = await response.json();
      return data.data;
    },

    async getUserReputation(): Promise<any> {
      const res = await apiFetch<any>('/barriers/user/reputation');
      return res.data;
    },

    async getDetails(barrierId: string): Promise<any> {
      const res = await apiFetch<any>(`/barriers/${barrierId}`);
      return res.data;
    }
  },

  // Reports
  reports: {
    async create(report: {
      place_id: string;
      report_type: string;
      title: string;
      description: string;
      location: Coordinate;
    }): Promise<Report> {
      return apiFetch<Report>('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
    },

    async uploadEvidence(reportId: string, file: File): Promise<any> {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/reports/${reportId}/evidence`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Evidence upload failed');
      }
      const wrapper = await response.json();
      return wrapper.data;
    },

    async getMyReports(): Promise<Report[]> {
      return apiFetch<Report[]>('/reports/me');
    }
  },

  // Routes
  routes: {
    async plan(req: {
      origin: Coordinate;
      destination: Coordinate;
      profile_id?: string;
      preferences?: Record<string, any>;
    }): Promise<{ request_id: string; routes: Route[] }> {
      return apiFetch<{ request_id: string; routes: Route[] }>('/routes/plan', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    },

    async recalculate(routeId: string): Promise<{
      previous_route_id: string;
      previous_route_affected: boolean;
      reason: string;
      routes: Route[];
    }> {
      return apiFetch<any>(`/routes/${routeId}/recalculate`, {
        method: 'POST',
      });
    },

    async checkImpact(routeId: string): Promise<{
      affected: boolean;
      severity: string;
      recommended_action: string;
    }> {
      return apiFetch<any>(`/routes/internal/${routeId}/impact`, {
        method: 'POST',
      });
    }
  },

  // Itineraries
  itineraries: {
    async create(title: string, stops: Array<{ place_id: string; sequence: number; notes?: string }>): Promise<Itinerary> {
      return apiFetch<Itinerary>('/itineraries', {
        method: 'POST',
        body: JSON.stringify({ title, stops }),
      });
    },

    async get(itineraryId: string): Promise<Itinerary> {
      return apiFetch<Itinerary>(`/itineraries/${itineraryId}`);
    },

    async getSuitability(itineraryId: string): Promise<any> {
      return apiFetch<any>(`/itineraries/${itineraryId}/suitability`);
    }
  },

  // Context
  context: {
    async getWeather(lat: number, lng: number): Promise<WeatherSnapshot> {
      return apiFetch<WeatherSnapshot>(`/context/weather?lat=${lat}&lng=${lng}`);
    },

    async getCrowds(placeId: string): Promise<CrowdObservation> {
      return apiFetch<CrowdObservation>(`/context/crowds?place_id=${placeId}`);
    }
  },

  // Copilot
  copilot: {
    async chat(req: {
      message: string;
      current_location?: { lat: number; lng: number };
      destination?: { lat: number; lng: number };
      profile_id?: string;
      conversation_history?: Array<{ role: string; content: string }>;
    }): Promise<{
      response: string;
      relevant_places?: any[];
      relevant_accessibility?: any;
      warnings?: string[];
      route_info?: any;
    }> {
      return apiFetch<any>('/copilot/chat', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    },

    async getVoiceToken(roomName?: string, participantName?: string): Promise<{
      server_url: string;
      room_name: string;
      token: string;
      provider: string;
    }> {
      const query = new URLSearchParams();
      if (roomName) query.append('room_name', roomName);
      if (participantName) query.append('participant_name', participantName);
      return apiFetch<any>(`/copilot/voice-token?${query.toString()}`);
    },

    async processVoice(req: {
      transcript?: string;
      current_location?: { lat: number; lng: number };
      voice_gender?: string;
      voice_id?: string;
      conversation_history?: Array<{ role: string; content: string }>;
    }): Promise<{


      transcript: string;
      response: string;
      audio?: any;
      relevant_places?: any[];
      route_info?: any;
      warnings?: string[];
      is_end_call?: boolean;
    }> {

      return apiFetch<any>('/copilot/voice-process', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    }
  }
};


