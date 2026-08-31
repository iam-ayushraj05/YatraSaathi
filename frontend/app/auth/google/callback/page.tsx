'use client';

import React, { useEffect } from 'react';

export default function GoogleCallbackPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Parse hash parameters from Google OAuth redirect (#access_token=...&id_token=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');

    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_SUCCESS',
          access_token: accessToken,
          credential: idToken,
        },
        window.location.origin
      );
      window.close();
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0c0e17] text-slate-900 dark:text-white">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#6b21a8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Completing Google sign-in...
        </p>
      </div>
    </div>
  );
}
