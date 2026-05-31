'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface CompanySettings {
    companyName: string;
    companyLogoUrl?: string;
    timezone: string;
    currency: string;
    brandColor: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    roles: string[];
    departments: string[];
}

interface SettingsContextType {
    settings: CompanySettings;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<void>;
}

const DEFAULT_SETTINGS: CompanySettings = {
    companyName: 'Macenza',
    companyLogoUrl: '',
    timezone: 'UTC',
    currency: 'USD',
    brandColor: '#3B82F6',
    dateFormat: 'MM/DD/YYYY',
    roles: ['employee', 'manager', 'hr', 'admin'],
    departments: ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance']
};

const SettingsContext = createContext<SettingsContextType>({
    settings: DEFAULT_SETTINGS,
    isLoading: false,
    isError: false,
    refetch: async () => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/settings');
            if (response.data?.success && response.data?.data) {
                setSettings(response.data.data);
                setIsError(false);
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error('Failed to fetch global company settings:', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Apply Brand Color directly to CSS variables on DOM
    useEffect(() => {
        if (settings?.brandColor) {
            document.documentElement.style.setProperty('--primary-color', settings.brandColor);
        }
    }, [settings?.brandColor]);

    return (
        <SettingsContext.Provider value={{ settings, isLoading, isError, refetch: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
