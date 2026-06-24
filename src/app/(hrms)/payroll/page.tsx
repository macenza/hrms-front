// src/app/(hrms)/payroll/page.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Download, 
    PlayCircle, 
    FileSpreadsheet, 
    Loader2, 
    Calendar, 
    Users, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    History, 
    IndianRupee,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store/hooks';
import { payrollService } from '@/services/payrollService';
import { 
    useRealTimeAccrual, 
    useFinalizeMonth, 
    usePayrollBatches, 
    useRunPayroll, 
    useBatchRecords,
    usePayrollBatchByPeriod
} from '@/hooks/api/usePayroll';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import PayrollSummaryCards from '@/components/payroll/PayrollSummaryCards';
import PayrollDataTable, { type PayrollAccrualRow } from '@/components/payroll/PayrollDataTable';
import PayrollDetailsDrawer from '@/components/payroll/PayrollDetailsDrawer';

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

const PROCESSING_STEPS = [
    "Fetching employee contracts & identity data...",
    "Retrieving attendance rosters & identifying unpaid leaves...",
    "Computing LWP (Leave Without Pay) deductions...",
    "Verifying active loans & capping EMI adjustments...",
    "Calculating basic salary & dynamic HRA allowances...",
    "Deducting employee PF, ESIC & tax contributions...",
    "Validating mathematical net payable salary parameters...",
    "Structuring enterprise spreadsheet columns...",
    "Finalizing calculation batch and uploading report..."
];

const getProcessingStep = (progress: number) => {
    if (progress < 15) return PROCESSING_STEPS[0];
    if (progress < 30) return PROCESSING_STEPS[1];
    if (progress < 45) return PROCESSING_STEPS[2];
    if (progress < 60) return PROCESSING_STEPS[3];
    if (progress < 70) return PROCESSING_STEPS[4];
    if (progress < 80) return PROCESSING_STEPS[5];
    if (progress < 90) return PROCESSING_STEPS[6];
    if (progress < 98) return PROCESSING_STEPS[7];
    return PROCESSING_STEPS[8];
};

