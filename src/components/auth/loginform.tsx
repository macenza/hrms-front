'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Name</label>
                    <Input 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        className="text-gray-900" // Dark text fix
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <Input 
                        type="email" 
                        placeholder="name@company.com" 
                        required 
                        className="text-gray-900" // Dark text fix
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700">Password</label>
                        <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            required 
                            className="pr-10 text-gray-900"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full py-6 text-base font-bold shadow-lg shadow-blue-200"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-600 font-bold hover:underline">Create one</Link>
            </p>
        </div>
    );
}