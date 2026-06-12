// src/components/auth/CustomerLoginForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCustomerCredentials } from '@/store/authSlice';
import { loginCustomer } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function CustomerLoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const err = params.get('error');
            const registered = params.get('registered');
            if (err === 'session_expired') {
                setError('Your session has expired. Please log in again.');
            } else if (err === 'logged_out') {
                setInfoMessage('You have been successfully logged out.');
            } else if (registered === 'true') {
                setInfoMessage('Workspace registered successfully! Please log in to access your dashboard.');
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            const data = await loginCustomer({ email, password });
            
            if (data.accessToken) {
                // Set B2B Customer Edge Cookie
                Cookies.set('customer_token', data.accessToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
                localStorage.setItem('customer_token', data.accessToken);
            }
            if (data.customer) {
                localStorage.setItem('customer_user', JSON.stringify(data.customer));
            }
            
            dispatch(setCustomerCredentials({ user: data.customer }));
            setSuccess(true);
            
            setTimeout(() => {
                window.location.href = '/customer-dashboard';
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Invalid credentials or server error.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-100 dark:shadow-none">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Login Successful!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Connecting to your premium customer console... <br />
                    Preparing active licenses, billing statements, and instance details.
                </p>
                <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6D5DFD]" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Customer Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Manage your B2B subscription and workspace integrations
                </p>
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {infoMessage && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-805/50 text-blue-600 dark:text-blue-400 text-sm rounded-xl flex items-center gap-2 font-medium">
                    <ShieldCheck size={18} className="shrink-0 text-blue-500" />
                    <span>{infoMessage}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Email Address</label>
                    <Input
                        type="email"
                        placeholder="admin@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                        <a href="#" className="text-xs font-bold text-[#6D5DFD] dark:text-[#8B7BFF] hover:underline">
                            Forgot?
                        </a>
                    </div>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none mt-6 bg-[#6D5DFD] hover:bg-[#5b4eed]"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In to Workspace'}
                </Button>
            </form>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
                New buyer?{' '}
                <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Get Workspace License
                </Link>
            </p>
        </div>
    );
}
