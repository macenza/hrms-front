'use client';

import React, { useState } from 'react';
import { Building, Lock, Bell, Shield, Paintbrush } from 'lucide-react';
import clsx from 'clsx';
import GeneralSettings from '@/components/settings/GeneralSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';

const settingsTabs = [
    { id: 'general', label: 'General & Company', icon: Building },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your company workspace, security, and preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation for Settings */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1">
                        {settingsTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left",
                                        isActive 
                                            ? "bg-[#4F7CF3]/10 text-[#4F7CF3]" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon size={18} className={isActive ? "text-[#4F7CF3]" : "text-gray-400"} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[60vh]">
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}