'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Save, Lock, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input'; 
import { Badge } from '@/components/ui/Badge'; 
import { useAppSelector } from '@/store/hooks';

export interface SecurityPreferences {
    is2FAEnabled: boolean;
    lastPasswordChange?: string; 
}

interface SecuritySettingsProps {
    initialData?: SecurityPreferences | null;
    onPasswordUpdate?: (currentPass: string, newPass: string) => Promise<boolean>; 
    onToggle2FA?: (enable: boolean) => Promise<void>;
}

export default function SecuritySettings({
    initialData,
    onPasswordUpdate,
    onToggle2FA
}: SecuritySettingsProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Account';
    
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isToggling2FA, setIsToggling2FA] = useState(false);

    useEffect(() => {
        if (initialData) {
            setIs2FAEnabled(initialData.is2FAEnabled);
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("Passwords don't match!");
            return;
        }
        
        setIsUpdatingPassword(true);
        try {
            if (onPasswordUpdate) {
                const success = await onPasswordUpdate(passwords.current, passwords.new);
                if (success) {
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
            setIs2FAEnabled(newState);
        } finally {
            setIsToggling2FA(false);
        }
    };

    const isStrong = passwords.new.length >= 8;
    const canSubmitPassword = passwords.current && passwords.new && passwords.confirm && isStrong;

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
            
            {/* Password Section */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <Key size={18} className="text-gray-400 dark:text-gray-500 transition-colors" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Change Password</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium transition-colors">
                    Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Current Password</label>
                            <Input
                                type="password"
                                name="current"
                                value={passwords.current}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={isUpdatingPassword}
                                className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">New Password</label>
                            <Input
                                type="password"
                                name="new"
                                value={passwords.new}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isUpdatingPassword}
                                className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                            />
                            {passwords.new && (
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors",
                                    isStrong ? "text-emerald-500 dark:text-emerald-400" : "text-orange-500 dark:text-orange-400"
                                )}>
                                    {isStrong ? "Strength: Strong" : "Strength: Too Weak (Min 8 chars)"}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Confirm New Password</label>
                            <Input
                                type="password"
                                name="confirm"
                                value={passwords.confirm}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isUpdatingPassword}
                                className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6 transition-colors">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none min-w-[160px] font-semibold"
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

            {/* 2FA Section */}
            <section className="pt-8 border-t border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-gray-400 dark:text-gray-500 transition-colors" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Two-Factor Authentication</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                            Add an extra layer of security to your {userRole} account.
                        </p>
                    </div>
                    <div className="self-start sm:self-auto">
                        <Badge variant={is2FAEnabled ? "success" : "default"}>
                            {is2FAEnabled ? 'Active' : 'Not Configured'}
                        </Badge>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 gap-4 transition-colors">
                    <div className="flex items-start gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-500 shrink-0 transition-colors">
                            <Lock size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">Authenticator App</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed max-w-md transition-colors">
                                Use an app like Google Authenticator or 1Password to generate secure verification codes.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handle2FAToggleClick}
                        disabled={isToggling2FA}
                        className="w-full sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[140px] flex justify-center"
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

            {/* Pro-tip Alert */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 transition-colors">
                <ShieldAlert size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5 transition-colors" />
                <p className="text-xs text-orange-800 dark:text-orange-200/80 leading-relaxed transition-colors">
                    <strong className="text-orange-900 dark:text-orange-100">Pro-tip:</strong> Changing your security settings will not log you out of your current session, but you will need to use your new credentials for any future logins.
                </p>
            </div>
            
        </div>
    );
}