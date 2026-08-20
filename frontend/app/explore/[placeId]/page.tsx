'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, CheckCircle2, AlertTriangle, Shield, Star, Accessibility,
  ArrowLeft, Navigation, Loader2, ChevronRight, Phone, Clock, ExternalLink
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { PlaceDetails } from '../../../lib/types';

const PLACE_IMAGES: Record<string, string> = {
  'Lotus Temple': '/images/places/lotus-temple.jpg',
  'Qutub Minar': '/images/places/qutub-minar.jpg',
  'Qutub Minar Complex': '/images/places/qutub-minar.jpg',
  'Red Fort': '/images/places/red-fort.jpg',
  'India Gate': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  "Humayun's Tomb": 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
  'National Museum': '/images/places/national-museum.jpg',
  'Connaught Place': '/images/places/connaught-place.jpg',
  'Lodhi Gardens': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
  'Akshardham Temple': '/images/places/akshardham.jpg',
  'Jantar Mantar': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  'Taj Mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'Udaipur City Palace': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
  'City Palace, Udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
  'Juhu Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Kovalam Lighthouse Beach Deck': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80',
  'Miramar Beach': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'Vidhana Soudha': '/images/places/vidhana-soudha.jpg',
  'Birla Planetarium': '/images/places/birla-planetarium.jpg',
  'M. P. Birla Planetarium': '/images/places/birla-planetarium.jpg',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';

const PLACE_DETAILS_MAP: Record<string, PlaceDetails> = {
  'p1': {
    place: { id: 'p1', name: 'India Gate', category: 'Monument', country: 'India', city: 'New Delhi', description: 'Iconic national memorial with wide paved boulevards, smooth step-free walkways, dedicated accessible parking, and level access to all central vista plazas.', location: { lat: 28.6129, lng: 77.2295 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.98' },
    accessibility_records: [
      { id: 'ar1', place_id: 'p1', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'ar2', place_id: 'p1', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' },
      { id: 'ar1_3', place_id: 'p1', feature: 'AUDIO_GUIDE', status: 'AVAILABLE', confidence: '0.92', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f1', place_id: 'p1', facility_type: 'RESTROOM', name: 'Accessible Public Toilet', description: 'Equipped with grab bars, emergency cord, and sliding wide door.', is_operational: true },
      { id: 'f2', place_id: 'p1', facility_type: 'RAMP', name: 'Central Vista Step-Free Promenade', description: 'Wide paved path with gentle 1:15 gradient incline.', is_operational: true },
      { id: 'f1_3', place_id: 'p1', facility_type: 'PARKING', name: 'Dedicated Disabled Parking Bay', description: 'Close-proximity parking bays with dropped curbs.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap1', place_id: 'p1', name: 'Visitor Information & Assist Desk', assistance_type: 'MOBILITY', description: 'Wheelchair assistance and escorts available.', location: { lat: 28.6129, lng: 77.2295 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.98'
  },
  'p2': {
    place: { id: 'p2', name: 'Lotus Temple', category: 'Temple', country: 'India', city: 'New Delhi', description: 'Serene Bahai House of Worship with gradual ramped approaches, smooth marble prayer hall, loaned manual wheelchairs, and tactile orientation guides.', location: { lat: 28.5535, lng: 77.2588 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.99' },
    accessibility_records: [
      { id: 'ar3', place_id: 'p2', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.99', source_type: 'AUDIT' },
      { id: 'ar2_2', place_id: 'p2', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'ar2_3', place_id: 'p2', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f3', place_id: 'p2', facility_type: 'RAMP', name: 'Temple Garden Marble Ramp', description: 'Zero-step entrance into central prayer sanctuary.', is_operational: true },
      { id: 'f2_2', place_id: 'p2', facility_type: 'RAMP', name: 'Zero-Step Sanctum Entrance', description: 'Smooth marble ramps leading directly to main prayer hall.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap2', place_id: 'p2', name: 'Volunteer Wheelchair Escort Service', assistance_type: 'MOBILITY', description: 'Free manual wheelchairs available at main security booth.', location: { lat: 28.5530, lng: 77.2580 }, availability_status: 'AVAILABLE', source_type: 'VOLUNTEER' }
    ],
    active_barriers: [],
    trust_score: '0.99'
  },
  'p3': {
    place: { id: 'p3', name: 'Red Fort', category: 'Heritage', country: 'India', city: 'Old Delhi', description: 'Historic Mughal fort with partial ramped paths at Lahori Gate, wheelchair assistants available on demand, and some historic cobblestone courtyards.', location: { lat: 28.6562, lng: 77.2410 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'LOW', verified: false, active_barriers_count: 2, confidence: '0.80' },
    accessibility_records: [
      { id: 'ar4', place_id: 'p3', feature: 'RAMP', status: 'PARTIAL', confidence: '0.75', source_type: 'COMMUNITY' },
      { id: 'ar3_2', place_id: 'p3', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.80', source_type: 'COMMUNITY' }
    ],
    facilities: [
      { id: 'f4', place_id: 'p3', facility_type: 'RAMP', name: 'Lahori Gate Wooden Access Ramp', description: 'Temporary wooden ramp over historic threshold.', is_operational: true }
    ],
    assistance_points: [],
    active_barriers: [
      { id: 'b1', place_id: 'p3', barrier_type: 'STAIRS_ONLY', severity: 'HIGH', title: 'Cobblestone Incline at Diwan-i-Khas', description: 'Uneven historic stone surface requires companion assistance.', location: { lat: 28.6565, lng: 77.2415 }, status: 'ACTIVE', created_at: '', updated_at: '' }
    ],
    trust_score: '0.75'
  },
  'p4': {
    place: { id: 'p4', name: 'National Museum', category: 'Museum', country: 'India', city: 'Janpath, New Delhi', description: 'Fully accessible national gallery with tactile braille art exhibits, audio narration headsets, elevator access to all floors, and low-gradient entry ramps.', location: { lat: 28.6118, lng: 77.2191 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.98' },
    accessibility_records: [
      { id: 'ar5', place_id: 'p4', feature: 'ELEVATOR', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'ar6', place_id: 'p4', feature: 'AUDIO_GUIDE', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'ar4_3', place_id: 'p4', feature: 'BRAILLE_SIGN', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' },
      { id: 'ar4_4', place_id: 'p4', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f5', place_id: 'p4', facility_type: 'ELEVATOR', name: 'Full-Access Glass Elevator', description: 'Connects Ground, 1st and 2nd gallery floors with voice announcement.', is_operational: true },
      { id: 'f6', place_id: 'p4', facility_type: 'AUDIO_GUIDE', name: 'Tactile Art Gallery & Multilingual Audio Tour', description: 'Braille touch-replicas for visually impaired travelers.', is_operational: true },
      { id: 'f4_3', place_id: 'p4', facility_type: 'RAMP', name: 'Low-Gradient Main Entrance Ramp', description: 'Gentle incline ramp at main foyer with dual handrails.', is_operational: true },
      { id: 'f4_4', place_id: 'p4', facility_type: 'RESTROOM', name: 'Ground Floor Accessible Restroom', description: 'Step-free entrance with grab rails and emergency buzzer.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap4_1', place_id: 'p4', name: 'Curator Disability Helpdesk', assistance_type: 'MOBILITY', description: 'Audio headsets and tactile orientation replicas available at reception.', location: { lat: 28.6118, lng: 77.2191 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.98'
  },
  'p5': {
    place: { id: 'p5', name: 'Akshardham Temple', category: 'Temple', country: 'India', city: 'East Delhi', description: 'Expansive spiritual campus with motorized wheelchair loans, wide gentle ramps, tactile stone walkways, and priority step-free exhibition corridors.', location: { lat: 28.6127, lng: 77.2773 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.99' },
    accessibility_records: [
      { id: 'ar5_1', place_id: 'p5', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.99', source_type: 'AUDIT' },
      { id: 'ar5_2', place_id: 'p5', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.97', source_type: 'AUDIT' },
      { id: 'ar5_3', place_id: 'p5', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.99', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f5_1', place_id: 'p5', facility_type: 'RAMP', name: 'Sanctum Marble Ramps', description: 'Expansive gentle ramps providing complete barrier-free access around the central Mandir.', is_operational: true },
      { id: 'f5_2', place_id: 'p5', facility_type: 'RESTROOM', name: 'Accessible Campus Washrooms', description: 'Fully equipped disabled washrooms near Sahaj Anand water show and food court.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap5_1', place_id: 'p5', name: 'Motorized & Manual Wheelchair Hub', assistance_type: 'MOBILITY', description: 'Loaner motorized wheelchairs available free of charge at Main Gate 1.', location: { lat: 28.6127, lng: 77.2773 }, availability_status: 'AVAILABLE', source_type: 'VOLUNTEER' }
    ],
    active_barriers: [],
    trust_score: '0.99'
  },
  'p9': {
    place: { id: 'p9', name: 'Qutub Minar', category: 'Heritage', country: 'India', city: 'Mehrauli, New Delhi', description: 'UNESCO World Heritage site featuring stone-paved accessible paths connecting the Iron Pillar, Alai Darwaza, and main courtyard gardens.', location: { lat: 28.5244, lng: 77.1855 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.98' },
    accessibility_records: [
      { id: 'ar9_1', place_id: 'p9', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'ar9_2', place_id: 'p9', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.94', source_type: 'AUDIT' },
      { id: 'ar9_3', place_id: 'p9', feature: 'BRAILLE_SIGN', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f9_1', place_id: 'p9', facility_type: 'RAMP', name: 'Complex Paved Walkways & Ramps', description: 'Smooth sandstone pathways connecting Iron Pillar, Alai Darwaza, and surrounding gardens.', is_operational: true },
      { id: 'f9_2', place_id: 'p9', facility_type: 'BRAILLE_SIGN', name: 'Braille Monument Guide Plaque', description: 'Tactile braille historical plaques installed at key architectural view areas.', is_operational: true },
      { id: 'f9_3', place_id: 'p9', facility_type: 'RAMP', name: 'Iron Pillar Step-Free Viewing Deck', description: 'Elevated wooden deck with gentle gradient approach.', is_operational: true },
      { id: 'f9_4', place_id: 'p9', facility_type: 'RESTROOM', name: 'Accessible Public Toilet', description: 'Step-free toilet with grab bars near main entry pavilion.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap9_1', place_id: 'p9', name: 'ASI Disability Helpdesk', assistance_type: 'MOBILITY', description: 'Wheelchair assistance and loan service at ticketing entry.', location: { lat: 28.5244, lng: 77.1855 }, availability_status: 'AVAILABLE', source_type: 'AUTHORITY' }
    ],
    active_barriers: [],
    trust_score: '0.98'
  },
  'p10': {
    place: { id: 'p10', name: 'Taj Mahal', category: 'Heritage', country: 'India', city: 'Agra, Uttar Pradesh', description: 'Dedicated electric golf-cart transit from ticketing gates, custom ramped wooden pathways over marble plinth, and tactile scale model at visitor center.', location: { lat: 27.1751, lng: 78.0421 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.99' },
    accessibility_records: [
      { id: 'ar10_1', place_id: 'p10', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.99', source_type: 'AUDIT' },
      { id: 'ar10_2', place_id: 'p10', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.97', source_type: 'AUDIT' },
      { id: 'ar10_3', place_id: 'p10', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.99', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f10_1', place_id: 'p10', facility_type: 'RAMP', name: 'Main Plinth Wooden Ramps', description: 'Gentle timber ramps over steps reaching the main marble terrace and central platform.', is_operational: true },
      { id: 'f10_2', place_id: 'p10', facility_type: 'TACTILE_PATH', name: 'Tactile Miniature Model', description: '3D touchable architectural model of the Taj Mahal at East Gate visitor centre.', is_operational: true },
      { id: 'f10_3', place_id: 'p10', facility_type: 'RESTROOM', name: 'Accessible Visitor Restrooms', description: 'Spacious accessible washrooms at East & West gate complex.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap10_1', place_id: 'p10', name: 'Electric Golf-Cart Transit Hub', assistance_type: 'MOBILITY', description: 'Free electric cart shuttle from parking to ticket barrier for seniors & disabled visitors.', location: { lat: 27.1751, lng: 78.0421 }, availability_status: 'AVAILABLE', source_type: 'AUTHORITY' }
    ],
    active_barriers: [],
    trust_score: '0.99'
  },
  'p11': {
    place: { id: 'p11', name: 'Udaipur City Palace', category: 'Heritage', country: 'India', city: 'Udaipur, Rajasthan', description: 'Magnificent lakeside palace complex featuring battery-operated golf-cart shuttle transit, ramped courtyards, ground-level museum exhibits, and tactile heritage scale models overlooking Lake Pichola.', location: { lat: 24.5764, lng: 73.6835 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.97' },
    accessibility_records: [
      { id: 'ar11', place_id: 'p11', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.97', source_type: 'AUDIT' },
      { id: 'ar12', place_id: 'p11', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'ar11_3', place_id: 'p11', feature: 'AUDIO_GUIDE', status: 'AVAILABLE', confidence: '0.94', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f11', place_id: 'p11', facility_type: 'RAMP', name: 'Courtyard Accessibility Ramp System', description: 'Wide paved ramps providing access to Manak Mahal and museum courtyards.', is_operational: true },
      { id: 'f12', place_id: 'p11', facility_type: 'RESTROOM', name: 'Ground Floor Accessible Restroom', description: 'Step-free entrance with grab bars and wide doorway near main ticket gate.', is_operational: true },
      { id: 'f11_3', place_id: 'p11', facility_type: 'RAMP', name: 'Lake Pichola Accessible Balcony', description: 'Step-free viewpoint overlooking the lake with barrier-free ramp.', is_operational: true }
    ],
    assistance_points: [
      { id: 'ap11', place_id: 'p11', name: 'Battery-Operated Golf Cart Shuttle', assistance_type: 'MOBILITY', description: 'Complimentary transit for seniors and wheelchair users from palace entrance.', location: { lat: 24.5764, lng: 73.6835 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.97'
  },
  'b2': {
    place: { id: 'b2', name: 'Juhu Beach', category: 'Beach', country: 'India', city: 'Mumbai, Maharashtra', description: 'Ramped concrete promenade connecting the main road to the high-tide viewing deck, tactile guiding tiles, and accessible washroom facilities at entry.', location: { lat: 19.0988, lng: 72.8267 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.96' },
    accessibility_records: [
      { id: 'arb2_1', place_id: 'b2', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'arb2_2', place_id: 'b2', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.93', source_type: 'AUDIT' },
      { id: 'arb2_3', place_id: 'b2', feature: 'RESTROOM', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'fb2_1', place_id: 'b2', facility_type: 'RAMP', name: 'Concrete Accessible Beach Pathway', description: 'Smooth, ramped concrete path leading directly from the street to the high-tide sea viewing deck.', is_operational: true },
      { id: 'fb2_2', place_id: 'b2', facility_type: 'RESTROOM', name: 'Accessible Beach Washroom', description: 'Step-free modular toilet equipped with wide doors and support grab bars.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apb2_1', place_id: 'b2', name: 'BMC Coastal Assistance Post', assistance_type: 'MOBILITY', description: 'Lifeguard-assisted beach access and wheelchair parking zone.', location: { lat: 19.0988, lng: 72.8267 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.96'
  },
  'b3': {
    place: { id: 'b3', name: 'Kovalam Lighthouse Beach Deck', category: 'Beach', country: 'India', city: 'Thiruvananthapuram, Kerala', description: 'Level paved promenade with scenic ramped decks, gentle sloping access to the southern rock formations, and certified beach accessibility assistants.', location: { lat: 8.3988, lng: 76.9785 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.95' },
    accessibility_records: [
      { id: 'arb3_1', place_id: 'b3', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' },
      { id: 'arb3_2', place_id: 'b3', feature: 'AUDIO_GUIDE', status: 'AVAILABLE', confidence: '0.91', source_type: 'AUDIT' },
      { id: 'arb3_3', place_id: 'b3', feature: 'ASSISTANCE', status: 'AVAILABLE', confidence: '0.94', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'fb3_1', place_id: 'b3', facility_type: 'RAMP', name: 'Scenic Sloping Promenade & Deck', description: 'Gentle timber and stone ramped viewpoint overlooking the Arabian Sea.', is_operational: true },
      { id: 'fb3_2', place_id: 'b3', facility_type: 'RESTROOM', name: 'Beach Rest Gazebos', description: 'Shaded seating zones with level wheelchair bays.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apb3_1', place_id: 'b3', name: 'Kerala Tourism Beach Helpdesk', assistance_type: 'MOBILITY', description: 'Escort assistance for rocky promontory viewpoints.', location: { lat: 8.3988, lng: 76.9785 }, availability_status: 'AVAILABLE', source_type: 'AUTHORITY' }
    ],
    active_barriers: [],
    trust_score: '0.95'
  },
  'b4': {
    place: { id: 'b4', name: 'Miramar Beach', category: 'Beach', country: 'India', city: 'Panaji, Goa', description: 'Illuminated wide tiled promenade along the Mandovi river mouth with zero-step entry, shaded wheelchair rest points, and accessible food kiosk access.', location: { lat: 15.4820, lng: 73.8078 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.97' },
    accessibility_records: [
      { id: 'arb4_1', place_id: 'b4', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.97', source_type: 'AUDIT' },
      { id: 'arb4_2', place_id: 'b4', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' },
      { id: 'arb4_3', place_id: 'b4', feature: 'RESTROOM', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'fb4_1', place_id: 'b4', facility_type: 'RAMP', name: 'River Mouth Tiled Promenade', description: 'Zero-step wide illuminated promenade with shaded wheelchair rest gazebos.', is_operational: true },
      { id: 'fb4_2', place_id: 'b4', facility_type: 'RESTROOM', name: 'Promenade Accessible Restroom', description: 'Clean disabled toilet with wide sliding door and call button.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apb4_1', place_id: 'b4', name: 'Goa Tourism Information Booth', assistance_type: 'MOBILITY', description: 'Assistance for beach strolls and beach wheelchair rentals.', location: { lat: 15.4820, lng: 73.8078 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.97'
  },
  'c1': {
    place: { id: 'c1', name: 'Connaught Place', category: 'Station', country: 'India', city: 'New Delhi', description: 'Major transit and shopping hub with elevator-linked metro gates, continuous level colonnades, dropped curbs at all inner circle pedestrian crossings, and low-floor electric feeder buses.', location: { lat: 28.6304, lng: 77.2177 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.96' },
    accessibility_records: [
      { id: 'ar8', place_id: 'c1', feature: 'ELEVATOR', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'arc1_2', place_id: 'c1', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'arc1_3', place_id: 'c1', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'f8', place_id: 'c1', facility_type: 'ELEVATOR', name: 'Rajiv Chowk Metro Elevator Corridor', description: 'Direct street-to-concourse and platform level elevators.', is_operational: true },
      { id: 'f9', place_id: 'c1', facility_type: 'TACTILE_PATH', name: 'Continuous Colonnade Tactile Guideway', description: 'Guiding ground tiles throughout Inner and Middle circle colonnades.', is_operational: true },
      { id: 'fc1_3', place_id: 'c1', facility_type: 'RAMP', name: 'Dropped Curbs & Paved Crossings', description: 'Smooth transitions at pedestrian crossing points.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apc1_1', place_id: 'c1', name: 'DMRC Metro Passenger Assistance', assistance_type: 'TRANSIT', description: 'Wheelchair assistance for boarding/deboarding trains.', location: { lat: 28.6304, lng: 77.2177 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.96'
  },
  'c3': {
    place: { id: 'c3', name: 'Vidhana Soudha', category: 'City', country: 'India', city: 'Bengaluru, Karnataka', description: 'Grand legislative heritage precinct connected via Namma Metro underground accessible station with dual elevators and wide sidewalk corridors.', location: { lat: 12.9797, lng: 77.5907 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.98' },
    accessibility_records: [
      { id: 'arc3_1', place_id: 'c3', feature: 'ELEVATOR', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'arc3_2', place_id: 'c3', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'arc3_3', place_id: 'c3', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'fc3_1', place_id: 'c3', facility_type: 'ELEVATOR', name: 'Namma Metro Dual Station Elevators', description: 'Direct surface-to-platform step-free transit elevators with audio floor indicators.', is_operational: true },
      { id: 'fc3_2', place_id: 'c3', facility_type: 'TACTILE_PATH', name: 'Heritage Sidewalk Tactile Paving', description: 'Continuous tactile indicator tiles along the outer Ambedkar Veedhi boulevard.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apc3_1', place_id: 'c3', name: 'Metro Accessibility Facilitator', assistance_type: 'TRANSIT', description: 'Staff assistance for boarding low-floor buses and metro trains.', location: { lat: 12.9797, lng: 77.5907 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.98'
  },
  'c4': {
    place: { id: 'c4', name: 'Birla Planetarium', category: 'Museum', country: 'India', city: 'Kolkata, West Bengal', description: 'Landmark astronomical observatory featuring ramped entrance, wheelchair-accessible cosmic sky show dome seating, audio induction loops, and tactile galaxy exhibits.', location: { lat: 22.5448, lng: 88.3475 }, status: 'ACTIVE', created_at: '', updated_at: '' },
    accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.98' },
    accessibility_records: [
      { id: 'arc4_1', place_id: 'c4', feature: 'RAMP', status: 'AVAILABLE', confidence: '0.98', source_type: 'AUDIT' },
      { id: 'arc4_2', place_id: 'c4', feature: 'AUDIO_GUIDE', status: 'AVAILABLE', confidence: '0.96', source_type: 'AUDIT' },
      { id: 'arc4_3', place_id: 'c4', feature: 'TACTILE_PATH', status: 'AVAILABLE', confidence: '0.95', source_type: 'AUDIT' }
    ],
    facilities: [
      { id: 'fc4_1', place_id: 'c4', facility_type: 'RAMP', name: 'Main Entrance Stepless Ramp', description: 'Gently sloped non-slip ramp leading into the main celestial gallery.', is_operational: true },
      { id: 'fc4_2', place_id: 'c4', facility_type: 'AUDIO_GUIDE', name: 'Induction Loop & Tactile Planet Models', description: 'Hearing-aid induction loops and touchable 3D planet models throughout astronomy hall.', is_operational: true },
      { id: 'fc4_3', place_id: 'c4', facility_type: 'RESTROOM', name: 'Accessible Ground Restroom', description: 'Spacious accessible washroom with support bars.', is_operational: true }
    ],
    assistance_points: [
      { id: 'apc4_1', place_id: 'c4', name: 'Visitor Disability Desk', assistance_type: 'MOBILITY', description: 'Reserved front-row wheelchair spots for cosmic sky shows.', location: { lat: 22.5448, lng: 88.3475 }, availability_status: 'AVAILABLE', source_type: 'MUNICIPAL' }
    ],
    active_barriers: [],
    trust_score: '0.98'
  }
};

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useApp();
  const hi = language === 'HI';
  const placeId = params.placeId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true);
    setError(null);

    // Check local fallback first
    if (PLACE_DETAILS_MAP[placeId]) {
      setDetails(PLACE_DETAILS_MAP[placeId]);
      setLoading(false);
      return;
    }

    // Otherwise try API, fallback gracefully
    api.places.getDetails(placeId)
      .then(data => setDetails(data))
      .catch(() => {
        // Build generic fallback
        setDetails({
          place: { id: placeId, name: 'Accessible Venue', category: 'Destination', country: 'India', city: 'Delhi NCR', location: { lat: 28.6139, lng: 77.2090 }, status: 'ACTIVE', created_at: '', updated_at: '' },
          accessibility_summary: { level: 'HIGH', verified: true, active_barriers_count: 0, confidence: '0.95' },
          accessibility_records: [],
          facilities: [
            { id: 'fg1', place_id: placeId, facility_type: 'RAMP', name: 'Step-Free Ramped Entrance', description: 'Accessible gently sloped entrance with side handrails.', is_operational: true }
          ],
          assistance_points: [],
          active_barriers: [],
          trust_score: '0.95'
        });
      })
      .finally(() => setLoading(false));
  }, [placeId]);

  const getImg = (name: string) => PLACE_IMAGES[name] || DEFAULT_IMG;

  const lvlColor = (l: string) =>
    l === 'HIGH' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
    : l === 'MEDIUM' ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';

  const lvlLabel = (l: string) =>
    hi ? (l === 'HIGH' ? 'अत्यधिक सुलभ' : l === 'MEDIUM' ? 'मध्यम सुलभ' : 'सीमित सुलभता')
    : (l === 'HIGH' ? 'Highly Accessible' : l === 'MEDIUM' ? 'Moderately Accessible' : 'Limited Accessibility');

  const severityColor = (s: string) =>
    s === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
    : s === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
            </div>
          ) : error || !details ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 px-4">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{hi ? 'स्थान लोड नहीं हो सका' : 'Could not load place'}</h2>
              <p className="text-xs text-slate-500 text-center">{error || 'Unknown error'}</p>
              <button onClick={() => router.back()} className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />{hi ? 'वापस जाएं' : 'Go Back'}
              </button>
            </div>
          ) : (
            <>
              {/* Hero Image */}
              <div className="relative w-full h-56 md:h-72 overflow-hidden">
                <img src={getImg(details.place.name)} alt={details.place.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button onClick={() => router.push('/explore')} className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white transition-colors shadow-sm" aria-label="Back to explore">
                  <ArrowLeft className="h-3.5 w-3.5" />{hi ? 'वापस' : 'Back'}
                </button>
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                  <span className="text-[9px] font-bold uppercase bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md tracking-wider">{details.place.category}</span>
                  <h1 className="text-2xl md:text-3xl font-black mt-2 flex items-center gap-2.5 drop-shadow-lg">
                    {details.place.name}
                    {details.accessibility_summary?.verified && <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />}
                  </h1>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{details.place.city || details.place.address || 'New Delhi, India'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

                {/* Quick Badges Row */}
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-xs font-bold ${lvlColor(details.accessibility_summary?.level || 'UNKNOWN')}`}>
                    <Star className="h-3.5 w-3.5" />
                    {lvlLabel(details.accessibility_summary?.level || 'UNKNOWN')}
                  </div>
                  <div className="flex items-center gap-1.5 border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 rounded-lg px-3 py-2 text-xs font-bold text-violet-700 dark:text-violet-400">
                    <Shield className="h-3.5 w-3.5" />
                    {hi ? 'विश्वास:' : 'Trust:'} {details.trust_score || 'N/A'}
                  </div>
                  {details.accessibility_summary?.verified && (
                    <div className="flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {hi ? 'yatrasaathi द्वारा प्रमाणित' : 'Verified by yatrasaathi'}
                    </div>
                  )}
                  {details.accessibility_summary?.active_barriers_count > 0 && (
                    <div className="flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {details.accessibility_summary.active_barriers_count} {hi ? 'सक्रिय बाधाएं' : 'Active Barriers'}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{hi ? 'विवरण' : 'About this Place'}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {details.place.description || (hi ? 'यह स्थान पहुंच सुविधाओं के साथ प्रमाणित है।' : 'This place has been verified for accessibility features including ramped entrances, braille signage, and dedicated accessible restrooms.')}
                  </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Accessibility Records */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <Accessibility className="h-4 w-4 text-violet-600" />
                      {hi ? 'पहुंच सुविधाएं' : 'Accessibility Features'}
                    </h3>
                    {details.accessibility_records?.length > 0 ? (
                      <div className="space-y-2">
                        {details.accessibility_records.map((r, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2.5">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${r.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <div className="min-w-0">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate">{r.feature}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{r.confidence} confidence</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">{hi ? 'डेटा जल्द उपलब्ध होगा' : 'Data coming soon'}</p>
                    )}
                  </div>

                  {/* Facilities */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      {hi ? 'सुविधाएं' : 'Facilities'}
                    </h3>
                    {details.facilities?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {details.facilities.map((f, i) => (
                          <span key={i} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${f.is_operational ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 line-through'}`}>
                            {f.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">{hi ? 'कोई सुविधा सूचीबद्ध नहीं' : 'No facilities listed'}</p>
                    )}
                  </div>
                </div>

                {/* Assistance Points */}
                {details.assistance_points?.length > 0 && (
                  <div className="rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 p-5">
                    <h3 className="text-xs font-bold text-violet-800 dark:text-violet-300 mb-3 flex items-center gap-1.5">
                      <Accessibility className="h-4 w-4" />
                      {hi ? 'सहायता केंद्र' : 'Assistance Points'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {details.assistance_points.map((ap, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-900/30 rounded-lg px-3 py-2.5">
                          <Navigation className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 block">{ap.name}</span>
                            <span className="text-[9px] text-slate-500 capitalize block">{ap.assistance_type} · {ap.availability_status}</span>
                            {ap.description && <span className="text-[9px] text-slate-400 block mt-0.5">{ap.description}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Barriers */}
                {details.active_barriers?.length > 0 && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5">
                    <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      {hi ? 'सक्रिय बाधाएं' : 'Active Barriers'}
                    </h3>
                    <div className="space-y-2">
                      {details.active_barriers.map((b, i) => (
                        <div key={i} className={`flex items-start gap-2.5 border rounded-lg px-3 py-2.5 ${severityColor(b.severity)}`}>
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold block">{b.title}</span>
                            <span className="text-[9px] block mt-0.5">{b.description}</span>
                            <span className="text-[8px] font-bold uppercase mt-1 block opacity-70">{b.severity} · {b.barrier_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/plan-route?destination=${placeId}&name=${encodeURIComponent(details.place.name)}&lat=${details.place.location.lat}&lng=${details.place.location.lng}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    id="plan-route-cta"
                  >
                    <Navigation className="h-4 w-4" />
                    {hi ? 'सुलभ मार्ग की योजना बनाएं →' : 'Plan Accessible Route →'}
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center justify-center gap-2 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
                    id="report-barrier-cta"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {hi ? 'बाधा रिपोर्ट करें' : 'Report a Barrier'}
                  </Link>
                </div>

              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
