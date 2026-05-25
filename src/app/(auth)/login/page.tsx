'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SaaSBuyerLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate SaaS Customer dashboard login (Billing, instances, etc.)
        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/30 text-[#6D5DFD] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Customer Hub!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Connecting you to your corporate subscription console... <br />
                    Here you can upgrade plans, check billing history, and configure domain routing.
                </p>
                <Link 
                    href="/" 
                    className="w-full bg-[#6D5DFD] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center hover:bg-[#5B4DF0] transition duration-300 shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    Return to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Console</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Manage your B2B subscription and instance integrations
                </p>
            </div>

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
                    className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none mt-6"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Start free trial
                </Link>
            </p>
        </div>
    );
}