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

const API_BASE = 'http://127.0.0.1:8000/api/v1';

// Safe localStorage access
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('yatrasaathi_token');
  }
  return null;
};

// Fetch wrapper with auth header
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

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
  // Unwrap standard backend ResponseWrapper
  return (wrapper && wrapper.data !== undefined ? wrapper.data : wrapper) as T;
}

export const api = {
  // Authentication
  auth: {
    async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Incorrect email or password');
      }
      const data = await response.json();
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('yatrasaathi_token', data.access_token);
      }
      return data;
    },

    async register(email: string, password: string, displayName: string): Promise<any> {
      const wrapper = await apiFetch<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      });
      return wrapper;
    },

    async getMe(): Promise<User> {
      return apiFetch<User>('/auth/me');
    },

    logout() {
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

  // Barriers
  barriers: {
    async getNearby(lat: number, lng: number, radiusMeters: number = 5000): Promise<Barrier[]> {
      return apiFetch<Barrier[]>(`/barriers/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
    },

    async getDetails(barrierId: string): Promise<Barrier> {
      return apiFetch<Barrier>(`/barriers/${barrierId}`);
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


