'use client';

import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  isError?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  isError = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first empty input on mount
    const firstEmpty = inputsRef.current.find((input) => input && !input.value);
    if (firstEmpty) {
      firstEmpty.focus();
    } else if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // only digits
    if (!val) {
      // Clear current digit
      const otpArr = value.split('');
      otpArr[index] = '';
      onChange(otpArr.join(''));
      return;
    }

    // Single digit input
    const digit = val[val.length - 1];
    const otpArr = value.padEnd(length, ' ').split('');
    otpArr[index] = digit;
    const newOtp = otpArr.join('').trimEnd();
    onChange(newOtp);

    // Auto-advance to next input
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full my-2">
      {Array.from({ length }, (_, i) => {
        const digit = value[i] || '';
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all duration-200 outline-none select-none ${
              isError
                ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : digit
                ? 'border-purple-400 dark:border-purple-600 bg-purple-50/30 dark:bg-purple-950/20 text-[#6b21a8] dark:text-purple-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-[#6b21a8] dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
}
