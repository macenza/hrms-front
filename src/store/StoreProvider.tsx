'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Using useRef ensures the store is only initialized once per request lifecycle
    const storeRef = useRef(store);
    const queryClientRef = useRef(
        new QueryClient({
            defaultOptions: {
                queries: {
                    retry: 1,
                    refetchOnWindowFocus: false,
                },
            },
        })
    );

    return (
        <Provider store={storeRef.current}>
            <QueryClientProvider client={queryClientRef.current}>
                {children}
            </QueryClientProvider>
        </Provider>
    );
}