'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Lock, Bell, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/Card'; 

import GeneralSettings, { CompanySettings } from '@/components/settings/GeneralSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings, { NotificationPreferences } from '@/components/settings/NotificationSettings';

import { 
    useCompanySettings, 
    useUpdateCompanySettings,
    useNotificationPreferences,
    useUpdateNotificationPreferences,
    useUpdatePassword,
    useToggle2FA
} from '@/hooks/api/useSettings';

const settingsTabs = [
    { id: 'general', label: 'General & Company', icon: Building, description: 'Workspace details and branding' },
    { id: 'security', label: 'Security & Access', icon: Lock, description: 'Passwords and 2FA settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and system alerts' },
] as const;

type SettingsTabId = typeof settingsTabs[number]['id'];

export default function SettingsPage() {
    const router = useRouter();
    
    // Auth & RBAC
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    
    // UI State
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    // Data Fetching (React Query)
    const { data: companyData, isLoading: isCompanyLoading } = useCompanySettings();
    const { data: notificationData, isLoading: isNotificationsLoading } = useNotificationPreferences();

    // Mutations (React Query)
    const updateCompanyMutation = useUpdateCompanySettings();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const updatePasswordMutation = useUpdatePassword();
    const toggle2FAMutation = useToggle2FA();

    const handleSaveCompanySettings = async (data: CompanySettings) => {
        try {
            await updateCompanyMutation.mutateAsync(data);
            toast.success('Company settings updated successfully');
        } catch (error) {
            toast.error('Failed to update company settings');
        }
    };

    const handleUpdateNotifications = async (data: NotificationPreferences) => {
        try {
            await updateNotificationsMutation.mutateAsync(data);
            toast.success('Notification preferences saved');
        } catch (error) {
            toast.error('Failed to save preferences');
        }
    };

    const handleUpdatePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
        try {
            await updatePasswordMutation.mutateAsync({ currentPassword: currentPass, newPassword: newPass });
            toast.success('Password updated successfully');
            return true; 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
            return false;
        }
    };

    const handleToggle2FA = async (enable: boolean) => {
        try {
            await toggle2FAMutation.mutateAsync(enable);
            toast.success(`Two-Factor Authentication ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to toggle 2FA');
            throw error; // Throw so child component can revert UI toggle
        }
    };

    const isCurrentTabLoading = 
        (activeTab === 'general' && isCompanyLoading) || 
        (activeTab === 'notifications' && isNotificationsLoading);

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Platform Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        Manage your company workspace, security protocols, and user preferences.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <nav className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-2 space-y-1 transition-colors">
                            {settingsTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left group",
                                            isActive
                                                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-none"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={18}
                                                className={cn(
                                                    "transition-colors",
                                                    isActive 
                                                        ? "text-white" 
                                                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                )}
                                            />
                                            <span>{tab.label}</span>
                                        </div>
                                        {isActive && <ChevronRight size={14} className="text-white/70" />}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Admin Notice */}
                        {isAdmin && (
                            <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 hidden lg:block transition-colors">
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2 transition-colors">Workspace Admin</p>
                                <p className="text-xs text-blue-600 dark:text-blue-300/80 leading-relaxed transition-colors">
                                    Changes made in the General tab affect the entire workspace for all employees.
                                </p>
                            </div>
                        )}
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full">
                        <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none min-h-[65vh] bg-white dark:bg-gray-900 overflow-hidden relative transition-colors duration-300">
                            
                            {/* Loading Overlay */}
                            {isCurrentTabLoading && (
                                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all">
                                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={32} />
                                </div>
                            )}

                            <div className="p-6 sm:p-8">
                                {activeTab === 'general' && (
                                    <GeneralSettings 
                                        initialData={companyData} 
                                        onSave={handleSaveCompanySettings} 
                                    />
                                )}
                                {activeTab === 'security' && (
                                    <SecuritySettings 
                                        onPasswordUpdate={handleUpdatePassword}
                                        onToggle2FA={handleToggle2FA}
                                    />
                                )}
                                {activeTab === 'notifications' && (
                                    <NotificationSettings 
                                        initialData={notificationData}
                                        onUpdate={handleUpdateNotifications}
                                    />
                                )}
                            </div>
                        </Card>
                    </main>

                </div>
            </div>
        </div>
    );
}