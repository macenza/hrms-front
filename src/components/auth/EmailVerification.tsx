'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OtpInput } from '@/components/ui/OtpInput';
import apiClient from '@/services/apiClient';
import { Mail, CheckCircle2, Loader2, Send, RefreshCw, ShieldCheck } from 'lucide-react';

type VerificationState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

interface EmailVerificationProps {
    /** The email address to verify */
    email: string;
    /** Called when email is changed by the user */
    onEmailChange: (email: string) => void;
    /** Called when verification status changes */
    onVerified: (verified: boolean) => void;
    /** Whether the email is already verified */
    isVerified: boolean;
    /** Label for the email input */
    label?: string;
    /** Placeholder for the email input */
    placeholder?: string;
    /** Whether this component is disabled */
    disabled?: boolean;
    /** Whether the email field is required */
    required?: boolean;
    /** Whether to show error highlighting (red border) */
    hasError?: boolean;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerification({
    email,
    onEmailChange,
    onVerified,
    isVerified,
    label = 'Email *',
    placeholder = 'user@example.com',
    disabled = false,
    required = true,
    hasError = false,
}: EmailVerificationProps) {
    const [state, setState] = useState<VerificationState>(isVerified ? 'verified' : 'idle');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    // Sync external verified state
    useEffect(() => {
        if (isVerified && state !== 'verified') {
            setState('verified');
        }
    }, [isVerified]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Reset verification when email changes
    const handleEmailChange = useCallback((newEmail: string) => {
        onEmailChange(newEmail);
        if (state === 'verified' || state === 'sent') {
            setState('idle');
            setOtp('');
            setError(null);
            onVerified(false);
        }
    }, [state, onEmailChange, onVerified]);

    const handleSendOtp = async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setState('sending');
        setError(null);

        try {
            const response = await apiClient.post('/auth/send-otp', { email });
            setState('sent');
            setCountdown(RESEND_COOLDOWN_SECONDS);
            if (response.data && response.data.devOtp) {
                setOtp(response.data.devOtp);
            }
        } catch (err: any) {
            setState('error');
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setState('verifying');
        setError(null);

        try {
            await apiClient.post('/auth/verify-otp', { email, otp });
            setState('verified');
            onVerified(true);
        } catch (err: any) {
            setState('sent'); // Go back to "sent" state so they can retry
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setState('sending');
        setError(null);
        setOtp('');

        try {
            const response = await apiClient.post('/auth/resend-otp', { email });
            setState('sent');
            setCountdown(RESEND_COOLDOWN_SECONDS);
            if (response.data && response.data.devOtp) {
                setOtp(response.data.devOtp);
            }
        } catch (err: any) {
            setState('sent');
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        }
    };

    const isEmailLocked = state === 'sent' || state === 'verifying' || state === 'verified';

    return (
        <div className="space-y-3">
            {/* Email Input Row */}
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    {label}
                    {state === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            Verified
                        </span>
                    )}
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled || isEmailLocked}
                        required={required}
                        className={`
                        flex-1 h-10 px-3 rounded-md border text-sm transition-all duration-300
                        bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-[#6D5DFD]/20 focus:border-[#6D5DFD]
                        ${hasError && state !== 'verified'
                            ? 'border-red-500 ring-2 ring-red-500/20 dark:border-red-500'
                            : state === 'verified'
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }
                        ${isEmailLocked ? 'opacity-70 cursor-not-allowed' : ''}
                        disabled:bg-gray-50 dark:disabled:bg-gray-800
                    `}
                    />
                    {/* Send OTP Button — only show when not yet verified */}
                    {state !== 'verified' && state !== 'sent' && state !== 'verifying' && (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={disabled || state === 'sending' || !email}
                            className={`
                                inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-xs font-bold
                                whitespace-nowrap transition-all duration-200
                                ${state === 'sending'
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-wait'
                                    : 'bg-[#6D5DFD] hover:bg-[#5b4eed] text-white shadow-sm hover:shadow-md active:scale-95'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                            `}
                        >
                            {state === 'sending' ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Send size={14} />
                            )}
                            {state === 'sending' ? 'Sending...' : 'Send OTP'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-500 text-xs mt-0.5">⚠️</span>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}



            {/* OTP Verification Section */}
            {(state === 'sent' || state === 'verifying') && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#6D5DFD]" />
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Enter Verification Code
                        </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        We sent a 6-digit code to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
                    </p>

                    {/* OTP Input */}
                    <OtpInput
                        value={otp}
                        onChange={setOtp}
                        disabled={state === 'verifying'}
                        error={!!error}
                        autoFocus={true}
                    />

                    {/* Verify + Resend Row */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otp.length !== 6 || state === 'verifying'}
                            className={`
                                inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold
                                transition-all duration-200
                                ${state === 'verifying'
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-wait'
                                    : 'bg-[#6D5DFD] hover:bg-[#5b4eed] text-white shadow-sm hover:shadow-md active:scale-95'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {state === 'verifying' ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={14} />
                            )}
                            {state === 'verifying' ? 'Verifying...' : 'Verify'}
                        </button>

                        <span className="text-gray-300 dark:text-gray-600">|</span>

                        {countdown > 0 ? (
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                Resend in {countdown}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#6D5DFD] hover:text-[#5b4eed] transition-colors"
                            >
                                <RefreshCw size={12} />
                                Resend OTP
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Verified Success */}
            {state === 'verified' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        Email verified successfully
                    </p>
                </div>
            )}
        </div>
    );
}

EmailVerification.displayName = 'EmailVerification';
