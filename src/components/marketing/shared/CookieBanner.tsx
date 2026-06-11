'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie'; // We use js-cookie library that is already in your package.json

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the user has already made a choice
        const consent = Cookies.get('macenza_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);


    const handleAccept = () => {
        // Set the cookie 'macenza_cookie_consent' to 'accepted' for 365 days
        Cookies.set('macenza_cookie_consent', 'accepted', { expires: 365, path: '/' });
        setIsVisible(false); // Hide the banner
    };

    const handleDecline = () => {
        // Set the cookie 'macenza_cookie_consent' to 'declined' for 365 days
        Cookies.set('macenza_cookie_consent', 'declined', { expires: 365, path: '/' });
        setIsVisible(false); // Hide the banner
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl p-4 md:py-5 md:px-12 z-50 transition-all duration-300 transform translate-y-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <span className="text-xl shrink-0">🍪</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center md:text-left">
                        We use cookies to improve your experience on our site, analyze site traffic, and understand where our visitors are coming from. Read our{' '}
                        <Link href="/privacy" className="text-[#6D5DFD] hover:underline font-medium">
                            Cookies Policy
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#6D5DFD] hover:bg-[#5b4dfc] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
