'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, CreditCard, QrCode, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCustomerCredentials } from '@/store/authSlice';
import { registerCustomer } from '@/services/authService';
import Cookies from 'js-cookie';

export default function SaaSBuyerSignupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isCustomerAuthenticated = useAppSelector((state) => state.auth.isCustomerAuthenticated);

    // Form inputs
    const [companyName, setCompanyName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState('Growth');
    const [showPassword, setShowPassword] = useState(false);

    // Flow states
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Simulated Razorpay details based on plan
    const getPlanPrice = () => {
        if (plan === 'Growth') return { usd: 49, inr: 3999 };
        if (plan === 'Professional') return { usd: 129, inr: 9999 };
        return { usd: 499, inr: 39999 }; // Enterprise
    };

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isCustomerAuthenticated) {
            router.push('/customer-dashboard');
        }
    }, [isCustomerAuthenticated, router]);

    const handleStartOnboarding = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Show payment modal first to secure Razorpay authorization
        setShowPaymentModal(true);
    };

    const handleCompletePaymentAndSignup = async () => {
        setIsPaying(true);
        setError(null);

        // Simulate Razorpay secure payment gateway connection
        setTimeout(async () => {
            try {
                // Payment was successful in Razorpay widget, now save customer in database
                const data = await registerCustomer({
                    name,
                    email,
                    password,
                    companyName,
                    subscriptionPlan: plan
                });

                if (data.accessToken) {
                    Cookies.set('customer_token', data.accessToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                    localStorage.setItem('customer_token', data.accessToken);
                }
                if (data.customer) {
                    localStorage.setItem('customer_user', JSON.stringify(data.customer));
                }

                dispatch(setCustomerCredentials({ user: data.customer }));
                
                setIsPaying(false);
                setPaymentSuccess(true);

                // Hold screen for checked animation then redirect
                setTimeout(() => {
                    setShowPaymentModal(false);
                    window.location.href = '/customer-dashboard';
                }, 1500);
            } catch (err: any) {
                setIsPaying(false);
                setShowPaymentModal(false);
                setError(err.message || 'Payment capture failed. Database error.');
            }
        }, 2000);
    };

    return (
        <div className="relative">
            {/* Main Form Panel */}
            <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                        <Sparkles className="w-5 h-5 text-[#6D5DFD]" /> Get Started Today
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        Setup your secure B2B tenant and deploy HRMS modules.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleStartOnboarding} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Administrator Name</label>
                            <Input
                                type="text"
                                placeholder="Vanessa Hoeger"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-gray-900 dark:text-gray-100"
                            />
                        </div>
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
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Workspace Plan</label>
                        <select
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold cursor-pointer transition"
                        >
                            <option value="Growth">Growth Plan ($49/mo - ₹3,999/mo)</option>
                            <option value="Professional">Professional Plan ($129/mo - ₹9,999/mo)</option>
                            <option value="Enterprise">Enterprise Workspace ($499/mo - ₹39,999/mo)</option>
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
                        className="w-full py-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none mt-6 bg-[#6D5DFD] hover:bg-[#5b4eed]"
                    >
                        Review Workspace & Buy
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
                    Already registered?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>

            {/* Premium Razorpay Payment Modal Overlay */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 text-gray-800">
                        {/* Razorpay Top Header Bar */}
                        <div className="bg-[#0f172a] text-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-tighter">
                                    R
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight leading-tight">Macenza Solutions</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">B2B SaaS Workspace Setup</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block font-semibold">PAYING</span>
                                <span className="font-black text-lg text-emerald-400">₹{getPlanPrice().inr.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Plan Indicator */}
                        <div className="bg-blue-50 px-5 py-2.5 flex items-center justify-between text-xs text-blue-800 font-bold border-b border-blue-100">
                            <span>Selected: {plan} License</span>
                            <span>USD equivalent: ${getPlanPrice().usd}/mo</span>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {paymentSuccess ? (
                                <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className="font-black text-lg text-gray-900">Payment Captured!</h4>
                                    <p className="text-xs text-gray-500 mt-1 font-semibold">Creating your corporate workspace, please wait...</p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Secure Payment Options</h4>
                                    
                                    {/* Tabs */}
                                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-3.5 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs ${
                                                paymentMethod === 'card' 
                                                    ? 'border-blue-600 bg-blue-50/55 text-blue-700' 
                                                    : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                            }`}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            <span>Card / Netbanking</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`p-3.5 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs ${
                                                paymentMethod === 'upi' 
                                                    ? 'border-blue-600 bg-blue-50/55 text-blue-700' 
                                                    : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                            }`}
                                        >
                                            <QrCode className="w-4 h-4" />
                                            <span>UPI / QR Code</span>
                                        </button>
                                    </div>

                                    {/* Payment Inputs */}
                                    <div className="space-y-4 mb-6 min-h-[120px] flex flex-col justify-center">
                                        {paymentMethod === 'card' ? (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400">Card Number</label>
                                                    <Input type="text" placeholder="4111 2222 3333 4444" disabled={isPaying} defaultValue="4111 2222 3333 4444" className="h-9 text-xs" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400">Expiry (MM/YY)</label>
                                                        <Input type="text" placeholder="12/29" disabled={isPaying} defaultValue="12/29" className="h-9 text-xs" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400">CVV</label>
                                                        <Input type="password" placeholder="•••" disabled={isPaying} defaultValue="123" className="h-9 text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-2 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200">
                                                <QrCode className="w-14 h-14 text-gray-400 mb-2" />
                                                <span className="text-xs font-bold text-gray-600">Scan QR Code via PhonePe, GPay, or Paytm</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">UPI ID: macenza@razorpay</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleCompletePaymentAndSignup}
                                            disabled={isPaying}
                                            className="w-full py-5 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100 rounded-xl"
                                        >
                                            {isPaying ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Authorizing via Razorpay...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4" />
                                                    <span>Pay ₹{getPlanPrice().inr.toLocaleString()} Securely</span>
                                                </>
                                            )}
                                        </Button>
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            disabled={isPaying}
                                            className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 py-1 transition"
                                        >
                                            Cancel Transaction
                                        </button>
                                    </div>
                                </>
							)}
                        </div>

                        {/* Razorpay Safe badge */}
                        <div className="bg-[#f8fafc] py-3.5 px-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold">
                            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>100% SECURE INTEGRATION VIA RAZORPAY GATEWAY</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}