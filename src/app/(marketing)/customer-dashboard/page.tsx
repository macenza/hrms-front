'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOutCustomer, setCustomerCredentials } from '@/store/authSlice';
import { logoutCustomer } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import {
    CreditCard, Shield, Users, Globe, LogOut, CheckCircle2,
    Sparkles, Building2, ArrowUpRight,
    User, Mail, Phone, Clock, RefreshCw,
    AlertTriangle, Loader2, History, UserPlus, Plus, X, Lock, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboardPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const customer = useAppSelector((state) => state.customerAuth.customer);
    const isCustomerAuthenticated = useAppSelector((state) => state.customerAuth.isAuthenticated);
    const [mounted, setMounted] = useState(false);

    // Add states for addon purchase & simulated Razorpay payment modal
    const [selectedSlots, setSelectedSlots] = useState<number>(10);
    const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
    const [payMethod, setPayMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
    const [simulatedCardNumber, setSimulatedCardNumber] = useState('4111 1111 1111 1111');
    const [simulatedUpiId, setSimulatedUpiId] = useState('');

    useEffect(() => {
        setMounted(true);
        if (!isCustomerAuthenticated) {
            router.push('/login?error=session_expired');
            return;
        }

        // Fetch latest profile state to keep UI seats data completely fresh
        const refreshProfile = async () => {
            try {
                const response = await apiClient.get('/customers/profile');
                if (response.data && response.data.success) {
                    dispatch(setCustomerCredentials({ user: response.data.customer }));
                }
            } catch (err) {
                console.error("Failed to refresh customer profile on mount:", err);
            }
        };

        refreshProfile();
    }, [isCustomerAuthenticated, router, dispatch]);

    // Pre-populate UPI state when customer name becomes available
    useEffect(() => {
        if (customer?.name) {
            setSimulatedUpiId(`${customer.name.toLowerCase().replace(/\s+/g, '')}@upi`);
        }
    }, [customer]);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
            dispatch(logOutCustomer());
            window.location.href = '/login?error=logged_out';
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const getAddonPrice = (slots: number) => {
        if (slots === 10) return 99;
        if (slots === 25) return 199;
        if (slots === 50) return 349;
        return 0;
    };

    const handleBuyAddon = async () => {
        setIsPurchasing(true);
        setPurchaseError(null);
        setPurchaseSuccess(null);

        // Simulate network latency for checkout validation
        await new Promise((resolve) => setTimeout(resolve, 1500));

        try {
            const response = await apiClient.post('/customers/buy-addon', { slots: selectedSlots });
            if (response.data && response.data.success) {
                dispatch(setCustomerCredentials({ user: response.data.customer }));
                setPurchaseSuccess(`Successfully purchased +${selectedSlots} Employee slots!`);
                setTimeout(() => {
                    setIsRazorpayOpen(false);
                    setPurchaseSuccess(null);
                }, 2000);
            } else {
                setPurchaseError(response.data?.message || "Payment verification failed.");
            }
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message || err.message || "An error occurred during payment.");
        } finally {
            setIsPurchasing(false);
        }
    };

    const getEmployeeLimits = () => {
        const baseLimit = customer.subscriptionPlan === 'Growth' ? 50 : (customer.subscriptionPlan === 'Professional' ? 250 : Infinity);
        const additionalSlots = customer.addonSlots || 0;
        const totalCapacity = baseLimit === Infinity ? Infinity : (baseLimit + additionalSlots);
        const currentCount = customer.employeeCount || 0;

        return {
            baseLimit,
            additionalSlots,
            totalCapacity,
            currentCount
        };
    };

    const { baseLimit, additionalSlots, totalCapacity, currentCount } = getEmployeeLimits();

    // Compute cumulative capacity progression for purchase history display
    const getAddonsWithCumulative = () => {
        let runningCapacity = 50;
        return (customer.addons || []).map((addon: any) => {
            runningCapacity += addon.slots;
            return {
                ...addon,
                cumulativeCapacity: runningCapacity
            };
        });
    };

    const addonsWithCumulative = getAddonsWithCumulative();

    const formatDate = (dateString: any) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const formatDateOnly = (dateString: any) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const calculateRemainingDays = (expiryDateString: any) => {
        if (!expiryDateString) return 'N/A';
        try {
            const expiry = new Date(expiryDateString);
            if (isNaN(expiry.getTime())) return 'N/A';
            const now = new Date();
            const diffTime = expiry.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return 'Expired';
            return `${diffDays} Days`;
        } catch (e) {
            return 'N/A';
        }
    };

    const getBasePlanPrice = (plan: string) => {
        if (plan === 'Growth') return 499;
        if (plan === 'Professional') return 1999;
        if (plan === 'Enterprise') return 39999;
        return 0;
    };

    const getValidUntilDate = (startDateString: any) => {
        if (!startDateString) return null;
        try {
            const date = new Date(startDateString);
            if (isNaN(date.getTime())) return null;
            const validUntil = new Date(date);
            validUntil.setMonth(validUntil.getMonth() + 1);
            return validUntil;
        } catch (e) {
            return null;
        }
    };

    const validUntilDate = getValidUntilDate(customer.startDate || customer.createdAt);
    const basePlanPrice = getBasePlanPrice(customer.subscriptionPlan);
    const addonsTotal = (customer.addons || []).reduce((sum: number, addon: any) => sum + (addon.price || 0), 0);
    const totalAmountPaid = basePlanPrice + addonsTotal;

    const getPaymentHistory = () => {
        const history: any[] = [];

        // 1. Base Plan Purchase
        if (customer.subscriptionPlan) {
            history.push({
                date: customer.purchaseDate || customer.createdAt,
                name: `${customer.subscriptionPlan} Plan License`,
                type: 'Base Plan',
                price: basePlanPrice,
                transactionId: customer.transactionId || 'N/A',
                status: customer.paymentStatus || 'Paid'
            });
        }

        // 2. Add-on Purchases
        if (customer.addons && customer.addons.length > 0) {
            customer.addons.forEach((addon: any) => {
                history.push({
                    date: addon.purchaseDate,
                    name: addon.name,
                    type: 'Add-on',
                    price: addon.price,
                    transactionId: addon.transactionId,
                    status: 'Paid'
                });
            });
        }

        // Sort descending by date
        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const paymentHistory = getPaymentHistory();

    if (!mounted || !customer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#6D5DFD] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading B2B Console...</span>
                </div>
            </div>
        );
    }

    // Plan configuration limits and values
    const getPlanConfig = () => {
        if (customer.subscriptionPlan === 'Growth') {
            return {
                maxEmployees: 50,
                price: '₹499/mo',
                type: 'B2B Growth SaaS License',
                features: ['Core HR Directory', 'Attendance check-ins', 'Leave Management', 'Basic Payroll Engine', 'Without AI features']
            };
        }
        if (customer.subscriptionPlan === 'Professional') {
            return {
                maxEmployees: 250,
                price: '₹1,999/mo',
                type: 'B2B Professional SaaS License',
                features: ['Core HR Directory', 'Attendance check-ins', 'Leave Management', 'Automated Disbursement Payroll', 'Asset Lifecycle tracking', 'With AI (Employees can give AI interviews) - Coming Soon']
            };
        }
        return {
            maxEmployees: 'Unlimited',
            price: '₹39,999/mo',
            type: 'B2B Enterprise License',
            features: ['All HRMS Modules', 'Custom Allowance Rules', 'Granular Audit Logs', 'Uptime SLA Guarantee', '24/7 Dedicated Support']
        };
    };

    const planConfig = getPlanConfig();

    return (
        <main className="min-h-screen bg-[#F8F9FB] dark:bg-gray-950 py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

                {/* Header Welcome Bar */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#6D5DFD]/5 blur-[80px] pointer-events-none" />
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#6D5DFD] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {customer.companyName}
                                </h1>
                                <span className={`px-2.5 py-0.5 text-xs font-black rounded-full flex items-center gap-1 border ${customer.subscriptionStatus === 'Active'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30'
                                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30'
                                    }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {customer.subscriptionStatus || 'Active'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-blue-500" /> B2B Customer Operations Console
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-3 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold rounded-2xl transition duration-300 text-sm shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout Console
                    </button>
                </div>

                {/* Dashboard Main Grid - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Card 1: Account Information */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <User className="w-5 h-5 text-[#6D5DFD]" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                Account Information
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Customer Name</span>
                                <span className="text-sm font-bold text-gray-850 dark:text-gray-200 block mt-1">
                                    {customer.name || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Email Address</span>
                                <span className="text-sm font-bold text-gray-850 dark:text-gray-200 block mt-1 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-gray-405 shrink-0" />
                                    {customer.email || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Phone Number</span>
                                <span className="text-sm font-bold text-gray-850 dark:text-gray-200 block mt-1 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-gray-405 shrink-0" />
                                    {customer.phone || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Company Name</span>
                                <span className="text-sm font-bold text-gray-850 dark:text-gray-200 block mt-1 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-gray-450 shrink-0" />
                                    {customer.companyName || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Customer ID</span>
                                <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-405 block mt-1 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg border border-gray-100 dark:border-gray-800/60 break-all">
                                    {customer._id || customer.id || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Subscription Information */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <CreditCard className="w-5 h-5 text-[#6D5DFD]" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                Subscription Information
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Current Plan</span>
                                    <span className="text-sm font-black text-[#6D5DFD] dark:text-[#8B7BFF] block mt-1">
                                        {customer.subscriptionPlan || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Plan Type</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mt-1">
                                        {planConfig.type}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Subscription Status</span>
                                    <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-1.5 ${customer.subscriptionStatus === 'Active'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                        }`}>
                                        {customer.subscriptionStatus || 'Active'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Remaining Time</span>
                                    <span className="text-sm font-bold text-gray-850 dark:text-gray-200 block mt-1 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {calculateRemainingDays(validUntilDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800/80 pt-3">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Purchase Date</span>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-450 block mt-1">
                                        {formatDateOnly(customer.purchaseDate || customer.createdAt)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Valid Until</span>
                                    <span className="text-xs font-bold text-gray-750 dark:text-gray-205 block mt-1">
                                        {formatDateOnly(validUntilDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800/80 pt-3">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Billing Cycle</span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 block mt-1">
                                        {customer.billingCycle || 'Monthly'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Amount Paid</span>
                                    <span className="text-xs font-black text-emerald-500 block mt-1">
                                        ₹{totalAmountPaid.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800/80 pt-3">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Payment Status</span>
                                    <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${customer.paymentStatus === 'Paid'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                        }`}>
                                        {customer.paymentStatus || 'Paid'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Transaction ID</span>
                                    <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-405 block mt-1 break-all">
                                        {customer.transactionId || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Additional & Tenant Information */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <Shield className="w-5 h-5 text-[#6D5DFD]" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                Additional Information
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Account Creation Date</span>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mt-1">
                                    {formatDate(customer.createdAt)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Last Login Date</span>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mt-1">
                                    {formatDate(customer.lastLogin || customer.updatedAt)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Users Allowed</span>
                                <span className="text-sm font-bold text-gray-850 dark:text-gray-250 block mt-1 flex items-center gap-1.5">
                                    <Users className="w-4.5 h-4.5 text-gray-400" />
                                    {totalCapacity === Infinity
                                        ? 'Unlimited Active Employees'
                                        : `${totalCapacity} Employees (Base: ${baseLimit} + Addon: ${additionalSlots})`}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Renewal Information</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mt-1 flex items-center gap-1.5">
                                    <RefreshCw className="w-4 h-4 text-[#6D5DFD]" />
                                    Auto-renews on {formatDateOnly(customer.expiryDate)}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Features Included</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {planConfig.features.map((feat, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-900/30"
                                        >
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Secure DNS Configuration / Launcher Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#6D5DFD]" /> Active Domain Routing
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4">
                            <div>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Tenant Workspace Instance</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                                    {customer.companyName.toLowerCase().replace(/\s+/g, '-')}.macenza-hrms.com
                                </span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                Deployed
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href="/hrms-login"
                                target="_blank"
                                className="flex-1 bg-[#6D5DFD] hover:bg-[#5b4eed] text-white py-3.5 px-5 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                            >
                                Launch Employee Login <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => alert("Premium Tenant Settings module requires fully verified Stripe/Razorpay live secrets.")}
                                className="px-5 py-3.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition text-sm flex items-center gap-1.5"
                            >
                                Configure DNS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Employee Capacity & Add-on Management Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left & Center: Progress and Add-on History */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Progress Bar Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#6D5DFD]" /> Employee Seats Capacity
                                </h2>
                                <span className="text-xs font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/20 text-[#6D5DFD] dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                                    {totalCapacity === Infinity ? 'Unlimited' : `${currentCount} / ${totalCapacity} Seats`}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-gray-400">
                                    <span>Workspace Limit Progress</span>
                                    <span>
                                        {totalCapacity === Infinity
                                            ? '0%'
                                            : `${Math.round((currentCount / totalCapacity) * 100)}% filled`}
                                    </span>
                                </div>

                                <div className="w-full h-4 bg-gray-105 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] transition-all duration-500 rounded-full"
                                        style={{
                                            width: `${totalCapacity === Infinity ? 0 : Math.min((currentCount / totalCapacity) * 100, 100)}%`
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Active Employees</span>
                                        <span className="text-lg font-black text-gray-850 dark:text-gray-200 mt-0.5 block">{currentCount}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Base Plan Seats</span>
                                        <span className="text-lg font-black text-gray-850 dark:text-gray-200 mt-0.5 block">{totalCapacity === Infinity ? 'Unlimited' : baseLimit}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Additional Seats</span>
                                        <span className="text-lg font-black text-gray-850 dark:text-gray-200 mt-0.5 block">+{additionalSlots}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Seats Remaining</span>
                                        <span className="text-lg font-black text-emerald-500 mt-0.5 block">
                                            {totalCapacity === Infinity ? 'Unlimited' : Math.max(totalCapacity - currentCount, 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment History List */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <History className="w-5 h-5 text-[#6D5DFD]" /> Payment History
                            </h2>

                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-455 font-semibold space-y-2">
                                    <Activity className="w-8 h-8 text-gray-300 mx-auto" />
                                    <p className="text-sm">No payment history records found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-800/80 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                <th className="pb-3 pr-2">Date</th>
                                                <th className="pb-3 px-2">Item</th>
                                                <th className="pb-3 px-2 text-center">Type</th>
                                                <th className="pb-3 px-2 text-right">Amount</th>
                                                <th className="pb-3 px-2 text-center">Status</th>
                                                <th className="pb-3 pl-2 max-w-[120px] truncate">Transaction ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {paymentHistory.map((payment: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                                                    <td className="py-3 pr-2 font-mono whitespace-nowrap">{formatDateOnly(payment.date)}</td>
                                                    <td className="py-3 px-2 text-gray-900 dark:text-white font-extrabold">{payment.name}</td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            payment.type === 'Base Plan'
                                                                ? 'bg-blue-50 dark:bg-blue-950/20 text-[#6D5DFD] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                                                                : 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30'
                                                        }`}>
                                                            {payment.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right font-extrabold text-emerald-500">₹{payment.price.toLocaleString('en-IN')}</td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pl-2 text-gray-400 font-mono max-w-[120px] truncate" title={payment.transactionId}>
                                                        {payment.transactionId}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right: Purchase Widget */}
                    <div>
                        {customer.subscriptionPlan === 'Growth' ? (
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6 sticky top-8">
                                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-[#6D5DFD]" /> Purchase Expansion
                                    </h2>
                                    <p className="text-xs text-gray-405 font-semibold mt-1">
                                        Instantly add permanent capacity to your current subscription workspace.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Select Employee Pack</label>

                                    <div className="space-y-3">
                                        {[
                                            { slots: 10, price: 99, desc: 'Starter Capacity' },
                                            { slots: 25, price: 199, desc: 'Growth Scale Pack' },
                                            { slots: 50, price: 349, desc: 'Professional Boost' }
                                        ].map((tier) => {
                                            const wouldExceed = totalCapacity !== Infinity && (totalCapacity + tier.slots > 250);
                                            const isSelected = selectedSlots === tier.slots;

                                            return (
                                                <div
                                                    key={tier.slots}
                                                    onClick={() => !wouldExceed && setSelectedSlots(tier.slots)}
                                                    className={`p-4 rounded-2xl border transition-all duration-300 relative ${wouldExceed
                                                            ? 'border-gray-200 bg-gray-50/50 dark:border-gray-800/40 dark:bg-gray-900/30 opacity-50 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'border-[#6D5DFD] bg-blue-50/20 dark:bg-[#6D5DFD]/5 cursor-pointer ring-2 ring-[#6D5DFD]/20'
                                                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                                                                +{tier.slots} Employees
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-bold">
                                                                {tier.desc}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-base text-emerald-500">
                                                                ₹{tier.price}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400 font-semibold uppercase">
                                                                One-Time
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {wouldExceed && (
                                                        <div className="mt-2 text-[9px] text-red-500 font-black flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Exceeds 250 Limit
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Cap validation alert */}
                                    {totalCapacity !== Infinity && totalCapacity + selectedSlots > 250 ? (
                                        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-2xl border border-red-100 dark:border-red-900/30 space-y-1 font-bold animate-shake">
                                            <p className="font-black uppercase flex items-center gap-1">
                                                ⚠️ Limit Warning
                                            </p>
                                            <p>
                                                Purchasing this pack will exceed the 250 employee limit. Please upgrade to the Professional plan instead.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-[10px] text-gray-400 font-bold flex justify-between">
                                            <span>Cumulative Limit after purchase:</span>
                                            <span className="text-[#6D5DFD] dark:text-blue-400 font-extrabold">
                                                {totalCapacity === Infinity ? 'Unlimited' : totalCapacity + selectedSlots} Employees
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsRazorpayOpen(true)}
                                        disabled={totalCapacity !== Infinity && totalCapacity + selectedSlots > 250}
                                        className="w-full bg-[#6D5DFD] hover:bg-[#5b4eed] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-505 disabled:cursor-not-allowed text-white py-4 px-5 rounded-2xl font-black flex items-center justify-center gap-1.5 transition text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                                    >
                                        <CreditCard className="w-4 h-4" /> Pay ₹{getAddonPrice(selectedSlots)} Securely
                                    </button>

                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold leading-normal">
                                            Pricing is structured so Growth Plan + add-ons up to 250 capacity (max ₹1,895 total) remains cheaper than Professional (₹1,999).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6 sticky top-8">
                                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-gray-400" /> Purchase Expansion
                                    </h2>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-400 space-y-2 font-bold leading-normal">
                                    <p className="font-black uppercase flex items-center gap-1">
                                        ℹ️ Add-on Notice
                                    </p>
                                    {customer.subscriptionPlan === 'Professional' ? (
                                        <p>
                                            Add-ons are not available on the Professional plan. The Professional plan already provides the maximum system limit of 250 active employee seats.
                                        </p>
                                    ) : (
                                        <p>
                                            Add-ons are not available on the Enterprise plan since it already grants unlimited active employee seats.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* Simulated Razorpay Modal */}
            {isRazorpayOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">

                        {/* Modal Header */}
                        <div className="bg-[#0B153C] text-white p-5 flex justify-between items-center relative">
                            <div>
                                <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                                    <Lock className="w-3 h-3 shrink-0" /> Secure Checkout
                                </div>
                                <h3 className="text-lg font-black tracking-tight mt-0.5 truncate max-w-[200px]">
                                    {customer.companyName}
                                </h3>
                                <p className="text-xs text-gray-400 font-semibold">
                                    Employee Expansion: +{selectedSlots} Slots
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-bold block">Amount to Pay</span>
                                <span className="text-xl font-black text-emerald-400">
                                    ₹{getAddonPrice(selectedSlots)}
                                </span>
                            </div>

                            <button
                                onClick={() => !isPurchasing && setIsRazorpayOpen(false)}
                                disabled={isPurchasing}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Payment Body */}
                        <div className="p-6 space-y-6">

                            {/* Alert messages */}
                            {purchaseError && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-2 font-bold animate-shake">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <div>{purchaseError}</div>
                                </div>
                            )}

                            {purchaseSuccess ? (
                                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-base font-black text-gray-900 dark:text-white">
                                        Payment Successful!
                                    </h4>
                                    <p className="text-xs text-gray-400 font-semibold px-4">
                                        {purchaseSuccess} Your seats are now provisioned.
                                    </p>
                                </div>
                            ) : isPurchasing ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                                    <Loader2 className="w-10 h-10 text-[#6D5DFD] animate-spin" />
                                    <h4 className="text-sm font-bold text-gray-850 dark:text-gray-200">
                                        Authorizing payment...
                                    </h4>
                                    <p className="text-[11px] text-gray-400 font-medium">
                                        Communicating with Razorpay gateway & bank terminals. Please do not close this window.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">

                                    {/* Tabs */}
                                    <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500">
                                        <button
                                            type="button"
                                            onClick={() => setPayMethod('card')}
                                            className={`flex-1 py-2 text-center rounded-lg transition ${payMethod === 'card' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50' : 'hover:text-gray-800 dark:hover:text-white'}`}
                                        >
                                            Card
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPayMethod('upi')}
                                            className={`flex-1 py-2 text-center rounded-lg transition ${payMethod === 'upi' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50' : 'hover:text-gray-800 dark:hover:text-white'}`}
                                        >
                                            UPI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPayMethod('netbanking')}
                                            className={`flex-1 py-2 text-center rounded-lg transition ${payMethod === 'netbanking' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50' : 'hover:text-gray-800 dark:hover:text-white'}`}
                                        >
                                            Netbanking
                                        </button>
                                    </div>

                                    {/* Tab Contents */}
                                    {payMethod === 'card' && (
                                        <div className="space-y-3 text-left">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Card Number</label>
                                                <input
                                                    type="text"
                                                    value={simulatedCardNumber}
                                                    onChange={(e) => setSimulatedCardNumber(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent outline-none text-gray-850 dark:text-white font-bold animate-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Expiry</label>
                                                    <input
                                                        type="text"
                                                        defaultValue="12/29"
                                                        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent outline-none text-gray-850 dark:text-white font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">CVV</label>
                                                    <input
                                                        type="password"
                                                        defaultValue="123"
                                                        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent outline-none text-gray-850 dark:text-white font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {payMethod === 'upi' && (
                                        <div className="space-y-3 text-left">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={simulatedUpiId}
                                                    onChange={(e) => setSimulatedUpiId(e.target.value)}
                                                    placeholder="username@upi"
                                                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent outline-none text-gray-850 dark:text-white font-bold"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold">
                                                A payment request will be sent to your virtual payment address.
                                            </p>
                                        </div>
                                    )}

                                    {payMethod === 'netbanking' && (
                                        <div className="space-y-3 text-left">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Select Bank</label>
                                            <select className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-[#6D5DFD] focus:border-transparent outline-none text-gray-850 dark:text-white font-bold">
                                                <option>State Bank of India (SBI)</option>
                                                <option>HDFC Bank</option>
                                                <option>ICICI Bank</option>
                                                <option>Axis Bank</option>
                                                <option>Kotak Mahindra Bank</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
                                        <button
                                            type="button"
                                            onClick={handleBuyAddon}
                                            className="w-full bg-[#1C54EC] hover:bg-[#1242c7] text-white py-3.5 px-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                                        >
                                            <Shield className="w-4 h-4 text-blue-300" /> Pay ₹{getAddonPrice(selectedSlots)} securely
                                        </button>

                                        <p className="text-[9px] text-gray-450 mt-3 text-center font-bold">
                                            🛡️ PCI-DSS compliant. Secure gateway connections simulated for review purposes.
                                        </p>
                                    </div>

                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}
        </main>
    );
}
