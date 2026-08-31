'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

const LIVE_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '617269705260-u9cfqlq1equ8i9hfbn69q66i6in8bhq3.apps.googleusercontent.com';

export default function GoogleAuthButton({
  text = 'Continue with Google',
  className = '',
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load official Google Identity Services (GSI) script
    const loadGsiScript = () => {
      if (document.getElementById('google-gsi-client')) {
        initGoogleClient();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleClient();
      };
      document.head.appendChild(script);
    };

    const initGoogleClient = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: LIVE_GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: async (tokenResponse: any) => {
              if (tokenResponse?.access_token) {
                await handleGoogleAccessToken(tokenResponse.access_token);
              } else if (tokenResponse?.error) {
                console.error('[GOOGLE] OAuth error:', tokenResponse);
                setLoading(false);
                if (tokenResponse.error !== 'popup_closed_by_user') {
                  onError?.(tokenResponse.error_description || 'Google sign-in failed.');
                }
              }
            },
          });
        } catch (err) {
          console.warn('[GOOGLE] tokenClient init warning:', err);
        }
      }
    };

    loadGsiScript();
  }, [onError]);

  const handleGoogleAccessToken = async (accessToken: string) => {
    setLoading(true);
    try {
      // Fetch verified user profile directly from Google's official userinfo API
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userinfoRes.ok) {
        throw new Error('Failed to retrieve user profile from Google.');
      }

      const profile = await userinfoRes.json();

      // Submit to YatraSaathi backend for session creation & provider conflict verification
      await loginWithGoogle({
        email: profile.email,
        name: profile.name,
        avatar_url: profile.picture,
        google_id: profile.sub,
      });

      onSuccess?.();
    } catch (err: any) {
      console.error('[GOOGLE AUTH] Error:', err);
      onError?.(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    setLoading(true);

    // 1. Try official GIS OAuth2 token client popup directly from Google
    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('[GOOGLE] requestAccessToken failed, fallback to window.open:', err);
      }
    }

    // 2. Direct official Google OAuth2 popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      LIVE_GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account`;

    const popup = window.open(
      googleAuthUrl,
      'GoogleSignIn',
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setLoading(false);
      onError?.('Please allow popups for Google Sign-In.');
      return;
    }

    // Listen for message from popup callback window
    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        popup?.close();
        if (event.data.access_token) {
          await handleGoogleAccessToken(event.data.access_token);
        } else if (event.data.credential) {
          try {
            await loginWithGoogle({ credential: event.data.credential });
            onSuccess?.();
          } catch (err: any) {
            onError?.(err.message || 'Google sign-in failed.');
          } finally {
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', messageListener);

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignInClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-[#6b21a8] border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting to Google...' : text}</span>
    </button>
  );
}
