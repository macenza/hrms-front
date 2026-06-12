'use client';

import React from 'react';
import {
    CreditCard, Users, HardDrive, UserCheck, Calendar, CheckCircle,
    Sparkles, Zap, Clock, Receipt, ArrowUpCircle, Shield,
    BarChart3, FileText, Globe
} from 'lucide-react';

const usageMetrics = [
    { label: 'Employees Used', value: '0 / 100', percent: 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 'bg-blue-500' },
    { label: 'Storage Used', value: '0 GB / 10 GB', percent: 0, icon: HardDrive, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', bar: 'bg-purple-500' },
    { label: 'Active Users', value: '0', percent: 0, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500' },
];

const planFeatures = [
    'Core HR Management',
    'Employee Self-Service Portal',
    'Attendance & Leave Tracking',
    'Payroll Engine',
    'Project Management',
    'Notice Board',
    'Policy Management',
    'Holiday Calendar',
    'Custom Reports',
    'Priority Email Support',
];

const comingSoonFeatures = [
    { title: 'Billing History', description: 'View and download past invoices and payment records.', icon: Receipt },
    { title: 'Plan Upgrades', description: 'Upgrade or downgrade your subscription instantly.', icon: ArrowUpCircle },
    { title: 'Usage Analytics', description: 'Detailed insights into module and feature adoption.', icon: BarChart3 },
    { title: 'Invoice Downloads', description: 'Generate GST-compliant invoices for accounting.', icon: FileText },
    { title: 'Payment Methods', description: 'Manage cards, UPI, and bank account details.', icon: CreditCard },
    { title: 'Multi-Workspace', description: 'Manage multiple company workspaces under one account.', icon: Globe },
];

export default function SubscriptionPage() {
    // Mock data for display
    const currentPlan = 'Professional';
    const status = 'Active';
    const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2 transition-colors">
                            <CreditCard className="w-6 h-6 text-[#6D5DFD]" />
                            Subscription
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">
                            Manage your plan, view usage, and handle billing.
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={12} /> Coming Soon
                    </span>
                </header>

                {/* Current Plan + Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Plan Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#6D5DFD]/10 via-purple-500/5 to-blue-500/10 dark:from-[#6D5DFD]/20 dark:via-purple-500/10 dark:to-blue-500/20 border border-[#6D5DFD]/20 dark:border-[#6D5DFD]/30 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Current Plan</p>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{currentPlan}</h2>
                            </div>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                                <CheckCircle size={12} /> {status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="font-medium">Renewal: <strong className="text-gray-900 dark:text-gray-100">{renewalDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CreditCard size={14} className="text-gray-400" />
                                <span className="font-medium">₹7,999<span className="text-gray-400">/month</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                            <Shield className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Subscription Management</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upgrades and billing will be available soon.</p>
                    </div>
                </div>

                {/* Usage Metrics */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
                        <BarChart3 size={12} /> Usage Overview
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {usageMetrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl ${metric.bg}`}>
                                            <Icon size={18} className={metric.color} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{metric.percent}%</span>
                                    </div>
                                    <p className="text-lg font-black text-gray-900 dark:text-gray-100">{metric.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{metric.label}</p>
                                    <div className="mt-3 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${metric.bar} transition-all duration-500`} style={{ width: `${Math.max(metric.percent, 2)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Features Included */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
                        <Zap size={12} /> Features Included in {currentPlan}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {planFeatures.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium py-1">
                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Features */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
                        <Clock size={12} /> Coming in Future Releases
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comingSoonFeatures.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-all group">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl w-fit mb-3 group-hover:bg-[#6D5DFD]/10 transition-colors">
                                        <Icon size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-[#6D5DFD] transition-colors" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
