'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCustomerCredentials, logOutCustomer } from '@/store/authSlice';
import apiClient from '@/services/apiClient';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CustomerAuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const persistedCustomer = useAppSelector((state) => state.customerAuth.customer);
    const [isHydrated, setIsHydrated] = useState(false);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!isFirstRun.current) return;
        isFirstRun.current = false;

        const hydrateCustomerAuth = async () => {
            const customerToken = typeof window !== 'undefined' ? sessionStorage.getItem('customer_token') : null;
            const cachedCustomerStr = typeof window !== 'undefined' ? sessionStorage.getItem('customer_user') : null;
            let cachedCustomer = null;
            try {
                if (cachedCustomerStr) cachedCustomer = JSON.parse(cachedCustomerStr);
            } catch (e) {}

            if (persistedCustomer || customerToken || cachedCustomer) {
                try {
                    // Fetch verified customer profile from B2B customer endpoint
                    const verifiedCustomerRes = await apiClient.get('/customers/me');
                    const verifiedCustomer = verifiedCustomerRes.data?.customer;
                    
                    if (verifiedCustomer) {
                        sessionStorage.setItem('customer_user', JSON.stringify(verifiedCustomer));
                        dispatch(setCustomerCredentials({ user: verifiedCustomer }));
                        
                        // Keep cookies in sync
                        const currentToken = sessionStorage.getItem('customer_token');
                        if (currentToken) {
                            Cookies.set('customer_token', currentToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
                        }
                    } else {
                        throw new Error("Invalid customer context");
                    }
                } catch (error) {
                    console.log("Customer session verification failed. Logging out customer.");
                    dispatch(logOutCustomer());
                    sessionStorage.removeItem('customer_user');
                    sessionStorage.removeItem('customer_token');
                    sessionStorage.removeItem('persist:customerAuth');
                    localStorage.removeItem('customer_user');
                    localStorage.removeItem('customer_token');
                    localStorage.removeItem('persist:customerAuth');
                    Cookies.remove('customer_token', { path: '/' });
                    
                    const isProtected = typeof window !== 'undefined' && window.location.pathname.startsWith('/subscription');
                    if (isProtected) {
                        window.location.href = '/login?error=session_expired';
                    }
                } finally {
                    setIsHydrated(true);
                }
            } else {
                dispatch(logOutCustomer());
                sessionStorage.removeItem('customer_user');
                sessionStorage.removeItem('customer_token');
                sessionStorage.removeItem('persist:customerAuth');
                localStorage.removeItem('customer_user');
                localStorage.removeItem('customer_token');
                localStorage.removeItem('persist:customerAuth');
                Cookies.remove('customer_token', { path: '/' });
                
                const isProtected = typeof window !== 'undefined' && window.location.pathname.startsWith('/subscription');
                if (isProtected) {
                    window.location.href = '/login?error=session_expired';
                } else {
                    setIsHydrated(true);
                }
            }
        };

        hydrateCustomerAuth();
    }, [dispatch, persistedCustomer]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-[#6D5DFD]" />
            </div>
        );
    }

    return <>{children}</>;
}
