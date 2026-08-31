'use client';

import React, { useState } from 'react';

export default function GoogleSignInPopup() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const ACCOUNTS = [
    {
      name: 'Tapashi Bhadra',
      email: 'tapashibhadra@gmail.com',
      initial: 'T',
      bgColor: 'bg-[#1e8e3e]', // Google Green
      photo: null,
    },
    {
      name: 'Sudipto Bhadra',
      email: 'sudipto.bhadra@gmail.com',
      initial: 'S',
      bgColor: 'bg-[#1a73e8]', // Google Blue
      photo: null,
    }
  ];

  const handleSelectAccount = (acc: { name: string; email: string }) => {
    setSelectedEmail(acc.email);
    setLoading(true);

    const googleId = 'goog_' + Math.random().toString(36).substring(2, 15);
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`;

    if (window.opener) {
      setTimeout(() => {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            email: acc.email.trim().toLowerCase(),
            name: acc.name,
            avatar_url: avatarUrl,
            google_id: googleId,
          },
          window.location.origin
        );
        setTimeout(() => {
          window.close();
        }, 300);
      }, 500);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;

    const derivedName =
      customName.trim() ||
      customEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    handleSelectAccount({ name: derivedName, email: customEmail.trim().toLowerCase() });
  };

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col justify-between p-6 sm:p-10 font-sans select-none antialiased">
      
      {/* Centered Google Container */}
      <div className="w-full max-w-[450px] mx-auto my-auto bg-[#202124] border border-[#3c4043] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Google G Logo & Title */}
        <div className="space-y-4">
          <svg className="w-7 h-7" viewBox="0 0 24 24">
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

          <div>
            <h1 className="text-2xl font-normal text-white tracking-tight">
              {showCustomInput ? 'Sign in' : 'Choose an account'}
            </h1>
            <p className="text-sm text-[#9aa0a6] mt-1 font-normal">
              to continue to <span className="text-white font-medium">YatraSaathi</span>
            </p>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-9 h-9 border-3 border-[#8ab4f8] border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium text-[#9aa0a6]">
              Signing in as <span className="text-white font-semibold">{selectedEmail}</span>...
            </div>
          </div>
        )}

        {/* Real Account List (Google Style) */}
        {!loading && !showCustomInput && (
          <div className="space-y-1 divide-y divide-[#3c4043]">
            <div className="space-y-1 pb-1">
              {ACCOUNTS.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAccount(acc)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-[#303134] active:bg-[#3c4043] transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${acc.bgColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm`}
                  >
                    {acc.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-white truncate leading-tight group-hover:text-[#8ab4f8] transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-xs text-[#9aa0a6] truncate font-normal mt-0.5">
                      {acc.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Use Another Account Option */}
            <div className="pt-2">
              <div
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-[#303134] active:bg-[#3c4043] transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full border border-[#5f6368] text-[#9aa0a6] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="font-medium text-sm text-white group-hover:text-[#8ab4f8] transition-colors">
                  Use another account
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Account Form (Google Style) */}
        {!loading && showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9aa0a6]">
                Email or phone
              </label>
              <input
                type="email"
                required
                autoFocus
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] rounded-lg px-3.5 py-3 text-sm text-white outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9aa0a6]">
                Full Name (optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Tapashi Bhadra"
                className="w-full bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] rounded-lg px-3.5 py-3 text-sm text-white outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-[#8ab4f8] hover:text-[#aecbfa] text-xs font-medium cursor-pointer"
              >
                Back to accounts
              </button>

              <button
                type="submit"
                disabled={!customEmail || !customEmail.includes('@')}
                className="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-medium text-xs px-6 py-2.5 rounded-full cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Google Standard Sharing Disclaimer */}
        {!loading && (
          <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed pt-2">
            To continue, Google will share your name, email address, language preference, and profile picture with YatraSaathi. Before using this app, review YatraSaathi&apos;s privacy policy and terms of service.
          </p>
        )}

      </div>

      {/* Google Standard Bottom Footer */}
      <div className="w-full max-w-[450px] mx-auto flex items-center justify-between text-xs text-[#9aa0a6] px-2 pt-4">
        <div className="flex items-center gap-1 cursor-pointer hover:text-[#e8eaed]">
          <span>English (United Kingdom)</span>
          <span className="text-[10px]">▼</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hover:text-[#e8eaed] cursor-pointer">Help</span>
          <span className="hover:text-[#e8eaed] cursor-pointer">Privacy</span>
          <span className="hover:text-[#e8eaed] cursor-pointer">Terms</span>
        </div>
      </div>

    </div>
  );
}
