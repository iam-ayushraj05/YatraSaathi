'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth, AuthModalView } from '../../context/AuthContext';
import VoiceAuthWall from './VoiceAuthWall';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import PhoneAuth from './PhoneAuth';
import PostSignupOnboardingModal from './PostSignupOnboardingModal';
import { X, ArrowLeft, Mail, CheckCircle2, Lock } from 'lucide-react';
import Image from 'next/image';
import appLogo from '../../public/app-logo.png';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalView,
    authModalReason,
    closeAuthModal,
    openAuthModal,
    forgotPassword,
  } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<AuthModalView>(authModalView);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentView(authModalView);
    setForgotSent(false);
    setForgotError(null);
  }, [authModalView, authModalOpen]);

  // Keyboard trap & Escape support
  useEffect(() => {
    if (!authModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'onboarding') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [authModalOpen, currentView, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 animate-scaleUp relative max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        {currentView !== 'onboarding' && (
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close modal"
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header for standard views */}
        {currentView !== 'voice_wall' && currentView !== 'onboarding' && (
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src={appLogo}
                alt="yatrasaathi Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-xl shadow-xs"
              />
            </div>
            <div>
              <div className="text-base font-black tracking-tight leading-none">
                <span className="text-slate-900 dark:text-white">yatra</span>
                <span className="bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">saathi</span>
              </div>
              <p className="text-[7.5px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mt-1 leading-none">
                {currentView === 'login' ? 'Sign in to your account' : currentView === 'signup' ? 'Create a free account' : currentView === 'phone' ? 'Phone Verification' : 'Password Reset'}
              </p>
            </div>
          </div>
        )}

        {/* View Switcher Tabs (Login vs Register) */}
        {(currentView === 'login' || currentView === 'signup') && (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                currentView === 'login'
                  ? 'bg-white dark:bg-[#121420] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                currentView === 'signup'
                  ? 'bg-white dark:bg-[#121420] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* VIEW 1: Voice Auth Wall */}
        {currentView === 'voice_wall' && (
          <VoiceAuthWall
            onSuccess={closeAuthModal}
            onSelectPhone={() => setCurrentView('phone')}
            onSelectEmail={() => setCurrentView('signup')}
            onSelectLogin={() => setCurrentView('login')}
          />
        )}

        {/* VIEW 2: Login Form */}
        {currentView === 'login' && (
          <LoginForm
            onSuccess={closeAuthModal}
            onSwitchToSignup={() => setCurrentView('signup')}
            onSwitchToPhone={() => setCurrentView('phone')}
            onSwitchToForgotPassword={() => setCurrentView('forgot_password')}
          />
        )}

        {/* VIEW 3: Signup Form */}
        {currentView === 'signup' && (
          <SignupForm
            onSuccess={closeAuthModal}
            onSwitchToLogin={() => setCurrentView('login')}
            onSwitchToPhone={() => setCurrentView('phone')}
          />
        )}

        {/* VIEW 4: Phone Auth */}
        {currentView === 'phone' && (
          <PhoneAuth
            onSuccess={closeAuthModal}
            onSwitchToEmail={() => setCurrentView('login')}
          />
        )}

        {/* VIEW 5: Forgot Password */}
        {currentView === 'forgot_password' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Reset your password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-medium space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Reset instructions sent!</span>
                </div>
                <p>
                  We&apos;ve sent a password reset link to <strong className="font-bold">{forgotEmail}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="w-full py-2.5 mt-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                {forgotError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {forgotError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="aarav@yatrasaathi.in"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW 6: Post-signup Onboarding */}
        {currentView === 'onboarding' && (
          <PostSignupOnboardingModal
            onComplete={closeAuthModal}
            onSkip={closeAuthModal}
          />
        )}
      </div>
    </div>
  );
}
