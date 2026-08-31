'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import { Mail, Lock, Eye, EyeOff, Phone, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToPhone?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onSwitchToPhone,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'The email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Social & Phone Auth */}
      <div className="space-y-2.5">
        <GoogleAuthButton 
          text="Continue with Google" 
          onSuccess={onSuccess} 
          onError={(err) => setError(err)}
        />
        
        {onSwitchToPhone && (
          <button
            type="button"
            onClick={onSwitchToPhone}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-xs transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#6b21a8] dark:text-purple-400" />
            <span>Continue with Phone</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-[#121420] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          or continue with email
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@yatrasaathi.in"
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            {onSwitchToForgotPassword && (
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-xs font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {onSwitchToSignup && (
        <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      )}
    </div>
  );
}
