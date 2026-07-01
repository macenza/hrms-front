// src/app/(hrms)/payroll/history/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Calendar, 
    Users, 
    Clock, 
    FileSpreadsheet, 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Eye,
    CheckCircle2,
    AlertCircle,
    FileDown,
    Send
} from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store/hooks';
import { usePayrollHistory, useBatchRecords } from '@/hooks/api/usePayroll';
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

export default function PayrollHistoryPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canManagePayroll = role === 'hr' || role === 'admin';

    // Filters and Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [selectedMonth, setSelectedMonth] = useState<string>('All');

    // Queries
    const { data: historyData, isLoading, isError, refetch } = usePayrollHistory(page, limit);

    // Detail Modal Batch State
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const selectedBatch = historyData?.data?.find((b: any) => b._id === selectedBatchId);
    const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
    const [isBulkSending, setIsBulkSending] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({
        total: 0,
        sent: 0,
        failed: 0,
        remaining: 0
    });
    
    // Batch records query
    const { data: batchRecords, isLoading: isRecordsLoading, refetch: refetchRecords } = useBatchRecords(
        selectedBatchId,
        selectedBatch?.status === 'Processing'
    );

    const handleDownloadPayslip = async (rec: any) => {
        try {
            toast.info(`Preparing payslip download for ${rec.employeeName}...`);
            const blob = await payrollService.downloadPayslip(rec._id);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `payslip_${rec.employeeName.replace(/\s+/g, '_')}_${selectedBatch ? MONTHS.find((m) => m.value === selectedBatch.month)?.label + '_' + selectedBatch.year : ''}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            toast.success("Payslip downloaded successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to download payslip.");
        }
    };

    const handleSendPayslip = async (rec: any) => {
        if (sendingMap[rec._id]) return;
        setSendingMap(prev => ({ ...prev, [rec._id]: true }));
        try {
            await payrollService.sendPayslipEmail(rec._id);
            toast.success(`Payslip sent to ${rec.employeeName} successfully!`);
            refetchRecords();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || `Failed to send payslip to ${rec.employeeName}.`);
        } finally {
            setSendingMap(prev => ({ ...prev, [rec._id]: false }));
        }
    };

    const handleSendAllPayslips = async () => {
        if (!batchRecords || batchRecords.length === 0 || isBulkSending) return;
        
        if (!window.confirm(`Are you sure you want to send payslips to all ${batchRecords.length} employees?`)) {
            return;
        }

        setIsBulkSending(true);
        const total = batchRecords.length;
        setBulkProgress({
            total,
            sent: 0,
            failed: 0,
            remaining: total
        });

        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < batchRecords.length; i++) {
            const rec = batchRecords[i];
            
            setBulkProgress(prev => ({
                ...prev,
                remaining: total - (sentCount + failedCount)
            }));

            try {
                setSendingMap(prev => ({ ...prev, [rec._id]: true }));
                await payrollService.sendPayslipEmail(rec._id);
                sentCount++;
                refetchRecords();
            } catch (error) {
                console.error(`Failed to send payslip to ${rec.employeeName}:`, error);
                failedCount++;
            } finally {
                setSendingMap(prev => ({ ...prev, [rec._id]: false }));
                setBulkProgress(prev => ({
                    ...prev,
                    sent: sentCount,
                    failed: failedCount,
                    remaining: total - (sentCount + failedCount)
                }));
            }
        }

        setIsBulkSending(false);
        refetchRecords();
        alert(`Payslips sending process completed!\n\nTotal: ${total}\nSent Successfully: ${sentCount}\nFailed: ${failedCount}`);
    };

    useEffect(() => {
        if (isAuthenticated && !canManagePayroll) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, canManagePayroll, router]);

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
            case 'Completed': 
                return <Badge variant="success" className="gap-1 px-2.5 py-1 text-xs"><CheckCircle2 size={12} /> Completed</Badge>;
            case 'Processing': 
                return <Badge variant="warning" className="gap-1 px-2.5 py-1 text-xs bg-yellow-100 dark:bg-yellow-955/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-909/60"><Loader2 size={12} className="animate-spin" /> Processing</Badge>;
            case 'Failed': 
                return <Badge variant="error" className="gap-1 px-2.5 py-1 text-xs"><AlertCircle size={12} /> Failed</Badge>;
            default: 
                return <Badge variant="default" className="text-xs">{status}</Badge>;
        }
    };

    // Filter historical batches based on UI inputs
    const filteredBatches = (historyData?.data || []).filter((batch: any) => {
        if (selectedYear !== 'All' && batch.year.toString() !== selectedYear) return false;
        if (selectedMonth !== 'All' && batch.month.toString() !== selectedMonth) return false;
        return true;
    });

    const years = Array.from(
        new Set<string>((historyData?.data || []).map((b: any) => b.year.toString()))
    ).sort((a: string, b: string) => b.localeCompare(a));

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
                
                {/* Header section with back button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/payroll')}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm"
                        aria-label="Back to Payroll Dashboard"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Payroll History & Archives
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Access finalized payroll snapshots, employee calculations logs, and Excel reports.
                        </p>
                    </div>
                </div>

                {/* Filter and Search Panel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        {/* Year Filter */}
                        <div className="space-y-1 w-full sm:w-auto min-w-[120px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full h-9 px-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Years</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div className="space-y-1 w-full sm:w-auto min-w-[140px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full h-9 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Months</option>
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reset filters */}
                        {(selectedYear !== 'All' || selectedMonth !== 'All') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedYear('All'); setSelectedMonth('All'); }}
                                className="h-9 mt-4 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-105 border-dashed"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Payroll Snapshots Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 font-bold">
                            Archived Batches & Auto-Runs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                <Loader2 size={36} className="animate-spin text-blue-650" />
                                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">Loading historical records...</p>
                            </div>
                        ) : isError ? (
                            <div className="text-center p-20 text-red-500 font-bold">
                                Failed to fetch payroll history archives. Please reload and try again.
                            </div>
                        ) : filteredBatches.length === 0 ? (
                            <div className="text-center p-20 space-y-3">
                                <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">No payroll snapshot archives found.</p>
                                <p className="text-xs text-gray-400 dark:text-gray-550">Auto-runs will trigger and lock calculations at month-end at 11:59 PM.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Batch Name</th>
                                            <th className="px-6 py-4">Period</th>
                                            <th className="px-6 py-4">Headcount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Archived On</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                        {filteredBatches.map((batch: any) => (
                                            <tr key={batch._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                    {batch.batchName || `${MONTHS.find(m => m.value === batch.month)?.label} ${batch.year} Payroll`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span>{MONTHS.find(m => m.value === batch.month)?.label} {batch.year}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-gray-400" />
                                                        {batch.totalEmployees || 0} Employees
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(batch.status)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs font-mono">
                                                    {new Date(batch.createdAt || batch.processedAt).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedBatchId(batch._id)}
                                                            className="text-blue-650 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2.5 py-1.5 h-auto font-semibold flex items-center gap-1.5 border-blue-100 dark:border-blue-900"
                                                        >
                                                            <Eye size={13} />
                                                            <span>View & Send Payslips</span>
                                                        </Button>
                                                        {batch.status === 'Completed' && batch.excelFileUrl && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => window.open(getExcelDownloadUrl(batch.excelFileUrl), '_blank')}
                                                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center gap-1.5 font-bold transition-all text-xs px-3 py-1.5 h-auto shadow-sm"
                                                            >
                                                                <FileSpreadsheet size={13} />
                                                                <span>Download Excel</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>

                    {/* Pagination control */}
                    {!isLoading && historyData?.totalCount > limit && (
                        <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-955/20 flex items-center justify-between gap-4 font-semibold text-xs text-gray-550">
                            <div>
                                Showing <span className="text-gray-950 dark:text-gray-105 font-bold">{(page - 1) * limit + 1}</span> to{' '}
                                <span className="text-gray-950 dark:text-gray-105 font-bold">{Math.min(page * limit, historyData.totalCount)}</span> of{' '}
                                <span className="text-gray-950 dark:text-gray-105 font-bold">{historyData.totalCount}</span> snapshots
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <span className="px-2 font-bold">Page {page} of {Math.ceil(historyData.totalCount / limit)}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.min(Math.ceil(historyData.totalCount / limit), prev + 1))}
                                    disabled={page === Math.ceil(historyData.totalCount / limit)}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Batch Preview Calculations Details Modal */}
                <Modal
                    isOpen={!!selectedBatchId}
                    onClose={() => setSelectedBatchId(null)}
                    title={`Archived Calculations Details - ${selectedBatch ? MONTHS.find(m => m.value === selectedBatch.month)?.label + ' ' + selectedBatch.year : ''}`}
                    className="max-w-5xl"
                >
                    <div className="space-y-4">
                        <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
                            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-800/40 text-gray-550 dark:text-gray-400 font-semibold border-b border-gray-150 dark:border-gray-800 uppercase tracking-wider text-xs">
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
                                        <th className="px-4 py-3.5 text-center">Payslip</th>
                                        <th className="px-4 py-3.5 text-center">Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 font-medium">
                                    {isRecordsLoading ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                                                <span className="block mt-2 text-xs text-gray-400 dark:text-gray-500">Loading calculation records...</span>
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
                                                <td className="px-4 py-3 text-center text-gray-750 dark:text-gray-300 font-mono text-xs">
                                                    {rec.totalDaysInMonth} / {rec.daysAttended} / <span className={rec.leave > 0 ? "text-red-500 font-bold" : ""}>{rec.leave}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-605 dark:text-gray-300 font-mono text-xs">₹{rec.basic?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 font-medium text-gray-850 dark:text-gray-200 font-mono text-xs">₹{rec.grossTotal?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-red-500 dark:text-red-400 font-mono text-xs">₹{(rec.totalDeduction + (rec.fixedDeductions?.unpaidLeaveDeduction || rec.lwpDeduction || 0))?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">₹{rec.netPayable?.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadPayslip(rec)}
                                                        disabled={isBulkSending}
                                                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2.5 py-1.5 h-auto font-semibold flex items-center gap-1 border-blue-100 dark:border-blue-900"
                                                    >
                                                        <FileDown size={13} />
                                                        <span>Download</span>
                                                    </Button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant={rec.payslipSent ? "ghost" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleSendPayslip(rec)}
                                                        disabled={sendingMap[rec._id] || isBulkSending || rec.payslipSent}
                                                        className={cn(
                                                            "text-xs px-2.5 py-1.5 h-auto font-semibold flex items-center gap-1.5 transition-all duration-250",
                                                            rec.payslipSent 
                                                                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 cursor-default opacity-85" 
                                                                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900"
                                                        )}
                                                    >
                                                        {sendingMap[rec._id] ? (
                                                            <Loader2 size={13} className="animate-spin" />
                                                        ) : rec.payslipSent ? (
                                                            <CheckCircle2 size={13} />
                                                        ) : (
                                                            <Send size={13} />
                                                        )}
                                                        <span>{rec.payslipSent ? "Sent" : "Send"}</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Bulk progress bar display */}
                        {isBulkSending && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/60 p-4 rounded-xl space-y-2 animate-in fade-in duration-300">
                                <div className="flex justify-between text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                    <span>Sending Payslips...</span>
                                    <span>{bulkProgress.sent + bulkProgress.failed} / {bulkProgress.total} Complete</span>
                                </div>
                                <div className="w-full bg-blue-100 dark:bg-blue-900/40 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-blue-600 h-full transition-all duration-350"
                                        style={{ width: `${((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    <span>Sent: <strong className="text-emerald-600">{bulkProgress.sent}</strong></span>
                                    <span>Failed: <strong className="text-red-500">{bulkProgress.failed}</strong></span>
                                    <span>Remaining: <strong>{bulkProgress.remaining}</strong></span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                {isBulkSending && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Dispatching payslips...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2.5">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedBatchId(null)}
                                    disabled={isBulkSending}
                                    className="h-10 px-5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
                                >
                                    Close
                                </Button>
                                {batchRecords && batchRecords.length > 0 && (
                                    <Button
                                        variant="primary"
                                        onClick={handleSendAllPayslips}
                                        disabled={isBulkSending}
                                        className="h-10 px-5 font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                                    >
                                        {isBulkSending ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Sending... ({bulkProgress.sent}/{bulkProgress.total})</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                <span>Send Payslips to All</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}
