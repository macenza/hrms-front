'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Loader2, AlertCircle, Building2, CreditCard, QrCode,
    Check, ChevronRight, ChevronLeft, Shield, Sparkles, Users, Zap,
    Crown, CheckCircle2, Upload, X, ImageIcon, MapPin, Phone, Info, ArrowLeft, ArrowRight, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { AddressForm } from '@/components/ui/AddressForm';
import { validatePhone } from '@/components/ui/PhoneNumberInput';
import { EmailVerification } from '@/components/auth/EmailVerification';
import { useAppDispatch } from '@/store/hooks';
import { setCustomerCredentials } from '@/store/authSlice';
import { registerCustomer } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { getEmptyAddressFormData } from '@/types/address';
import { validatePostalCode } from '@/utils/postalCodeValidation';
import type { AddressFormData } from '@/types/address';
import Cookies from 'js-cookie';

// ── Step definitions ──
const STEPS = [
    {
        id: 1,
        label: 'Organization Details',
        description: 'Basic information about your organization',
        icon: Building2,
    },
    {
        id: 2,
        label: 'Select Plan',
        description: 'Choose the right plan for your team',
        icon: CreditCard,
    },
    {
        id: 3,
        label: 'Payment',
        description: 'Complete your subscription',
        icon: Shield,
    },
];

