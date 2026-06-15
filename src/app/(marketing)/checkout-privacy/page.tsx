'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, Shield, Eye, Lock, FileText, Sparkles, Building2,
    Mail, MapPin, CheckCircle2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CheckoutPrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState('collection');

    useEffect(() => {
        const sections = ['collection', 'usage', 'protection', 'sharing', 'contact'];
        const observers = sections.map(id => {
            const el = document.getElementById(id);
            if (!el) return null;
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setActiveSection(id);
                }
            }, { rootMargin: '-20% 0px -50% 0px' });
            observer.observe(el);
            return { observer, el };
        });

        return () => {
            observers.forEach(obs => {
                if (obs) obs.observer.unobserve(obs.el);
            });
        };
    }, []);

    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full min-h-screen bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-950/20">
            {/* Redirect / Back Button to Checkout */}
            <div className="mb-10 flex items-center justify-between">
                <Link href="/register-company?step=3">
                    <Button variant="outline" className="flex items-center gap-2 text-sm font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl px-5 py-2.5 transition-all duration-300 hover:shadow-md">
                        <ChevronLeft size={16} className="text-gray-500" /> Back to Checkout & Payment
                    </Button>
                </Link>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                    Compliance Document
                </span>
            </div>

            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-4.5 py-2 rounded-full border border-[#6D5DFD]/20">
                    <Sparkles size={12} className="animate-pulse" /> Data Protection & Compliance
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Privacy Policy
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase">
                    Last Updated: June 11, 2026
                </p>
            </div>

            {/* Intro Alert Box */}
            <div className="mb-12 p-6 bg-blue-50/30 dark:bg-[#6D5DFD]/5 border border-blue-100/50 dark:border-[#6D5DFD]/10 rounded-3xl flex items-start gap-4 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm shadow-sm">
                <div className="p-3 bg-blue-100/50 dark:bg-[#6D5DFD]/20 rounded-2xl text-[#6D5DFD] shrink-0">
                    <Shield className="w-6 h-6" />
                </div>
                <div className="text-base text-gray-655 dark:text-gray-300 leading-relaxed">
                    At <strong>MACENZA</strong>, we value the trust you place in us when sharing your corporate, financial, and employee information. This Privacy Policy outlines our strict practices regarding data collection, processing, storage, sharing, security, and statutory compliance. It is designed to meet the rigorous verification criteria of premium merchant providers like Razorpay.
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2.5 lg:sticky lg:top-24 h-fit p-4 bg-white/40 dark:bg-gray-900/30 border border-gray-150/40 dark:border-gray-800/40 rounded-3xl backdrop-blur-md">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-3">
                        Policy Index
                    </p>
                    <nav className="space-y-1.5">
                        <a 
                            href="#collection" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'collection' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <FileText size={16} /> 1. Info We Collect
                        </a>
                        <a 
                            href="#usage" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'usage' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Eye size={16} /> 2. Info Usage
                        </a>
                        <a 
                            href="#protection" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'protection' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Lock size={16} /> 3. Data Protection
                        </a>
                        <a 
                            href="#sharing" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'sharing' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Shield size={16} /> 4. Data Sharing
                        </a>
                        <a 
                            href="#contact" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'contact' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Building2 size={16} /> 5. Privacy Support
                        </a>
                    </nav>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-3 space-y-10 text-gray-650 dark:text-gray-300 text-base leading-relaxed">
                    
                    {/* SECTION 1: Information We Collect */}
                    <section 
                        id="collection" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <FileText size={20} />
                            </span>
                            1. Information We Collect
                        </h2>
                        
                        <div className="space-y-4">
                            <p className="text-gray-655 dark:text-gray-300">
                                We collect information necessary to deliver and manage our services. The categories of information we collect include:
                            </p>
                            <ul className="space-y-3.5 pt-2">
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 bg-green-50 dark:bg-green-950/30 p-1 rounded-full text-green-600">
                                        <CheckCircle2 size={15} />
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-white">Account Registration Data:</strong>
                                        <span className="text-gray-600 dark:text-gray-400 block text-sm mt-0.5">Administrator Name, Corporate Email Address, Company Name, Billing Address, Password, and contact details.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 bg-green-50 dark:bg-green-950/30 p-1 rounded-full text-green-600">
                                        <CheckCircle2 size={15} />
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-white">Employee Records (Workspace Data):</strong>
                                        <span className="text-gray-600 dark:text-gray-400 block text-sm mt-0.5">Any data entered by you or your employees into your workspace (including names, attendance timestamps, leave balances, salary details, PAN/Aadhaar numbers for payroll computation, etc.). MACENZA acts solely as a data processor for this information, while your company acts as the data controller.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 bg-green-50 dark:bg-green-950/30 p-1 rounded-full text-green-600">
                                        <CheckCircle2 size={15} />
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-white">Payment Details:</strong>
                                        <span className="text-gray-600 dark:text-gray-400 block text-sm mt-0.5">Payment processing details. We do not store credit card numbers, CVV codes, or netbanking passwords on our servers. All payments are handled securely through <strong>Razorpay</strong> in accordance with PCI DSS guidelines. We only store transaction references (e.g., Razorpay Customer ID, order IDs, payment IDs).</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* SECTION 2: How We Use Information */}
                    <section 
                        id="usage" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Eye size={20} />
                            </span>
                            2. How We Use Information
                        </h2>
                        
                        <div className="space-y-4">
                            <p className="text-gray-655 dark:text-gray-300">
                                We utilize account and setup information exclusively to operate and secure our SaaS service:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Tenant Provisioning</p>
                                    <p className="text-xs text-gray-500 mt-1">To provision, host, and maintain your HRMS tenant database and customized subdomain workspace.</p>
                                </div>
                                <div className="p-4.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Subscription Billing</p>
                                    <p className="text-xs text-gray-500 mt-1">To process monthly/annual subscription billing, issue commercial tax invoices, and track payments.</p>
                                </div>
                                <div className="p-4.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">System Notifications</p>
                                    <p className="text-xs text-gray-500 mt-1">To transmit critical system alerts, updates, maintenance reports, and security patches.</p>
                                </div>
                                <div className="p-4.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Operations Support</p>
                                    <p className="text-xs text-gray-500 mt-1">To solve customer support queries, respond to requests, and run platform debugging updates.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Data Protection & Security */}
                    <section 
                        id="protection" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Lock size={20} />
                            </span>
                            3. Data Protection & Security
                        </h2>
                        
                        <div className="space-y-4">
                            <p>
                                We implement robust industry-standard encryption protocols (SSL/TLS for data in transit and AES-256 for data at rest) to secure user information. All tenant data is stored in secure cloud database clusters (MongoDB Atlas/Vercel Edge database partners). Payment transactions are encrypted and processed by Razorpay in compliance with the Reserve Bank of India (RBI) security regulations.
                            </p>
                            <div className="flex items-start gap-3 p-4 bg-[#6D5DFD]/5 dark:bg-[#6D5DFD]/10 border border-[#6D5DFD]/10 dark:border-[#6D5DFD]/20 rounded-2xl">
                                <Info className="w-5 h-5 text-[#6D5DFD] shrink-0 mt-0.5" />
                                <span className="text-xs text-[#6D5DFD] font-bold">
                                    Our cloud server operations are continuously monitored for vulnerabilities, ensuring that your enterprise and employee HR data remains secure.
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: Sharing of Information */}
                    <section 
                        id="sharing" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Shield size={20} />
                            </span>
                            4. Sharing of Information
                        </h2>
                        
                        <div className="space-y-4">
                            <p>
                                We do not sell, trade, or rent your personal or organizational data to third parties. We only share information with trusted third-party service providers (like payment gateways, cloud hosting providers, and transactional email services) who assist in running the platform and are bound by strict confidentiality agreements.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 5: Privacy Support Contact */}
                    <section 
                        id="contact" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Building2 size={20} />
                            </span>
                            5. Privacy Support Contact
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                For any privacy or data security questions, please contact our Grievance Officer:
                            </p>
                            
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border border-gray-150 dark:border-gray-850 rounded-3xl space-y-3 max-w-xl text-sm leading-relaxed shadow-sm">
                                <p className="font-extrabold text-gray-900 dark:text-white text-base border-b border-gray-200/50 dark:border-gray-800 pb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#6D5DFD]" /> MACENZA Privacy Office
                                </p>
                                <div className="space-y-2 pt-1">
                                    <div className="flex gap-2.5 items-center">
                                        <Mail size={15} className="text-gray-400 shrink-0" />
                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px] w-20">Email:</span>
                                        <a href="mailto:info@macenza.com" className="hover:text-[#6D5DFD] transition-colors font-semibold text-gray-750 dark:text-gray-200">info@macenza.com</a>
                                    </div>
                                    <div className="flex gap-2.5 items-start">
                                        <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px] w-20 shrink-0">Address:</span>
                                        <span className="text-gray-700 dark:text-gray-300">Siddhart Nagar, Mayo Link Road, Ajmer, Rajasthan, India, 305001</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            
            {/* Redirect Button at the Bottom */}
            <div className="mt-20 pt-8 border-t border-gray-150 dark:border-gray-900 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/register-company?step=3">
                    <Button className="py-5 px-8 text-sm font-black bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2.5 shadow-xl shadow-[#6D5DFD]/20 hover:shadow-2xl hover:shadow-[#6D5DFD]/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
                        ← Back to Checkout & Payment Screen
                    </Button>
                </Link>
            </div>
        </div>
    );
}
