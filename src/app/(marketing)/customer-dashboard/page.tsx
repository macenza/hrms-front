'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOutCustomer } from '@/store/authSlice';
import { logoutCustomer } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { 
    CreditCard, Shield, Users, Globe, ExternalLink, LogOut, CheckCircle2, 
    Lock, Sparkles, Building2, Terminal, ArrowUpRight, BarChart3 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CustomerDashboardPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const customer = useAppSelector((state) => state.auth.customerUser);
    const isCustomerAuthenticated = useAppSelector((state) => state.auth.isCustomerAuthenticated);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isCustomerAuthenticated) {
            router.push('/login');
        }
    }, [isCustomerAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
            dispatch(logOutCustomer());
            router.push('/');
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

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

    // Dynamic stats based on plan
    const getPlanLimits = () => {
        if (customer.subscriptionPlan === 'Growth') {
            return { maxEmployees: 50, price: '₹3,999/mo', modules: ['Core HR', 'Attendance', 'Leave Manager'] };
        }
        if (customer.subscriptionPlan === 'Professional') {
            return { maxEmployees: 250, price: '₹9,999/mo', modules: ['Core HR', 'Attendance', 'Leave Manager', 'Payroll Engine', 'Asset Tracking'] };
        }
        return { maxEmployees: 9999, price: '₹39,999/mo', modules: ['All HRMS Modules', 'Dedicated Tenant Hosting', '24/7 Priority SLA'] };
    };

    const limits = getPlanLimits();

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
                                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-800/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active
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

                {/* Dashboard Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Subscription Status Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[#6D5DFD]" /> License & Plan details
                                </h2>
                                <span className="text-xs font-bold text-gray-400">RAZORPAY SECURED</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Plan Level</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5 mt-1">
                                        {customer.subscriptionPlan} Plan
                                    </span>
                                </div>
                                <div className="md:border-l border-gray-200 dark:border-gray-700 md:pl-6">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Billing Rate</span>
                                    <span className="text-2xl font-black text-emerald-500 tracking-tight block mt-1">
                                        {limits.price}
                                    </span>
                                </div>
                            </div>

                            {/* Resource Seats Slider/Bar */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-gray-400" /> Employee Seat Allocations
                                    </span>
                                    <span className="font-black text-gray-900 dark:text-white">8 / {limits.maxEmployees} Seats Used</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden">
                                    <div 
                                        className="bg-[#6D5DFD] h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-200 dark:shadow-none" 
                                        style={{ width: `${(8 / limits.maxEmployees) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 font-semibold">
                                    Growth seats are automatically provisioned. Upgrade to Professional for up to 250 seats.
                                </p>
                            </div>

                            {/* Active Modules */}
                            <div className="space-y-3">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">Included HRMS Modules</span>
                                <div className="flex flex-wrap gap-2">
                                    {limits.modules.map((mod, idx) => (
                                        <span 
                                            key={idx} 
                                            className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-100 dark:border-blue-900/30"
                                        >
                                            {mod}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Domain configuration details */}
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
                    </div>

                    {/* Right Column - Billing History & Security */}
                    <div className="space-y-8">
                        {/* Razorpay Billing Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-4.5 h-4.5 text-[#6D5DFD]" /> Billing Account
                            </h3>
                            
                            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-black text-white text-xs">
                                        R
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block font-semibold">GATEWAY REFERENCE</span>
                                        <span className="text-xs font-mono font-bold text-gray-200 block mt-0.5">
                                            {customer.razorpayCustomerId || 'cust_m1k2l3j4'}
                                        </span>
                                    </div>
                                </div>
                                <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-semibold">Gateway Integration</span>
                                    <span className="text-emerald-500 font-black">Razorpay Live APIs</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-semibold">Last Invoiced</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-bold">Today</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <span className="text-gray-400 font-semibold">Subscription Status</span>
                                    <span className="text-emerald-500 font-black">Active (Autopay)</span>
                                </div>
                            </div>

                            <button
                                onClick={() => alert("Connecting to Razorpay Secure Invoicing portal. This requires live credentials.")}
                                className="w-full bg-[#f8fafc] dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/80 border border-gray-150 dark:border-gray-800 py-3 rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300"
                            >
                                Razorpay Customer Portal <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Quick Tenant Stats Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none space-y-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="w-4.5 h-4.5 text-[#6D5DFD]" /> Instance Status
                            </h3>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-semibold">Server Host</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Vercel Edge Network</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-semibold">DB Clusters</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">MongoDB Atlas</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-semibold">Calculations Engine</span>
                                    <span className="text-emerald-500 font-black">Operational</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-semibold">SSL Certificate</span>
                                    <span className="text-emerald-500 font-black">Secure / Valid</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
