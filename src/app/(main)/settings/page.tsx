// src/app/(main)/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building, Lock, Bell, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

// Services & State
import apiClient from '@/services/apiClient'; // Verify your path
import { useAppSelector } from '@/store/hooks';

// UI Components
import { Card } from '@/components/ui/Card'; // Verify your path

// Setting Tabs & Types
import GeneralSettings, { CompanySettings } from '@/components/settings/GeneralSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings, { NotificationPreferences } from '@/components/settings/NotificationSettings';

const settingsTabs = [
    { id: 'general', label: 'General & Company', icon: Building, description: 'Workspace details and branding' },
    { id: 'security', label: 'Security & Access', icon: Lock, description: 'Passwords and 2FA settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and system alerts' },
] as const;

type SettingsTabId = typeof settingsTabs[number]['id'];

export default function SettingsPage() {
    // 1. Global State
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

    // 2. Data States
    const [companyData, setCompanyData] = useState<CompanySettings | null>(null);
    const [notificationData, setNotificationData] = useState<NotificationPreferences | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);

    // 3. Lazy-Loading Data Fetcher
    // We only fetch data when the user clicks the corresponding tab
    const fetchTabData = useCallback(async (tab: SettingsTabId) => {
        setIsLoading(true);
        try {
            if (tab === 'general' && !companyData) {
                const res = await apiClient.get('/settings/company');
                setCompanyData(res.data.data);
            } else if (tab === 'notifications' && !notificationData) {
                const res = await apiClient.get('/settings/notifications');
                setNotificationData(res.data.data);
            }
            // Security doesn't need an initial fetch unless grabbing 2FA status
        } catch (error) {
            console.error(`Failed to fetch ${tab} data:`, error);
            toast.error('Failed to load settings data.');
        } finally {
            setIsLoading(false);
        }
    }, [companyData, notificationData]);

    useEffect(() => {
        fetchTabData(activeTab);
    }, [activeTab, fetchTabData]);

    // 4. API Handlers
    const handleSaveCompanySettings = async (data: CompanySettings) => {
        try {
            await apiClient.put('/settings/company', data);
            setCompanyData(data);
            toast.success('Company settings updated successfully');
        } catch (error) {
            toast.error('Failed to update company settings');
        }
    };

    const handleUpdateNotifications = async (data: NotificationPreferences) => {
        try {
            await apiClient.put('/settings/notifications', data);
            setNotificationData(data);
            toast.success('Notification preferences saved');
        } catch (error) {
            toast.error('Failed to save preferences');
        }
    };

    const handleUpdatePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
        try {
            await apiClient.patch('/auth/update-password', { currentPassword: currentPass, newPassword: newPass });
            toast.success('Password updated successfully');
            return true; 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
            return false;
        }
    };

    const handleToggle2FA = async (enable: boolean) => {
        try {
            await apiClient.post('/auth/2fa/toggle', { enable });
            toast.success(`Two-Factor Authentication ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to toggle 2FA');
            throw error; // Let the child component know it failed so it can revert the UI
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
                <p className="text-sm text-gray-500 font-medium">
                    Manage your company workspace, security protocols, and user preferences.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-72 shrink-0">
                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 space-y-1">
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
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            size={18}
                                            className={cn(
                                                "transition-colors",
                                                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                            )}
                                        />
                                        <span>{tab.label}</span>
                                    </div>
                                    {isActive && <ChevronRight size={14} className="text-white/70" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* RBAC: Only show workspace warnings to Admins */}
                    {isAdmin && (
                        <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hidden lg:block">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Workspace Admin</p>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Changes made in the General tab affect the entire workspace for all employees.
                            </p>
                        </div>
                    )}
                </aside>

                {/* Content Area */}
                <main className="flex-1 w-full">
                    <Card className="border-gray-200 shadow-sm min-h-[65vh] bg-white overflow-hidden relative">
                        {/* Global Loading Overlay for the Card */}
                        {isLoading && (
                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
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
    );
}