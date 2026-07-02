'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import {
    CreditCard, Shield, Users, CheckCircle2,
    Sparkles, Building2,
    Mail, Phone, Clock, RefreshCw,
    AlertTriangle, Loader2, History, Plus, X, Lock, Activity, Zap, Star, TrendingUp,
    Copy, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/utils/cn';

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                               */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 900) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

/* ------------------------------------------------------------------ */
/*  Animated progress bar                                               */
/* ------------------------------------------------------------------ */
function AnimatedProgress({ value, color = '#6D5DFD' }: { value: number; color?: string }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(Math.min(value, 100)), 120);
        return () => clearTimeout(t);
    }, [value]);
    const danger = value >= 90;
    const warn = value >= 75;
    const bg = danger ? '#f43f5e' : warn ? '#f59e0b' : color;
    return (
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-850 rounded-full overflow-hidden">
            <div
                style={{ width: `${width}%`, background: `linear-gradient(90deg, ${bg}aa, ${bg})`, transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                className="h-full rounded-full relative"
            >
                <div className="absolute right-1 top-0 bottom-0 w-1 rounded-full bg-white/30 animate-pulse" />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Stat mini card                                                       */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
    return (
        <div 
            className="relative p-4 rounded-2xl border bg-white/80 dark:bg-gray-900/80 border-gray-100 dark:border-gray-800 transition-all duration-300 group overflow-hidden hover:-translate-y-1"
            style={{ 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
            }}
        >
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${accent || '#6D5DFD'}15, transparent 70%)` }} 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-gradient-to-r transition-all duration-350" style={{ backgroundImage: `linear-gradient(90deg, transparent, ${accent || '#6D5DFD'}, transparent)` }} />
            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
            <span className="text-2xl font-black block" style={{ color: accent || '#6D5DFD' }}>{value}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                       */
/* ------------------------------------------------------------------ */
function SectionHeader({ icon, title, badge, action }: { icon: React.ReactNode; title: string; badge?: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20">
                    {icon}
                </span>
                {title}
            </h2>
            <div className="flex items-center gap-2">
                {badge}
                {action}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Info Row                                                             */
/* ------------------------------------------------------------------ */
function InfoRow({ label, value, icon, accent }: { label: string; value: React.ReactNode; icon?: React.ReactNode; accent?: string }) {
    const getHoverClass = () => {
        if (!accent) return 'hover:from-gray-100 hover:via-gray-50/50 hover:to-transparent dark:hover:from-gray-800/40 dark:hover:via-gray-800/10';
        if (accent === '#6D5DFD') return 'hover:from-violet-100 hover:via-violet-50/50 hover:to-transparent dark:hover:from-violet-950/40 dark:hover:via-violet-950/10';
        if (accent === '#3b82f6') return 'hover:from-blue-100 hover:via-blue-50/50 hover:to-transparent dark:hover:from-blue-950/40 dark:hover:via-blue-950/10';
        if (accent === '#10b981') return 'hover:from-emerald-100 hover:via-emerald-50/50 hover:to-transparent dark:hover:from-emerald-950/40 dark:hover:via-emerald-950/10';
        return 'hover:from-violet-100 hover:via-violet-50/50 hover:to-transparent dark:hover:from-violet-950/40 dark:hover:via-violet-950/10';
    };
    return (
        <div className={cn("flex flex-col gap-0.5 py-2.5 border-b border-gray-50 dark:border-gray-850/60 last:border-0 px-2 rounded-xl -mx-2 transition-all duration-250 hover:bg-gradient-to-r hover:translate-x-0.5", getHoverClass())}>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold flex items-center gap-1.5 mt-0.5" style={accent ? { color: accent } : { color: '' }}>
                {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
                {value}
            </span>
        </div>
    );
}

const getHistoryRowHoverStyles = (type: string) => {
    if (type === 'Base Plan') {
        return 'hover:from-blue-100 hover:via-blue-50/50 hover:to-transparent dark:hover:from-blue-950/40 dark:hover:via-blue-950/10';
    }
    return 'hover:from-purple-100 hover:via-purple-50/50 hover:to-transparent dark:hover:from-purple-950/40 dark:hover:via-purple-950/10';
};

const getCompanyLogoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/_next') || url.startsWith('data:')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseHost = apiUrl.replace(/\/api\/?$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseHost}${cleanUrl}`;
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function SubscriptionManagementPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { company } = useAppSelector((state) => state.settings);

    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [hasSubscription, setHasSubscription] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);

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
        const fetchSubscriptionProfile = async () => {
            try {
                const response = await apiClient.get('/customers/profile');
                if (response.data && response.data.success) {
                    setCustomer(response.data.customer);
                    setHasSubscription(true);
                } else {
                    setFetchError('Failed to fetch subscription profile.');
                }
            } catch (err: any) {
                if (err.response?.status === 404) setHasSubscription(false);
                else setFetchError(err.response?.data?.message || err.message || 'Failed to load subscription details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubscriptionProfile();
    }, [dispatch]);

    useEffect(() => {
        if (customer?.name) setSimulatedUpiId(`${customer.name.toLowerCase().replace(/\s+/g, '')}@upi`);
    }, [customer]);

    const getAddonPrice = (slots: number) => {
        if (slots === 10) return 99;
        if (slots === 25) return 199;
        if (slots === 50) return 349;
        return 0;
    };

    const handleBuyAddon = async () => {
        setIsPurchasing(true); setPurchaseError(null); setPurchaseSuccess(null);
        await new Promise((r) => setTimeout(r, 1500));
        try {
            const response = await apiClient.post('/customers/buy-addon', { slots: selectedSlots });
            if (response.data?.success) {
                setCustomer(response.data.customer);
                setPurchaseSuccess(`Successfully purchased +${selectedSlots} Employee slots!`);
                setTimeout(() => { setIsRazorpayOpen(false); setPurchaseSuccess(null); }, 2000);
            } else {
                setPurchaseError(response.data?.message || 'Payment verification failed.');
            }
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message || err.message || 'An error occurred during payment.');
        } finally {
            setIsPurchasing(false);
        }
    };

    const getEmployeeLimits = () => {
        if (!customer) return { baseLimit: 50, additionalSlots: 0, totalCapacity: 50, currentCount: 0 };
        const baseLimit = customer.subscriptionPlan === 'Growth' ? 50 : customer.subscriptionPlan === 'Professional' ? 250 : Infinity;
        const additionalSlots = customer.addonSlots || 0;
        const totalCapacity = baseLimit === Infinity ? Infinity : baseLimit + additionalSlots;
        const currentCount = customer.employeeCount || 0;
        return { baseLimit, additionalSlots, totalCapacity, currentCount };
    };

    const { baseLimit, additionalSlots, totalCapacity, currentCount } = getEmployeeLimits();
    const usagePercent = totalCapacity === Infinity ? 0 : Math.round((currentCount / totalCapacity) * 100);
    const seatsRemaining = totalCapacity === Infinity ? Infinity : Math.max(totalCapacity - currentCount, 0);
    const countedSeats = useCountUp(currentCount, 800);
    const countedTotal = useCountUp(totalCapacity === Infinity ? 0 : totalCapacity, 800);

    const fmt = (d: any) => {
        if (!d) return 'N/A';
        try {
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return 'N/A'; }
    };
    const fmtDate = (d: any) => {
        if (!d) return 'N/A';
        try {
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'N/A'; }
    };
    const remainDays = (exp: any) => {
        if (!exp) return 'N/A';
        try {
            const dt = new Date(exp);
            if (isNaN(dt.getTime())) return 'N/A';
            const d = Math.ceil((dt.getTime() - Date.now()) / 86400000);
            return d < 0 ? 'Expired' : `${d} Days`;
        } catch { return 'N/A'; }
    };
    const getPlanPrice = (p: string) => p === 'Growth' ? 499 : p === 'Professional' ? 1999 : p === 'Enterprise' ? 39999 : 0;
    const getValidUntil = (s: any) => {
        if (!s) return null;
        try { const d = new Date(s); if (isNaN(d.getTime())) return null; d.setMonth(d.getMonth() + 1); return d; } catch { return null; }
    };

    const validUntilDate = customer ? getValidUntil(customer.startDate || customer.createdAt) : null;
    const basePlanPrice = customer ? getPlanPrice(customer.subscriptionPlan) : 0;
    const addonsTotal = customer ? (customer.addons || []).reduce((s: number, a: any) => s + (a.price || 0), 0) : 0;
    const totalAmountPaid = basePlanPrice + addonsTotal;

    const getPaymentHistory = () => {
        if (!customer) return [];
        const h: any[] = [];
        if (customer.subscriptionPlan) h.push({ date: customer.purchaseDate || customer.createdAt, name: `${customer.subscriptionPlan} Plan License`, type: 'Base Plan', price: basePlanPrice, transactionId: customer.transactionId || 'N/A', status: customer.paymentStatus || 'Paid' });
        (customer.addons || []).forEach((a: any) => h.push({ date: a.purchaseDate, name: a.name, type: 'Add-on', price: a.price, transactionId: a.transactionId, status: 'Paid' }));
        return h.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };
    const paymentHistory = getPaymentHistory();

    const getPlanConfig = () => {
        if (!customer) return { price: '', type: '', features: [] as string[], color: '#6D5DFD', Icon: Zap };
        if (customer.subscriptionPlan === 'Growth') return { price: '₹499/mo', type: 'B2B Growth SaaS License', color: '#3b82f6', Icon: TrendingUp, features: ['Core HR Directory', 'Attendance check-ins', 'Leave Management', 'Basic Payroll Engine', 'Without AI features'] };
        if (customer.subscriptionPlan === 'Professional') return { price: '₹1,999/mo', type: 'B2B Professional SaaS License', color: '#6D5DFD', Icon: Star, features: ['Core HR Directory', 'Attendance check-ins', 'Leave Management', 'Automated Disbursement Payroll', 'Asset Lifecycle tracking', 'With AI (Employees can give AI interviews)'] };
        return { price: '₹39,999/mo', type: 'B2B Enterprise License', color: '#8b5cf6', Icon: Shield, features: ['All HRMS Modules', 'Custom Allowance Rules', 'Granular Audit Logs', 'Uptime SLA Guarantee', '24/7 Dedicated Support'] };
    };
    const planConfig = getPlanConfig();
    const { Icon: PlanIcon } = planConfig;

    /* loading */
    if (!mounted || isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <span className="text-sm font-bold text-gray-400 animate-pulse">Loading subscription...</span>
            </div>
        </div>
    );

    /* access denied */
    if (user?.role?.toLowerCase() !== 'admin') return (
        <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
            <div className="max-w-sm w-full bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-200/50 dark:shadow-none">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="text-sm text-gray-500 mt-1">You do not have permission to view this page.</p>
                </div>
                <button onClick={() => router.push('/dashboard')} className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all">
                    Back to Dashboard
                </button>
            </div>
        </main>
    );

    /* no subscription */
    if (!hasSubscription) return (
        <main className="min-h-[calc(100vh-5rem)] py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="relative p-6 md:p-8 rounded-3xl overflow-hidden border border-amber-200/60 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-xl">
                    <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-400/10 blur-[80px] pointer-events-none" />
                    <div className="flex items-center gap-4 relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-none shrink-0">
                            <AlertTriangle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">No Active Subscription</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your organization is running on a local workspace without an active cloud subscription.</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { name: 'Growth Plan', price: '₹499/mo', color: '#3b82f6', features: ['Up to 50 employees', 'Core HR Directory', 'Leave Management', 'Basic Payroll'], cta: 'Activate Growth Plan' },
                        { name: 'Professional Plan', price: '₹1,999/mo', color: '#6D5DFD', popular: true, features: ['Up to 250 employees', 'Leave & Attendance', 'Automated Payroll', 'AI Interviews & Analytics'], cta: 'Activate Professional Plan' }
                    ].map((plan) => (
                        <div key={plan.name} className={cn("relative p-6 rounded-3xl border bg-white dark:bg-gray-900 shadow-lg flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl", plan.popular ? 'border-violet-300 dark:border-violet-700/50 ring-2 ring-violet-500/20' : 'border-gray-100 dark:border-gray-800')}>
                            {plan.popular && <span className="absolute -top-2.5 right-5 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full text-white" style={{ background: 'linear-gradient(135deg,#6D5DFD,#8B7BFF)' }}>Most Popular</span>}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: plan.color }} />
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{plan.name}</h3>
                                    <span className="px-3 py-1 text-[10px] font-black rounded-full border" style={{ color: plan.color, borderColor: `${plan.color}30`, background: `${plan.color}10` }}>{plan.price}</span>
                                </div>
                                <ul className="space-y-2">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />{f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => alert('Please register at our main portal to activate this plan.')} className="mt-5 w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-md" style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}cc)`, boxShadow: `0 8px 20px -6px ${plan.color}40` }}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );

    /* error */
    if (fetchError || !customer) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-2">
                <p className="text-red-500 font-bold">{fetchError || 'Subscription not found.'}</p>
                <p className="text-xs text-gray-500">Please contact support if this persists.</p>
            </div>
        </div>
    );

    /* ---------------------------------------------------------------- */
    /*  Main Dashboard                                                    */
    /* ---------------------------------------------------------------- */
    return (
        <main className="min-h-[calc(100vh-5rem)] py-8 px-4 md:px-8 relative overflow-hidden bg-gray-50/50 dark:bg-[#0a0a0a]">

            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-600/5 rounded-full blur-[130px] pointer-events-none animate-pulse duration-10000" />
            <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[110px] pointer-events-none animate-pulse duration-8000" style={{ animationDelay: '1.5s' }} />

            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 relative z-10">

                {/* Welcome Greeting Header */}
                <div className="flex flex-col gap-1 animate-in fade-in duration-500">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        Welcome back, {user?.name || 'Chester'} 👋
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Here's what's happening with your subscription today.
                    </p>
                </div>

                {/* Hero Header */}
                <div className="relative rounded-3xl overflow-hidden border border-emerald-100 dark:border-emerald-950 bg-gradient-to-r from-emerald-50/70 via-yellow-50/40 to-teal-50/60 dark:from-emerald-950/15 dark:via-yellow-950/10 dark:to-teal-950/15 text-gray-900 dark:text-white shadow-lg shadow-emerald-500/5 animate-in fade-in duration-700 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 animate-float-banner">
                    <style>{`
                        @keyframes float-banner {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-6px); }
                        }
                        .animate-float-banner {
                            animation: float-banner 4s ease-in-out infinite;
                        }
                    `}</style>
                    {/* Subtle soft backdrop glowing spheres */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-400/5 blur-[50px] pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full bg-yellow-400/5 blur-[40px] pointer-events-none" />

                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/55 flex items-center justify-center shadow-inner text-emerald-600 overflow-hidden shrink-0">
                                {company?.companyLogoUrl ? (
                                    <img 
                                        src={getCompanyLogoUrl(company.companyLogoUrl)} 
                                        alt="Company Logo" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-7 h-7" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{customer.companyName}</h2>
                                    <span className={cn("px-2.5 py-0.5 text-xs font-black rounded-full flex items-center gap-1 border", customer.subscriptionStatus === 'Active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30')}>
                                        <CheckCircle2 className="w-3 h-3" />{customer.subscriptionStatus || 'Active'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Subscription Management
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl px-4 py-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 border border-emerald-250/20 dark:border-emerald-800/30 text-emerald-600">
                                <PlanIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Active Plan</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white">{customer.subscriptionPlan} · <span className="font-extrabold" style={{ color: planConfig.color }}>{planConfig.price}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                          {/* 4-Col Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat Card 1: Plan Status */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-lg shadow-gray-100/30 dark:shadow-none flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.25)] hover:border-emerald-300 dark:hover:border-emerald-800">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-500 shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Plan Status</p>
                            <p className="text-base font-black text-emerald-500 mt-0.5">{customer.subscriptionStatus || 'Active'}</p>
                        </div>
                    </div>

                    {/* Stat Card 2: Days Remaining */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-lg shadow-gray-100/30 dark:shadow-none flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.25)] hover:border-blue-300 dark:hover:border-blue-850">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-500 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Days Remaining</p>
                            <p className="text-base font-black text-blue-500 mt-0.5">{remainDays(customer.expiryDate)}</p>
                        </div>
                    </div>

                    {/* Stat Card 3: Plan Cost */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-lg shadow-gray-100/30 dark:shadow-none flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.25)] hover:border-violet-300 dark:hover:border-violet-850">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Plan Cost</p>
                            <p className="text-base font-black text-violet-500 mt-0.5">{planConfig.price}</p>
                        </div>
                    </div>

                    {/* Stat Card 4: Renewal Date */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-lg shadow-gray-100/30 dark:shadow-none flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.25)] hover:border-amber-300 dark:hover:border-amber-800">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Renewal Date</p>
                            <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">{fmtDate(customer.expiryDate)}</p>
                        </div>
                    </div>
                </div>

                {/* 3-Col Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Account */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 pt-7 rounded-3xl shadow-md shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/20 dark:hover:shadow-violet-500/30 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 dark:hover:border-violet-850">
                        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] bg-violet-400/5 group-hover:bg-violet-400/10 transition-all duration-500 pointer-events-none" />
                        <SectionHeader icon={<Users className="w-4 h-4 text-violet-500 animate-pulse" />} title="Account Information" action={<MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-white" />} />
                        <div className="pt-2">
                            <InfoRow label="Customer Name" value={customer.name || 'N/A'} />
                            <InfoRow label="Email Address" value={customer.email || 'N/A'} icon={<Mail className="w-3.5 h-3.5" />} />
                            <InfoRow label="Phone Number" value={customer.phone || 'N/A'} icon={<Phone className="w-3.5 h-3.5" />} />
                            <InfoRow label="Company Name" value={customer.companyName || 'N/A'} icon={<Building2 className="w-3.5 h-3.5" />} />
                            <div className="pt-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Customer ID</span>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={customer._id || customer.id || 'N/A'} 
                                        className="flex-1 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 outline-none select-all"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(customer._id || customer.id || '');
                                            alert('Customer ID copied to clipboard!');
                                        }}
                                        className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 pt-7 rounded-3xl shadow-md shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-850">
                        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] bg-indigo-400/5 group-hover:bg-indigo-400/10 transition-all duration-500 pointer-events-none" />
                        <SectionHeader icon={<CreditCard className="w-4 h-4 text-indigo-500" />} title="Subscription Info" action={<MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-white" />} />
                        <div className="pt-2">
                            <InfoRow label="Current Plan" value={customer.subscriptionPlan || 'N/A'} accent="#3b82f6" />
                            <InfoRow label="Remaining Time" value={remainDays(customer.expiryDate)} icon={<Clock className="w-3.5 h-3.5" />} accent="#10b981" />
                            <InfoRow label="Purchase Date" value={fmtDate(customer.purchaseDate || customer.createdAt)} />
                            <InfoRow label="Valid Until" value={fmtDate(validUntilDate)} />
                            <InfoRow label="Billing Cycle" value={customer.billingCycle || 'Monthly'} />
                            <InfoRow label="Amount Paid" value={`₹${totalAmountPaid.toLocaleString('en-IN')}`} accent="#10b981" />
                            <InfoRow label="Transaction ID" value={<span className="font-mono text-[10px] break-all text-gray-500">{customer.transactionId || 'N/A'}</span>} />
                        </div>
                    </div>

                    {/* Additional */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 pt-7 rounded-3xl shadow-md shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-850">
                        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] bg-blue-400/5 group-hover:bg-blue-400/10 transition-all duration-500 pointer-events-none" />
                        <SectionHeader icon={<Shield className="w-4 h-4 text-blue-500" />} title="Additional Info" action={<MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-white" />} />
                        <div className="pt-2">
                            <InfoRow label="Account Creation" value={fmt(customer.createdAt)} />
                            <InfoRow label="Last Login" value={fmt(customer.lastLogin || customer.updatedAt)} />
                            <InfoRow label="Total Users Allowed" value={`${totalCapacity === Infinity ? 'Unlimited' : totalCapacity} Employees`} icon={<Users className="w-3.5 h-3.5" />} accent="#6D5DFD" />
                            <InfoRow label="Renewal Info" value={`Auto-renews ${fmtDate(customer.expiryDate)}`} icon={<RefreshCw className="w-3.5 h-3.5" />} accent="#6D5DFD" />
                            <div className="pt-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Features Included</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {planConfig.features.map((feat: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 hover:scale-105" style={{ color: planConfig.color, background: `${planConfig.color}0f`, borderColor: `${planConfig.color}25` }}>
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capacity + History + Addon */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Capacity Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 pt-7 rounded-3xl shadow-md shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/20 dark:hover:shadow-violet-500/30 space-y-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 dark:hover:border-violet-850">
                            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: `${planConfig.color}12` }} />
                            <SectionHeader
                                icon={<Users className="w-4 h-4" style={{ color: planConfig.color }} />}
                                title="Employee Seats Capacity"
                                badge={
                                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border" style={{ color: planConfig.color, background: `${planConfig.color}12`, borderColor: `${planConfig.color}25` }}>
                                        {totalCapacity === Infinity ? 'Unlimited' : `${countedSeats} / ${countedTotal} Seats`}
                                    </span>
                                }
                            />
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-gray-400">
                                    <span>Workspace Limit Progress</span>
                                    <span className={cn("font-black", usagePercent >= 90 ? 'text-rose-500' : usagePercent >= 75 ? 'text-amber-500' : 'text-emerald-500')}>
                                        {totalCapacity === Infinity ? 'Unlimited' : `${usagePercent}% used`}
                                    </span>
                                </div>
                                <AnimatedProgress value={usagePercent} color={planConfig.color} />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard label="Active Employees" value={countedSeats} accent="#6D5DFD" />
                                <StatCard label="Base Plan Seats" value={totalCapacity === Infinity ? '∞' : baseLimit} accent="#3b82f6" />
                                <StatCard label="Addon Seats" value={`+${additionalSlots}`} accent="#8b5cf6" />
                                <StatCard label="Seats Left" value={seatsRemaining === Infinity ? '∞' : seatsRemaining} accent={(seatsRemaining !== Infinity && (seatsRemaining as number) < 5) ? '#f43f5e' : '#10b981'} />
                            </div>
                            {totalCapacity !== Infinity && usagePercent >= 80 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">⚠ Seat Capacity Running Low</p>
                                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400/80 mt-1 leading-relaxed">You've used {usagePercent}% of your seats ({currentCount}/{totalCapacity}). Buy additional packs or upgrade your plan.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 pt-7 rounded-3xl shadow-md shadow-fuchsia-500/5 hover:shadow-2xl hover:shadow-fuchsia-500/20 dark:hover:shadow-fuchsia-500/30 space-y-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300 dark:hover:border-fuchsia-850">
                            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500" />
                            <SectionHeader icon={<History className="w-4 h-4 text-violet-500" />} title="Payment History" />
                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                                    <p className="text-sm text-gray-400 font-semibold">No payment records found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <th className="pb-3 pr-2">Date</th>
                                                <th className="pb-3 px-2">Item</th>
                                                <th className="pb-3 px-2 text-center">Type</th>
                                                <th className="pb-3 px-2 text-right">Amount</th>
                                                <th className="pb-3 px-2 text-center">Status</th>
                                                <th className="pb-3 pl-2">Transaction ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                             {paymentHistory.map((p: any, idx: number) => (
                                                 <tr key={idx} className={cn("border-b border-gray-50 dark:border-gray-800/50 transition-all duration-200 hover:bg-gradient-to-r hover:translate-x-0.5", getHistoryRowHoverStyles(p.type))}>
                                                    <td className="py-3 pr-2 font-mono whitespace-nowrap text-gray-500">{fmtDate(p.date)}</td>
                                                    <td className="py-3 px-2 font-extrabold text-gray-900 dark:text-white">{p.name}</td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black border", p.type === 'Base Plan' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100 dark:border-blue-900/30' : 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-100 dark:border-purple-900/30')}>{p.type}</span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right font-black text-emerald-500">₹{p.price?.toLocaleString('en-IN')}</td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">{p.status}</span>
                                                    </td>
                                                    <td className="py-3 pl-2 font-mono text-gray-400 max-w-[120px] truncate" title={p.transactionId}>{p.transactionId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase Widget */}
                    <div>
                        {customer.subscriptionPlan === 'Growth' ? (
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 pt-7 rounded-3xl shadow-md shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 space-y-5 sticky top-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-850">
                                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[70px] bg-violet-400/8 pointer-events-none" />
                                <SectionHeader icon={<Plus className="w-4 h-4 text-violet-500" />} title="Purchase Expansion" />
                                <p className="text-xs text-gray-400 font-semibold -mt-2">Instantly add permanent capacity to your workspace.</p>
                                <div className="space-y-3">
                                    {[
                                        { slots: 10, price: 99, desc: 'Starter Pack', color: '#3b82f6' },
                                        { slots: 25, price: 199, desc: 'Growth Scale', color: '#6D5DFD' },
                                        { slots: 50, price: 349, desc: 'Professional Boost', color: '#8b5cf6' }
                                    ].map((tier) => {
                                        const wouldExceed = totalCapacity !== Infinity && (totalCapacity + tier.slots > 250);
                                        const isSelected = selectedSlots === tier.slots;
                                        return (
                                            <div key={tier.slots} onClick={() => !wouldExceed && setSelectedSlots(tier.slots)}
                                                className={cn("p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer overflow-hidden", wouldExceed ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800' : isSelected ? 'shadow-md' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5')}
                                                style={isSelected ? { borderColor: tier.color, boxShadow: `0 4px 20px -6px ${tier.color}40` } : {}}
                                            >
                                                {isSelected && <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: tier.color }} />}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 dark:text-white">+{tier.slots} Employees</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{tier.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-lg" style={{ color: tier.color }}>₹{tier.price}</p>
                                                        <p className="text-[9px] text-gray-400 font-semibold uppercase">One-Time</p>
                                                    </div>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 absolute top-2 right-2" style={{ color: tier.color }} />}
                                                {wouldExceed && <p className="mt-1.5 text-[9px] text-rose-500 font-black flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Exceeds 250 limit</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                                {totalCapacity !== Infinity && totalCapacity + selectedSlots > 250 ? (
                                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 font-bold space-y-1">
                                        <p className="font-black uppercase">⚠ Limit Warning</p>
                                        <p>This pack exceeds the 250 limit. Upgrade to Professional instead.</p>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-[10px] text-gray-400 font-bold flex justify-between">
                                        <span>After purchase:</span>
                                        <span className="font-extrabold" style={{ color: planConfig.color }}>{totalCapacity === Infinity ? 'Unlimited' : totalCapacity + selectedSlots} Employees</span>
                                    </div>
                                )}
                                <button type="button" onClick={() => setIsRazorpayOpen(true)} disabled={totalCapacity !== Infinity && totalCapacity + selectedSlots > 250}
                                    className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                                    style={{ background: 'linear-gradient(135deg,#6D5DFD,#4f46e5)', boxShadow: '0 8px 24px -6px #6D5DFD50' }}>
                                    <CreditCard className="w-4 h-4" /> Pay ₹{getAddonPrice(selectedSlots)} Securely
                                </button>
                                <p className="text-[9px] text-gray-400 font-semibold text-center leading-relaxed">Growth + add-ons up to 250 seats (max ₹1,895 total) stays cheaper than Professional (₹1,999).</p>
                            </div>
                        ) : (
                             <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 pt-7 rounded-3xl shadow-md shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 space-y-5 sticky top-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-850">
                                 <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                                <SectionHeader icon={<Plus className="w-4 h-4 text-gray-400" />} title="Purchase Expansion" />
                                <div className="p-4 bg-amber-55 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-xs text-amber-700 dark:text-amber-400 space-y-2 font-bold">
                                    <p className="font-black uppercase flex items-center gap-1">ℹ Add-on Notice</p>
                                    {customer.subscriptionPlan === 'Professional' ? (
                                        <p>Add-ons are unavailable on the Professional plan — it already provides the maximum 250 active employee seats.</p>
                                    ) : (
                                        <p>Add-ons are unavailable on the Enterprise plan since it grants unlimited active employee seats.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isRazorpayOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
                        <div className="relative p-5 flex justify-between items-center overflow-hidden" style={{ background: 'linear-gradient(135deg,#0B153C,#1a2460)' }}>
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px,transparent 0)', backgroundSize: '20px 20px' }} />
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] bg-blue-400/10 pointer-events-none" />
                            <div className="relative">
                                <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-blue-400 uppercase mb-1"><Lock className="w-3 h-3" /> Secure Checkout</div>
                                <h3 className="text-lg font-black text-white tracking-tight truncate max-w-[200px]">{customer.companyName}</h3>
                                <p className="text-xs text-gray-400 font-semibold">Employee Expansion: +{selectedSlots} Slots</p>
                            </div>
                            <div className="relative text-right">
                                <span className="text-[10px] text-gray-400 font-bold block">Amount</span>
                                <span className="text-2xl font-black text-emerald-400">₹{getAddonPrice(selectedSlots)}</span>
                            </div>
                            <button onClick={() => !isPurchasing && setIsRazorpayOpen(false)} disabled={isPurchasing} className="absolute top-4 right-4 text-gray-400 hover:text-white transition disabled:opacity-50"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {purchaseError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-xs rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-2 font-bold animate-shake">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{purchaseError}
                                </div>
                            )}
                            {purchaseSuccess ? (
                                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="w-10 h-10" /></div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white">Payment Successful!</h4>
                                        <p className="text-xs text-gray-400 font-semibold mt-1">{purchaseSuccess} Seats are now provisioned.</p>
                                    </div>
                                </div>
                            ) : isPurchasing ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Authorizing payment...</h4>
                                        <p className="text-xs text-gray-400 mt-1">Communicating with gateway. Do not close this window.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500">
                                        {(['card', 'upi', 'netbanking'] as const).map((method) => (
                                            <button key={method} type="button" onClick={() => setPayMethod(method)}
                                                className={cn("flex-1 py-2 text-center rounded-lg capitalize transition-all duration-200", payMethod === method ? 'bg-white dark:bg-gray-850 shadow-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50' : 'hover:text-gray-700 dark:hover:text-white')}>
                                                {method === 'netbanking' ? 'Netbanking' : method.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    {payMethod === 'card' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Card Number</label>
                                                <input type="text" value={simulatedCardNumber} onChange={(e) => setSimulatedCardNumber(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 dark:text-white" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Expiry</label>
                                                    <input type="text" defaultValue="12/29" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">CVV</label>
                                                    <input type="password" defaultValue="123" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {payMethod === 'upi' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">UPI ID</label>
                                            <input type="text" value={simulatedUpiId} onChange={(e) => setSimulatedUpiId(e.target.value)} placeholder="username@upi" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white" />
                                            <p className="text-[10px] text-gray-400 font-semibold">A payment request will be sent to your virtual payment address.</p>
                                        </div>
                                    )}
                                    {payMethod === 'netbanking' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Select Bank</label>
                                            <select className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white font-semibold">
                                                <option>State Bank of India (SBI)</option>
                                                <option>HDFC Bank</option>
                                                <option>ICICI Bank</option>
                                                <option>Axis Bank</option>
                                                <option>Kotak Mahindra Bank</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                        <button type="button" onClick={handleBuyAddon}
                                            className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-lg"
                                            style={{ background: 'linear-gradient(135deg,#1C54EC,#1242c7)', boxShadow: '0 8px 20px -6px #1C54EC50' }}>
                                            <Shield className="w-4 h-4 text-blue-300" /> Pay ₹{getAddonPrice(selectedSlots)} securely
                                        </button>
                                        <p className="text-[9px] text-gray-400 mt-3 text-center font-bold">🛡️ PCI-DSS compliant. Secure gateway connections simulated for review purposes.</p>
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
