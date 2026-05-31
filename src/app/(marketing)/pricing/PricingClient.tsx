'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface Plan {
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
}

const plans: Plan[] = [
    {
        name: 'Growth',
        price: '$49',
        description: 'Perfect for fast-growing startups and small teams.',
        features: [
            'Up to 50 active employees',
            'Comprehensive directory',
            'Automated Leave management',
            'Basic Payroll calculations',
            'Standard email support (24h)',
        ],
        cta: 'Start Growth Trial',
        popular: false,
    },
    {
        name: 'Professional',
        price: '$129',
        description: 'Optimized for mid-market organizations and scaling companies.',
        features: [
            'Up to 250 active employees',
            'Leave & Attendance check-ins',
            'Automated Disbursement Payroll',
            'Cloudinary excel reporting',
            'Advanced Asset Lifecycle tracking',
            'Dedicated account representative',
        ],
        cta: 'Get Professional Now',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Dedicated cloud instances and specialized compliance for enterprises.',
        features: [
            'Unlimited active employees',
            'Custom dynamic allowances & rates',
            'Granular HR Audit compliance tracking',
            'Unlimited team sprint workspaces',
            '99.9% uptime SLA guarantee',
            '24/7 dedicated telephone support',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function PricingClient() {
    const [currency, setCurrency] = useState('USD');
    const [locale, setLocale] = useState('en-US');

    useEffect(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (timezone.includes('Kolkata')) {
            setCurrency('INR');
            setLocale('en-IN');
        } else if (timezone.includes('London')) {
            setCurrency('GBP');
            setLocale('en-GB');
        } else {
            setCurrency('USD');
            setLocale('en-US');
        }
    }, []);

    // Regional pricing with strict key/value indexing
    const regionalPricing: Record<string, Record<string, number>> = {
        USD: {
            Growth: 49,
            Professional: 129,
        },
        INR: {
            Growth: 1999,
            Professional: 5999,
        },
        GBP: {
            Growth: 39,
            Professional: 99,
        },
    };

    // Format price
    const formatPrice = (planName: string) => {
        const amount =
            regionalPricing[currency]?.[planName] ||
            regionalPricing['USD'][planName] || 0;

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Plans Crafted to Scale <br />
                    <span className="bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent">
                        With Your Global Organization
                    </span>
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400">
                    No hidden setup fees. Upgrade or downgrade plans directly at any time.
                    Start with a 14-day free trial on us.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((p, idx) => (
                    <div
                        key={idx}
                        className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                            p.popular
                                ? 'bg-white dark:bg-gray-900 border-[#6D5DFD] shadow-lg scale-105 z-10 dark:shadow-none'
                                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        {/* Popular badge */}
                        {p.popular && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white bg-[#6D5DFD] text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                                Most Popular
                            </span>
                        )}

                        <div>
                            {/* Plan Name & Price */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {p.name}
                                </h3>

                                <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">
                                    {p.description}
                                </p>

                                <div className="mt-4 flex items-baseline gap-1 text-gray-900 dark:text-white">
                                    <span className="text-4xl font-extrabold tracking-tight">
                                        {p.price === 'Custom'
                                            ? 'Custom'
                                            : formatPrice(p.name)}
                                    </span>

                                    {p.price !== 'Custom' && (
                                        <span className="text-sm font-medium text-gray-500">
                                            /month
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                                {p.features.map((f, fIdx) => (
                                    <li
                                        key={fIdx}
                                        className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={12} strokeWidth={3} />
                                        </div>

                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA button */}
                        <div className="mt-8">
                            <Link
                                href={p.price === 'Custom' ? '/contact' : '/signup'}
                                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 ${
                                    p.popular
                                        ? 'bg-[#6D5DFD] hover:bg-[#5B4DF0] text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                        : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-850 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800'
                                }`}
                            >
                                {p.cta}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}