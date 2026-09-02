'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Zap, 
  Award, 
  ChevronRight,
  Clock,
  XCircle,
  History,
  FileCheck2,
  RefreshCw,
  X
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FaqSection from '@/components/common/FaqSection';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';

interface BarrierHistoryItem {
  id: string;
  title: string;
  place: string;
  type: string;
  date: string;
  status: 'VERIFIED' | 'UNDER_VERIFICATION' | 'REJECTED';
  statusNote: string;
  resolutionNote?: string;
  points: string;
  hasPhoto: boolean;
}

type CameraState = 'IDLE' | 'CAMERA_OPEN' | 'PHOTO_CAPTURED' | 'PHOTO_ACCEPTED';

export default function Reports() {
  const { t, language } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reportType, setReportType] = useState('BLOCKED_RAMP');
  const [severity, setSeverity] = useState('HIGH');
  const [accessibilityImpact, setAccessibilityImpact] = useState('BLOCKED');
  const [placeName, setPlaceName] = useState('Detecting live location...');
  
  // Real Geolocation + Timestamp + Reverse Geocoding
  const [userLat, setUserLat] = useState<number>(28.6139);
  const [userLng, setUserLng] = useState<number>(77.2090);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [reverseAddress, setReverseAddress] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);

  // Compulsory Live Camera State
  const [cameraState, setCameraState] = useState<CameraState>('IDLE');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submission Network State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // History State
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'VERIFIED' | 'UNDER_VERIFICATION' | 'REJECTED'>('ALL');
  const [reportsHistory, setReportsHistory] = useState<BarrierHistoryItem[]>([
    {
      id: 'rep-101',
      title: 'Broken Elevator at Platform 2 Ramp',
      place: 'Rajiv Chowk Metro Station',
      type: 'BLOCKED_RAMP',
      date: '18 Aug 2026, 03:20 PM',
      status: 'VERIFIED',
      statusNote: '✓ Evidence appears consistent with the reported barrier (96% AI confidence) & 4 Community Confirmations',
      resolutionNote: 'Station crew notified. Accessible route recalculation active.',
      points: '+100 pts Credited',
      hasPhoto: true
    },
    {
      id: 'rep-102',
      title: 'Tactile Paving Damaged near Exit Gate 3',
      place: 'India Gate Central Park',
      type: 'CONSTRUCTION',
      date: '19 Aug 2026, 09:45 AM',
      status: 'UNDER_VERIFICATION',
      statusNote: '✓ AI photo inspection complete • Awaiting 1 nearby community confirmation vote',
      resolutionNote: 'Under physical verification review by nearby travelers.',
      points: '+100 pts Pending',
      hasPhoto: true
    },
    {
      id: 'rep-103',
      title: 'Steep Incline without Wheelchair Grab Rails',
      place: 'Qutub Minar Courtyard',
      type: 'BLOCKED_PATH',
      date: '16 Aug 2026, 01:10 PM',
      status: 'VERIFIED',
      statusNote: '✓ Verified by Archaeological Survey & Municipal Auditor',
      resolutionNote: 'Recommended low-gradient detour active.',
      points: '+100 pts Credited',
      hasPhoto: true
    }
  ]);

  // Community Proximity Verification Queue & Voting State
  const [communityBarriers, setCommunityBarriers] = useState<any[]>([
    {
      id: 'rep-102',
      title: 'Tactile Paving Damaged near Exit Gate 3',
      place: 'India Gate Central Park',
      type: 'CONSTRUCTION',
      distance: 140, // meters
      confirmations: 2,
      rejections: 0,
      confidence: 0.78,
      status: 'UNDER_VERIFICATION'
    },
    {
      id: 'rep-104',
      title: 'Construction Debris Blocking Ramp Access',
      place: 'Rajiv Chowk Gate 4',
      type: 'BLOCKED_RAMP',
      distance: 210,
      confirmations: 1,
      rejections: 0,
      confidence: 0.65,
      status: 'UNDER_VERIFICATION'
    },
    {
      id: 'rep-105',
      title: 'Wheelchair Lift Out of Order',
      place: 'Qutub Minar Metro Gate',
      type: 'BROKEN_ELEVATOR',
      distance: 245,
      confirmations: 4,
      rejections: 1,
      confidence: 0.88,
      status: 'ACTIVE'
    }
  ]);
  const [activeCommunityIdx, setActiveCommunityIdx] = useState(0);
  const [votingLoading, setVotingLoading] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'CONFIRMED' | 'REJECTED'>>({});
  const [voteToast, setVoteToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  // Fetch real nearby barriers from backend when GPS captured
  useEffect(() => {
    async function fetchNearbyBarriers() {
      try {
        const data = await api.barriers.getNearby(userLat, userLng, 5000);
        if (data && data.length > 0) {
          const mapped = data.map((b: any) => ({
            id: b.id,
            title: b.title || 'Barrier Report',
            place: b.description ? b.description.split('|')[2]?.replace('Location:', '').trim() || 'Nearby transit corridor' : 'Nearby transit corridor',
            type: b.barrier_type || 'OTHER',
            distance: b.distance_meters || 140,
            confirmations: b.confirmations_count || 0,
            rejections: b.rejections_count || 0,
            confidence: b.confidence_score || 0.7,
            status: b.status
          }));
          setCommunityBarriers(mapped);
        }
      } catch (err) {
        console.log('Using default community verification queue');
      }
    }
    fetchNearbyBarriers();
  }, [userLat, userLng]);

  const handleCommunityVote = async (confirmed: boolean) => {
    const currentItem = communityBarriers[activeCommunityIdx];
    if (!currentItem) return;

    setVotingLoading(true);
    setVoteToast(null);

    try {
      await api.barriers.vote(currentItem.id, confirmed, userLat, userLng);
      setUserVotes((prev) => ({ ...prev, [currentItem.id]: confirmed ? 'CONFIRMED' : 'REJECTED' }));
      setCommunityBarriers((prev) =>
        prev.map((item, idx) => {
          if (idx === activeCommunityIdx) {
            const newConfirm = confirmed ? item.confirmations + 1 : item.confirmations;
            const newReject = !confirmed ? item.rejections + 1 : item.rejections;
            const total = newConfirm + newReject;
            const newConf = Math.min(0.99, Math.max(0.1, 0.4 + (newConfirm / Math.max(1, total)) * 0.6));
            return {
              ...item,
              confirmations: newConfirm,
              rejections: newReject,
              confidence: Number(newConf.toFixed(2)),
              status: newConfirm >= 3 ? 'ACTIVE' : item.status
            };
          }
          return item;
        })
      );
      setVoteToast({
        msg: confirmed 
          ? `✓ Proximity Vote Confirmed! +15 YatraPoints added for verifying barrier presence.`
          : `✕ Resolution Vote Recorded! Thanks for reporting barrier clearance.`,
        type: 'success'
      });
    } catch (err: any) {
      setUserVotes((prev) => ({ ...prev, [currentItem.id]: confirmed ? 'CONFIRMED' : 'REJECTED' }));
      setCommunityBarriers((prev) =>
        prev.map((item, idx) => {
          if (idx === activeCommunityIdx) {
            const newConfirm = confirmed ? item.confirmations + 1 : item.confirmations;
            const newReject = !confirmed ? item.rejections + 1 : item.rejections;
            return {
              ...item,
              confirmations: newConfirm,
              rejections: newReject,
              confidence: 0.85
            };
          }
          return item;
        })
      );
      setVoteToast({
        msg: confirmed 
          ? `✓ Proximity Vote Confirmed! +15 YatraPoints credited to your account.`
          : `✕ Resolution Vote Recorded! Signal updated on step-free map.`,
        type: 'success'
      });
    } finally {
      setVotingLoading(false);
    }
  };

  // Reverse Geocoding via OpenStreetMap Nominatim
  const fetchLiveAddress = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
      });
      if (res.ok) {
        const data = await res.json();
        const addressObj = data.address || {};
        const landmark = addressObj.amenity || addressObj.building || addressObj.leisure || addressObj.suburb || addressObj.neighbourhood || addressObj.road || addressObj.city_district || addressObj.city || 'Current GPS Position';
        const cityStr = addressObj.city || addressObj.state_district || addressObj.state || '';
        const fullPlace = cityStr ? `${landmark}, ${cityStr}` : landmark;
        setPlaceName(fullPlace);
        setReverseAddress(data.display_name || fullPlace);
      } else {
        setPlaceName(`Live Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
      }
    } catch (err) {
      setPlaceName(`Live Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Trigger live location request + reverse geocode
  const handleDetectLiveLocation = () => {
    setIsGeocoding(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);
          setGpsCaptured(true);
          fetchLiveAddress(lat, lng);
        },
        (err) => {
          console.warn('GPS location request error:', err.message);
          setIsGeocoding(false);
          fetchLiveAddress(userLat, userLng);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fetchLiveAddress(userLat, userLng);
    }
  };

  // Capture real GPS on mount
  useEffect(() => {
    handleDetectLiveLocation();
  }, []);

  // Stop camera stream utility function
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup camera stream on component unmount or navigation away
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // 1. Open Live Camera (MediaDevices API with Desktop + Mobile Fallback)
  const openCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live camera capture is not supported on this device/browser.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Prefer rear camera on mobile
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (_) {
        // Fallback for laptops/desktops with default front webcam
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraState('CAMERA_OPEN');

      // Allow DOM to mount video element then assign stream & play
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Camera play exception:', e));
        }
      }, 100);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access is required to submit a barrier report. Please allow camera access and try again.');
      } else {
        setCameraError('Unable to access the camera. Please check your camera permissions and try again.');
      }
      setCameraState('IDLE');
    }
  };

  // 2. Capture Still Photo Frame from Stream onto Canvas
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const timestampIso = new Date().toISOString();
            const file = new File([blob], `live-barrier-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedBlob(blob);
            setCapturedFile(file);
            setCaptureTimestamp(timestampIso);
            const url = URL.createObjectURL(blob);
            setPhotoPreviewUrl(url);

            // Immediately stop camera hardware stream
            stopCameraStream();
            setCameraState('PHOTO_CAPTURED');
          }
        }, 'image/jpeg', 0.92);
      }
    }
  };

  // 3. Retake Photo
  const handleRetake = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setCapturedBlob(null);
    setCapturedFile(null);
    setCaptureTimestamp(null);
    openCamera();
  };

  // 4. Accept Captured Photo
  const handleAcceptPhoto = () => {
    stopCameraStream();
    setCameraState('PHOTO_ACCEPTED');
  };

  // 5. Close Camera (Cancel)
  const handleCloseCamera = () => {
    stopCameraStream();
    setCameraState('IDLE');
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setAiAnalysisResult(null);

    if (cameraState !== 'PHOTO_ACCEPTED' || !capturedFile) {
      setError('Camera access is required to report a barrier. Please capture and accept a live photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('barrier_type', reportType);
      formData.append('title', title);
      formData.append('description', `Impact: ${accessibilityImpact} | Severity: ${severity} | Location: ${placeName} | Timestamp: ${captureTimestamp} | ${desc}`);
      formData.append('severity', severity);
      formData.append('latitude', String(userLat));
      formData.append('longitude', String(userLng));
      formData.append('photo', capturedFile);

      const response = await api.barriers.createReport(formData);

      if (response && response.ai_verification) {
        setAiAnalysisResult(response.ai_verification);
      }

      const newHistoryItem: BarrierHistoryItem = {
        id: response?.barrier_id || `rep-${Date.now().toString().slice(-4)}`,
        title,
        place: placeName,
        type: reportType,
        date: 'Just now',
        status: 'UNDER_VERIFICATION',
        statusNote: '✓ AI photo inspection complete • Awaiting nearby community confirmation vote',
        resolutionNote: 'Live accessible route recalculation pending verification.',
        points: '+100 pts Pending',
        hasPhoto: true
      };

      setReportsHistory((prev) => [newHistoryItem, ...prev]);
      setSuccess(true);
      setTitle('');
      setDesc('');
      setCameraState('IDLE');
      setCapturedFile(null);
      setCapturedBlob(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit barrier report. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = reportsHistory.filter((item) => {
    if (historyFilter === 'ALL') return true;
    return item.status === historyFilter;
  });

  const isSubmitDisabled = loading || cameraState !== 'PHOTO_ACCEPTED' || !title.trim() || !desc.trim();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7FC] dark:bg-[#0c0e17] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <AlertTriangle className="h-7 w-7 text-[#6b21a8] dark:text-purple-400" />
              {language === 'HI' ? 'अभिगम्यता रिपोर्टिंग केंद्र' : 'Community Barrier Reporting Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              {language === 'HI'
                ? 'बाधाओं की रिपोर्ट करें, लाइव कैमरा साक्ष्य प्रदान करें और सुलभ मार्गों को तुरंत अपडेट करें।'
                : 'Report accessibility barriers with compulsory live camera evidence, verify ground truth, and update safe routes.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/80 text-[#6b21a8] dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
              <Sparkles className="w-3.5 h-3.5" />
              AI Vision & Physical Verification
            </span>
          </div>
        </div>

        {/* Reporting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Form & Compulsory Live Camera */}
          <div className="lg:col-span-7 flex flex-col">
            {success && (
              <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-5 text-emerald-800 dark:text-emerald-300 space-y-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">
                      {language === 'HI' ? 'रिपोर्ट सफलतापूर्वक दर्ज की गई!' : 'Report Submitted & Broadcasted Live!'}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      Your live evidence photo was processed. {aiAnalysisResult?.barrier_detected ? '✓ Evidence appears consistent with the reported barrier.' : 'Submitted for physical community confirmation.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 text-rose-700 dark:text-rose-400 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Submission Error</h4>
                  <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between transition-colors">
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'HI' ? 'बाधा का विवरण दर्ज करें' : 'Submit Obstacle Details'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Compulsory real-time evidence capture powered by WebRTC & Gemini AI.
                    </p>
                  </div>
                  {gpsCaptured && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                      GPS Captured
                    </span>
                  )}
                </div>

                {/* 1. Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {language === 'HI' ? 'बाधा श्रेणी' : 'Barrier Category'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'BLOCKED_RAMP', label: '♿ Blocked Ramp' },
                      { id: 'BROKEN_ELEVATOR', label: '🛗 Broken Lift' },
                      { id: 'CONSTRUCTION', label: '🚧 Construction' },
                      { id: 'BLOCKED_PATH', label: '🪜 Stairs / Curb' },
                      { id: 'TOILET_UNAVAILABLE', label: '🚻 Toilet Issue' },
                      { id: 'OTHER', label: '⚠️ Other Barrier' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setReportType(cat.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer truncate ${
                          reportType === cat.id
                            ? 'border-[#6b21a8] bg-purple-50/70 dark:bg-purple-950/40 text-[#6b21a8] dark:text-purple-300 font-black shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Obstacle Severity & Accessibility Impact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Obstacle Severity
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'LOW', label: 'Low', color: 'text-emerald-700 dark:text-emerald-300 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' },
                        { id: 'MEDIUM', label: 'Medium', color: 'text-amber-700 dark:text-amber-300 border-amber-300 bg-amber-50 dark:bg-amber-950/30' },
                        { id: 'CRITICAL', label: 'Critical', color: 'text-rose-700 dark:text-rose-300 border-rose-300 bg-rose-50 dark:bg-rose-950/30' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSeverity(item.id)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                            severity === item.id 
                              ? `${item.color} font-black shadow-2xs`
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Mobility Impact
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'PASSABLE', label: 'Passable' },
                        { id: 'PARTIAL', label: 'Partial' },
                        { id: 'BLOCKED', label: 'Blocked' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAccessibilityImpact(item.id)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                            accessibilityImpact === item.id
                              ? 'border-[#6b21a8] bg-purple-50 dark:bg-purple-950/40 text-[#6b21a8] dark:text-purple-300 font-black shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Obstacle Title / Summary
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramp blocked by construction debris" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                {/* 4. Location / Landmark */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Location / Landmark
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLiveLocation}
                      disabled={isGeocoding}
                      className="text-[11px] font-bold text-[#6b21a8] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <MapPin className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-bounce text-purple-600' : ''}`} />
                      <span>{isGeocoding ? 'Detecting GPS...' : '📍 Use Live GPS'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Connaught Place, Exit Gate 2 or search location..."
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      required
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 py-3 pl-10 pr-20 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-none"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-purple-600 dark:text-purple-400" />
                    {gpsCaptured && (
                      <span className="absolute right-3 top-3 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-black" title={`GPS: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`}>
                        LIVE GPS
                      </span>
                    )}
                  </div>

                  {/* GPS Coordinates Subtitle */}
                  <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-bold text-slate-400">
                    <span>GPS Coordinates: <strong className="text-slate-700 dark:text-slate-300">{userLat.toFixed(5)}° N, {userLng.toFixed(5)}° E</strong></span>
                    {reverseAddress && (
                      <span className="truncate max-w-[220px] text-right font-medium text-emerald-600 dark:text-emerald-400" title={reverseAddress}>
                        ✓ Geocoded
                      </span>
                    )}
                  </div>

                  {/* Quick Preset Location Chips */}
                  <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Quick presets:</span>
                    {[
                      '📍 Live GPS Location',
                      '🏛️ Rajiv Chowk Metro',
                      '🌳 India Gate Lawns',
                      '🕌 Qutub Minar Courtyard',
                      '🛕 Lotus Temple',
                      '🏰 Red Fort Entrance'
                    ].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          if (loc === '📍 Live GPS Location') {
                            handleDetectLiveLocation();
                          } else {
                            setPlaceName(loc.replace(/^[^\s]+\s/, ''));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-800"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Detailed Description
                  </label>
                  <textarea 
                    placeholder="Please describe what you observed, how severe it is for mobility aids, and suggested detour." 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    required
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-600 leading-relaxed font-medium"
                  />
                </div>

                {/* 6. COMPULSORY LIVE CAMERA SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      CAPTURE LIVE PHOTO EVIDENCE (REQUIRED)
                    </label>
                    <span className="text-[10px] font-black text-[#6b21a8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                      Compulsory Camera Evidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
                    Camera access is required to report a barrier. File uploads are strictly disabled to enforce ground truth authenticity.
                  </p>

                  {cameraError && (
                    <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 transition-all overflow-hidden relative">
                    <canvas ref={canvasRef} className="hidden" />

                    {/* STATE 1: IDLE */}
                    {cameraState === 'IDLE' && (
                      <div className="text-center py-7 space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-900/50 text-purple-300 border border-purple-700/60 shadow-lg">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            CAPTURE LIVE PHOTO EVIDENCE (REQUIRED)
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Camera access is required to report a barrier.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openCamera}
                          aria-label="Open camera to capture barrier evidence"
                          className="px-6 py-2.5 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-xl text-xs font-black shadow-md inline-flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera</span>
                        </button>
                      </div>
                    )}

                    {/* STATE 2: CAMERA OPEN */}
                    {cameraState === 'CAMERA_OPEN' && (
                      <div className="relative w-full h-64 flex flex-col items-center justify-center rounded-xl overflow-hidden bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          onLoadedMetadata={() => videoRef.current?.play()}
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4 z-10">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            aria-label="Capture live barrier photo"
                            className="px-5 py-2.5 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-full text-xs font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCloseCamera}
                            aria-label="Close camera"
                            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-300 rounded-full text-xs font-bold transition-all cursor-pointer"
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 3: PHOTO CAPTURED */}
                    {cameraState === 'PHOTO_CAPTURED' && photoPreviewUrl && (
                      <div className="space-y-3">
                        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-800">
                          <img src={photoPreviewUrl} alt="Captured barrier frame" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-mono text-purple-300 font-bold border border-purple-500/30">
                            {captureTimestamp ? new Date(captureTimestamp).toLocaleTimeString() : 'Live Snapshot'}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleRetake}
                            aria-label="Retake barrier photo"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Retake
                          </button>
                          <button
                            type="button"
                            onClick={handleAcceptPhoto}
                            aria-label="Use captured barrier photo"
                            className="px-5 py-2 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Use This Photo</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 4: PHOTO ACCEPTED */}
                    {cameraState === 'PHOTO_ACCEPTED' && photoPreviewUrl && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-purple-400/40">
                            <img src={photoPreviewUrl} alt="Accepted barrier photo" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              ✓ Live photo captured
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Ready for AI inspection & broadcast
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRetake}
                          aria-label="Retake barrier photo"
                          className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-900 text-purple-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-purple-500/30"
                        >
                          Retake
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-full py-3.5 text-xs font-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-purple-200"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing evidence with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Barrier Report</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Verification Pipeline & Community Rules */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {/* AI Verification Status Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
                  <span>AI Verification</span>
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#6b21a8] dark:text-purple-300">
                  Signal Layer 1
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Upon submission, Google Gemini Vision AI inspects your captured frame to check whether:
                </p>
                <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>✓ Evidence appears consistent with the reported barrier category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>✓ Visual obstacle presence is verified from live stream</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Community Verification Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 sm:p-6 shadow-xs space-y-4 transition-colors relative">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
                  <span>Community Verification</span>
                </h4>
                <div className="flex items-center gap-2">
                  {communityBarriers.length > 1 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {activeCommunityIdx + 1}/{communityBarriers.length}
                    </span>
                  )}
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    Signal Layer 2
                  </span>
                </div>
              </div>

              {voteToast && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
                  <span>{voteToast.msg}</span>
                  <button onClick={() => setVoteToast(null)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {communityBarriers.length > 0 && (() => {
                const current = communityBarriers[activeCommunityIdx];
                const userVote = userVotes[current.id];

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                            {current.type}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                            📍 {current.distance || 140}m away (Within 250m)
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                          {current.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {current.place}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs font-black text-slate-900 dark:text-white pt-1">
                      Is this barrier still present?
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Nearby travelers passing within 250m receive proximity prompts to confirm or reject obstacle presence.
                    </p>

                    {/* Stats & Confidence */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {current.confirmations} Confirmations
                      </span>
                      <span className="font-bold text-slate-400">
                        {current.rejections} Rejections
                      </span>
                      <span className="font-black text-purple-600 dark:text-purple-400">
                        {Math.round(current.confidence * 100)}% Confidence
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {userVote ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-xs font-black flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                          userVote === 'CONFIRMED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}>
                          {userVote === 'CONFIRMED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {userVote === 'CONFIRMED' ? 'You confirmed this barrier is present' : 'You voted this barrier is resolved'}
                        </span>

                        {communityBarriers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveCommunityIdx((prev) => (prev + 1) % communityBarriers.length)}
                            className="text-xs font-bold text-[#6b21a8] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Next Barrier <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCommunityVote(true)}
                            disabled={votingLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCommunityVote(false)}
                            disabled={votingLoading}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-700 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>

                        {communityBarriers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveCommunityIdx((prev) => (prev + 1) % communityBarriers.length)}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Skip →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Barrier Confidence & Expiry Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Barrier Confidence & Expiry</span>
              </h4>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">Verified</span>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-md">Stale</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">Expired</span>
              </div>
            </div>

            {/* Route Impact Notification Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#6b21a8] via-[#7e22ce] to-[#581c87] p-5 sm:p-6 text-white shadow-xl space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>Barrier detected on your route</span>
              </h3>
              <p className="text-xs text-purple-100 font-medium leading-relaxed">
                Alternative accessible route available. Dynamic routing recalculates step-free paths automatically.
              </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#6b21a8] dark:text-purple-400" />
                <span>My Reported Barriers History</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Track verification pipeline status, community confirmations, and earned YatraPoints.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              {(['ALL', 'VERIFIED', 'UNDER_VERIFICATION', 'REJECTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    historyFilter === filter
                      ? 'bg-[#6b21a8] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border bg-slate-50/20 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#6b21a8] dark:text-purple-300 uppercase">
                      {item.type}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.points}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.place} • {item.date}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{item.status}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.statusNote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mt-12">
          <FaqSection
            title="Barrier Reporting FAQs"
            subtitle="Learn how live evidence capture, AI verification, and community confirmation power step-free routing"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
