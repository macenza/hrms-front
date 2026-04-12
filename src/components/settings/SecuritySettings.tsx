// src/components/settings/SecuritySettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Save, Lock, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button'; // Verify path
import { Input } from '@/components/ui/Input'; // Verify path
import { Badge } from '@/components/ui/Badge'; // Verify path

// State
import { useAppSelector } from '@/store/hooks';

// 1. Data Contract
export interface SecurityPreferences {
    is2FAEnabled: boolean;
    lastPasswordChange?: string; // ISO Date string from backend
}

interface SecuritySettingsProps {
    initialData?: SecurityPreferences | null;
    onPasswordUpdate?: (currentPass: string, newPass: string) => Promise<boolean>; // Returns true if successful
    onToggle2FA?: (enable: boolean) => Promise<void>;
}

export default function SecuritySettings({
    initialData,
    onPasswordUpdate,
    onToggle2FA
}: SecuritySettingsProps) {
    // Current User Data for personalized UI
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Account';

    // 2. Local State Management
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    
    // Loading States for Async Actions
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isToggling2FA, setIsToggling2FA] = useState(false);

    // Sync initial 2FA state from backend
    useEffect(() => {
        if (initialData) {
            setIs2FAEnabled(initialData.is2FAEnabled);
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Secure Form Submission
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            // In a real app, use toast.error("Passwords don't match!");
            alert("Passwords don't match!");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            if (onPasswordUpdate) {
                const success = await onPasswordUpdate(passwords.current, passwords.new);
                if (success) {
                    // CRITICAL: Clear sensitive data from memory immediately upon success
                    setPasswords({ current: '', new: '', confirm: '' });
                }
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handle2FAToggleClick = async () => {
        setIsToggling2FA(true);
        try {
            const newState = !is2FAEnabled;
            if (onToggle2FA) {
                await onToggle2FA(newState);
            }
            // Optimistic UI update
            setIs2FAEnabled(newState);
        } finally {
            setIsToggling2FA(false);
        }
    };

    // Simple password strength check
    const isStrong = passwords.new.length >= 8;
    const canSubmitPassword = passwords.current && passwords.new && passwords.confirm && isStrong;

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
            {/* Change Password Section */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <Key size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Change Password</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                            <Input
                                type="password"
                                name="current"
                                value={passwords.current}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={isUpdatingPassword}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <Input
                                type="password"
                                name="new"
                                value={passwords.new}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isUpdatingPassword}
                            />
                            {passwords.new && (
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider mt-1",
                                    isStrong ? "text-emerald-500" : "text-orange-500"
                                )}>
                                    {isStrong ? "Strength: Strong" : "Strength: Too Weak (Min 8 chars)"}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                            <Input
                                type="password"
                                name="confirm"
                                value={passwords.confirm}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isUpdatingPassword}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-gray-100 pt-6">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 shadow-sm min-w-[160px]"
                            disabled={!canSubmitPassword || isUpdatingPassword}
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </section>

            {/* Two-Factor Authentication Section */}
            <section className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Two-Factor Authentication</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            Add an extra layer of security to your {userRole} account.
                        </p>
                    </div>
                    <Badge variant={is2FAEnabled ? "success" : "default"}>
                        {is2FAEnabled ? 'Active' : 'Not Configured'}
                    </Badge>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-200 rounded-2xl bg-gray-50/50 gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600">
                            <Lock size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Authenticator App</p>
                            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed max-w-md">
                                Use an app like Google Authenticator or 1Password to generate secure verification codes.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handle2FAToggleClick}
                        disabled={isToggling2FA}
                        className="w-full sm:w-auto bg-white min-w-[140px] flex justify-center"
                    >
                        {isToggling2FA ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : is2FAEnabled ? (
                            'Disable 2FA'
                        ) : (
                            'Enable 2FA'
                        )}
                    </Button>
                </div>
            </section>

            {/* Security Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <ShieldAlert size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 leading-relaxed">
                    <strong>Pro-tip:</strong> Changing your security settings will not log you out of your current session, but you will need to use your new credentials for any future logins.
                </p>
            </div>
        </div>
    );
}