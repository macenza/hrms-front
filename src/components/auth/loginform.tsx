// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { loginUser } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            const data = await loginUser({ email, password });
            const raw = data.user;
            
            // Store tokens for cookieless cross-domain compatibility
            if (data.accessToken) {
                localStorage.setItem('hrms_token', data.accessToken);
                Cookies.set('hrms_token', data.accessToken, { expires: 7, secure: true, sameSite: 'lax' });
            }
            if (data.refreshToken) {
                localStorage.setItem('hrms_refreshToken', data.refreshToken);
            }
            if (data.user?.role) {
                Cookies.set('role', data.user.role.toLowerCase(), { expires: 7, secure: true, sameSite: 'lax' });
            }
            
            // Normalize Mongoose _id to frontend id
            const user = {
                ...raw,
                id: String((raw as any)._id || raw.id || ''),
            };
            
            dispatch(setCredentials({ user }));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials or server error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Enter your credentials to access your account
                </p>
            </div>
            
            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center justify-center gap-2 font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                    <Input
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                        <Link href="/forgot-password" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            Forgot?
                        </Link>
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
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
                </Button>
            </form>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
                Need access? Please contact your company&apos;s HR Administrator.
            </p>
        </div>
    );
}