'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Loader2, AlertCircle, Building2, CreditCard, QrCode,
    Check, ChevronRight, ChevronLeft, Shield, Sparkles, Users, Zap,
    Crown, CheckCircle2, ArrowRight, Globe, MapPin, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppDispatch } from '@/store/hooks';
import { setCustomerCredentials } from '@/store/authSlice';
import { registerCustomer } from '@/services/authService';
import Cookies from 'js-cookie';

// Step indicator
const STEPS = [
    { id: 1, label: 'Company Info', icon: Building2 },
    { id: 2, label: 'Select Plan', icon: CreditCard },
    { id: 3, label: 'Payment', icon: Shield },
];

// Plan data
const PLANS = [
    {
        id: 'Growth',
        name: 'Growth',
        price: { usd: 49, inr: 499 },
        employeeLimit: 50,
        description: 'Perfect for fast-growing startups and small teams.',
        features: [
            'Up to 50 active employees',
            'Comprehensive directory',
            'Automated Leave management',
            'Basic Payroll calculations',
            'Without AI features',
            'Standard email support (24h)'
        ],
        popular: false,
        gradient: 'from-blue-500/10 to-cyan-500/10',
        border: 'border-blue-200 dark:border-blue-900/50',
        activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: Users,
    },
    {
        id: 'Professional',
        name: 'Professional',
        price: { usd: 129, inr: 1999 },
        employeeLimit: 250,
        description: 'Optimized for mid-market organizations and scaling companies.',
        features: [
            'Up to 250 active employees',
            'Leave & Attendance check-ins',
            'Automated Disbursement Payroll',
            'With AI (Employees can give AI interviews)',
            'Cloudinary excel reporting',
            'Advanced Asset Lifecycle tracking',
            'Dedicated account representative'
        ],
        popular: true,
        gradient: 'from-[#6D5DFD]/10 to-purple-500/10',
        border: 'border-[#6D5DFD]/30 dark:border-[#6D5DFD]/20',
        activeBorder: 'border-[#6D5DFD] ring-2 ring-[#6D5DFD]/20',
        badge: 'bg-[#6D5DFD]/10 text-[#6D5DFD] dark:bg-[#6D5DFD]/20',
        icon: Zap,
    },
];

