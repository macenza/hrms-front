'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import LoanStats, { LoanStatsData } from '@/components/loan/LoanStats';
import LoanTable, { LoanRecord } from '@/components/loan/LoanTable';
import ApplyLoanModal, { LoanApplicationPayload, SelectOption } from '@/components/loan/ApplyLoanModal';

// Services
import { loanService } from '@/services/loanService';
import { employeeService } from '@/services/employeeService';

export default function LoanPage() {
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [stats, setStats] = useState<LoanStatsData | null>(null);
    const [records, setRecords] = useState<LoanRecord[]>([]);
    const [employees, setEmployees] = useState<SelectOption[]>([]);

    // Role Simulation (Replace with your Auth context)
    const currentUserRole = 'Admin';
    const isManagerial = ['Admin', 'HR'].includes(currentUserRole);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Loan Data
            const data = await loanService.getDashboardData();
            setStats(data.stats);

            const mappedRecords: LoanRecord[] = data.records.map((rec: any) => ({
                id: rec._id, // Mongo ID
                employeeName: rec.user?.name || 'Unknown',
                employeeId: rec.user?.employeeId || 'N/A',
                type: rec.loanType,
                amount: rec.amount,
                emi: rec.emiAmount,
                tenureMonths: rec.tenure,
                status: rec.status
            }));
            setRecords(mappedRecords);

            // Fetch Employee List for the Application Modal
            if (isManagerial) {
                const empResponse = await employeeService.getAll(1, 100);
                const options = empResponse.employees.map((emp: any, index: number) => ({
                    id: emp._id || emp.id || `temp-id-${index}`,
                    label: `${emp.name} (${emp.employeeId || 'No ID'})`
                }));
                setEmployees(options);
            } else {
                // If standard employee, only allow them to apply for themselves
                // Assume you have currentUser._id and currentUser.name
                setEmployees([{ id: 'CURRENT_USER_ID', label: 'My Self' }]);
            }

        } catch (error) {
            console.error("Failed to load loan data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleApplyLoan = async (payload: LoanApplicationPayload) => {
        try {
            await loanService.applyForLoan({
                user: payload.employeeId,
                loanType: payload.loanType,
                amount: Number(payload.amount),
                tenure: Number(payload.tenure),
                deductionStart: payload.deductionStart,
                reason: payload.reason
            });
            alert('Loan request submitted successfully!');
            await fetchData(); // Refresh table
        } catch (error) {
            alert('Failed to submit loan request.');
            throw error; // Let modal know it failed
        }
    };

    const handleExportReport = () => {
        if (records.length === 0) return alert("No records to export.");

        const headers = ['Ref ID', 'Employee Name', 'Employee ID', 'Loan Type', 'Amount', 'EMI', 'Tenure (Mo)', 'Status'];
        const csvRows = records.map(rec => [
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loan & Advances</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Manage employee salary advances and loan requests
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isManagerial && (
                        <Button variant="outline" onClick={handleExportReport} disabled={isLoading} className="gap-2 shadow-sm bg-white">
                            <Download size={16} />
                            <span className="hidden sm:inline">Export Report</span>
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/30 font-bold"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Request
                    </Button>
                </div>
            </div>

            {/* Statistics Cards (Only show to Admins/HR) */}
            {isManagerial && <LoanStats data={stats} isLoading={isLoading} />}

            {/* Main Data Table */}
            <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-gray-100 mb-2">
                    <CardTitle className="text-lg">Active Loans & Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                    <LoanTable
                        data={records}
                        isLoading={isLoading}
                        onViewDetails={(record) => alert(`Viewing details for: ${record.employeeName}`)}
                    />
                </CardContent>
            </Card>

            {/* Application Modal */}
            <ApplyLoanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleApplyLoan}
                employees={employees}
            />
        </div>
    );
}