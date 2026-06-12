'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Lock, Bell, ChevronRight, Loader2, Calculator, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Card } from '@/components/ui/Card'; 
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { setCompanySettings } from '@/store/settingsSlice';
import { logOut } from '@/store/authSlice';
import { logoutUser } from '@/services/authService';
import Cookies from 'js-cookie';

import GeneralSettings from '@/components/settings/GeneralSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PayrollSettings from '@/components/settings/PayrollSettings';
import ShiftSettings from '@/components/settings/ShiftSettings';

import { 
    useCompanySettings, 
    useUpdateCompanySettings,
    useNotificationPreferences,
    useUpdateNotificationPreferences,
    useUpdatePassword
} from '@/hooks/api/useSettings';

const settingsTabs = [
    { id: 'general', label: 'General & Company', icon: Building, description: 'Workspace details and branding' },
    { id: 'security', label: 'Security & Access', icon: Lock, description: 'Manage passwords and access' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and system webhook alerts' },
    { id: 'payroll', label: 'Payroll Engine', icon: Calculator, description: 'Manage dynamic allowances and deductions' },
] as const;

type SettingsTabId = typeof settingsTabs[number]['id'];

export default function SettingsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    // Auth & RBAC
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    
    // UI State
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    // Filter tabs based on role permissions (Payroll Engine is Admin/HR only)
    const visibleTabs = useMemo(() => {
        return settingsTabs.filter((tab) => {
            if (tab.id === 'payroll') {
                const role = user?.role?.toLowerCase();
                return role === 'admin' || role === 'hr';
            }
            return true;
        });
    }, [user]);

    // Auto-redirect if active tab is restricted for current user role
    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.id === activeTab)) {
            setActiveTab('general');
        }
    }, [activeTab, visibleTabs]);

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    // Data Fetching (React Query)
    const { data: companyData, isLoading: isCompanyLoading } = useCompanySettings();
    const { data: notificationData, isLoading: isNotificationsLoading } = useNotificationPreferences();

    // Mutations (React Query)
    const updateCompanyMutation = useUpdateCompanySettings();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const updatePasswordMutation = useUpdatePassword();

    const handleSaveCompanySettings = async (data: FormData) => {
        try {
            const res = await updateCompanyMutation.mutateAsync(data);
            if (res.success && res.data) {
                dispatch(setCompanySettings(res.data));
                if (res.data.brandColor) {
                    document.documentElement.style.setProperty('--primary-color', res.data.brandColor);
                }
            }
            toast.success('Company settings updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update company settings');
        }
    };

    const handleUpdateNotifications = async (data: any) => {
        try {
            await updateNotificationsMutation.mutateAsync(data);
            toast.success('Notification preferences saved');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save preferences');
        }
    };

    const handleUpdatePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
        try {
            await updatePasswordMutation.mutateAsync({ currentPassword: currentPass, newPassword: newPass });
            toast.success('Password Updated Successfully. Logging out...');
            
            setTimeout(async () => {
                try {
                    await logoutUser();
                } catch (e) {
                    console.error("Backend logout failed:", e);
                } finally {
                    dispatch(logOut());
                    
                    // Clear local storage and cookies to prevent ghost sessions
                    localStorage.removeItem('hrms_user');
                    localStorage.removeItem('hrms_token');
                    localStorage.removeItem('hrms_refreshToken');
                    Cookies.remove('hrms_token', { path: '/' });
                    Cookies.remove('hrms_role', { path: '/' });
                    Cookies.remove('role', { path: '/' });
                    
                    router.push('/hrms-login');
                }
            }, 1500);

            return true; 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
            return false;
        }
    };

    const isCurrentTabLoading = 
        (activeTab === 'general' && isCompanyLoading) || 
        (activeTab === 'notifications' && isNotificationsLoading);

    const activeTabData = settingsTabs.find(t => t.id === activeTab);

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Platform Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        Manage your company workspace, security protocols, and user preferences.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0">
                        {/* Mobile: Sheet Drawer Trigger Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMobileNavOpen(true)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-left transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {activeTabData && <activeTabData.icon size={18} className="text-primary" />}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{activeTabData?.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{activeTabData?.description}</p>
                                    </div>
                                </div>
                                <Menu size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
                            </button>
                        </div>

                        {/* Mobile: Sheet Drawer */}
                        <Sheet isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} side="bottom">
                            <SheetHeader>
                                <SheetTitle>Settings Navigation</SheetTitle>
                            </SheetHeader>
                            <nav className="px-4 pb-6 space-y-1">
                                {visibleTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsMobileNavOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left group",
                                                isActive
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
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
                                                <div>
                                                    <span className="block">{tab.label}</span>
                                                    <span className={cn(
                                                        "block text-xs font-medium mt-0.5",
                                                        isActive ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                                                    )}>
                                                        {tab.description}
                                                    </span>
                                                </div>
                                            </div>
                                            {isActive && <ChevronRight size={14} className="text-white/70" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </Sheet>

                        {/* Desktop: Vertical Sidebar */}
                        <nav className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-2 space-y-1 transition-colors">
                            {visibleTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left group",
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
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


                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full min-w-0">
                        <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none min-h-[65vh] bg-white dark:bg-gray-900 overflow-hidden relative transition-colors duration-300">
                            
                            {/* Loading Overlay */}
                            {isCurrentTabLoading && (
                                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            )}

                            <div className="p-4 sm:p-6 lg:p-8">
                                {activeTab === 'general' && (
                                    <GeneralSettings 
                                        initialData={companyData} 
                                        onSave={handleSaveCompanySettings} 
                                    />
                                )}
                                {activeTab === 'security' && (
                                    <SecuritySettings 
                                        onPasswordUpdate={handleUpdatePassword}
                                    />
                                )}
                                {activeTab === 'notifications' && (
                                    <NotificationSettings 
                                        initialData={notificationData}
                                        onUpdate={handleUpdateNotifications}
                                    />
                                )}
                                {activeTab === 'payroll' && (
                                    <PayrollSettings 
                                        initialData={companyData} 
                                        onSave={handleSaveCompanySettings}
                                    />
                                )}

                            </div>
                        </Card>
                        {activeTab === 'general' && isAdmin && <ShiftSettings />}
                    </main>

                </div>
            </div>
        </div>
    );
}