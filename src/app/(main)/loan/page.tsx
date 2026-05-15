// src/app/(main)/loan/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoanStats from '@/components/loan/LoanStats';
import LoanTable, { type LoanRecord } from '@/components/loan/LoanTable';
import ApplyLoanModal, { LoanApplicationPayload } from '@/components/loan/ApplyLoanModal';
import { useAppSelector } from '@/store/hooks';
import { useLoanDashboard, useLoanEmployees, useApplyLoan } from '@/hooks/api/useLoans';

export default function LoanPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 1. RBAC & Auth State
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = ['admin', 'hr'].includes(role);

    // 2. React Query Data Layer
    const { data: dashboardData, isLoading: isDashboardLoading } = useLoanDashboard();
    const { data: fetchedEmployees = [], isLoading: isEmployeesLoading } = useLoanEmployees(isAuthenticated && isManagerial);
    const applyLoanMutation = useApplyLoan();

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    // Format employee list based on role
    const employees = isManagerial 
        ? fetchedEmployees 
        : [{ id: user?.id || 'CURRENT_USER_ID', label: 'My Self' }];

    const handleApplyLoan = async (payload: LoanApplicationPayload) => {
        try {
            await applyLoanMutation.mutateAsync(payload);
            setIsModalOpen(false);
            // We use a toast or standard alert; no need to manually refetch, React Query handles it.
        } catch (error) {
            alert('Failed to submit loan request. Please try again.');
        }
    };

    const handleExportReport = () => {
        const records: LoanRecord[] = dashboardData?.records ?? [];
        if (records.length === 0) return alert("No records to export.");
        
        const headers = ['Ref ID', 'Employee Name', 'Employee ID', 'Loan Type', 'Amount', 'EMI', 'Tenure (Mo)', 'Status'];
        const csvRows = records.map((rec) => [
            rec.id.slice(-6),
            `"${rec.employeeName}"`,
            rec.employeeId,
            rec.type,
            rec.amount,
            rec.emi,
            rec.tenureMonths,
            rec.status
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Loan_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Loan & Advances</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Manage employee salary advances and loan requests
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isManagerial && (
                            <Button 
                                variant="outline" 
                                onClick={handleExportReport} 
                                disabled={isDashboardLoading} 
                                className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Export Report</span>
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => setIsModalOpen(true)}
                            className="gap-2 shadow-sm shadow-blue-500/30 dark:shadow-none font-bold"
                            disabled={isEmployeesLoading && isManagerial}
                        >
                            {isEmployeesLoading && isManagerial ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                            New Request
                        </Button>
                    </div>
                </div>

                {/* Dashboard Widgets */}
                {isManagerial && (
                    <LoanStats 
                        data={dashboardData?.stats} 
                        isLoading={isDashboardLoading} 
                    />
                )}

                {/* Data Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 mb-0 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">Active Loans & Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-0">
                        <LoanTable
                            data={dashboardData?.records || []}
                            isLoading={isDashboardLoading}
                            onViewDetails={(record) => alert(`Viewing details for: ${record.employeeName}`)}
                        />
                    </CardContent>
                </Card>

                {/* Action Modals */}
                <ApplyLoanModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleApplyLoan}
                    employees={employees}
                    isSubmitting={applyLoanMutation.isPending}
                />
            </div>
        </div>
    );
}