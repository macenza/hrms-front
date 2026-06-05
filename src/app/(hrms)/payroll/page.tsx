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
import { 
    useRealTimeAccrual, 
    usePayrollHistory, 
    useFinalizeMonth, 
    usePayrollBatches, 
    useRunPayroll, 
    useBatchRecords 
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

    // Pagination for History Snapshot Table inside modal
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLimit, setHistoryLimit] = useState(5);

    // Modals visibility
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);

    // Employee details drawer
    const [selectedEmployee, setSelectedEmployee] = useState<PayrollAccrualRow | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleRowClick = (row: PayrollAccrualRow) => {
        setSelectedEmployee(row);
        setIsDrawerOpen(true);
    };

    // History Modal Tab: 'batches' | 'snapshots'
    const [activeHistoryTab, setActiveHistoryTab] = useState<'batches' | 'snapshots'>('batches');

    // Run batch inputs
    const [runMonth, setRunMonth] = useState<number>(new Date().getMonth() + 1);
    const [runYear, setRunYear] = useState<number>(new Date().getFullYear());

    // Finalize Snapshot inputs
    const [finalizeMonthVal, setFinalizeMonthVal] = useState<number>(new Date().getMonth() + 1);
    const [finalizeYearVal, setFinalizeYearVal] = useState<number>(new Date().getFullYear());

    // Queries & Mutations
    const { data: accrualData, isLoading: isAccrualLoading, isError: isAccrualError, refetch: refetchAccrual } = useRealTimeAccrual(page, limit);
    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory } = usePayrollHistory(historyPage, historyLimit);
    const { data: batches, isLoading: isBatchesLoading } = usePayrollBatches(isAuthenticated && canManagePayroll);
    
    const runPayrollMutation = useRunPayroll();
    const finalizeMonthMutation = useFinalizeMonth();

    // Accruals Pagination variables
    const accruals = accrualData?.data || [];
    const accrualsTotal = accrualData?.totalCount || 0;
    const accrualsPages = Math.ceil(accrualsTotal / limit) || 1;

    // Summary card data computed from current page accruals
    const summaryData = useMemo(() => ({
        totalEmployees: accrualsTotal,
        totalGrossAccrued: accruals.reduce((sum: number, a: any) => sum + (a.accruedGross || 0), 0),
        totalDeductions: accruals.reduce((sum: number, a: any) => sum + (a.accruedDeductions || 0), 0),
        totalNetPayroll: accruals.reduce((sum: number, a: any) => sum + (a.accruedNetPay || 0), 0),
    }), [accruals, accrualsTotal]);

    // History Pagination variables
    const historyBatches = historyData?.data || [];
    const historyTotal = historyData?.totalCount || 0;
    const historyPages = Math.ceil(historyTotal / historyLimit) || 1;

    const availablePeriods = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const availableYears = Array.from(new Set(availablePeriods.map(p => p.year)));
    const availableMonths = MONTHS.filter(m => availablePeriods.some(p => p.month === m.value && p.year === runYear));

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    useEffect(() => {
        if (runYear === currentYear && runMonth > currentMonth) {
            setRunMonth(currentMonth);
        }
    }, [runYear, runMonth, currentYear, currentMonth]);

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

    // Batch Preview State
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const selectedBatch = batches?.find((b: any) => b._id === selectedBatchId) || historyBatches?.find((b: any) => b._id === selectedBatchId);
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

    const handleFinalizeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (finalizeYearVal > currentYear || (finalizeYearVal === currentYear && finalizeMonthVal > currentMonth)) {
            toast.error("Payroll cannot be calculated for upcoming months.");
            return;
        }

        try {
            await finalizeMonthMutation.mutateAsync({ month: finalizeMonthVal, year: finalizeYearVal });
            toast.success("Payroll finalized and snapshot successfully archived!");
            setIsFinalizeModalOpen(false);
            refetchAccrual();
            refetchHistory();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to finalize payroll.");
        }
    };

    const handleRunPayrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final secure validation
        if (runYear > currentYear || (runYear === currentYear && runMonth > currentMonth)) {
            toast.error("Payroll cannot be calculated for upcoming months.");
            return;
        }

        try {
            await runPayrollMutation.mutateAsync({ month: runMonth, year: runYear });
            toast.success("Payroll batch processing started! It will run in the background.");
            setIsRunModalOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to start payroll batch.");
        }
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
                            Continuous Rolling Payroll
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Monitor real-time monthly accruals and manage payroll historical records.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsHistoryModalOpen(true)} 
                            className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm whitespace-nowrap"
                        >
                            <History size={16} />
                            <span className="hidden sm:inline">Payroll History & Batches</span>
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => setIsFinalizeModalOpen(true)} 
                            disabled={finalizeMonthMutation.isPending}
                            className="gap-2 shadow-sm font-semibold shadow-blue-500/20 whitespace-nowrap"
                        >
                            {finalizeMonthMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <PlayCircle size={16} />
                            )}
                            <span className="hidden sm:inline">Finalize Current Month</span>
                        </Button>
                    </div>
                </div>

                {/* ── Payroll Summary Cards ── */}
                <PayrollSummaryCards data={summaryData} isLoading={isAccrualLoading} />

                {/* ── Payroll Data Table ── */}
                <PayrollDataTable
                    data={accruals}
                    isLoading={isAccrualLoading}
                    isError={isAccrualError}
                    page={page}
                    totalCount={accrualsTotal}
                    pageSize={limit}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                    searchTerm={payrollSearch}
                    onSearchChange={setPayrollSearch}
                    onRowClick={handleRowClick}
                />

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
                                    {recentlyCompleted.excelFileUrl && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => window.open(getExcelDownloadUrl(recentlyCompleted.excelFileUrl), '_blank')}
                                            className="bg-emerald-650 hover:bg-emerald-700 text-white border-none flex items-center gap-1.5 font-bold transition-all text-xs px-3 py-1.5 h-auto shadow-sm shadow-emerald-500/20"
                                        >
                                            <FileSpreadsheet size={14} />
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

               

                {/* Finalize Month Modal */}
                <Modal
                    isOpen={isFinalizeModalOpen}
                    onClose={() => setIsFinalizeModalOpen(false)}
                    title="Finalize Payroll Month"
                >
                    <form onSubmit={handleFinalizeSubmit} className="space-y-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                            <strong>Note:</strong> Freezing the payroll month will lock the real-time accruals MTD, generate the final payslips ledger, generate the finalized Excel report, and archive it permanently.
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Month</label>
                            <select
                                value={finalizeMonthVal}
                                onChange={(e) => setFinalizeMonthVal(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer"
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value} className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">{m.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Year</label>
                            <select
                                value={finalizeYearVal}
                                onChange={(e) => setFinalizeYearVal(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer"
                            >
                                <option value={new Date().getFullYear() - 1} className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">{new Date().getFullYear() - 1}</option>
                                <option value={new Date().getFullYear()} className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">{new Date().getFullYear()}</option>
                                <option value={new Date().getFullYear() + 1} className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">{new Date().getFullYear() + 1}</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setIsFinalizeModalOpen(false)}
                                className="h-11 px-5"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={finalizeMonthMutation.isPending}
                                className="h-11 px-6 font-semibold shadow-sm shadow-blue-500/20"
                            >
                                {finalizeMonthMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                )}
                                {finalizeMonthMutation.isPending ? 'Finalizing...' : 'Finalize & Freeze'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Unified Payroll History & Asynchronous Batches Modal */}
                <Modal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    title="Payroll History & Calculation Batches"
                    className="max-w-5xl"
                >
                    <div className="space-y-4">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-2">
                            <button
                                onClick={() => setActiveHistoryTab('batches')}
                                className={cn(
                                    "px-4 py-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer",
                                    activeHistoryTab === 'batches'
                                        ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                Background Run Batches
                            </button>
                            <button
                                onClick={() => setActiveHistoryTab('snapshots')}
                                className={cn(
                                    "px-4 py-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer",
                                    activeHistoryTab === 'snapshots'
                                        ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                Finalized Rolling Snapshots
                            </button>
                        </div>

                        {/* Tab 1: Background Run Batches */}
                        {activeHistoryTab === 'batches' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-850 p-3 rounded-lg border border-gray-150 dark:border-gray-800/80">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Track background asynchronous calculations or execute a new run.
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setIsRunModalOpen(true)}
                                        disabled={runPayrollMutation.isPending || isProcessing}
                                        className={cn(
                                            "gap-2 shadow-sm font-semibold text-xs px-3 py-1.5 h-auto self-end sm:self-auto",
                                            isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                        )}
                                    >
                                        <PlayCircle size={14} />
                                        <span>{isProcessing ? 'Calculations Active' : 'Run New Payroll Batch'}</span>
                                    </Button>
                                </div>

                                <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
                                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                        <thead className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-150 dark:border-gray-800">
                                            <tr>
                                                <th className="px-4 py-3.5">Employee Code</th>
                                                <th className="px-4 py-3.5">Period</th>
                                                <th className="px-4 py-3.5">Employees Processed</th>
                                                <th className="px-4 py-3.5">Generated By</th>
                                                <th className="px-4 py-3.5">Status</th>
                                                <th className="px-4 py-3.5">Date Run</th>
                                                <th className="px-4 py-3.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                            {isBatchesLoading ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                                                        <span className="block mt-2 text-xs font-semibold text-gray-400">Loading payroll batches...</span>
                                                    </td>
                                                </tr>
                                            ) : batches?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-550 font-medium">
                                                        No payroll batches found. Start a batch calculation run to see details here.
                                                    </td>
                                                </tr>
                                            ) : (
                                                batches?.map((batch: any) => (
                                                    <tr key={batch._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                                        <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{batch._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-4 py-3.5 font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors">
                                                            <Calendar size={14} className="text-gray-400 dark:text-gray-550" />
                                                            <span>{MONTHS.find(m => m.value === batch.month)?.label} {batch.year}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex items-center gap-1 text-gray-650 dark:text-gray-350 font-semibold">
                                                                <Users size={14} />
                                                                {batch.totalEmployees || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium text-xs">
                                                            {batch.processedBy?.name || 'System'}
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            {getStatusBadge(batch.status)}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-gray-500 text-xs">
                                                            {new Date(batch.createdAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setSelectedBatchId(batch._id)}
                                                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-blue-100 dark:border-blue-900/60 text-xs px-2.5 py-1.5 h-auto font-semibold"
                                                                >
                                                                    View Calculations
                                                                </Button>
                                                                {batch.status === 'Completed' && batch.excelFileUrl && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => window.open(getExcelDownloadUrl(batch.excelFileUrl), '_blank')}
                                                                        className="text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-1.5 font-bold transition-all text-xs px-2.5 py-1.5 h-auto"
                                                                    >
                                                                        <FileSpreadsheet size={16} />
                                                                        Download
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Finalized Rolling Snapshots */}
                        {activeHistoryTab === 'snapshots' && (
                            <div className="space-y-4">
                                <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
                                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                        <thead className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-150 dark:border-gray-800">
                                            <tr>
                                                <th className="px-4 py-3.5">S.No</th>
                                                <th className="px-4 py-3.5">Batch Name</th>
                                                <th className="px-4 py-3.5">Date Finalized</th>
                                                <th className="px-4 py-3.5">HR Admin Name</th>
                                                <th className="px-4 py-3.5">Status</th>
                                                <th className="px-4 py-3.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                            {isHistoryLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-500" />
                                                        <span className="block mt-2 text-xs font-semibold text-gray-400">Loading snapshot history...</span>
                                                    </td>
                                                </tr>
                                            ) : isHistoryError ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-bold">
                                                        Failed to load snapshot history.
                                                    </td>
                                                </tr>
                                            ) : historyBatches.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-550 font-medium">
                                                        No finalized monthly snapshots found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyBatches.map((batch: any, index: number) => (
                                                    <tr key={batch._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                                        <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{(historyPage - 1) * historyLimit + index + 1}</td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-gray-100">{batch.batchName || `${MONTHS.find(m => m.value === batch.month)?.label} ${batch.year} Payroll`}</td>
                                                        <td className="px-4 py-3.5 text-gray-500 text-xs font-medium">
                                                            {batch.processedAt ? new Date(batch.processedAt).toLocaleString() : new Date(batch.createdAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium text-xs">
                                                            {batch.processedBy?.name || 'System'}
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            {getStatusBadge(batch.status)}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setSelectedBatchId(batch._id)}
                                                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-blue-100 dark:border-blue-900/60 text-xs px-2.5 py-1.5 h-auto font-semibold"
                                                                >
                                                                    View Calculations
                                                                </Button>
                                                                {batch.status === 'Completed' && batch.excelFileUrl && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        onClick={() => window.open(getExcelDownloadUrl(batch.excelFileUrl), '_blank')}
                                                                        className="text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-1 font-bold transition-all text-xs px-2.5 py-1.5 h-auto"
                                                                    >
                                                                        <FileSpreadsheet size={14} />
                                                                        Download Excel
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Modal Snapshots Pagination */}
                                {historyTotal > 0 && (
                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div className="text-xs font-semibold text-gray-500">
                                            Showing <span className="text-gray-900 dark:text-gray-100">{(historyPage - 1) * historyLimit + 1}</span> to{' '}
                                            <span className="text-gray-900 dark:text-gray-100">{Math.min(historyPage * historyLimit, historyTotal)}</span> of{' '}
                                            <span className="text-gray-900 dark:text-gray-100">{historyTotal}</span> snapshots
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                                                disabled={historyPage === 1}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft size={16} />
                                            </Button>
                                            
                                            {Array.from({ length: historyPages }).map((_, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant={historyPage === idx + 1 ? 'primary' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setHistoryPage(idx + 1)}
                                                    className={cn("h-8 w-8 p-0 text-xs font-bold", historyPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900')}
                                                >
                                                    {idx + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setHistoryPage(prev => Math.min(historyPages, prev + 1))}
                                                disabled={historyPage === historyPages}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="h-10 px-5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Run Payroll Dialog Modal */}
                <Modal
                    isOpen={isRunModalOpen}
                    onClose={() => setIsRunModalOpen(false)}
                    title="Generate Payroll Batch"
                >
                    <form onSubmit={handleRunPayrollSubmit} className="space-y-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                            <strong>Note:</strong> Generating payroll runs in the background. It will calculate dynamic allowances, deductions, and attendance records, then generate a downloadable Excel sheet for all active employees.
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">Select Month</label>
                            <select
                                value={runMonth}
                                onChange={(e) => setRunMonth(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer text-gray-900 dark:text-gray-100"
                            >
                                {availableMonths.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-455 dark:text-gray-400 uppercase tracking-wider">Select Year</label>
                            <select
                                value={runYear}
                                onChange={(e) => setRunYear(Number(e.target.value))}
                                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 cursor-pointer text-gray-900 dark:text-gray-100"
                            >
                                {availableYears.map(y => (
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
                                {runPayrollMutation.isPending ? 'Starting...' : 'Start Processing'}
                            </Button>
                        </div>
                    </form>
                </Modal>

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
                                                <td className="px-4 py-3 text-red-500 dark:text-red-400 font-mono text-xs">₹{rec.totalDeduction?.toLocaleString('en-IN')}</td>
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