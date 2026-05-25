'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SaaSBuyerSignupPage() {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState('Professional');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate B2B SaaS signup onboarding / payment setup
        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Onboarding Initiated!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    We have successfully registered **{companyName}** under the **{plan}** plan. <br />
                    We sent a workspace activation link to **{email}**. Please verify your billing to complete your instance setup.
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start Your Free Trial</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Create a corporate B2B SaaS account in seconds
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Name</label>
                    <Input
                        type="text"
                        placeholder="Acme Corporation"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Corporate Email Address</label>
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
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Choose Plan</label>
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                    >
                        <option value="Growth">Growth Plan ($49/mo)</option>
                        <option value="Professional">Professional Plan ($129/mo)</option>
                        <option value="Enterprise">Enterprise (Custom)</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
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
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Register Workspace'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}