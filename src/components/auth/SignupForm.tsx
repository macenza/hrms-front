// src/components/auth/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerUser } from '@/services/authService';
import { SignupPayload } from '@/types/index';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';

export default function SignupForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        team: '',
        gender: 'Male',
        profile: {
            phone: '',
            address: '',
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            profile: { ...prev.profile, [name]: value },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await registerUser(formData as unknown as SignupPayload);
            const raw = data.user;
            const user = {
                ...raw,
                id: String((raw as { _id?: string; id?: string })._id || raw.id || ''),
            };

            dispatch(setCredentials({ user }));
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error. Please check your details.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Get Started</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Create your HRMS account</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Email</label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            required
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.profile.phone}
                            onChange={handleProfileChange}
                            placeholder="+1 (555) 000-0000"
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Team / Department</label>
                        <Input
                            name="team"
                            value={formData.team}
                            onChange={handleChange}
                            placeholder="e.g. Engineering"
                            required
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Address</label>
                    <Input
                        name="address"
                        value={formData.profile.address}
                        onChange={handleProfileChange}
                        placeholder="123 Business Pkwy, Suite 100"
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            required
                            className="pr-10 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-6 font-bold flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                    </Button>
                </div>
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
