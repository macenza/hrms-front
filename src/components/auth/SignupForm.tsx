'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { registerUser } from '@/services/authService';
import { SignupPayload } from '@/types/index';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        team: '',
        profile: {
            phone: '',
            address: ''
        }
    });

    // Handlers for top-level and nested state updates
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Ensure payload matches your backend User model exactly
            await registerUser(formData as SignupPayload);
            router.push('/dashboard');
        } catch (err: any) {
            // Logic to handle 500 errors gracefully in UI
            setError(err.message || 'Server error. Please check backend logs.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>
                <p className="text-sm text-gray-500 mt-2">Create your HRMS account</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="text-gray-900"
                    />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Work Email</label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            required
                            className="text-gray-900"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.profile.phone}
                            onChange={handleProfileChange}
                            placeholder="+1 (555) 000-0000"
                            className="text-gray-900"
                        />
                    </div>
                </div>

                {/* Role & Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white text-gray-900 font-medium"
                        >
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Team / Department</label>
                        <Input
                            name="team"
                            value={formData.team}
                            onChange={handleChange}
                            placeholder="e.g. Engineering"
                            required
                            className="text-gray-900"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Address</label>
                    <Input
                        name="address"
                        value={formData.profile.address}
                        onChange={handleProfileChange}
                        placeholder="123 Business Pkwy, Suite 100"
                        className="text-gray-900"
                    />
                </div>
                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Password</label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            required
                            className="pr-10"
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

                {/* Submit Action */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-6 font-bold"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Create Account'}
                    </Button>
                </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
            </p>
        </div>
    );
}