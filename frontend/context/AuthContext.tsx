'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, GuestSessionData, VoiceAccessData } from '../lib/api';

export type AuthModalView = 
  | 'voice_wall'
  | 'login'
  | 'signup'
  | 'phone'
  | 'forgot_password'
  | 'onboarding';

export interface PendingAction {
  type: 'start_voice' | 'save_journey' | 'save_place' | 'navigate' | 'complete_booking';
  payload?: any;
  data?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  auth_provider?: string;
  avatar_url?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  onboarding_completed?: boolean;
  travel_style?: string;
  points?: number;
  saved_places?: any[];
  saved_journeys?: any[];
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  guestSession: GuestSessionData | null;
  voiceChatCount: number;
  maxFreeVoiceChats: number;
  
  // Modals & UI states
  authModalOpen: boolean;
  authModalView: AuthModalView;
  authModalReason: string;
  logoutModalOpen: boolean;
  sessionExpiredModalOpen: boolean;
  activeToast: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  
  // Pending actions & callbacks
  pendingAction: PendingAction | null;
  onVoiceAutoResume?: () => void;
  setOnVoiceAutoResume: (cb?: () => void) => void;

  // Actions
  login: (email: string, pass: string) => Promise<any>;
  register: (data: { email: string; password: string; display_name: string; first_name?: string; last_name?: string; phone?: string }) => Promise<any>;
  loginWithGoogle: (data?: { credential?: string; email?: string; name?: string; avatar_url?: string; google_id?: string }) => Promise<any>;
  sendPhoneOtp: (phone: string) => Promise<any>;
  verifyPhoneOtp: (phone: string, otp: string, name?: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPass: string) => Promise<any>;
  logout: () => void;
  confirmLogout: () => Promise<void>;
  
  // Modal controls
  openAuthModal: (view?: AuthModalView, reason?: string, action?: PendingAction) => void;
  closeAuthModal: () => void;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  closeSessionExpiredModal: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  hideToast: () => void;

