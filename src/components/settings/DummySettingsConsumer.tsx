'use client';

import React from 'react';
import { useSettings } from '@/providers/SettingsProvider';
import { IndianRupee, DollarSign, Euro, Coins } from 'lucide-react';

export default function DummySettingsConsumer() {
    const { settings, isLoading, isError } = useSettings();

    if (isLoading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-400">Loading global configurations...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm text-center">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">Failed to load company configurations.</span>
            </div>
        );
    }

    const getCurrencyIcon = (currencyCode: string) => {
        switch (currencyCode.toUpperCase()) {
            case 'INR': return <IndianRupee className="w-5 h-5 text-primary" />;
            case 'USD': return <DollarSign className="w-5 h-5 text-primary" />;
            case 'EUR': return <Euro className="w-5 h-5 text-primary" />;
            default: return <Coins className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-gray-100 transition-colors">
            <h3 className="text-md font-bold tracking-tight mb-4 flex items-center gap-2">
                <span>Branding Configuration Overview</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                    useSettings() Hook
                </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-550 dark:text-gray-400">Company Name</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{settings.companyName}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-550 dark:text-gray-400">System Currency</span>
                    <span className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                        {getCurrencyIcon(settings.currency)}
                        <span>{settings.currency.toUpperCase()}</span>
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-550 dark:text-gray-400">Date Format</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                        {settings.dateFormat}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-550 dark:text-gray-400">Active Brand Color</span>
                    <span className="flex items-center gap-2">
                        <span 
                            className="w-4 h-4 rounded-full border border-white dark:border-gray-950 shadow-sm"
                            style={{ backgroundColor: settings.brandColor }}
                        />
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">{settings.brandColor}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
