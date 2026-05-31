// src/app/(main)/my-payroll/page.tsx
'use client';

import React, { useState } from 'react';
import { 
    IndianRupee, 
    Download, 
    FileText, 
    Loader2, 
    Calendar, 
    TrendingUp, 
    ShieldAlert,
    Wallet,
    Percent,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';
import { useMyPayslips } from '@/hooks/api/usePayroll';
import PayslipModal from '@/components/payroll/PayslipModal';
import { PayrollRecord } from '@/components/payroll/PayrollTable';
import { cn } from '@/utils/cn';

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(amount || 0);
};

const getMonthName = (monthNumber: number) => {
    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
};

export default function MyPayrollPage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { data: payslips = [], isLoading, error } = useMyPayslips(isAuthenticated);
    const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate YTD Net Earnings (only paid records of the current year)
    const currentYear = new Date().getFullYear();
    const ytdEarnings = payslips
        .filter((slip: PayrollRecord) => slip.status === 'Paid' && slip.year === currentYear)
        .reduce((sum: number, slip: PayrollRecord) => sum + slip.netPayable, 0);

    // Get the most recent paid slip
    const lastPaidSlip = payslips.find((slip: PayrollRecord) => slip.status === 'Paid');
    const lastNetPay = lastPaidSlip ? lastPaidSlip.netPayable : 0;

    // Calculate cumulative deductions across all payslips
    const totalDeductions = payslips.reduce((sum: number, slip: PayrollRecord) => {
        const tax = slip.taxDeduction || 0;
        const unpaid = slip.unpaidLeaveDeduction || 0;
        return sum + tax + unpaid;
    }, 0);

    const handleViewPayslip = (slip: PayrollRecord) => {
        setSelectedSlip(slip);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Heading Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Wallet className="text-blue-600 dark:text-blue-400" size={32} />
                        My Payroll
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">
                        View, search, and download your monthly paid payslips and earnings summaries.
                    </p>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* YTD Earnings Card */}
                <Card className="border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg dark:shadow-none hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            YTD Net Earnings ({currentYear})
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp size={20} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight flex items-center">
                            <IndianRupee size={26} strokeWidth={2.5} className="mr-0.5 text-blue-600 dark:text-blue-400" />
                            {ytdEarnings.toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Cumulative disbursed take-home pay this calendar year.
                        </p>
                    </CardContent>
                </Card>

                {/* Last Disbursed Salary Card */}
                <Card className="border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg dark:shadow-none hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Last Disbursed Salary
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 group-hover:scale-110 transition-transform duration-300">
                            <IndianRupee size={20} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight flex items-center">
                            <IndianRupee size={26} strokeWidth={2.5} className="mr-0.5 text-emerald-600 dark:text-emerald-450" />
                            {lastNetPay.toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            {lastPaidSlip 
                                ? `Disbursed on ${lastPaidSlip.paymentDate ? new Date(lastPaidSlip.paymentDate).toLocaleDateString() : 'N/A'} for ${getMonthName(lastPaidSlip.month || 0)} ${lastPaidSlip.year}`
                                : 'No disbursed payslips found.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Saved/Deducted Card */}
                <Card className="border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg dark:shadow-none hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Deductions Summary
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 group-hover:scale-110 transition-transform duration-300">
                            <Percent size={20} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight flex items-center">
                            <IndianRupee size={26} strokeWidth={2.5} className="mr-0.5 text-rose-600 dark:text-rose-400" />
                            {totalDeductions.toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Total cumulative tax, leave without pay, and loan deductions.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payslips Table Ledger */}
            <Card className="border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-5">
                    <CardTitle className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                        Payslip Ledger & History
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/75 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                            <tr>
                                <th className="px-6 py-4">Pay Period</th>
                                <th className="px-6 py-4">Gross Earnings</th>
                                <th className="px-6 py-4">Total Deductions</th>
                                <th className="px-6 py-4">Net Disbursed</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4.5 w-24 bg-gray-200 dark:bg-gray-800 rounded font-bold"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : payslips.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">No payslips generated yet</p>
                                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Your paid monthly payslips will appear here once processed by HR.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payslips.map((slip: PayrollRecord) => {
                                    const deductSum = (slip.taxDeduction || 0) + (slip.unpaidLeaveDeduction || 0);
                                    return (
                                        <tr key={slip.dbId} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                {getMonthName(slip.month || 0)} {slip.year}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                                {formatINR(slip.grossSalary)}
                                            </td>
                                            <td className="px-6 py-4 text-rose-500 dark:text-rose-450 font-medium">
                                                {deductSum > 0 ? `-${formatINR(deductSum)}` : '—'}
                                            </td>
                                            <td className="px-6 py-4 font-black text-gray-900 dark:text-gray-100 text-base">
                                                {formatINR(slip.netPayable)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="success" className="font-bold py-1 px-3 border border-emerald-500/20 text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full gap-1">
                                                    Disbursed
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewPayslip(slip)}
                                                    className="shadow-sm font-bold text-xs h-9 px-4 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all gap-1.5"
                                                >
                                                    <FileText size={13} />
                                                    View & Download
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Payslip Print / View Modal */}
            <PayslipModal
                isOpen={isModalOpen}
                record={selectedSlip}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSlip(null);
                }}
            />
        </div>
    );
}