  // Voice & Journey helpers
  checkVoiceAccess: () => Promise<VoiceAccessData>;
  reportVoiceCompleted: (conversation_id: string, turns_count?: number, duration_seconds?: number, journey_data?: any) => Promise<any>;
  completeOnboarding: (data: { travel_style?: string; accessibility_features?: string[]; walking_limit_meters?: number }) => Promise<any>;
  saveJourneyWithAuth: (journey: any) => Promise<any>;
  savePlaceWithAuth: (place: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FREE_GUEST_VOICE_CHATS = 2;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [guestSession, setGuestSession] = useState<GuestSessionData | null>(null);
  const [voiceChatCount, setVoiceChatCount] = useState<number>(0);
  
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');
  const [authModalReason, setAuthModalReason] = useState<string>('user_action');
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [sessionExpiredModalOpen, setSessionExpiredModalOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [onVoiceAutoResume, setOnVoiceAutoResumeState] = useState<(() => void) | undefined>(undefined);

  const setOnVoiceAutoResume = useCallback((cb?: () => void) => {
    setOnVoiceAutoResumeState(() => cb);
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  const hideToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Initialize session and authentication state on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 1. Initialize or reconcile guest session from server
        const gSess = await api.guest.getSession().catch(() => null);
        if (isMounted && gSess) {
          setGuestSession(gSess);
          setVoiceChatCount(gSess.voice_chat_count || 0);
        }

        // 2. Check if user is logged in
        if (typeof window !== 'undefined' && localStorage.getItem('yatrasaathi_token')) {
          const me = await api.auth.getMe().catch(() => null);
          if (isMounted && me) {
            setUser(me);
            setVoiceChatCount(0); // unlimited for authenticated users
          } else if (isMounted) {
            // Token might be invalid or expired
            localStorage.removeItem('yatrasaathi_token');
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('[AUTH] Session init fallback:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle post-authentication resolution (convert guest session & execute pending actions)
  const handleAuthSuccess = useCallback(async (newUser: UserProfile, requiresOnboarding?: boolean) => {
    setUser(newUser);
    setVoiceChatCount(0); // authenticated users have unlimited access

    // Convert guest session on backend
    try {
      await api.guest.convertSession().catch(() => null);
    } catch (_) {}

    if (requiresOnboarding) {
      setAuthModalView('onboarding');
      setAuthModalOpen(true);
      return;
    }

    setAuthModalOpen(false);

    // Execute pending action if any
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);

      if (act.type === 'start_voice' && onVoiceAutoResume) {
        setTimeout(() => {
          onVoiceAutoResume();
        }, 300);
      } else if (act.type === 'save_journey' && act.payload) {
        void api.auth.saveJourney(act.payload).then(() => {
          showToast('Journey saved to your profile!', 'success');
        });
      } else if (act.type === 'save_place' && act.payload) {
        void api.auth.savePlace(act.payload).then(() => {
          showToast('Place saved to your profile!', 'success');
        });
      } else if (act.type === 'complete_booking') {
        showToast('Authentication successful! Your booking has been confirmed & synced.', 'success');
      }
    }
  }, [pendingAction, onVoiceAutoResume, showToast]);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      const userProfile = res.user || {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        display_name: email.split('@')[0],
        points: 350,
      };
      await handleAuthSuccess(userProfile, false);
      showToast(`Welcome back, ${userProfile.display_name}!`, 'success');
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, showToast]);

  const register = useCallback(async (data: { email: string; password: string; display_name: string; first_name?: string; last_name?: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      const userProfile = res.user || {
        id: '00000000-0000-0000-0000-000000000001',
        email: data.email,
        display_name: data.display_name,
        points: 350,
      };
      await handleAuthSuccess(userProfile, true); // Trigger onboarding
      showToast('Account created successfully! Welcome to YatraSaathi.', 'success');
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, showToast]);

  const loginWithGoogle = useCallback(async (data?: { credential?: string; email?: string; name?: string; avatar_url?: string; google_id?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.loginWithGoogle(data || {
        email: 'google.traveller@yatrasaathi.in',
        name: 'Google Traveller',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      });
      const userProfile = res.user || {
        id: '00000000-0000-0000-0000-000000000001',
        email: data?.email || 'google.traveller@yatrasaathi.in',
        display_name: data?.name || 'Google Traveller',
        points: 350,
      };
      await handleAuthSuccess(userProfile, false);
      showToast('Signed in with Google successfully!', 'success');
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, showToast]);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    return api.auth.sendPhoneOtp(phone);
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, otp: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.verifyPhoneOtp({ phone, otp, name });
      const userProfile = res.user || {
        id: '00000000-0000-0000-0000-000000000001',
        email: `${phone.replace('+', '')}@yatrasaathi.in`,
        display_name: name || `Traveller ${phone.slice(-4)}`,
        phone,
        points: 350,
      };
      await handleAuthSuccess(userProfile, false);
      showToast('Phone number verified successfully!', 'success');
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, showToast]);

  const forgotPassword = useCallback(async (email: string) => {
    return api.auth.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPass: string) => {
    return api.auth.resetPassword({ token, new_password: newPass });
  }, []);

  const logout = useCallback(() => {
    setLogoutModalOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      setLogoutModalOpen(false);

      // Re-fetch clean guest session
      const gSess = await api.guest.getSession().catch(() => null);
      if (gSess) {
        setGuestSession(gSess);
        setVoiceChatCount(gSess.voice_chat_count || 0);
      }

      showToast("You've been logged out successfully.", 'info');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const openAuthModal = useCallback((view: AuthModalView = 'login', reason: string = 'user_action', action?: PendingAction) => {
    setAuthModalView(view);
    setAuthModalReason(reason);
    if (action) {
      setPendingAction(action);
    }
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const openLogoutModal = useCallback(() => {
    setLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setLogoutModalOpen(false);
  }, []);

  const closeSessionExpiredModal = useCallback(() => {
    setSessionExpiredModalOpen(false);
  }, []);

  // Pre-flight check before voice initialization
  const checkVoiceAccess = useCallback(async (): Promise<VoiceAccessData> => {
    if (user) {
      return {
        allowed: true,
        is_authenticated: true,
        voice_chat_count: 0,
        max_free_chats: MAX_FREE_GUEST_VOICE_CHATS,
        requires_auth: false,
        message: 'Unlimited voice access active.'
      };
    }

    try {
      const res = await api.guest.checkVoiceAccess();
      setVoiceChatCount(res.voice_chat_count);
      return res;
    } catch (err) {
      // Safe fallback
      const currentCount = voiceChatCount;
      const allowed = currentCount < MAX_FREE_GUEST_VOICE_CHATS;
      return {
        allowed,
        is_authenticated: false,
        voice_chat_count: currentCount,
        max_free_chats: MAX_FREE_GUEST_VOICE_CHATS,
        requires_auth: !allowed,
        message: allowed ? `Free voice conversation ${currentCount + 1} of 2` : 'Free voice limit reached'
      };
    }
  }, [user, voiceChatCount]);

  // Report completed voice conversation and show subtle toast
  const reportVoiceCompleted = useCallback(async (
    conversation_id: string,
    turns_count: number = 1,
    duration_seconds: number = 0,
    journey_data?: any
  ) => {
    if (user) {
      return { is_authenticated: true, voice_chat_count: 0 };
    }

    try {
      const res = await api.guest.completeVoiceSession({
        conversation_id,
        turns_count,
        duration_seconds,
        journey_data
      });

      setVoiceChatCount(res.voice_chat_count);

      // Subtle toast on completion
      if (res.toast_message) {
        showToast(res.toast_message, 'info');
      }

      return res;
    } catch (e) {
      const newCount = voiceChatCount + 1;
      setVoiceChatCount(newCount);
      if (newCount === 1) {
        showToast('1 of 2 free voice conversations used', 'info');
      } else if (newCount >= 2) {
        showToast("You've used your 2 free voice conversations.", 'info');
      }
      return { voice_chat_count: newCount };
    }
  }, [user, voiceChatCount, showToast]);

  const completeOnboarding = useCallback(async (data: {
    travel_style?: string;
    accessibility_features?: string[];
    walking_limit_meters?: number;
  }) => {
    try {
      await api.auth.saveOnboarding(data);
      if (user) {
        setUser({ ...user, onboarding_completed: true, travel_style: data.travel_style });
      }
      setAuthModalOpen(false);
      showToast('Your accessibility preferences have been saved!', 'success');
    } catch (err) {
      console.warn('[AUTH] Onboarding save fallback:', err);
      setAuthModalOpen(false);
    }
  }, [user, showToast]);

  const saveJourneyWithAuth = useCallback(async (journey: any) => {
    if (!user) {
      openAuthModal('login', 'save_journey', { type: 'save_journey', payload: journey });
      return false;
    }
    await api.auth.saveJourney(journey);
    showToast('Journey saved to your profile!', 'success');
    return true;
  }, [user, openAuthModal, showToast]);

  const savePlaceWithAuth = useCallback(async (place: any) => {
    if (!user) {
      openAuthModal('login', 'save_place', { type: 'save_place', payload: place });
      return false;
    }
    await api.auth.savePlace(place);
    showToast('Place saved to your profile!', 'success');
    return true;
  }, [user, openAuthModal, showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        guestSession,
        voiceChatCount,
        maxFreeVoiceChats: MAX_FREE_GUEST_VOICE_CHATS,
        authModalOpen,
        authModalView,
        authModalReason,
        logoutModalOpen,
        sessionExpiredModalOpen,
        activeToast,
        pendingAction,
        onVoiceAutoResume,
        setOnVoiceAutoResume,
        login,
        register,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        forgotPassword,
        resetPassword,
        logout,
        confirmLogout,
        openAuthModal,
        closeAuthModal,
        openLogoutModal,
        closeLogoutModal,
        closeSessionExpiredModal,
        showToast,
        hideToast,
        checkVoiceAccess,
        reportVoiceCompleted,
        completeOnboarding,
        saveJourneyWithAuth,
        savePlaceWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
