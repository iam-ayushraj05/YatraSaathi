export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'TRAVELLER' | 'AUDITOR' | 'AUTHORITY' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessibilityProfile {
  id: string;
  user_id: string;
  mobility_preferences?: Record<string, boolean>;
  vision_preferences?: Record<string, boolean>;
  hearing_preferences?: Record<string, boolean>;
  cognitive_preferences?: Record<string, boolean>;
  walking_limit_meters?: number;
  avoid_stairs: boolean;
  prefer_step_free: boolean;
  prefer_rest_stops: boolean;
  preferred_route_style: 'MOST_ACCESSIBLE' | 'LEAST_WALKING' | 'FASTEST_ACCESSIBLE' | 'BALANCED';
  created_at: string;
  updated_at: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  region?: string;
  country: string;
  website_url?: string;
  phone?: string;
  opening_hours?: Record<string, any>;
  location: Coordinate;
  status: string;
  created_at: string;
  updated_at: string;
  accessibility_summary?: {
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
    verified: boolean;
    active_barriers_count: number;
    confidence?: string;
  };
}

export interface Facility {
  id: string;
  place_id: string;
  facility_type: string;
  name: string;
  description?: string;
  is_operational: boolean;
  last_checked_at?: string;
}

export interface AssistancePoint {
  id: string;
  place_id?: string;
  name: string;
  assistance_type: string;
  description?: string;
  location: Coordinate;
  availability_status: string;
  source_type: string;
  last_verified_at?: string;
}

export interface AccessibilityRecord {
  id: string;
  place_id: string;
  feature: string;
  status: string;
  confidence: string;
  source_type: string;
  last_verified_at?: string;
}

export interface PlaceDetails {
  place: Place;
  accessibility_summary: {
    level: string;
    verified: boolean;
    active_barriers_count: number;
    confidence: string;
  };
  accessibility_records: AccessibilityRecord[];
  facilities: Facility[];
  assistance_points: AssistancePoint[];
  active_barriers: Barrier[];
  trust_score: string;
  last_verified_at?: string;
}

export interface Barrier {
  id: string;
  place_id: string;
  reported_by?: string;
  report_id?: string;
  barrier_type: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: Coordinate;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING' | 'INACTIVE';
  observed_at?: string;
  reported_at?: string;
  verified_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  place_id: string;
  report_type: 'BARRIER' | 'FACILITY' | 'ASSISTANCE' | 'FEEDBACK';
  title: string;
  description: string;
  location: Coordinate;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  created_at: string;
  updated_at: string;
  evidence?: Evidence[];
}

export interface Evidence {
  id: string;
  report_id?: string;
  barrier_id?: string;
  uploaded_by?: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  ai_analysis?: Record<string, any>;
  ai_confidence?: number;
  created_at: string;
}

export interface RouteSegment {
  id: string;
  route_id: string;
  sequence: number;
  geometry: Coordinate[];
  distance_meters: number;
  duration_seconds: number;
  surface_type: string;
  stairs_count: number;
  accessibility_status: string;
  barrier_count: number;
}

export interface Route {
  id: string;
  route_request_id?: string;
  geometry: Coordinate[];
  total_distance_meters: number;
  total_duration_seconds: number;
  suitability_score: number;
  accessibility_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  safety_index: number;
  stairs_count: number;
  step_free: boolean;
  barriers_encountered_count: number;
  segments?: RouteSegment[];
}

export interface ItineraryStop {
  id: string;
  itinerary_id: string;
  place_id: string;
  sequence: number;
  planned_start?: string;
  planned_end?: string;
  notes?: string;
  place?: Place;
  accessibility_snapshot?: Record<string, any>;
}

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  source: 'USER_CREATED' | 'AI_GENERATED';
  created_at: string;
  updated_at: string;
  stops: ItineraryStop[];
}

export interface WeatherSnapshot {
  temp: number;
  humidity: number;
  condition: string;
  wind_speed: number;
  aqi?: number;
  recorded_at: string;
}

export interface CrowdObservation {
  place_id: string;
  crowd_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  density_score: number;
  estimated_count?: number;
  observed_at: string;
}
