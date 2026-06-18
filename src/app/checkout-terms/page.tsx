'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, FileText, CreditCard, Sparkles, Shield, RefreshCw, 
    Truck, Mail, Phone, MapPin, Building2, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CheckoutTermsAndConditionsPage() {
    const [activeSection, setActiveSection] = useState('terms');

    useEffect(() => {
        const sections = ['terms', 'refunds', 'pricing', 'shipping', 'contact'];
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
                    <Sparkles size={12} className="animate-pulse" /> SaaS Agreements & Policies
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Terms & Conditions & Compliance Policies
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase">
                    Last Updated: June 11, 2026
                </p>
            </div>

            {/* Intro Info */}
            <div className="mb-12 p-6 bg-purple-50/30 dark:bg-[#6D5DFD]/5 border border-purple-100/50 dark:border-[#6D5DFD]/10 rounded-3xl flex items-start gap-4 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm shadow-sm">
                <div className="p-3 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-2xl text-[#6D5DFD] shrink-0">
                    <FileText className="w-6 h-6" />
                </div>
                <div className="text-base text-gray-655 dark:text-gray-300 leading-relaxed">
                    Welcome to <strong>MACENZA</strong>. These terms govern your use of the MACENZA Human Resource Management System (HRMS) SaaS platform, subscription packages, and payment portals. By signing up, subscribing, or using the platform, you agree to be bound by these legal policies.
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
                            href="#terms" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'terms' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-450 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <FileText size={16} /> 1. Terms & Conditions
                        </a>
                        <a 
                            href="#refunds" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'refunds' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-455 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <RefreshCw size={16} /> 2. Refund & Cancel
                        </a>
                        <a 
                            href="#pricing" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'pricing' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-455 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <CreditCard size={16} /> 3. Pricing Policy
                        </a>
                        <a 
                            href="#shipping" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'shipping' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-455 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Truck size={16} /> 4. Shipping & Delivery
                        </a>
                        <a 
                            href="#contact" 
                            className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-bold transition-all duration-300 rounded-2xl border ${
                                activeSection === 'contact' 
                                    ? 'text-[#6D5DFD] bg-[#6D5DFD]/10 border-[#6D5DFD]/20 dark:bg-[#6D5DFD]/25 dark:border-[#6D5DFD]/35 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-455 hover:text-[#6D5DFD] hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-transparent'
                            }`}
                        >
                            <Shield size={16} /> 5. Contact Details
                        </a>
                    </nav>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-3 space-y-10 text-gray-650 dark:text-gray-300 text-base leading-relaxed">
                    
                    {/* SECTION 1: Terms and Conditions */}
                    <section 
                        id="terms" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-955 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <FileText size={20} />
                            </span>
                            1. Terms and Conditions
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. General Conditions & Eligibility</h3>
                                <p>
                                    To use our Service, you must be a legally registered business entity or an individual of at least 18 years of age capable of entering into a binding contract under the Indian Contract Act, 1872. We reserve the right to refuse service to anyone, at any time, for any reason permissible under applicable law.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Services & Tenant Provisioning</h3>
                                <p>
                                    MACENZA provides a cloud-based B2B Human Resource Management System (HRMS) featuring employee database directory, attendance management, leave tracking, payroll calculation engines, asset tracking, and related administrative modules. Upon successful signup and payment authorization, MACENZA will provision a dedicated workspace instance (e.g., <em>companyname.macenza-hrms.com</em>). The Customer is responsible for maintaining the confidentiality of their administrator account credentials.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Subscription Plans & Billing</h3>
                                <p>
                                    MACENZA offers subscription-based access to the platform. All payments are processed securely through <strong>Razorpay Software Private Limited</strong> and its partner payment gateways. Recurring subscription payments will be charged automatically at the start of each billing cycle (monthly or annually) using the payment method authorized by you, in compliance with RBI e-mandate guidelines.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Acceptable Use Policy</h3>
                                <p>
                                    You agree not to upload, store, or transmit any content that infringes on any intellectual property or proprietary rights, violates any data privacy laws, or contains malicious code, viruses, or malware. You agree not to attempt to reverse engineer, bypass security, or overload the infrastructure of MACENZA.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">5. Intellectual Property</h3>
                                <p>
                                    MACENZA, including its codebase, user interfaces, branding, logos, trademarks, visual design, and documentation, is the exclusive intellectual property of MACENZA. You are granted a limited, non-exclusive, non-transferable, revocable license to access the platform for internal business operations during your active subscription period.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">6. Limitation of Liability</h3>
                                <p>
                                    To the maximum extent permitted by applicable law, MACENZA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or operational disruptions. In no event shall our total aggregate liability exceed the amount paid by you to MACENZA in the three (3) months preceding the claim.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">7. Governing Law & Jurisdiction</h3>
                                <p>
                                    These Terms and your use of the Service shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Ajmer, Rajasthan, India</strong>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Cancellation & Refund Policy */}
                    <section 
                        id="refunds" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <RefreshCw size={20} />
                            </span>
                            2. Cancellation & Refund Policy
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Subscription Cancellation</h3>
                                <p>
                                    <strong>How to Cancel:</strong> You may cancel your MACENZA subscription at any time directly through the Customer Operations Dashboard or by emailing our billing support team at <strong>info@macenza.com</strong>.
                                </p>
                                <p>
                                    <strong>Effective Date:</strong> Upon cancellation, your subscription will remain active until the end of your current paid billing cycle (monthly or annual). You will continue to have access to your workspace and employee data during this time.
                                </p>
                                <p>
                                    <strong>No Auto-Renew:</strong> Once cancelled, your credit card, netbanking, or UPI mandate will not be charged for the next billing cycle, and your account will automatically downgrade or freeze at the end of the term.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Refund Eligibility</h3>
                                <p>
                                    <strong>Standard Subscriptions:</strong> Due to the immediate provisioning of server resources and software access, subscription fees (both monthly and annual) are generally non-refundable once paid.
                                </p>
                                <p>
                                    <strong>Billing Errors:</strong> If you believe you have been billed in error or charged twice for a single transaction, please notify us within 48 hours of the transaction. If validated, we will process a refund for the erroneous transaction.
                                </p>
                                <p>
                                    <strong>Service Disruptions:</strong> If MACENZA experiences a prolonged, unscheduled server outage exceeding 48 consecutive hours that prevents you from using the system, you may be eligible for a pro-rata refund or credit for the affected period, at our sole discretion.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Refund Processing Timeline</h3>
                                <p>
                                    <strong>Method:</strong> Approved refunds will be credited back to the original payment source (Credit/Debit Card, Netbanking, UPI, or Wallet) used at the time of purchase. Payments processed through <strong>Razorpay</strong> will be refunded through the Razorpay API network.
                                </p>
                                <p>
                                    <strong>Timeframe:</strong> Once initiated by MACENZA, it typically takes <strong>5 to 7 business days</strong> (excluding weekends and bank holidays) for the refund to reflect in your bank account or card statement, depending on your financial institution's processing times.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Pricing Policy */}
                    <section 
                        id="pricing" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <CreditCard size={20} />
                            </span>
                            3. Pricing Policy
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                MACENZA offers clear, transparent subscription options tailored to the size and needs of your organization. All transactions are charged in Indian Rupees (INR) for domestic customers and US Dollars (USD) for international customers.
                            </p>

                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Subscription Rates & Limits</h3>
                                
                                {/* Plans Table */}
                                <div className="overflow-x-auto rounded-2xl border border-gray-150 dark:border-gray-900 shadow-md">
                                    <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-450">
                                        <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-205 uppercase text-[10px] tracking-wider font-extrabold border-b border-gray-150 dark:border-gray-900">
                                            <tr>
                                                <th className="px-6 py-4">Plan Level</th>
                                                <th className="px-6 py-4">INR Rate / Mo</th>
                                                <th className="px-6 py-4">USD Rate / Mo</th>
                                                <th className="px-6 py-4">Max Seats</th>
                                                <th className="px-6 py-4">Included Modules</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900 bg-white dark:bg-gray-950">
                                            <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-955 dark:text-white">Growth</td>
                                                <td className="px-6 py-4 font-bold text-[#6D5DFD]">₹3,999</td>
                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">$49</td>
                                                <td className="px-6 py-4 text-xs font-semibold"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-md">50 Employees</span></td>
                                                <td className="px-6 py-4 text-xs">Core HR, Attendance, Leave Manager</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-955 dark:text-white">Professional</td>
                                                <td className="px-6 py-4 font-bold text-[#6D5DFD]">₹9,999</td>
                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">$129</td>
                                                <td className="px-6 py-4 text-xs font-semibold"><span className="px-2 py-1 bg-purple-50 dark:bg-purple-950/30 text-[#6D5DFD] rounded-md">250 Employees</span></td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-450">Core HR, Attendance, Leave, Payroll, Asset Tracking</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-955 dark:text-white">Enterprise</td>
                                                <td className="px-6 py-4 font-bold text-[#6D5DFD]">₹39,999</td>
                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">$499</td>
                                                <td className="px-6 py-4 text-xs font-semibold"><span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-md">9,999 Employees</span></td>
                                                <td className="px-6 py-4 text-xs">All Modules, Dedicated Hosting, Priority SLA</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Taxes and Duties</h3>
                                <p>
                                    For businesses registered in India, <strong>Goods and Services Tax (GST) at the rate of 18%</strong> will be applied at the time of invoicing. Customers claiming input tax credit (ITC) must provide their valid GSTIN (GST Identification Number) and corporate billing address at the time of registration or checkout.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: Shipping and Delivery Policy */}
                    <section 
                        id="shipping" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Truck size={20} />
                            </span>
                            4. Shipping and Delivery Policy
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                MACENZA is a cloud-based Software-as-a-Service (SaaS) application. Since we provide digital services and software subscriptions, there are <strong>no physical goods or shipping logistics involved</strong>.
                            </p>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Delivery Mode</h3>
                                <p>
                                    All MACENZA HRMS platform features, modules, databases, and administrative consoles are delivered entirely online over the internet. No physical CD/DVD, manuals, hardware, or printed materials will be shipped to your billing or physical address.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Delivery Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3.5 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="w-2.5 h-2.5 bg-[#6D5DFD] rounded-full shrink-0 mt-1.5" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">Immediate Instance Setup</p>
                                            <p className="text-xs text-gray-505 mt-0.5">Upon successful transaction authorization via our payment gateway (Razorpay), your business account and tenant database instance will be provisioned automatically.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3.5 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="w-2.5 h-2.5 bg-[#6D5DFD] rounded-full shrink-0 mt-1.5" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">Activation Email Onboarding</p>
                                            <p className="text-xs text-gray-550 mt-0.5">Within 24 hours (usually within 5 minutes) of payment approval, an onboarding confirmation and account activation email will be sent to the corporate email address provided during checkout. This email will contain your dedicated subdomain URL and login credentials.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Delivery Verification & Failures</h3>
                                <p>
                                    If you do not receive your activation email or database access link within 24 hours of successful transaction completion, please contact our support desk at <strong>info@macenza.com</strong> or call <strong>+91 9414660123</strong>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: Contact Us */}
                    <section 
                        id="contact" 
                        className="scroll-mt-24 p-8 bg-white dark:bg-gray-950 border border-gray-150/80 dark:border-gray-900 rounded-3xl shadow-xl shadow-gray-100/5 dark:shadow-none space-y-6"
                    >
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight border-b pb-4 border-gray-100 dark:border-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-xl text-[#6D5DFD]">
                                <Shield size={20} />
                            </span>
                            5. Contact Us Details
                        </h2>
                        
                        <div className="space-y-6">
                            <p>
                                For inquiries, cancellation support, billing errors, or technical questions, please contact our support office:
                            </p>
                            
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-900 dark:to-gray-955 border border-gray-150 dark:border-gray-850 rounded-3xl space-y-4 max-w-2xl text-sm leading-relaxed shadow-sm">
                                <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800 pb-3">
                                    <Building2 className="w-5 h-5 text-[#6D5DFD]" />
                                    <p className="font-extrabold text-gray-900 dark:text-white text-base">MACENZA Solutions</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Registered Office</p>
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
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hotline</p>
                                            <div className="flex gap-2 text-gray-700 dark:text-gray-300 items-center">
                                                <Phone size={15} className="text-gray-400 shrink-0" />
                                                <a href="tel:+919414660123" className="hover:text-[#6D5DFD] transition-colors font-semibold">+91 9414660123</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-450 border-t border-gray-200/50 dark:border-gray-800 pt-3 flex gap-2 items-center">
                                    <HelpCircle size={14} />
                                    <span>Support Hours: Monday to Friday (10:00 AM to 6:00 PM IST)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            
            {/* Redirect Button at the Bottom */}
            <div className="mt-20 pt-8 border-t border-gray-150 dark:border-gray-900 flex items-center justify-center">
                <Link href="/register-company?step=3">
                    <Button className="py-5 px-8 text-sm font-black bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2.5 shadow-xl shadow-[#6D5DFD]/20 hover:shadow-2xl hover:shadow-[#6D5DFD]/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
                        ← Back to Checkout & Payment Screen
                    </Button>
                </Link>
            </div>
        </div>
    );
}
