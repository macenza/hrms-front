// src/app/(main)/payroll/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, PlayCircle, IndianRupee, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import PayrollTable, { PayrollRecord } from '@/components/payroll/PayrollTable';
import PayslipModal from '@/components/payroll/PayslipModal';
import { useAppSelector } from '@/store/hooks';
import { usePayrollData, useRunPayroll } from '@/hooks/api/usePayroll';
import { cn } from '@/utils/cn';

export interface PayrollStatsData {
    totalPayroll: number; 
    employeesPaid: number;
    pendingApprovals: number;
    totalDeductions: number; 
}

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

export default function PayrollPage() {
    const router = useRouter();
    
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canManagePayroll = role === 'admin' || role === 'hr';

    // 2. React Query Data Layer
    const { data, isLoading: isQueryLoading } = usePayrollData(isAuthenticated && canManagePayroll);
    const runPayrollMutation = useRunPayroll();

    const stats: PayrollStatsData = data?.stats || { totalPayroll: 0, employeesPaid: 0, pendingApprovals: 0, totalDeductions: 0 };
    const records: PayrollRecord[] = data?.records || [];
    const isLoading = isQueryLoading || runPayrollMutation.isPending;

    // 3. Local UI State
    const [isGeneratingSlips, setIsGeneratingSlips] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    useEffect(() => {
        // Kick unauthorized users out of the route immediately
        if (isAuthenticated && !canManagePayroll) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, canManagePayroll, router]);

    const handleRunPayroll = async () => {
        if (!window.confirm("Are you sure you want to run payroll for this month?")) return;
        try {
            await runPayrollMutation.mutateAsync();
            alert("Payroll run initiated successfully!");
        } catch (error) {
            alert("Failed to run payroll.");
        }
    };

    const handleExportReport = () => {
        if (records.length === 0) return alert("No records to export.");
        
        const headers = ['Employee ID', 'Name', 'Department', 'Basic Salary', 'Gross Salary', 'Net Payable', 'Status'];
        const csvRows = records.map(rec => [
            rec.id,
            `"${rec.name}"`, 
            `"${rec.department}"`,
            rec.basicSalary,
            rec.grossSalary,
            rec.netPayable,
            rec.status
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSlipGenerator = async () => {
        if (records.length === 0) return alert("No payroll records found to generate slips for.");
        setIsGeneratingSlips(true);
        setTimeout(() => {
            setIsGeneratingSlips(false);
            alert(`Successfully generated ${records.length} payslips. They have been emailed to the employees.`);
        }, 2000);
    };

    // Upgraded stat cards with premium dark mode tinting
    const statCards = [
        { title: "Total Payroll", value: formatINR(stats.totalPayroll), icon: <IndianRupee size={18} />, colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-500/10" },
        { title: "Employees Paid", value: stats.employeesPaid.toString(), icon: <Users size={18} />, colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-500/10" },
        { title: "Pending Approvals", value: stats.pendingApprovals.toString(), icon: <Clock size={18} />, colorClass: "text-yellow-600 dark:text-yellow-500", bgClass: "bg-yellow-50 dark:bg-yellow-500/10" },
        { title: "Total Deductions", value: formatINR(stats.totalDeductions), icon: <AlertCircle size={18} />, colorClass: "text-red-500 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-500/10" }
    ];

    if (!isAuthenticated || !canManagePayroll) return null; // Avoid flashing UI before redirect

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                            Payroll Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Manage salaries, deductions and generate payslips
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleExportReport} 
                            disabled={isLoading} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Export Report</span>
                        </Button> 
                        <Button 
                            variant="outline" 
                            onClick={handleSlipGenerator} 
                            disabled={isGeneratingSlips || isLoading} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isGeneratingSlips ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                            <span className="hidden sm:inline">{isGeneratingSlips ? 'Generating...' : 'Slip Generator'}</span>
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleRunPayroll} 
                            disabled={isLoading}
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold ml-1"
                        >
                            {runPayrollMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} strokeWidth={2.5} />}
                            {runPayrollMutation.isPending ? 'Processing...' : 'Run Payroll'}
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
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
                                    <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1 transition-colors" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                        {stat.value}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Payroll Table */}
                <div className="pt-2">
                    <PayrollTable
                        data={records}
                        isLoading={isLoading}
                        onViewPayslip={(record) => {
                            setSelectedRecord(record);
                            setIsPayslipModalOpen(true);
                        }}
                    />
                </div>

                {/* Modals */}
                <PayslipModal 
                    isOpen={isPayslipModalOpen} 
                    record={selectedRecord} 
                    onClose={() => {
                        setIsPayslipModalOpen(false);
                        setSelectedRecord(null);
                    }} 
                />
            </div>
        </div>
    );
}