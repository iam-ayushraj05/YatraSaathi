'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToPhone?: () => void;
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
  onSwitchToPhone,
}: SignupFormProps) {
  const { register } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const cleanPhone = phone ? `+91${phone.replace(/\D/g, '').slice(-10)}` : undefined;

      await register({
        email: email.trim().toLowerCase(),
        password,
        display_name: displayName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: cleanPhone,
      });

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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

      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-[#121420] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          or register with email
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              First Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Sharma"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@yatrasaathi.in"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="+91 98765 43210"
              maxLength={10}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          By creating an account, you agree to YatraSaathi&apos;s Terms of Service and Privacy Policy. Accessibility preferences can be customized right after.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="pt-1 text-center text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}
