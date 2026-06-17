'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Shield, Settings, X } from 'lucide-react';

interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Check if the user has already made a choice
        const consent = Cookies.get('macenza_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        } else {
            try {
                const parsed = JSON.parse(consent);
                setPreferences(parsed);
            } catch (e) {
                // Fallback handling if it was stored as simple text from previous versions
                if (consent === 'accepted') {
                    setPreferences({ essential: true, analytics: true, marketing: true });
                } else {
                    setPreferences({ essential: true, analytics: false, marketing: false });
                }
            }
        }
    }, []);

    const savePreferences = (newPrefs: CookiePreferences) => {
        // Save preferences stringified for 365 days
        Cookies.set('macenza_cookie_consent', JSON.stringify(newPrefs), { expires: 365, path: '/' });
        setPreferences(newPrefs);
        setIsVisible(false);
        setShowModal(false);
    };

    const handleAcceptAll = () => {
        const acceptAll = { essential: true, analytics: true, marketing: true };
        savePreferences(acceptAll);
    };

    const handleDeclineAll = () => {
        const declineAll = { essential: true, analytics: false, marketing: false };
        savePreferences(declineAll);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Main Cookie Banner (Fixed Bottom-Bar) */}
            <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl p-4 md:py-5 md:px-12 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <span className="text-xl shrink-0">🍪</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center md:text-left">
                            We use cookies to improve your experience on our site, analyze traffic, and support security. Read our{' '}
                            <Link href="/privacy" className="text-[#6D5DFD] hover:underline font-medium">
                                Cookies Policy
                            </Link>
                            .
                        </p>
                    </div>
                    
                    {/* Action buttons (Decline, Customize, Accept All) */}
                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                        <button
                            onClick={handleDeclineAll}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Decline
                        </button>
                        
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                            <Settings size={14} /> Customize
                        </button>
                        
                        <button
                            onClick={handleAcceptAll}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#6D5DFD] hover:bg-[#5b4dfc] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>

            {/* Cookie Preferences Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-1 text-left">
                            <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <Shield className="text-[#6D5DFD]" size={18} /> Cookie Settings
                            </h3>
                            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                                Customize your cookie preferences. Mandatory cookies will remain enabled.
                            </p>
                        </div>

                        <div className="space-y-4 text-left">
                            {/* 1. Strictly Necessary */}
                            <div className="flex items-start justify-between p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-1 pr-4">
                                    <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                                        Strictly Necessary <span className="text-[9px] uppercase tracking-wider bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-bold">Required</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Required for security, session checks, and internal tenant login persistence.
                                    </p>
                                </div>
                                <div className="relative inline-flex items-center cursor-not-allowed">
                                    <input type="checkbox" checked disabled className="sr-only peer" />
                                    <div className="w-8 h-4 bg-gray-300 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#6D5DFD]" />
                                </div>
                            </div>

                            {/* 2. Analytics Cookies */}
                            <div className="flex items-start justify-between p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-1 pr-4">
                                    <p className="text-xs font-black text-gray-900 dark:text-white">Performance & Analytics</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Helps us monitor traffic rates to identify interface lag.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#6D5DFD]" />
                                </label>
                            </div>

                            {/* 3. Marketing Cookies */}
                            <div className="flex items-start justify-between p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-1 pr-4">
                                    <p className="text-xs font-black text-gray-900 dark:text-white">Marketing & Onboarding</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Tracks signup funnel conversion rates for onboarding analytics.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketing}
                                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#6D5DFD]" />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleAcceptAll}
                                className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={() => savePreferences(preferences)}
                                className="flex-1 py-3 px-4 bg-[#6D5DFD] hover:bg-[#5b4eed] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#6D5DFD]/20 transition"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