// ── Plan data ──
const PLANS = [
    {
        id: 'Starter',
        name: 'Starter',
        price: { usd: 6, inr: 499 },
        employeeLimit: 50,
        description: 'Perfect for small teams getting started.',
        features: ['Up to 50 Employees', 'Core HR Module', 'Attendance Tracking', 'Leave Management', 'Email Support'],
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
        price: { usd: 24, inr: 1999 },
        employeeLimit: 250,
        description: 'For growing companies needing advanced tools.',
        features: ['Up to 250 Employees', 'All Starter Features', 'Advanced Payroll Engine', 'Asset Lifecycle Tracking', 'AI Assistant (Interviews & Analytics)', 'Priority Support'],
        popular: true,
        gradient: 'from-[#6D5DFD]/10 to-purple-500/10',
        border: 'border-[#6D5DFD]/30 dark:border-[#6D5DFD]/20',
        activeBorder: 'border-[#6D5DFD] ring-2 ring-[#6D5DFD]/20',
        badge: 'bg-[#6D5DFD]/10 text-[#6D5DFD] dark:bg-[#6D5DFD]/20',
        icon: Zap,
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        price: { usd: 499, inr: 39999 },
        employeeLimit: 1000,
        description: 'Full-scale enterprise HR operations.',
        features: ['Up to 1000 Employees', 'All Professional Features', 'Recruitment Module', 'Advanced Analytics & Custom Rules', 'Uptime SLA Guarantee', 'SSO & SAML', '24/7 Dedicated Support'],
        popular: false,
        gradient: 'from-amber-500/10 to-orange-500/10',
        border: 'border-amber-200 dark:border-amber-900/50',
        activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: Crown,
    },
];

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false);
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function RegisterCompanyPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);

    // ── Step 1 State ──
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [orgPrefix, setOrgPrefix] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [addressData, setAddressData] = useState<AddressFormData>(getEmptyAddressFormData());

    // ── Email Verification State ──
    const [orgEmailVerified, setOrgEmailVerified] = useState(false);
    const [adminEmailVerified, setAdminEmailVerified] = useState(false);

    // ── Step 2 State ──
    const [selectedPlan, setSelectedPlan] = useState('Professional');

    // ── Step 3 State ──
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showMockModal, setShowMockModal] = useState(false);
    const [mockOrderData, setMockOrderData] = useState<any>(null);

    // ── General ──
    const [error, setError] = useState<string | null>(null);

    // ── Validation Highlight State ──
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
    const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Save and load state from sessionStorage to persist checkout info & active step
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlStep = params.get('step');

            const saved = sessionStorage.getItem('register_company_flow');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.companyName) setCompanyName(data.companyName);
                    if (data.companyEmail) setCompanyEmail(data.companyEmail);
                    if (data.adminName) setAdminName(data.adminName);
                    if (data.adminEmail) setAdminEmail(data.adminEmail);
                    if (data.password) setPassword(data.password);
                    if (data.orgPrefix) setOrgPrefix(data.orgPrefix);
                    if (data.addressData) setAddressData(data.addressData);
                    if (data.selectedPlan) setSelectedPlan(data.selectedPlan);
                    if (data.agreeToTerms) setAgreeToTerms(data.agreeToTerms);
                    if (data.orgEmailVerified) setOrgEmailVerified(data.orgEmailVerified);
                    if (data.adminEmailVerified) setAdminEmailVerified(data.adminEmailVerified);
                    
                    if (urlStep) {
                        setStep(parseInt(urlStep, 10));
                    } else if (data.step) {
                        setStep(data.step);
                    }
                } catch (e) {
                    console.error('Error parsing saved checkout data:', e);
                }
            } else if (urlStep) {
                setStep(parseInt(urlStep, 10));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const data = {
                step, companyName, companyEmail, adminName, adminEmail, password, orgPrefix,
                addressData, selectedPlan, agreeToTerms, orgEmailVerified, adminEmailVerified
            };
            sessionStorage.setItem('register_company_flow', JSON.stringify(data));
        }
    }, [step, companyName, companyEmail, adminName, adminEmail, password, orgPrefix, addressData, selectedPlan, agreeToTerms, orgEmailVerified, adminEmailVerified]);

    /** Scroll to the first invalid field and flash red borders for 3 seconds */
    const highlightInvalidFields = useCallback((fields: string[]) => {
        if (fields.length === 0) return;

        // Clear any previous timer
        if (validationTimerRef.current) {
            clearTimeout(validationTimerRef.current);
        }

        setInvalidFields(new Set(fields));

        // Scroll to the first invalid field
        const firstFieldEl = document.querySelector(`[data-field="${fields[0]}"]`);
        if (firstFieldEl) {
            firstFieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Auto-clear red borders after 3 seconds
        validationTimerRef.current = setTimeout(() => {
            setInvalidFields(new Set());
            validationTimerRef.current = null;
        }, 3000);
    }, []);

    /** Helper: returns red border classes if field is in the invalid set */
    const fieldErrorClass = useCallback((fieldName: string) => {
        return invalidFields.has(fieldName)
            ? 'border-red-500 ring-2 ring-red-500/20 dark:border-red-500 transition-all duration-300'
            : '';
    }, [invalidFields]);

    // ── Password strength ──
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

    // ── Logo handling ──
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('Logo file must be under 2MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }

        setLogo(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        setError(null);
    };

    const removeLogo = () => {
        setLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Validation ──
    const validateStep1 = () => {
        setError(null);
        const errors: string[] = [];
        const messages: string[] = [];

        if (!companyName.trim()) { errors.push('companyName'); messages.push('Organization name'); }
        if (!companyEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) { errors.push('companyEmail'); messages.push('Organization email'); }
        else if (!orgEmailVerified) { errors.push('companyEmail'); messages.push('Organization email verification'); }
        if (!adminName.trim()) { errors.push('adminName'); messages.push('Admin name'); }
        if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) { errors.push('adminEmail'); messages.push('Admin email'); }
        else if (!adminEmailVerified) { errors.push('adminEmail'); messages.push('Admin email verification'); }
        if (password.length < 8 || pwStrength < 2) { errors.push('password'); messages.push('Password (too weak)'); }
        else if (password !== confirmPassword) { errors.push('confirmPassword'); messages.push('Confirm password (does not match)'); }

        // Address validation
        if (!addressData.addressLine1.trim()) { errors.push('addressLine1'); messages.push('Address Line 1'); }
        if (!addressData.countryCode.trim()) { errors.push('countryCode'); messages.push('Country'); }
        if (!addressData.stateCode.trim()) { errors.push('stateCode'); messages.push('State'); }
        if (!addressData.city.trim()) { errors.push('city'); messages.push('City'); }
        if (!addressData.postalCode.trim()) { errors.push('postalCode'); messages.push('Postal Code'); }

        // Validate phone
        if (!addressData.phoneNumber) {
            errors.push('phoneNumber'); messages.push('Phone number');
        } else if (!validatePhone(addressData.phoneNumber)) {
            errors.push('phoneNumber'); messages.push('Valid Phone number');
        }

        // Validate postal code format
        if (addressData.postalCode && addressData.countryCode) {
            const result = validatePostalCode(addressData.postalCode, addressData.countryCode);
            if (!result.valid) { errors.push('postalCode'); messages.push('Valid Postal code'); }
        }

        if (errors.length > 0) {
            setError(`Please fill in the required fields: ${messages.join(', ')}.`);
            highlightInvalidFields(errors);
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1 && !validateStep1()) return;
        setError(null);
        setInvalidFields(new Set());
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setError(null);
        setInvalidFields(new Set());
        setStep(step - 1);
    };

    const selectedPlanData = PLANS.find(p => p.id === selectedPlan)!;

    const executeFinalRegistration = async (razorpayPaymentId: string) => {
        // Construct standard payload containing fields expected by backend schema
        const registerPayload = {
            name: adminName,
            email: adminEmail,
            password,
            companyName,
            companyEmail,
            subscriptionPlan: selectedPlan === 'Starter' ? 'Growth' : selectedPlan,
            phone: addressData.phoneNumber || undefined,
            address: addressData.addressLine1 + (addressData.addressLine2 ? `, ${addressData.addressLine2}` : ''),
            country: addressData.country,
            state: addressData.state,
            district: addressData.district || undefined,
            city: addressData.city,
            zipCode: addressData.postalCode,
        };

        const data = await registerCustomer(registerPayload);

        if (data.accessToken) {
            Cookies.set('customer_token', data.accessToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
            localStorage.setItem('customer_token', data.accessToken);
        }
        if (data.customer) {
            localStorage.setItem('customer_user', JSON.stringify(data.customer));
        }

        dispatch(setCustomerCredentials({ user: data.customer }));
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('register_company_flow');
        }

        setIsPaying(false);
        setPaymentSuccess(true);

        // Redirect to success page
        setTimeout(() => {
            router.push(`/payment-success?company=${encodeURIComponent(companyName)}&plan=${encodeURIComponent(selectedPlan)}&txn=${razorpayPaymentId}&amount=${selectedPlanData.price.inr}`);
        }, 1500);
    };

    const handleCompleteMockPayment = async (status: 'success' | 'fail') => {
        if (status === 'fail') {
            setShowMockModal(false);
            setError('Payment was simulated as failed/cancelled.');
            return;
        }

        setIsPaying(true);
        setShowMockModal(false);
        try {
            const response = {
                razorpay_order_id: mockOrderData.id,
                razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
                razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2, 12)}`
            };

            // Verify payment signature on backend
            const verifyRes = await apiClient.post('/payment/verify-signature', response);
            const verifyData = verifyRes.data;

            if (verifyData.success) {
                await executeFinalRegistration(response.razorpay_payment_id);
            } else {
                throw new Error('Payment verification failed.');
            }
        } catch (err: any) {
            setIsPaying(false);
            setError(err.message || 'Verification failed. Please contact billing support.');
        }
    };

    const handleCompletePayment = async () => {
        setIsPaying(true);
        setError(null);

        // 1. Load Razorpay script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            setError('Razorpay SDK failed to load. Please check your internet connection.');
            setIsPaying(false);
            return;
        }

        try {
            // 2. Request backend to create an order
            const amountInINR = selectedPlanData.price.inr;
            const orderRes = await apiClient.post('/payment/create-order', { amount: amountInINR });
            const orderData = orderRes.data;

            if (!orderData.success) {
                throw new Error(orderData.message || 'Failed to initialize payment.');
            }

            // If backend returned a mock order, skip real Razorpay SDK display (prevents 401 Unauthorized)
            if (orderData.isMock) {
                setMockOrderData(orderData.order);
                setShowMockModal(true);
                setIsPaying(false);
                return;
            }

            // 3. Setup Razorpay Popup options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Macenza Tech",
                description: `${selectedPlan} Workspace Subscription`,
                order_id: orderData.order.id,
                handler: async function (response: any) {
                    setIsPaying(true);
                    try {
                        // 4. Verify payment signature on backend
                        const verifyRes = await apiClient.post('/payment/verify-signature', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        const verifyData = verifyRes.data;

                        if (verifyData.success) {
                            await executeFinalRegistration(response.razorpay_payment_id);
                        } else {
                            throw new Error('Payment verification failed.');
                        }
                    } catch (err: any) {
                        setIsPaying(false);
                        setError(err.message || 'Verification failed. Please contact billing support.');
                    }
                },
                prefill: {
                    name: adminName,
                    email: adminEmail,
                    contact: addressData.phoneNumber
                },
                theme: {
                    color: "#6D5DFD"
                },
                modal: {
                    ondismiss: function() {
                        setIsPaying(false);
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (err: any) {
            setIsPaying(false);
            setError(err.message || 'Payment initialization failed. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-[1100px] mx-auto px-4 py-6">
            {/* Back to Home */}
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#6D5DFD] transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Home
            </Link>

            {/* ── PROGRESS BAR ── */}
            <div className="flex items-start justify-center mb-10">
                {STEPS.map((s, idx) => {
                    const isActive = step === s.id;
                    const isCompleted = step > s.id;
                    return (
                        <React.Fragment key={s.id}>
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center text-center w-44">
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 mb-2 ${
                                        isCompleted
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                                            : isActive
                                            ? 'bg-[#6D5DFD] text-white shadow-lg shadow-[#6D5DFD]/30 ring-4 ring-[#6D5DFD]/15'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {isCompleted ? <Check size={18} /> : s.id}
                                </div>
                                <span
                                    className={`text-xs font-bold transition-colors leading-tight ${
                                        isActive
                                            ? 'text-gray-900 dark:text-gray-100'
                                            : isCompleted
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}
                                >
                                    {s.label}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight hidden sm:block">
                                    {s.description}
                                </span>
                            </div>
                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div className="flex-1 mt-5 px-2">
                                    <div
                                        className={`h-0.5 w-full rounded-full transition-all duration-500 ${
                                            step > s.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                    {/* Organization Details */}
                    <Card className="py-6">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-[#6D5DFD]/10">
                                    <Building2 className="w-5 h-5 text-[#6D5DFD]" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        Organization Details
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Basic information about your organization
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* Org Name + Prefix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5" data-field="companyName">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Organization Name *</label>
                                    <Input
                                        placeholder="Enter full organization name"
                                        value={companyName}
                                        onChange={(e) => { setCompanyName(e.target.value); setError(null); }}
                                        className={`text-gray-900 dark:text-gray-100 ${fieldErrorClass('companyName')}`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Organization Prefix</label>
                                    <Input
                                        placeholder="E.G. ABC FOR ABC COMPANY"
                                        value={orgPrefix}
                                        onChange={(e) => setOrgPrefix(e.target.value.toUpperCase().slice(0, 5))}
                                        maxLength={5}
                                        className="text-gray-900 dark:text-gray-100"
                                    />
                                    <p className="text-[10px] text-[#6D5DFD] font-medium">Used for generating unique IDs. Maximum 5 characters.</p>
                                </div>
                            </div>

                            {/* Org Email with OTP Verification */}
                            <div data-field="companyEmail">
                                <EmailVerification
                                    email={companyEmail}
                                    onEmailChange={(val) => { setCompanyEmail(val); setError(null); }}
                                    onVerified={setOrgEmailVerified}
                                    isVerified={orgEmailVerified}
                                    label="Organization Email *"
                                    placeholder="organization@gmail.com"
                                    hasError={invalidFields.has('companyEmail')}
                                />
                            </div>

                            {/* Primary Administrator */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-3">
                                    <Shield size={12} /> Primary Administrator
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-1.5" data-field="adminName">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Admin Name *</label>
                                        <Input
                                            placeholder="John Doe"
                                            value={adminName}
                                            onChange={(e) => { setAdminName(e.target.value); setError(null); }}
                                            className={`text-gray-900 dark:text-gray-100 ${fieldErrorClass('adminName')}`}
                                        />
                                    </div>
                                    <div data-field="adminEmail">
                                        <EmailVerification
                                            email={adminEmail}
                                            onEmailChange={(val) => { setAdminEmail(val); setError(null); }}
                                            onVerified={setAdminEmailVerified}
                                            isVerified={adminEmailVerified}
                                            label="Admin Email *"
                                            placeholder="admin@company.com"
                                            hasError={invalidFields.has('adminEmail')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Setup */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5" data-field="password">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password *</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Min. 8 characters"
                                                value={password}
                                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                                className={`pr-10 text-gray-900 dark:text-gray-100 ${fieldErrorClass('password')}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

                                    <div className="space-y-1.5" data-field="confirmPassword">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm Password *</label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Re-enter your password"
                                                value={confirmPassword}
                                                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                                                className={`pr-10 text-gray-900 dark:text-gray-100 ${fieldErrorClass('confirmPassword')}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {confirmPassword && password !== confirmPassword && (
                                            <p className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
                                                <AlertCircle size={12} /> Passwords do not match
                                            </p>
                                        )}
                                        {confirmPassword && password === confirmPassword && (
                                            <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 mt-1">
                                                <CheckCircle2 size={12} /> Passwords match
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logo Upload */}
                    <Card className="py-6">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <ImageIcon className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        Organization Logo
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Upload a professional logo for your organization (optional)
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 shrink-0 overflow-hidden transition-colors">
                                    {logoPreview ? (
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <Upload className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Organization Logo</h4>
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer">
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">
                                                <Upload size={14} />
                                                Choose File
                                            </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {logo ? (
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                <span className="font-medium truncate max-w-[180px]">{logo.name}</span>
                                                <button onClick={removeLogo} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">No file chosen</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Recommended: 400x400px or larger. Maximum size: 2MB</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Address Card */}
                    <Card className="py-6">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <MapPin className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        Organization Address
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Physical location of your organization
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <AddressForm
                                value={addressData}
                                onChange={(data) => {
                                    setError(null);
                                    setAddressData(data);
                                }}
                                errors={{
                                    addressLine1: invalidFields.has('addressLine1') ? 'Required' : undefined,
                                    country: invalidFields.has('countryCode') ? 'Required' : undefined,
                                    state: invalidFields.has('stateCode') ? 'Required' : undefined,
                                    city: invalidFields.has('city') ? 'Required' : undefined,
                                    postalCode: invalidFields.has('postalCode') ? 'Required' : undefined,
                                    phoneNumber: invalidFields.has('phoneNumber') ? 'Required' : undefined,
                                }}
                                compact
                            />
                        </CardContent>
                    </Card>

                    {/* Continue Section */}
                    <div className="space-y-4">
                        <p className="text-xs text-[#6D5DFD] font-medium">
                            Fields marked with * are required
                        </p>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleNextStep}
                                className="px-8 py-5 text-sm font-bold bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center gap-2 shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none rounded-xl transition-all"
                            >
                                Continue <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="py-6">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-[#6D5DFD]/10">
                                    <Shield className="w-5 h-5 text-[#6D5DFD]" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        Choose Your Plan
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Select the plan that fits your team size
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {PLANS.map((plan) => {
                                const Icon = plan.icon;
                                const isSelected = selectedPlan === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative text-left w-full p-5 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${plan.gradient} group ${
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
                        </CardContent>
                    </Card>

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

            {/* ── STEP 3 ── */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    {paymentSuccess ? (
                        <Card className="py-12">
                            <CardContent>
                                <div className="text-center animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200 dark:shadow-none">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">Payment Successful!</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                        Setting up your workspace. Redirecting...
                                    </p>
                                    <Loader2 className="w-5 h-5 animate-spin text-[#6D5DFD] mx-auto mt-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Order Summary */}
                            <Card className="py-6">
                                <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <Shield className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                                Order Summary
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                Review your subscription details
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{companyName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPlanData.name} Plan • Monthly</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900 dark:text-gray-100">₹{selectedPlanData.price.inr.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">≈ ${selectedPlanData.price.usd}/mo</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="py-6">
                                <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-[#6D5DFD]/10">
                                            <CreditCard className="w-5 h-5 text-[#6D5DFD]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                                Payment Method
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                Choose how you'd like to pay
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
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
                                </CardContent>
                            </Card>

                            {/* Terms Agreement */}
                            <div className="flex items-start gap-2.5 my-4">
                                <input
                                    id="agree-terms"
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="w-4 h-4 text-[#6D5DFD] border-gray-300 rounded focus:ring-[#6D5DFD] mt-0.5 cursor-pointer"
                                />
                                <label htmlFor="agree-terms" className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed cursor-pointer select-none">
                                    I have read and agree to the{' '}
                                    <Link href="/checkout-terms" target="_blank" className="text-[#6D5DFD] hover:underline font-bold">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/checkout-privacy" target="_blank" className="text-[#6D5DFD] hover:underline font-bold">
                                        Privacy Policy
                                    </Link>.
                                </label>
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
                                    disabled={isPaying || !agreeToTerms}
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

                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold mt-2">
                                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>100% SECURE • POWERED BY RAZORPAY GATEWAY</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Footer link */}
            {step <= 2 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
                    Already have a workspace?{' '}
                    <Link href="/login" className="text-[#6D5DFD] dark:text-[#8B7BFF] font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            )}

            {/* Secure Sandbox Checkout Modal */}
            {showMockModal && mockOrderData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <Shield className="w-6 h-6 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-gray-950 dark:text-white">Secure Sandbox Checkout</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Razorpay Test Mode (Simulated)</p>
                        </div>

                        {/* Order info */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 text-left space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold">MERCHANT</span>
                                <span className="font-extrabold text-gray-800 dark:text-gray-200">MACENZA Solutions</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold">ORDER ID</span>
                                <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{mockOrderData.id}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-gray-200/50 dark:border-gray-800/50 pt-2.5">
                                <span className="text-gray-400 font-bold">AMOUNT</span>
                                <span className="text-base font-black text-[#6D5DFD]">₹{selectedPlanData.price.inr.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed bg-blue-50/50 dark:bg-blue-950/10 p-3.5 border border-blue-100/30 dark:border-blue-900/20 rounded-2xl text-left flex gap-2.5 items-start">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>No real payment keys were detected in the backend's environment configuration. We've initiated a secure local simulator so you can complete your registration.</span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <Button
                                onClick={() => handleCompleteMockPayment('success')}
                                className="w-full py-4 bg-[#6D5DFD] hover:bg-[#5b4eed] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#6D5DFD]/20 transition-all duration-300"
                            >
                                Simulate Success Payment
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={() => handleCompleteMockPayment('fail')}
                                    variant="outline"
                                    className="py-3 border-red-200 dark:border-red-950/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 text-xs font-bold rounded-2xl"
                                >
                                    Simulate Fail
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowMockModal(false);
                                        setIsPaying(false);
                                    }}
                                    variant="outline"
                                    className="py-3 text-xs font-bold rounded-2xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
