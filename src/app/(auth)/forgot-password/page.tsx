'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Loader2, AlertCircle, CheckCircle2,
    Mail, KeyRound, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import apiClient from '@/services/apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // ── Cooldown Timer ──
    const startCooldown = useCallback((seconds: number) => {
        setCooldown(seconds);
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // ── Password Strength ──
    const getPasswordStrength = (pw: string) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength] || '';
    const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength] || '';
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

    // ── Step 1: Send OTP ──
    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email.trim()) return setError('Please enter your email address.');
        setError(null);
        setIsLoading(true);

        try {
            await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim() });
            setStep('otp');
            startCooldown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Verify OTP ──
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return setError('Please enter the complete 6-digit OTP.');
        setError(null);
        setIsLoading(true);

        try {
            const res = await apiClient.post(ENDPOINTS.AUTH.VERIFY_RESET_OTP, {
                email: email.trim(),
                otp,
            });
            setResetToken(res.data.resetToken);
            setStep('password');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Resend OTP ──
    const handleResendOtp = async () => {
        if (cooldown > 0) return;
        setError(null);
        setIsLoading(true);
        setOtp('');

        try {
            await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim() });
            startCooldown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 3: Reset Password ──
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return setError('Please fill in both password fields.');
        if (newPassword !== confirmPassword) return setError('Passwords do not match.');
        if (strength < 3) return setError('Password is too weak. Use at least 8 characters, 1 uppercase letter, and 1 special character.');
        setError(null);
        setIsLoading(true);

        try {
            await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
                email: email.trim(),
                resetToken,
                newPassword,
            });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-[#6D5DFD] to-[#8B7BFF] px-8 py-8 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        {step === 'success' ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                            <KeyRound className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        {step === 'email' && 'Forgot Password?'}
                        {step === 'otp' && 'Verify Your Email'}
                        {step === 'password' && 'Set New Password'}
                        {step === 'success' && 'Password Reset!'}
                    </h1>
                    <p className="text-sm text-white/70 mt-1.5 font-medium">
                        {step === 'email' && 'Enter your email to receive a verification code'}
                        {step === 'otp' && `We sent a 6-digit code to ${email}`}
                        {step === 'password' && 'Choose a strong password for your account'}
                        {step === 'success' && 'Your password has been updated successfully'}
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-8">

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-medium">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── Step 1: Email ── */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 text-gray-900 dark:text-gray-100"
                                        id="forgot-email"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none bg-[#6D5DFD] hover:bg-[#5b4eed]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        <Mail size={18} />
                                        Send Verification Code
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* ── Step 2: OTP ── */}
                    {step === 'otp' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    length={6}
                                    disabled={isLoading}
                                    error={!!error}
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="button"
                                variant="primary"
                                className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none bg-[#6D5DFD] hover:bg-[#5b4eed]"
                                disabled={isLoading || otp.length !== 6}
                                onClick={handleVerifyOtp}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Verify Code
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={cooldown > 0 || isLoading}
                                    className="text-sm font-medium text-[#6D5DFD] dark:text-[#8B7BFF] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                                >
                                    {cooldown > 0
                                        ? `Resend code in ${cooldown}s`
                                        : "Didn't receive the code? Resend"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => { setStep('email'); setOtp(''); setError(null); }}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto"
                            >
                                <ArrowLeft size={14} />
                                Change email
                            </button>
                        </div>
                    )}

                    {/* ── Step 3: New Password ── */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10 text-gray-900 dark:text-gray-100"
                                        id="reset-new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Strength Indicator */}
                                {newPassword.length > 0 && (
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        backgroundColor: i < strength ? strengthColor : '#e5e7eb',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: strengthColor }}>
                                            {strengthLabel}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10 text-gray-900 dark:text-gray-100"
                                        id="reset-confirm-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Match / Mismatch feedback */}
                                {passwordsMatch && (
                                    <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Passwords match
                                    </p>
                                )}
                                {passwordsMismatch && (
                                    <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} /> Passwords do not match
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none bg-[#6D5DFD] hover:bg-[#5b4eed]"
                                disabled={isLoading || !passwordsMatch || strength < 3}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Reset Password
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* ── Step 4: Success ── */}
                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                    Your password has been successfully reset.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    You can now sign in with your new password.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-base font-bold rounded-lg bg-[#6D5DFD] hover:bg-[#5b4eed] text-white shadow-lg shadow-[#6D5DFD]/20 transition-colors"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    )}

                    {/* Back to login link (visible on all steps except success) */}
                    {step !== 'success' && (
                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#6D5DFD] transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
