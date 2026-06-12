// src/hooks/useMediaQuery.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when a CSS media query matches.
 * SSR-safe: defaults to false on the server.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(query);
        setMatches(mql.matches);

        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

/**
 * Returns the current responsive breakpoint.
 *   mobile  → <768px
 *   tablet  → 768–1024px
 *   desktop → >1024px
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const isDesktop = useMediaQuery('(min-width: 1025px)');
    const isTablet = useMediaQuery('(min-width: 768px)');

    if (isDesktop) return 'desktop';
    if (isTablet) return 'tablet';
    return 'mobile';
}