export default function PayrollDashboard() {
    const router = useRouter();

    // RBAC
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canManagePayroll = role === 'hr' || role === 'admin';

    // Pagination for Real-Time main table
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [payrollSearch, setPayrollSearch] = useState('');

    // Employee details drawer
    const [selectedEmployee, setSelectedEmployee] = useState<PayrollAccrualRow | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleRowClick = (row: PayrollAccrualRow) => {
        setSelectedEmployee(row);
        setIsDrawerOpen(true);
    };

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Queries & Mutations
    const { data: periodData, isLoading: isPeriodLoading, isError: isPeriodError } = usePayrollBatchByPeriod(selectedMonth, selectedYear);
    const { data: batches, isLoading: isBatchesLoading } = usePayrollBatches(isAuthenticated && canManagePayroll);
    
    const runPayrollMutation = useRunPayroll();
    const finalizeMonthMutation = useFinalizeMonth();

    const handleRunPayrollDirect = async () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
            toast.error("Payroll cannot be calculated for upcoming months.");
            return;
        }

        if (!window.confirm(`Are you sure you want to run payroll for ${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}?`)) {
            return;
        }

        try {
            await runPayrollMutation.mutateAsync({ month: selectedMonth, year: selectedYear });
            toast.success("Payroll batch processing started! It will run in the background.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to start payroll batch.");
        }
    };

    const handleFinalizeDirect = async () => {
        if (!window.confirm(`Are you sure you want to finalize payroll for ${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}? This will lock all calculations permanently.`)) {
            return;
        }
        try {
            await finalizeMonthMutation.mutateAsync({ month: selectedMonth, year: selectedYear });
            toast.success("Payroll finalized successfully!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to finalize payroll.");
        }
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadExcel = async (batchId: string, month: number, year: number) => {
        if (!batchId) return;
        try {
            setIsExporting(true);
            toast.info("Preparing Excel sheet...");
            const blob = await payrollService.exportBatchExcel(batchId);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `payroll_${month}_${year}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            toast.success('Excel sheet exported successfully!');
        } catch (error: any) {
            console.error('Failed to export Excel sheet:', error);
            toast.error(error?.response?.data?.message || 'Failed to export Excel sheet.');
        } finally {
            setIsExporting(false);
        }
    };

    // Map records from batch records
    const accruals = useMemo(() => {
        if (!periodData || !periodData.records) return [];
        return periodData.records.map((rec: any) => ({
            _id: rec._id,
            employee: {
                _id: rec.employeeId?._id || rec.employeeId,
                name: rec.employeeName,
                employeeId: rec.empIdString,
                profile: {
                    employment: {
                        department: rec.department,
                        designation: rec.employeeId?.profile?.employment?.designation || "N/A"
                    }
                }
            },
            month: periodData.batch.month,
            year: periodData.batch.year,
            daysConsidered: rec.workingDays,
            daysAttended: rec.daysAttended,
            lwpDays: rec.leave,
            loanDeduction: rec.fixedDeductions?.advances || 0,
            accruedGross: rec.grossTotal,
            accruedAllowances: rec.allowancesSnapshot?.reduce((sum: number, a: any) => sum + (a.amount || 0), 0) || 0,
            accruedDeductions: rec.totalDeduction,
            accruedNetPay: rec.netPayable,
            lastCalculatedDate: rec.updatedAt || rec.createdAt,

            // Detailed day counts and breakdowns
            totalCalendarDays: rec.totalDaysInMonth,
            workingDaysCount: rec.workingDays,
            presentDays: rec.presentDays,
            absentDays: rec.absentDays,
            paidLeaveDays: rec.paidLeave,
            unpaidLeaveDays: rec.unpaidLeaveDays,
            holidaysCount: rec.holidaysCount,
            weekendsCount: rec.weekendsCount,
            paidDays: rec.daysAttended,
            preJoiningDays: rec.preJoiningDays,
            totalDays: rec.totalDays,
            payableEarnings: rec.payableEarnings,
            ctc: rec.ctc,
            perDaySalary: rec.totalDaysInMonth > 0 ? (rec.grossTotal / rec.totalDaysInMonth) : (rec.perDaySalary || 0),
            basicSalary: rec.basic,
            basic: rec.basic,
            lwpDeduction: rec.lwpDeduction,
            allowancesSnapshot: rec.allowancesSnapshot || [],
            customDeductionsSnapshot: rec.customDeductionsSnapshot || [],
            fixedDeductions: rec.fixedDeductions,
            payslipPdfUrl: rec.payslipPdfUrl
        }));
    }, [periodData]);

    // Filter by search term on client
    const filteredAccruals = useMemo(() => {
        const term = payrollSearch.toLowerCase().trim();
        if (!term) return accruals;
        return accruals.filter((r: any) => {
            const name = (r.employee?.name || '').toLowerCase();
            const empId = (r.employee?.employeeId || '').toLowerCase();
            const dept = (r.employee?.profile?.employment?.department || '').toLowerCase();
            return name.includes(term) || empId.includes(term) || dept.includes(term);
        });
    }, [accruals, payrollSearch]);

    // Paginate client-side
    const paginatedAccruals = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredAccruals.slice(start, start + limit);
    }, [filteredAccruals, page, limit]);

    // Summary card data computed from batch statistics or aggregates
    const summaryData = useMemo(() => {
        if (!periodData || !periodData.batch || !accruals.length) {
            return {
                totalEmployees: 0,
                totalGrossAccrued: 0,
                totalDeductions: 0,
                totalNetPayroll: 0,
            };
        }
        
        const totalGross = accruals.reduce((sum: number, r: any) => sum + r.accruedGross, 0);
        const totalDeductions = accruals.reduce((sum: number, r: any) => sum + r.accruedDeductions + (r.lwpDeduction || 0), 0);
        const totalNet = accruals.reduce((sum: number, r: any) => sum + r.accruedNetPay, 0);
        
        return {
            totalEmployees: periodData.batch.totalEmployees || accruals.length,
            totalGrossAccrued: totalGross,
            totalDeductions: totalDeductions,
            totalNetPayroll: totalNet,
        };
    }, [periodData, accruals]);



    // Recently completed active UI banner state (auto-dismiss after 60 seconds)
    const [recentlyCompleted, setRecentlyCompleted] = useState<{ id: string; month: number; year: number; excelFileUrl: string; totalEmployees: number } | null>(null);
    const prevActiveBatchIdRef = useRef<string | null>(null);
    const [countdown, setCountdown] = useState<number>(60);

    useEffect(() => {
        const currentlyProcessing = batches?.find((b: any) => b.status === 'Processing');
        if (currentlyProcessing) {
            prevActiveBatchIdRef.current = currentlyProcessing._id;
        } else if (prevActiveBatchIdRef.current) {
            const completedBatch = batches?.find((b: any) => b._id === prevActiveBatchIdRef.current && b.status === 'Completed');
            if (completedBatch) {
                setRecentlyCompleted({
                    id: completedBatch._id,
                    month: completedBatch.month,
                    year: completedBatch.year,
                    excelFileUrl: completedBatch.excelFileUrl,
                    totalEmployees: completedBatch.totalEmployees
                });
                setCountdown(60);
                toast.success("Payroll batch completed successfully!");
            }
            prevActiveBatchIdRef.current = null;
        }
    }, [batches]);

    useEffect(() => {
        if (!recentlyCompleted) return;
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setRecentlyCompleted(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [recentlyCompleted]);

    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const selectedBatch = batches?.find((b: any) => b._id === selectedBatchId);
    const isSelectedBatchProcessing = selectedBatch?.status === 'Processing';

    // Batch calculations hook (polls every 2s if selected batch is processing)
    const { data: batchRecords, isLoading: isRecordsLoading } = useBatchRecords(
        selectedBatchId,
        isSelectedBatchProcessing
    );

    const isProcessing = batches?.some((b: any) => b.status === 'Processing');

    // Parallel calculations hook for background processing banner
    const activeProcessingBatch = batches?.find((b: any) => b.status === 'Processing');
    const { data: activeBatchRecords } = useBatchRecords(
        activeProcessingBatch?._id || null,
        !!activeProcessingBatch
    );

    useEffect(() => {
        if (isAuthenticated && !canManagePayroll) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, canManagePayroll, router]);



    const handleSearchChange = (term: string) => {
        setPayrollSearch(term);
        setPage(1);
    };

    const getExcelDownloadUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
        return `${backendBaseUrl}${url}`;
    };

    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return <Badge variant="success" className="gap-1"><CheckCircle2 size={14} /> Completed</Badge>;
            case 'Processing': return <Badge variant="warning" className="gap-1 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/60"><Loader2 size={14} className="animate-spin" /> Processing</Badge>;
            case 'Failed': return <Badge variant="error" className="gap-1"><AlertCircle size={14} /> Failed</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    if (!isAuthenticated || !canManagePayroll) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }



    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-900 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                            Unified Monthly Payroll
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Manage draft runs and lock monthly finalized records.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Current Period Badge */}
                        <div className="h-10 px-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 shadow-sm animate-in fade-in duration-300">
                            <Calendar size={15} />
                            <span>Current Period: {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => router.push('/payroll/history')}
                            className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm h-10 font-bold text-xs"
                        >
                            <History size={16} />
                            <span>Payroll History</span>
                        </Button>

                        {periodData?.batch?.isFinalized ? (
                            <Badge variant="success" className="gap-1.5 h-10 px-4 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                                <CheckCircle2 size={16} /> Finalized / Read-Only
                            </Badge>
                        ) : null}

                        {periodData?.batch?.status === 'Completed' && (
                            <Button
                                variant="outline"
                                onClick={() => handleDownloadExcel(periodData.batch._id, periodData.batch.month, periodData.batch.year)}
                                disabled={isExporting}
                                className="gap-2 bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-455 hover:text-emerald-750 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 shadow-sm whitespace-nowrap h-10 font-bold text-xs"
                            >
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                <span>Export to Excel</span>
                            </Button>
                        )}
                    </div>
                </div>

                {!isPeriodLoading && !periodData?.batch ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900/30">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-905 dark:text-gray-100">
                            No payroll batch generated for this month
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md font-medium">
                            Payroll calculations have not been processed for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}. Start a new calculations batch to get started.
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleRunPayrollDirect}
                            disabled={runPayrollMutation.isPending}
                            className="mt-6 gap-2 shadow-md shadow-blue-500/20 font-bold h-11 px-6 text-sm"
                        >
                            {runPayrollMutation.isPending ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <PlayCircle size={18} />
                            )}
                            Run Payroll Batch
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* ── Payroll Summary Cards ── */}
                        <PayrollSummaryCards data={summaryData} isLoading={isPeriodLoading} />

                        {/* ── Payroll Data Table ── */}
                        <PayrollDataTable
                            data={paginatedAccruals}
                            isLoading={isPeriodLoading}
                            isError={isPeriodError}
                            page={page}
                            totalCount={filteredAccruals.length}
                            pageSize={limit}
                            onPageChange={(p) => setPage(p)}
                            onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                            searchTerm={payrollSearch}
                            onSearchChange={handleSearchChange}
                            onRowClick={handleRowClick}
                        />
                    </>
                )}

                {/* Real-time Payroll Processing UI block (Asynchronous Batch calculations progress banner) */}
                {activeProcessingBatch ? (
                    <Card className="border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-md animate-in fade-in zoom-in duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between text-blue-900 dark:text-blue-100 font-bold">
                                <div className="flex items-center gap-2.5">
                                    <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
                                    <span>Active Calculations Processing (Background Job)</span>
                                </div>
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Period: <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {MONTHS.find(m => m.value === activeProcessingBatch.month)?.label} {activeProcessingBatch.year}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-450 animate-pulse flex items-center gap-1.5">
                                        <Clock size={13} />
                                        <span>Current Stage: {getProcessingStep(Math.min(100, Math.round(((activeBatchRecords?.length || 0) / (activeProcessingBatch.totalEmployees || 1)) * 100)))}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start border-t md:border-t-0 pt-2 md:pt-0">
                                    <span className="text-xs font-mono font-bold bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                                        Calculated: {activeBatchRecords?.length || 0} / {activeProcessingBatch.totalEmployees || 0}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedBatchId(activeProcessingBatch._id)}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50/50 dark:border-blue-900 dark:hover:bg-blue-950/40 text-xs font-semibold px-3 py-1.5 h-auto flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Clock size={13} />
                                        View Live Stream
                                    </Button>
                                </div>
                            </div>

                            {/* Modern Progress Bar */}
                            <div className="space-y-1">
                                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${Math.min(100, Math.round(((activeBatchRecords?.length || 0) / (activeProcessingBatch.totalEmployees || 1)) * 100))}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end text-[10px] text-gray-400 dark:text-gray-550 font-mono">
                                    {Math.min(100, Math.round(((activeBatchRecords?.length || 0) / (activeProcessingBatch.totalEmployees || 1)) * 100))}% Complete
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : recentlyCompleted ? (
                    <Card className="border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-md animate-in fade-in zoom-in duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between text-emerald-900 dark:text-emerald-100 font-bold">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-455" />
                                    <span>Payroll Generation Completed Successfully!</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setRecentlyCompleted(null)}
                                    className="h-7 w-7 p-0 rounded-full text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                >
                                    ✕
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Period: <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {MONTHS.find(m => m.value === recentlyCompleted.month)?.label} {recentlyCompleted.year}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Calculations generated for <span className="font-bold">{recentlyCompleted.totalEmployees}</span> employees.
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start border-t md:border-t-0 pt-2 md:pt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedBatchId(recentlyCompleted.id)}
                                        className="text-emerald-750 border-emerald-250 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-950/40 text-xs font-semibold px-3 py-1.5 h-auto"
                                    >
                                        View Calculations
                                    </Button>
                                    {recentlyCompleted && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleDownloadExcel(recentlyCompleted.id, recentlyCompleted.month, recentlyCompleted.year)}
                                            disabled={isExporting}
                                            className="bg-emerald-650 hover:bg-emerald-700 text-white border-none flex items-center gap-1.5 font-bold transition-all text-xs px-3 py-1.5 h-auto shadow-sm shadow-emerald-500/20"
                                        >
                                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                                            Download Excel
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-550 border-t border-emerald-100 dark:border-emerald-900/40 pt-2 font-medium">
                                <span>Status: <span className="text-emerald-600 dark:text-emerald-450 font-bold uppercase font-sans">Completed</span></span>
                                <span>Hiding automatically in <span className="font-bold text-gray-600 dark:text-gray-400 font-mono">{countdown}s</span>...</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Batch Calculations Preview Modal */}
                <Modal
                    isOpen={!!selectedBatchId}
                    onClose={() => setSelectedBatchId(null)}
                    title={isSelectedBatchProcessing ? "Active Calculations Stream" : "Batch Calculations Preview"}
                    className="max-w-5xl"
                >
                    <div className="space-y-4">
                        {isSelectedBatchProcessing && (
                            <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Loader2 size={20} className="animate-spin" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Live Calculation Streaming...</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Showing calculations in real-time as they are written to database.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                                        Processed: {batchRecords?.length || 0} / {selectedBatch?.totalEmployees || 0}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
                            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-150 dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 py-3.5">S.No</th>
                                        <th className="px-4 py-3.5">Emp ID</th>
                                        <th className="px-4 py-3.5">Employee Name</th>
                                        <th className="px-4 py-3.5">Department</th>
                                        <th className="px-4 py-3.5 text-center">Days (Total/Attended/LWP)</th>
                                        <th className="px-4 py-3.5">Basic Salary</th>
                                        <th className="px-4 py-3.5">Gross Total</th>
                                        <th className="px-4 py-3.5 text-red-500">Total Deduction</th>
                                        <th className="px-4 py-3.5 text-emerald-600">Net Payable</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                    {isRecordsLoading ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-500" />
                                                <span className="block mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">Loading calculation records...</span>
                                            </td>
                                        </tr>
                                    ) : batchRecords?.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No calculation records found for this batch.
                                            </td>
                                        </tr>
                                    ) : (
                                        batchRecords?.map((rec: any, idx: number) => (
                                            <tr key={rec._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                                <td className="px-4 py-3 text-gray-450 dark:text-gray-500 font-mono text-xs">{idx + 1}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-455 font-mono text-xs">{rec.empIdString || 'N/A'}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{rec.employeeName}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-medium">{rec.department || 'N/A'}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-mono text-xs">
                                                    {rec.totalDaysInMonth} / {rec.daysAttended} / <span className={rec.leave > 0 ? "text-red-500 font-bold" : ""}>{rec.leave}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">₹{rec.basic?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 font-mono text-xs">₹{rec.grossTotal?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-red-500 dark:text-red-400 font-mono text-xs">₹{(rec.totalDeduction + (rec.fixedDeductions?.unpaidLeaveDeduction || rec.lwpDeduction || 0))?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">₹{rec.netPayable?.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedBatchId(null)}
                                className="h-10 px-5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* ── Employee Payroll Details Drawer ── */}
                <PayrollDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => { setIsDrawerOpen(false); setSelectedEmployee(null); }}
                    data={selectedEmployee}
                />

            </div>
        </div>
    );
}