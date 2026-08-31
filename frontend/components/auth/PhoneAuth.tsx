'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import OTPInput from './OTPInput';
import { Phone, ArrowLeft, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhoneAuthProps {
  onSuccess?: () => void;
  onSwitchToEmail?: () => void;
}

export default function PhoneAuth({ onSuccess, onSwitchToEmail }: PhoneAuthProps) {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  
  const [step, setStep] = useState<'input_phone' | 'verify_otp'>('input_phone');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  // Timers
  const [expiresIn, setExpiresIn] = useState<number>(120); // 2 minutes
  const [resendIn, setResendIn] = useState<number>(24);   // 24s cooldown

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'verify_otp') {
      timer = setInterval(() => {
        setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
        setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${cleanPhone.slice(-10)}`;
      const res = await sendPhoneOtp(fullPhone);
      setStep('verify_otp');
      setExpiresIn(120);
      setResendIn(24);
      setOtp('');
      if (res?.demo_otp_hint) {
        setDemoHint(res.demo_otp_hint);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    if (expiresIn === 0) {
      setError('The OTP has expired. Please request a new code.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
      await verifyPhoneOtp(cleanPhone, otp, name.trim() || undefined);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'The OTP is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || loading) return;
    await handleSendOtp();
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'input_phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm select-none shrink-0">
                <span className="text-base">🇮🇳</span>
                <span>+91</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-semibold tracking-wider focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              We&apos;ll send a 6-digit one-time verification code via SMS.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:from-[#7c2d12] hover:to-[#6b21a8] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Send OTP</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep('input_phone');
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6b21a8] dark:text-purple-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change (+91 {phone})</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              OTP expires in <strong className="text-slate-800 dark:text-slate-200">{formatTimer(expiresIn)}</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Enter 6-Digit Code
            </label>
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
              isError={!!error}
            />
          </div>

          {demoHint && (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 text-[11px] font-medium flex items-center gap-2">
              <span className="font-bold">Test OTP:</span>
              <code className="bg-purple-200 dark:bg-purple-900 px-1.5 py-0.5 rounded font-mono font-bold">{demoHint}</code>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 dark:text-slate-400">Didn&apos;t receive the code?</span>
            {resendIn > 0 ? (
              <span className="text-slate-400 dark:text-slate-500 font-semibold">
                Resend OTP in {resendIn}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-bold text-[#6b21a8] dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || expiresIn === 0}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6b21a8] via-[#881337] to-[#581c87] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>
      )}

      {onSwitchToEmail && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onSwitchToEmail}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#6b21a8] dark:hover:text-purple-300 transition-colors"
          >
            Prefer to use email instead? <span className="font-bold text-[#6b21a8] dark:text-purple-400">Continue with Email</span>
          </button>
        </div>
      )}
    </div>
  );
}
