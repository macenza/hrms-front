'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Printer, Home, LogIn, Sparkles, Calendar, Building2, CreditCard, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const company = searchParams.get('company') || 'Your Company';
    const plan = searchParams.get('plan') || 'Professional';
    const txn = searchParams.get('txn') || `TXN${Date.now().toString(36).toUpperCase()}`;
    const amount = searchParams.get('amount') || '7999';
    const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
            {/* Background blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-50 dark:bg-emerald-950/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#6D5DFD]/5 dark:bg-[#6D5DFD]/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-[520px] relative z-10">
                {/* Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#6D5DFD] rounded-xl flex items-center justify-center shadow-lg shadow-[#6D5DFD]/30 mb-2">
                        <span className="text-white font-black text-2xl tracking-tighter">M</span>
                    </div>
                </div>

                {/* Success Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    {/* Green header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-0 duration-700">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Payment Successful!</h1>
                        <p className="text-emerald-100 text-sm font-medium mt-1">Your workspace has been created and is ready to use.</p>
                    </div>

                    {/* Receipt Details */}
                    <div className="p-6 sm:p-8 space-y-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <Building2 size={14} className="text-gray-400" /> Company
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{company}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <Sparkles size={14} className="text-gray-400" /> Plan
                                </span>
                                <span className="text-sm font-bold text-[#6D5DFD]">{plan}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <CreditCard size={14} className="text-gray-400" /> Amount
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{Number(amount).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <Hash size={14} className="text-gray-400" /> Transaction ID
                                </span>
                                <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{txn}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <Calendar size={14} className="text-gray-400" /> Payment Date
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{date}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                className="w-full py-5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl border-gray-200 dark:border-gray-700"
                            >
                                <Printer size={16} /> Print Receipt
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/" className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full py-5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl border-gray-200 dark:border-gray-700"
                                    >
                                        <Home size={16} /> Home
                                    </Button>
                                </Link>
                                <Link href="/login?registered=true" className="w-full">
                                    <Button
                                        className="w-full py-5 text-sm font-bold bg-[#6D5DFD] hover:bg-[#5b4eed] text-white flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#6D5DFD]/20 dark:shadow-none"
                                    >
                                        <LogIn size={16} /> Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-gray-400 dark:text-gray-500 text-xs font-medium">
                    &copy; {new Date().getFullYear()} Macenza Tech. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-gray-950">
                <div className="w-8 h-8 border-4 border-[#6D5DFD] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
