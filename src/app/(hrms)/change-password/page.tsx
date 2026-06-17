'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logOut } from '@/store/authSlice';
import { useUpdatePassword } from '@/hooks/api/useSettings';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ShieldAlert, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const updatePasswordMutation = useUpdatePassword();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Password requirements validation
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
    const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            console.error("Logout backend request failed:", e);
        } finally {
            dispatch(logOut());
            sessionStorage.removeItem('hrms_user');
            sessionStorage.removeItem('hrms_token');
            sessionStorage.removeItem('hrms_refreshToken');
            sessionStorage.removeItem('persist:employeeAuth');
            sessionStorage.removeItem('persist:customerAuth');
            localStorage.removeItem('hrms_user');
            localStorage.removeItem('hrms_token');
            localStorage.removeItem('hrms_refreshToken');
            localStorage.removeItem('persist:employeeAuth');
            localStorage.removeItem('persist:customerAuth');
            Cookies.remove('hrms_token', { path: '/' });
            Cookies.remove('hrms_role', { path: '/' });
            window.location.href = '/login';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (!isPasswordValid) {
            setError('Please satisfy all password strength requirements.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
            setSuccess(true);
            toast.success('Password updated successfully! Redirecting...');

            // Update user in Redux
            if (user) {
                const updatedUser = { ...user, mustChangePassword: false };
                dispatch(setCredentials({ user: updatedUser }));
                sessionStorage.setItem('hrms_user', JSON.stringify(updatedUser));
            }

            // Redirect to dashboard
            setTimeout(() => {
                router.replace('/dashboard');
            }, 1500);
        } catch (err: any) {
            console.error('Password update error:', err);
            const serverMsg = err.response?.data?.message || 'Failed to update password. Please check your current password and try again.';
            setError(serverMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[480px] p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800/50">
                    <ShieldAlert size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Change Password Required
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    This is your first login or your account credentials were reset. You must choose a secure password to continue.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center justify-start gap-2 font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-center justify-start gap-2 font-medium">
                    <CheckCircle size={18} className="shrink-0 animate-bounce" />
                    <span>Password updated successfully! Redirecting you now...</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Temporary/Current Password</label>
                    <div className="relative">
                        <Input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter current password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isSubmitting || success}
                            className="pr-10 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            disabled={isSubmitting || success}
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                    <div className="relative">
                        <Input
                            type={showNew ? "text" : "password"}
                            placeholder="Enter new password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isSubmitting || success}
                            className="pr-10 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            disabled={isSubmitting || success}
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <div className="relative">
                        <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting || success}
                            className="pr-10 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            disabled={isSubmitting || success}
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl space-y-2 text-xs border border-gray-100 dark:border-gray-800 transition-colors">
                    <span className="font-bold text-gray-600 dark:text-gray-400">Password requirements:</span>
                    <div className="grid grid-cols-1 gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                            <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-500'}>
                                At least 8 characters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                            <span className={hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-500'}>
                                At least 1 uppercase letter
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${hasSpecialChar ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                            <span className={hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-500'}>
                                At least 1 special character
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleLogout}
                        disabled={isSubmitting || success || isLoggingOut}
                        className="w-full sm:w-1/3 flex items-center justify-center gap-1.5 order-2 sm:order-1"
                    >
                        {isLoggingOut ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <LogOut size={16} />
                                Sign Out
                            </>
                        )}
                    </Button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || success || !isPasswordValid || isLoggingOut}
                        className="w-full sm:flex-1 py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none bg-[#6D5DFD] hover:bg-[#5b4eed] order-1 sm:order-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            'Change Password'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
