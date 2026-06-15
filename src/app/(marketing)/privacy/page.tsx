'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, Info, Cookie, Settings, ShieldAlert, Sparkles,
    Mail, Phone, MapPin, Building2, HelpCircle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CookieAndPrivacyPage() {
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        const sections = ['overview', 'types', 'third-party', 'manage', 'contact'];
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
            {/* Redirect / Back Button to Home Page */}
            <div className="mb-10 flex items-center justify-between">
                <Link href="/">
                    <Button variant="outline" className="flex items-center gap-2 text-sm font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl px-5 py-2.5 transition-all duration-300 hover:shadow-md">
                        <ChevronLeft size={16} className="text-gray-500" /> Back to Home
                    </Button>
                </Link>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                    Cookie Policy Compliance
                </span>
            </div>

            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-4.5 py-2 rounded-full border border-[#6D5DFD]/20">
                    <Sparkles size={12} className="animate-pulse" /> Legal & Privacy
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Cookie Policy
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase">
                    Last Updated: June 11, 2026
                </p>
            </div>

            {/* Intro Alert Box */}
            <div className="mb-12 p-6 bg-purple-50/30 dark:bg-[#6D5DFD]/5 border border-purple-100/50 dark:border-[#6D5DFD]/10 rounded-3xl flex items-start gap-4 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm shadow-sm">
                <div className="p-3 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-2xl text-[#6D5DFD] shrink-0">
                    <Cookie className="w-6 h-6" />
                </div>
                <div className="text-base text-gray-655 dark:text-gray-300 leading-relaxed">
                    This Privacy Policy describes how we collect, use, and share your personal information when you use our platform, with a focused breakdown of our tracking systems, first-party cookie requirements, and compliance guidelines.
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
                            href="#overview" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'overview' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Info size={16} /> 1. General Overview
                        </a>
                        <a 
                            href="#types" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'types' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Cookie size={16} /> 2. Cookie Types
                        </a>
                        <a 
                            href="#third-party" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'third-party' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Settings size={16} /> 3. Third-Party Systems
                        </a>
                        <a 
                            href="#manage" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'manage' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <ShieldAlert size={16} /> 4. Manage Controls
                        </a>
                        <a 
                            href="#contact" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'contact' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Building2 size={16} /> 5. Contact Details
                        </a>
                    </nav>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-3 space-y-10 text-gray-655 dark:text-gray-300 text-base leading-relaxed">
                    
                    {/* SECTION 1: General Overview */}
                    <section 
                        id="overview" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Info size={20} />
                            </span>
                            1. Information We Collect & Scope
                        </h2>
                        
                        <div className="space-y-4">
                            <p>
                                We collect information to provide better services to all our users. This includes information you provide directly (such as name, email address, and company details during sign-up) and information gathered automatically as you navigate our platform.
                            </p>
                            <p>
                                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 2: Cookie Types We Use */}
                    <section 
                        id="types" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Cookie size={20} />
                            </span>
                            2. Cookie Types We Use
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                Below is a detailed review of the functional tracking cookies deployed when accessing the MACENZA portal:
                            </p>

                            <div className="space-y-5">
                                <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Essential / Necessary Cookies</h3>
                                        <span className="px-2.5 py-1 bg-green-55 dark:bg-green-950/45 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-green-200/50 dark:border-green-900/30">Mandatory</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        These cookies are vital to provide you with services available through our site and to enable you to use some of its features. For example, we use the cookie <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs text-[#6D5DFD] font-mono">macenza_cookie_consent</code> to remember whether you accepted or declined our cookie policy. We also use secure token cookies to keep you logged in.
                                    </p>
                                </div>

                                <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Functionality Cookies</h3>
                                        <span className="px-2.5 py-1 bg-[#6D5DFD]/10 text-[#6D5DFD] text-[10px] font-black uppercase tracking-wider rounded-md border border-[#6D5DFD]/20">User Experience</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        These cookies allow our website to remember choices you make when you use our platform, such as remembering your login credentials, preferred language, or system theme (dark/light mode).
                                    </p>
                                </div>

                                <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Analytics & Performance Cookies</h3>
                                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-200/50 dark:border-blue-900/30">Analytics</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        These cookies are used to collect information about traffic to our site and how users interact with our platform. The information gathered does not identify individual visitors. It is aggregated and anonymous.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Third-Party Systems */}
                    <section 
                        id="third-party" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Settings size={20} />
                            </span>
                            3. Third-Party Cookies & Services
                        </h2>
                        
                        <div className="space-y-4">
                            <p>
                                In addition to our first-party cookies, we use trusted third-party integration cookies on our platform to handle analytics and process secure transactions:
                            </p>
                            
                            <div className="space-y-4 pt-2">
                                <div className="flex gap-4 items-start p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="w-2 h-2 bg-[#6D5DFD] rounded-full shrink-0 mt-2" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Google Analytics</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">We use Google Analytics cookies to monitor traffic volumes, understand user navigation patterns, and gather performance data. This information is completely anonymous and helps us optimize our website responsiveness.</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 items-start p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="w-2 h-2 bg-[#6D5DFD] rounded-full shrink-0 mt-2" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Stripe & Razorpay (Payment Gateways)</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">As part of our billing system integration, our third-party payment providers (Stripe and Razorpay) set secure cookies. These cookies are required to process payments securely, prevent fraudulent card transactions, and keep track of your checkout session state.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: Managing Cookies */}
                    <section 
                        id="manage" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <ShieldAlert size={20} />
                            </span>
                            4. Managing and Declining Cookies
                        </h2>
                        
                        <div className="space-y-4">
                            <p>
                                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by selecting your preferences on our <strong>Cookie Consent Banner</strong> when you first visit the site.
                            </p>
                            <p>
                                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 5: Contact Us Details */}
                    <section 
                        id="contact" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Shield size={20} />
                            </span>
                            5. Contact & Privacy Office
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                If you have any questions about this Privacy Policy or our cookie practices, please contact our privacy compliance team:
                            </p>
                            
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border border-gray-150 dark:border-gray-850 rounded-3xl space-y-4 max-w-2xl text-sm leading-relaxed shadow-sm">
                                <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800 pb-3">
                                    <Building2 className="w-5 h-5 text-[#6D5DFD]" />
                                    <p className="font-extrabold text-gray-900 dark:text-white text-base">MACENZA Privacy Officer</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Office Address</p>
                                        <div className="flex gap-2 text-gray-700 dark:text-gray-300">
                                            <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                            <span>Siddhart Nagar, Mayo Link Road, Ajmer, Rajasthan, India, 305001</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Support Email</p>
                                            <div className="flex gap-2 text-gray-700 dark:text-gray-300 items-center">
                                                <Mail size={15} className="text-gray-400 shrink-0" />
                                                <a href="mailto:info@macenza.com" className="hover:text-[#6D5DFD] transition-colors font-semibold">info@macenza.com</a>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Support Line</p>
                                            <div className="flex gap-2 text-gray-700 dark:text-gray-300 items-center">
                                                <Phone size={15} className="text-gray-400 shrink-0" />
                                                <a href="tel:+919414660123" className="hover:text-[#6D5DFD] transition-colors font-semibold">+91 9414660123</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 border-t border-gray-200/50 dark:border-gray-800 pt-3 flex gap-2 items-center">
                                    <HelpCircle size={14} />
                                    <span>Support Hours: Monday to Friday (10:00 AM to 6:00 PM IST)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            
            {/* Redirect Button at the Bottom */}
            <div className="mt-20 pt-8 border-t border-gray-150 dark:border-gray-900 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/">
                    <Button className="py-5 px-8 text-sm font-black bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2.5 shadow-xl shadow-[#6D5DFD]/20 hover:shadow-2xl hover:shadow-[#6D5DFD]/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
                        ← Back to Home Page
                    </Button>
                </Link>
            </div>
        </div>
    );
}