export default function RegisterCompanyPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [step, setStep] = useState(1);

    // Step 1: Company Info
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Step 2: Plan
    const [selectedPlan, setSelectedPlan] = useState('Professional');

    // Step 3: Payment
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // General
    const [error, setError] = useState<string | null>(null);

    // Password strength
    const getPasswordStrength = (pw: string) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const pwStrength = getPasswordStrength(password);
    const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength] || '';
    const pwStrengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][pwStrength] || '';

    // Step 1 validation
    const validateStep1 = () => {
        setError(null);
        if (!companyName.trim()) { setError('Company name is required.'); return false; }
        if (!companyEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) { setError('Valid company email is required.'); return false; }
        if (!companyPhone.trim() || !/^[\d\s\-+()]{7,15}$/.test(companyPhone)) { setError('Valid phone number is required.'); return false; }
        if (!adminName.trim()) { setError('Admin name is required.'); return false; }
        if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) { setError('Valid admin email is required.'); return false; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
        if (pwStrength < 2) { setError('Please use a stronger password (include uppercase, numbers, or symbols).'); return false; }
        if (!country.trim()) { setError('Country is required.'); return false; }
        if (!city.trim()) { setError('City is required.'); return false; }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1 && !validateStep1()) return;
        setError(null);
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setError(null);
        setStep(step - 1);
    };

    const selectedPlanData = PLANS.find(p => p.id === selectedPlan)!;

    const handleCompletePayment = async () => {
        setIsPaying(true);
        setError(null);

        // Simulate payment processing (2s delay)
        setTimeout(async () => {
            try {
                const data = await registerCustomer({
                    name: adminName,
                    email: adminEmail,
                    password,
                    companyName,
                    subscriptionPlan: selectedPlan,
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

                // Generate mock transaction details and redirect to success page
                const txnId = `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
                setTimeout(() => {
                    router.push(`/payment-success?company=${encodeURIComponent(companyName)}&plan=${encodeURIComponent(selectedPlan)}&txn=${txnId}&amount=${selectedPlanData.price.inr}`);
                }, 1500);
            } catch (err: any) {
                setIsPaying(false);
                setError(err.message || 'Registration failed. Please try again.');
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-[720px] mx-auto">
            {/* Step Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isCompleted = step > s.id;
                    return (
                        <React.Fragment key={s.id}>
                            <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                    isCompleted
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                        : isActive
                                        ? 'bg-[#6D5DFD] text-white shadow-md shadow-[#6D5DFD]/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                }`}>
                                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                </div>
                                <span className={`text-xs font-bold hidden sm:block transition-colors ${
                                    isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                                }`}>{s.label}</span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${
                                    step > s.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">

                {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-medium">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* STEP 1: Company Information */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-2">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center justify-center gap-2">
                                <Building2 className="w-5 h-5 text-[#6D5DFD]" />
                                Company Information
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                Tell us about your organization and primary admin
                            </p>
                        </div>

                        {/* Company Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                <Building2 size={12} /> Organization
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Name *</label>
                                    <Input type="text" placeholder="Acme Corporation" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Email *</label>
                                    <Input type="email" placeholder="info@acme.com" required value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Phone *</label>
                                <Input type="tel" placeholder="+91 98765 43210" required value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>

                        {/* Admin Details */}
                        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 pt-2">
                                <Shield size={12} /> Primary Administrator
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Admin Name *</label>
                                    <Input type="text" placeholder="John Doe" required value={adminName} onChange={(e) => setAdminName(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Admin Email *</label>
                                    <Input type="email" placeholder="admin@acme.com" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password *</label>
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
                                {password && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500">{pwStrengthLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 pt-2">
                                <MapPin size={12} /> Company Address
                            </h3>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Street Address</label>
                                <Input type="text" placeholder="123 Main Street, Suite 200" value={address} onChange={(e) => setAddress(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Country *</label>
                                    <Input type="text" placeholder="India" required value={country} onChange={(e) => setCountry(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">State</label>
                                    <Input type="text" placeholder="Maharashtra" value={state} onChange={(e) => setState(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">District</label>
                                    <Input type="text" placeholder="Mumbai" value={district} onChange={(e) => setDistrict(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">City *</label>
                                    <Input type="text" placeholder="Mumbai" required value={city} onChange={(e) => setCity(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Zip Code</label>
                                    <Input type="text" placeholder="400001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleNextStep}
                            className="w-full py-5 text-sm font-bold bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none rounded-xl"
                        >
                            Continue to Plan Selection <ChevronRight size={16} />
                        </Button>
                    </div>
                )}

                {/* STEP 2: Plan Selection */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-2">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#6D5DFD]" />
                                Choose Your Plan
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                Select the plan that fits your team size
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {PLANS.map((plan) => {
                                const Icon = plan.icon;
                                const isSelected = selectedPlan === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative text-left p-5 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${plan.gradient} group ${
                                            isSelected ? plan.activeBorder : `${plan.border} hover:shadow-md`
                                        }`}
                                    >
                                        {plan.popular && (
                                            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-[#6D5DFD] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                                                Most Popular
                                            </span>
                                        )}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2.5 rounded-xl ${plan.badge} shrink-0`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{plan.description}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                                                        {plan.features.slice(0, 4).map((f) => (
                                                            <span key={f} className="flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                                                                <Check size={10} className="text-emerald-500" /> {f}
                                                            </span>
                                                        ))}
                                                        {plan.features.length > 4 && (
                                                            <span className="text-[11px] font-bold text-gray-400">+{plan.features.length - 4} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xl font-black text-gray-900 dark:text-gray-100">₹{plan.price.inr.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">/month</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Up to {plan.employeeLimit} employees</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-3 left-3">
                                                <div className="w-5 h-5 bg-[#6D5DFD] rounded-full flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handlePrevStep}
                                variant="outline"
                                className="flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
                            >
                                <ChevronLeft size={16} /> Back
                            </Button>
                            <Button
                                onClick={handleNextStep}
                                className="flex-[2] py-5 text-sm font-bold bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none rounded-xl"
                            >
                                Continue to Payment <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Payment */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {paymentSuccess ? (
                            <div className="text-center py-12 animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200 dark:shadow-none">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">Payment Successful!</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                    Setting up your workspace. Redirecting...
                                </p>
                                <Loader2 className="w-5 h-5 animate-spin text-[#6D5DFD] mx-auto mt-4" />
                            </div>
                        ) : (
                            <>
                                {/* Order Summary */}
                                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Order Summary</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{companyName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPlanData.name} Plan • Monthly</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900 dark:text-gray-100">₹{selectedPlanData.price.inr.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">≈ ${selectedPlanData.price.usd}/mo</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Tabs */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-3.5 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs ${
                                                paymentMethod === 'card'
                                                    ? 'border-[#6D5DFD] bg-[#6D5DFD]/5 text-[#6D5DFD]'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                                            }`}
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            <span>Card / Netbanking</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`p-3.5 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs ${
                                                paymentMethod === 'upi'
                                                    ? 'border-[#6D5DFD] bg-[#6D5DFD]/5 text-[#6D5DFD]'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                                            }`}
                                        >
                                            <QrCode className="w-5 h-5" />
                                            <span>UPI / QR Code</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'card' ? (
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-gray-400">Card Number</label>
                                                <Input type="text" placeholder="4111 2222 3333 4444" disabled={isPaying} defaultValue="4111 2222 3333 4444" className="h-10 text-xs text-gray-900 dark:text-gray-100" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400">Expiry (MM/YY)</label>
                                                    <Input type="text" placeholder="12/29" disabled={isPaying} defaultValue="12/29" className="h-10 text-xs text-gray-900 dark:text-gray-100" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400">CVV</label>
                                                    <Input type="password" placeholder="•••" disabled={isPaying} defaultValue="123" className="h-10 text-xs text-gray-900 dark:text-gray-100" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-xl p-5 border border-dashed border-gray-200 dark:border-gray-800">
                                            <QrCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Scan QR via PhonePe, GPay, or Paytm</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">UPI ID: macenza@razorpay</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handlePrevStep}
                                        variant="outline"
                                        disabled={isPaying}
                                        className="py-5 px-5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button
                                        onClick={handleCompletePayment}
                                        disabled={isPaying}
                                        className="flex-1 py-5 text-sm font-black bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none rounded-xl"
                                    >
                                        {isPaying ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Processing Payment...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4" />
                                                <span>Pay ₹{selectedPlanData.price.inr.toLocaleString()} Securely</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                    <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>100% SECURE • POWERED BY RAZORPAY GATEWAY</span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer link */}
            {step <= 2 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
                    Already have a workspace?{' '}
                    <Link href="/login" className="text-[#6D5DFD] dark:text-[#8B7BFF] font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            )}
        </div>
    );
}
