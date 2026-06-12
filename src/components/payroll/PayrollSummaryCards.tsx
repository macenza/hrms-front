// src/components/payroll/PayrollSummaryCards.tsx
'use client';

import React from 'react';
import { Users, IndianRupee, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

// ─── PROPS ──────────────────────────────────────────────────────
export interface PayrollSummaryData {
    totalEmployees: number;
    totalGrossAccrued: number;
    totalDeductions: number;
    totalNetPayroll: number;
}

interface PayrollSummaryCardsProps {
    data: PayrollSummaryData;
    isLoading?: boolean;
}

interface SummaryCardDef {
    title: string;
    description: string;
    value: string | number;
    icon: React.ElementType;
    iconBg: string;
    accentText: string;
    trendBg: string;
    trend: string;
}

// ─── SKELETON CARD ──────────────────────────────────────────────
function SkeletonCard() {
    return (
        <Card className="p-6 min-h-[160px] animate-pulse">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800/50" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className="h-9 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-7 w-14 rounded bg-gray-100 dark:bg-gray-800/50" />
            </div>
        </Card>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function PayrollSummaryCards({ data, isLoading = false }: PayrollSummaryCardsProps) {
    const cards: SummaryCardDef[] = [
        {
            title: 'Total Employees',
            description: 'Active headcount in payroll',
            value: data.totalEmployees,
            icon: Users,
            iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
            accentText: 'text-blue-600 dark:text-blue-400',
            trendBg: 'bg-blue-50 dark:bg-blue-500/10',
            trend: 'Active',
        },
        {
            title: 'Total Gross Accrued',
            description: 'Month-to-date gross earnings',
            value: formatINR(data.totalGrossAccrued),
            icon: IndianRupee,
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
            accentText: 'text-emerald-600 dark:text-emerald-400',
            trendBg: 'bg-emerald-50 dark:bg-emerald-500/10',
            trend: 'MTD',
        },
        {
            title: 'Total Deductions',
            description: 'PF, ESIC, taxes & LWP',
            value: formatINR(data.totalDeductions),
            icon: TrendingDown,
            iconBg: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
            accentText: 'text-red-600 dark:text-red-400',
            trendBg: 'bg-red-50 dark:bg-red-500/10',
            trend: data.totalGrossAccrued > 0
                ? `${Math.round((data.totalDeductions / data.totalGrossAccrued) * 100)}%`
                : '0%',
        },
        {
            title: 'Total Net Payroll',
            description: 'Disbursable amount',
            value: formatINR(data.totalNetPayroll),
            icon: Wallet,
            iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
            accentText: 'text-violet-600 dark:text-violet-400',
            trendBg: 'bg-violet-50 dark:bg-violet-500/10',
            trend: 'Final',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={card.title}
                        className="p-6 min-h-[160px] flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5"
                    >
                        {/* Top: Icon + Label */}
                        <div className="flex items-center gap-3.5 mb-5">
                            <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors", card.iconBg)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">
                                    {card.title}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1 leading-relaxed">
                                    {card.description}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Bottom: Value + Badge */}
                        <div className="flex items-end justify-between">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-100 transition-colors leading-none">
                                {card.value}
                            </span>
                            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors", card.trendBg)}>
                                <span className={cn("text-xs font-bold", card.accentText)}>
                                    {card.trend}
                                </span>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
