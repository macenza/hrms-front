'use client';

import React, { useState } from 'react';
import { Building, Lock, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';

// Setting Tabs
import GeneralSettings from '@/components/settings/GeneralSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';

// 1. Configurable Settings Tabs
const settingsTabs = [
    { id: 'general', label: 'General & Company', icon: Building, description: 'Workspace details and branding' },
    { id: 'security', label: 'Security & Access', icon: Lock, description: 'Passwords and 2FA settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and system alerts' },
] as const;

type SettingsTabId = typeof settingsTabs[number]['id'];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

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

                    {/* Contextual help or info card under sidebar */}
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hidden lg:block">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Need help?</p>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Changes made here affect the entire workspace. Ensure you have the necessary permissions before modifying security protocols.
                        </p>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 w-full">
                    <Card className="border-gray-200 shadow-sm min-h-[65vh] bg-white overflow-hidden">
                        <div className="p-6 sm:p-8">
                            {activeTab === 'general' && <GeneralSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                        </div>
                    </Card>
                </main>

            </div>
        </div>
    );
}