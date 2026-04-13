'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { loginUser } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // ✅ Updated: removed name field
            const data = await loginUser({ email, password });

            const token = data.accessToken ?? data.token;
            const raw = data.user;

            const user = {
                ...raw,
                id: String(raw._id ?? raw.id ?? ''),
            };

            // Save token in cookies
            Cookies.set('token', token, { expires: 7 });
            Cookies.set('role', user.role, { expires: 7 });

            // Persist user
            localStorage.setItem('user', JSON.stringify(user));

            // Update Redux state
            dispatch(setCredentials({ user, token }));

            // Redirect
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Login failed');
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
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <Input
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-gray-900"
                    />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700">Password</label>
                        <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">
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

                {/* Submit */}
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
                <Link href="/signup" className="text-blue-600 font-bold hover:underline">
                    Create one
                </Link>
            </p>
        </div>
    );
}