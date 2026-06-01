// src/app/(main)/loan/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, Loader2, Search, X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoanStats, { PersonalLoanStatsData } from '@/components/loan/LoanStats';
import LoanTable, { type LoanRecord } from '@/components/loan/LoanTable';
import ApplyLoanModal, { LoanApplicationPayload } from '@/components/loan/ApplyLoanModal';
import LoanDetailsDrawer from '@/components/loan/LoanDetailsDrawer';
import ReviewLoanModal from '@/components/loan/ReviewLoanModal';
import { useAppSelector } from '@/store/hooks';
import { 
    useLoans, 
    useLoanEmployees, 
    useApplyLoan, 
    useReviewLoan, 
    useCancelLoan, 
    useForecloseLoan, 
    useTogglePauseEmi 
} from '@/hooks/api/useLoans';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LoanPage() {
    const router = useRouter();
    
    // Modals and Drawer Controls
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);

    // Advanced Table & Filtering state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [type, setType] = useState('All');

    // 1. RBAC & Auth State
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = ['admin', 'hr'].includes(role);

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [search, status, type, limit]);

    // 2. React Query Data Layer
    const { data, isLoading } = useLoans({
        page,
        limit,
        search,
        status,
        type,
        employeeId: isManagerial ? null : user?.id
    });

    const { data: fetchedEmployees = [], isLoading: isEmployeesLoading } = useLoanEmployees(isAuthenticated && isManagerial);
    
    // Mutations
    const applyLoanMutation = useApplyLoan();
    const reviewLoanMutation = useReviewLoan();
    const cancelLoanMutation = useCancelLoan();
    const forecloseLoanMutation = useForecloseLoan();
    const togglePauseEmiMutation = useTogglePauseEmi();

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    // Format employee list based on role
    const employees = isManagerial 
        ? fetchedEmployees 
        : [{ id: user?.id || 'CURRENT_USER_ID', label: 'My Self' }];

    // Dynamic Personal Stats Calculation for Standard Employees
    const calculatePersonalStats = (): PersonalLoanStatsData => {
        const records = data?.allFilteredRecords || [];
        
        let totalBorrowed = 0;
        let outstandingBalance = 0;
        let nextEmiAmount = 0;
        let pendingRequests = 0;

        records.forEach(rec => {
            if (rec.status === 'Active' || rec.status === 'Completed') {
                totalBorrowed += rec.amount;
            }
            if (rec.status === 'Pending') {
                pendingRequests += 1;
            }
            if (rec.status === 'Active') {
                // Approximate 2 months already paid for active loans
                const emi = rec.emi || 0;
                const paidInstallments = 2; 
                const repaid = emi * Math.min(paidInstallments, rec.tenureMonths);
                outstandingBalance += Math.max(0, rec.amount - repaid);
                
                // Add to next EMI if not paused
                const isPaused = rec.remarks?.toLowerCase().includes('paused') || rec.remarks?.toLowerCase().includes('hold');
                if (!isPaused) {
                    nextEmiAmount += emi;
                }
            }
        });

        // Compute next EMI date (1st of next month)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextEmiDate = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        return {
            totalBorrowed,
            outstandingBalance,
            nextEmiAmount,
            nextEmiDate: nextEmiAmount > 0 ? `1st ${nextEmiDate}` : undefined,
            pendingRequests
        };
    };

    const personalStats = !isManagerial ? calculatePersonalStats() : null;

    // Action Handlers
    const handleApplyLoan = async (payload: LoanApplicationPayload) => {
        try {
            await applyLoanMutation.mutateAsync(payload);
            setIsApplyModalOpen(false);
            toast.success('Loan request submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit loan request. Please try again.');
        }
    };

    const handleReviewLoan = async (
        loanId: string,
        payload: {
            status: 'Active' | 'Rejected';
            remarks: string;
            approvedAmount: number;
            interestRate: number;
        }
    ) => {
        try {
            await reviewLoanMutation.mutateAsync({ loanId, payload });
            setIsReviewModalOpen(false);
            toast.success(`Loan request ${payload.status === 'Active' ? 'approved' : 'rejected'} successfully!`);
        } catch (error) {
            toast.error('Failed to process loan review.');
        }
    };

    const handleCancelLoan = async (record: LoanRecord) => {
        if (!window.confirm("Are you sure you want to cancel this loan request?")) return;
        try {
            await cancelLoanMutation.mutateAsync(record.id);
            toast.success('Loan request cancelled successfully!');
        } catch (error) {
            toast.error('Failed to cancel request.');
        }
    };

    const handleForecloseLoan = async (record: LoanRecord) => {
        if (!window.confirm(`Are you sure you want to mark Loan #${record.id.slice(-6).toUpperCase()} as Foreclosed (Fully Settled)?`)) return;
        try {
            await forecloseLoanMutation.mutateAsync(record.id);
            toast.success('Loan marked as foreclosed/completed!');
        } catch (error) {
            toast.error('Failed to foreclose loan.');
        }
    };

    const handleTogglePauseEmi = async (record: LoanRecord, isPaused: boolean) => {
        const actionText = isPaused ? 'pause/hold EMI recovery for' : 'resume EMI recovery for';
        if (!window.confirm(`Are you sure you want to ${actionText} Loan #${record.id.slice(-6).toUpperCase()}?`)) return;
        try {
            await togglePauseEmiMutation.mutateAsync({ loanId: record.id, isPaused });
            toast.success(`EMI recovery ${isPaused ? 'paused' : 'resumed'} successfully!`);
        } catch (error) {
            toast.error('Failed to update EMI recovery status.');
        }
    };

    const handleDownloadStatement = (record: LoanRecord) => {
        try {
            const doc = new jsPDF();
            
            // Header Section: Elegant Modern Typography
            doc.setFillColor(30, 41, 59); // Slate-800
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('MACENZA HRMS', 15, 25);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Loan Amortization Statement', 140, 25);
            
            // Metadata Card
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            
            doc.text('Employee Name:', 15, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(record.employeeName, 50, 55);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Employee ID:', 15, 63);
            doc.setFont('helvetica', 'normal');
            doc.text(record.employeeId, 50, 63);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Total Loan Amount:', 15, 71);
            doc.setFont('helvetica', 'normal');
            doc.text(`INR ${record.amount.toLocaleString('en-IN')}`, 50, 71);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Approved Amount:', 110, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`INR ${(record.approvedAmount || record.amount).toLocaleString('en-IN')}`, 150, 55);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Interest Rate:', 110, 63);
            doc.setFont('helvetica', 'normal');
            doc.text(`${record.interestRate || 0}%`, 150, 63);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Processed By:', 110, 71);
            doc.setFont('helvetica', 'normal');
            doc.text(record.processedBy?.name || 'N/A', 150, 71);
            
            doc.setDrawColor(226, 232, 240); // slate-200 border
            doc.line(15, 80, 195, 80);
            
            // Generate or extract Amortization Schedule
            let schedule = [];
            if (record.emiSchedule && record.emiSchedule.length > 0) {
                schedule = record.emiSchedule;
            } else {
                // Fallback simulation if emiSchedule is not present
                const amount = record.approvedAmount || record.amount || 0;
                const tenure = record.tenureMonths || 12;
                const interestRate = record.interestRate || 0;
                let remBalance = amount;
                const r = interestRate === 0 ? 0 : (interestRate / 100) / 12;
                
                // Calculate EMI
                let emi;
                if (interestRate === 0) {
                    emi = amount / tenure;
                } else {
                    emi = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
                }
                
                let startMonth = new Date();
                if (record.deductionStart) {
                    const parts = record.deductionStart.split('-');
                    if (parts.length === 2) {
                        startMonth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
                    }
                }
                
                for (let i = 1; i <= tenure; i++) {
                    const currentMonth = new Date(startMonth.getTime());
                    currentMonth.setMonth(startMonth.getMonth() + i - 1);
                    const monthLabel = currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
                    
                    let interest = 0;
                    let principal = 0;
                    let totalEMI = emi;
                    
                    if (interestRate > 0) {
                        interest = remBalance * r;
                        principal = emi - interest;
                    } else {
                        interest = 0;
                        principal = emi;
                    }
                    
                    if (i === tenure) {
                        principal = remBalance;
                        totalEMI = principal + interest;
                        remBalance = 0;
                    } else {
                        remBalance = remBalance - principal;
                    }
                    
                    schedule.push({
                        month: i,
                        date: monthLabel,
                        principal,
                        interest,
                        totalEMI,
                        remainingBalance: remBalance
                    });
                }
            }
            
            const tableRows = schedule.map((row: any) => {
                const monthText = row.date instanceof Date 
                    ? new Date(row.date).toLocaleString('default', { month: 'short', year: 'numeric' })
                    : String(row.date);
                
                return [
                    `Month ${row.month}`,
                    monthText,
                    `INR ${row.principal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    `INR ${row.interest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    `INR ${row.totalEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    `INR ${row.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                ];
            });
            
            autoTable(doc, {
                startY: 90,
                head: [['Month', 'Date', 'Principal', 'Interest', 'Total EMI', 'Balance']],
                body: tableRows,
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                styles: { fontSize: 9, cellPadding: 4, font: 'helvetica' },
                columnStyles: {
                    2: { halign: 'right' },
                    3: { halign: 'right' },
                    4: { halign: 'right' },
                    5: { halign: 'right' }
                }
            });
            
            doc.save(`Statement_Loan_${record.id.slice(-6).toUpperCase()}.pdf`);
            toast.success(`Statement_Loan_${record.id.slice(-6).toUpperCase()}.pdf downloaded successfully!`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate statement.');
        }
    };

    const handleExportReport = () => {
        const records: LoanRecord[] = data?.allFilteredRecords ?? [];
        if (records.length === 0) return toast.info("No records to export.");
        
        const headers = ['Ref ID', 'Employee Name', 'Employee ID', 'Loan Type', 'Amount', 'EMI', 'Tenure (Mo)', 'Status', 'Deduction Start'];
        const csvRows = records.map((rec) => [
            rec.id.slice(-6).toUpperCase(),
            `"${rec.employeeName}"`,
            rec.employeeId,
            rec.type,
            rec.amount,
            rec.emi,
            rec.tenureMonths,
            rec.status,
            rec.deductionStart || 'N/A'
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `HRMS_Loan_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Loan report exported successfully!');
    };

    // Pagination calculations
    const totalRecords = data?.totalCount || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const showingStart = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
    const showingEnd = Math.min(page * limit, totalRecords);

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Loans & Advances</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            {isManagerial 
                                ? 'Oversee and audit employee loans, salary advances, and monthly recoveries' 
                                : 'Apply for salary advances or emergency loans and track repayment schedules'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleExportReport} 
                            disabled={isLoading || totalRecords === 0} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download size={16} />
                            <span>Export Report</span>
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsApplyModalOpen(true)}
                            className="gap-2 shadow-md shadow-blue-500/20 dark:shadow-none font-bold"
                            disabled={isEmployeesLoading && isManagerial}
                        >
                            {isEmployeesLoading && isManagerial ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                            New Request
                        </Button>
                    </div>
                </div>

                {/* Gated Stats Widgets */}
                <LoanStats 
                    data={isManagerial ? data?.stats : null}
                    personalData={!isManagerial ? personalStats : null}
                    isLoading={isLoading} 
                    isManagerial={isManagerial}
                />

                {/* Filter Toolbar & Data Table Container */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 mb-0 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">Active Loans & Requests</CardTitle>
                    </CardHeader>
                    
                    {/* Enterprise Filter Bar */}
                    <div className="p-4 bg-gray-100/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                placeholder={isManagerial ? "Search by employee name or ID..." : "Search loan type or reference ID..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-10 pl-10 pr-9 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">Status</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-semibold cursor-pointer shadow-sm"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Loan Type Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">Type</span>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-semibold cursor-pointer shadow-sm"
                                >
                                    <option value="All">All Loan Types</option>
                                    <option value="advance">Salary Advance</option>
                                    <option value="personal">Personal Loan</option>
                                    <option value="medical">Medical Emergency</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <CardContent className="p-0 sm:p-0">
                        <LoanTable
                            data={data?.records || []}
                            isLoading={isLoading}
                            currentUserId={user?.id}
                            currentUserRole={role}
                            onViewDetails={(rec) => {
                                setSelectedLoan(rec);
                                setIsDrawerOpen(true);
                            }}
                            onReview={(rec) => {
                                setSelectedLoan(rec);
                                setIsReviewModalOpen(true);
                            }}
                            onCancel={handleCancelLoan}
                            onForeclose={handleForecloseLoan}
                            onTogglePauseEmi={handleTogglePauseEmi}
                            onDownloadStatement={handleDownloadStatement}
                        />
                    </CardContent>

                    {/* Enterprise Pagination Controls */}
                    {totalRecords > 0 && (
                        <div className="px-6 py-4 bg-gray-100/40 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                Showing <span className="text-gray-900 dark:text-gray-100 font-bold">{showingStart}</span> to{' '}
                                <span className="text-gray-900 dark:text-gray-100 font-bold">{showingEnd}</span> of{' '}
                                <span className="text-gray-900 dark:text-gray-100 font-bold">{totalRecords}</span> records
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Rows per page selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Rows per page:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                        className="h-8 px-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs font-bold cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {/* Clickable Page List Buttons */}
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        className="h-8 w-8 p-0 rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    
                                    {Array.from({ length: totalPages }).map((_, idx) => {
                                        const pageNum = idx + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => setPage(pageNum)}
                                                className={`h-8 w-8 p-0 rounded-lg font-bold transition-all ${
                                                    page === pageNum 
                                                        ? 'bg-blue-600 text-white shadow-sm' 
                                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={page === totalPages}
                                        className="h-8 w-8 p-0 rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Applying Request Modal */}
                <ApplyLoanModal
                    isOpen={isApplyModalOpen}
                    onClose={() => setIsApplyModalOpen(false)}
                    onSubmit={handleApplyLoan}
                    employees={employees}
                    isSubmitting={applyLoanMutation.isPending}
                />

                {/* Review Request Modal (Admin/HR only) */}
                <ReviewLoanModal
                    isOpen={isReviewModalOpen}
                    onClose={() => { setIsReviewModalOpen(false); setSelectedLoan(null); }}
                    record={selectedLoan}
                    onSubmit={handleReviewLoan}
                    isSubmitting={reviewLoanMutation.isPending}
                />

                {/* Slide-over Loan Details Drawer */}
                <LoanDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => { setIsDrawerOpen(false); setSelectedLoan(null); }}
                    record={selectedLoan}
                />

            </div>
        </div>
    );
}