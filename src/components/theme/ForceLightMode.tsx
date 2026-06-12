'use client';

import { useEffect } from 'react';

export default function ForceLightMode() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const html = document.documentElement;
        
        // Find if HTML originally had 'dark' class
        const hadDark = html.classList.contains('dark');
        
        // Force light mode initially
        html.classList.remove('dark');
        html.classList.add('light');
        html.style.colorScheme = 'light';

        // Setup MutationObserver to watch for any changes to the html class attribute
        // (e.g. if next-themes tries to re-apply the user's global theme preference)
        const observer = new MutationObserver(() => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                html.classList.add('light');
                html.style.colorScheme = 'light';
            }
        });

        observer.observe(html, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer.disconnect();
            html.classList.remove('light');
            if (hadDark) {
                html.classList.add('dark');
                html.style.colorScheme = 'dark';
            } else {
                html.style.colorScheme = '';
            }
        };
    }, []);

    return null;
}
