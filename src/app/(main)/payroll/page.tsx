// src/app/(main)/payroll/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, PlayCircle, IndianRupee, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import PayrollTable, { PayrollRecord } from '@/components/payroll/PayrollTable';
import { useAppSelector } from '@/store/hooks';
import { usePayrollData, useRunPayroll, useProcessPayment } from '@/hooks/api/usePayroll';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const YEARS = [2024, 2025, 2026, 2027];

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(amount || 0);
};

export default function PayrollPage() {
    const router = useRouter();
    
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canManagePayroll = role === 'hr';

    // 2. Local Query State (Active month/year selection)
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // 3. React Query Data Layer
    const { data, isLoading: isQueryLoading } = usePayrollData(
        selectedMonth, 
        selectedYear, 
        isAuthenticated && canManagePayroll
    );
    const runPayrollMutation = useRunPayroll();
    const processPaymentMutation = useProcessPayment();

    const stats = data?.stats || { totalDraft: 0, totalDisbursed: 0, pendingApprovals: 0, totalDeductions: 0 };
    const records: PayrollRecord[] = data?.records || [];
    const isLoading = isQueryLoading;

    // 4. Local UI Modal State
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [runMonth, setRunMonth] = useState<number>(new Date().getMonth() + 1);
    const [runYear, setRunYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        // Redirect unauthorized roles
        if (isAuthenticated && !canManagePayroll) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, canManagePayroll, router]);

    const handleRunPayrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await runPayrollMutation.mutateAsync({ month: runMonth, year: runYear });
            toast.success(res.message || "Payroll draft generated successfully!");
            // Switch main filter to the generated month/year automatically
            setSelectedMonth(runMonth);
            setSelectedYear(runYear);
            setIsRunModalOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to generate payroll drafts.");
        }
    };

    const handleProcessPayment = async (record: PayrollRecord) => {
        try {
            await processPaymentMutation.mutateAsync(record.dbId);
            toast.success(`Disbursed salary of ${formatINR(record.netPayable)} to ${record.name} successfully!`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Disbursement transaction failed.");
        }
    };

    const handleExportReport = () => {
        if (records.length === 0) return toast.info("No records to export.");
        
        const headers = ['Employee ID', 'Name', 'Department', 'Gross Salary', 'LWP Deduction', 'Loan EMI Deduction', 'Taxes (10%)', 'Net Payable', 'Status', 'Payment Date'];
        const csvRows = records.map(rec => [
            rec.id,
            `"${rec.name}"`, 
            `"${rec.department}"`,
            rec.grossSalary,
            rec.unpaidLeaveDeduction,
            rec.loanDeduction,
            rec.taxDeduction,
            rec.netPayable,
            rec.status,
            rec.paymentDate ? new Date(rec.paymentDate).toLocaleDateString() : 'N/A'
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const currentMonthName = MONTHS.find(m => m.value === selectedMonth)?.label || 'Payroll';
        link.download = `Payroll_Report_${currentMonthName}_${selectedYear}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Payroll report exported successfully!");
    };

    // Advanced dynamic stats card mapping
    const statCards = [
        { 
            title: "Total Payroll (Draft)", 
            value: formatINR(stats.totalDraft), 
            icon: <IndianRupee size={18} />, 
            colorClass: "text-blue-600 dark:text-blue-400", 
            bgClass: "bg-blue-50 dark:bg-blue-500/10" 
        },
        { 
            title: "Total Disbursed", 
            value: formatINR(stats.totalDisbursed), 
            icon: <Users size={18} />, 
            colorClass: "text-emerald-600 dark:text-emerald-400", 
            bgClass: "bg-emerald-50 dark:bg-emerald-500/10" 
        },
        { 
            title: "Pending Approvals", 
            value: stats.pendingApprovals.toString(), 
            icon: <Clock size={18} />, 
            colorClass: "text-yellow-600 dark:text-yellow-500", 
            bgClass: "bg-yellow-50 dark:bg-yellow-500/10" 
        },
        { 
            title: "Total Deductions", 
            value: formatINR(stats.totalDeductions), 
            icon: <AlertCircle size={18} />, 
            colorClass: "text-red-500 dark:text-red-400", 
            bgClass: "bg-red-50 dark:bg-red-500/10" 
        }
    ];

    if (!isAuthenticated || !canManagePayroll) return null; // Avoid UI flash

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150/50 dark:border-gray-900 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                            Payroll Aggregation & Disbursement
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Maker-Checker salary engine calculation & transactional disbursements
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleExportReport} 
                            disabled={isLoading || records.length === 0} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download size={16} />
                            <span>Export Report</span>
                        </Button> 
                        <Button 
                            variant="primary" 
                            onClick={() => setIsRunModalOpen(true)} 
                            disabled={runPayrollMutation.isPending}
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold ml-1"
                        >
                            {runPayrollMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} strokeWidth={2.5} />}
                            <span>Run Payroll</span>
                        </Button>
                    </div>
                </div>

                {/* LEDGER DATE FILTER PANEL */}
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Viewing payroll ledger for: <span className="text-blue-600 dark:text-blue-400">{MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="h-10 px-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none cursor-pointer"
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="h-10 px-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none cursor-pointer"
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Cards Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-all duration-300 overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900/50">
                            <CardContent className="p-5 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-3 transition-colors">
                                    <div className={cn("p-2 rounded-lg transition-colors", stat.bgClass, stat.colorClass)}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">{stat.title}</span>
                                </div>
                                
                                {isQueryLoading ? (
                                    <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                        {stat.value}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Interactive Ledger Table */}
                <div className="pt-2">
                    <PayrollTable
                        data={records}
                        isLoading={isLoading}
                        onProcessPayment={handleProcessPayment}
                        isProcessing={processPaymentMutation.isPending}
                        processingId={processPaymentMutation.variables as string | null}
                    />
                </div>

                {/* Run Payroll Dialog Modal */}
                <Modal
                    isOpen={isRunModalOpen}
                    onClose={() => setIsRunModalOpen(false)}
                    title="Generate Payroll Drafts"
                >
                    <form onSubmit={handleRunPayrollSubmit} className="space-y-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                            Generate draft payroll records for all active employees. This will dynamically aggregate bases, calculate tax deductions (10%), check approved unpaid leaves (LWP), and deduct active EMIs.
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">Select Month</label>
                            <select
                                value={runMonth}
                                onChange={(e) => setRunMonth(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer text-gray-900 dark:text-gray-100"
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">Select Year</label>
                            <select
                                value={runYear}
                                onChange={(e) => setRunYear(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer text-gray-900 dark:text-gray-100"
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setIsRunModalOpen(false)}
                                className="h-11 px-5"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={runPayrollMutation.isPending}
                                className="h-11 px-6 font-semibold shadow-sm shadow-blue-500/20"
                            >
                                {runPayrollMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                )}
                                {runPayrollMutation.isPending ? 'Generating...' : 'Run Engine Draft'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}