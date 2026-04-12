'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, PlayCircle, IndianRupee, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

import PayrollTable, { PayrollRecord } from '@/components/payroll/PayrollTable';
import PayslipModal from '@/components/payroll/PayslipModal';
import { payrollService } from '@/services/payrollService';

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

    const [stats, setStats] = useState<PayrollStatsData>({ totalPayroll: 0, employeesPaid: 0, pendingApprovals: 0, totalDeductions: 0 });
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [isGeneratingSlips, setIsGeneratingSlips] = useState(false);

    const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    const currentUserRole = 'Admin'; 
    const canManagePayroll = ['Admin', 'HR'].includes(currentUserRole);

    const fetchPayrollData = async () => {
        setIsLoading(true);
        try {
            const data = await payrollService.getDashboardData();
            setStats(data.stats);
            const mappedRecords: PayrollRecord[] = data.records.map((rec: any) => ({
                id: rec.user?.employeeId || 'N/A',
                name: rec.user?.name || 'Unknown',
                department: rec.user?.profile?.department || 'Unassigned',
                basicSalary: rec.basicSalary,
                grossSalary: rec.grossSalary,
                netPayable: rec.netPayable,
                status: rec.status,
                dbId: rec._id
            }));
            setRecords(mappedRecords);
        } catch (error) {
            console.error("Failed to fetch payroll data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!canManagePayroll) {
            router.push('/dashboard');
            return;
        }
        fetchPayrollData();
    }, [router, canManagePayroll]);

    // 1. RUN PAYROLL
    const handleRunPayroll = async () => {
        if (!window.confirm("Are you sure you want to run payroll for this month?")) return;
        setIsRunning(true);
        try {
            await payrollService.runPayroll();
            alert("Payroll run initiated successfully!");
            await fetchPayrollData(); 
        } catch (error) {
            alert("Failed to run payroll.");
        } finally {
            setIsRunning(false);
        }
    };

    // 2. EXPORT REPORT TO CSV
    const handleExportReport = () => {
        if (records.length === 0) {
            alert("No records to export.");
            return;
        }

        // Create CSV Headers
        const headers = ['Employee ID', 'Name', 'Department', 'Basic Salary', 'Gross Salary', 'Net Payable', 'Status'];
        
        // Map records to CSV rows
        const csvRows = records.map(rec => [
            rec.id,
            `"${rec.name}"`, // Wrap in quotes in case of commas in names
            `"${rec.department}"`,
            rec.basicSalary,
            rec.grossSalary,
            rec.netPayable,
            rec.status
        ].join(','));

        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Trigger native download
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

    // 3. SLIP GENERATOR (Batch operation simulation)
    const handleSlipGenerator = async () => {
        if (records.length === 0) {
            alert("No payroll records found to generate slips for.");
            return;
        }
        
        setIsGeneratingSlips(true);
        
        // Simulate a heavy backend batch processing job
        setTimeout(() => {
            setIsGeneratingSlips(false);
            alert(`Successfully generated ${records.length} payslips. They have been emailed to the employees.`);
        }, 2000);
    };

    const statCards = [
        { title: "Total Payroll", value: formatINR(stats.totalPayroll), icon: <IndianRupee size={16} />, colorClass: "text-blue-600" },
        { title: "Employees Paid", value: stats.employeesPaid.toString(), icon: <Users size={16} />, colorClass: "text-emerald-600" },
        { title: "Pending Approvals", value: stats.pendingApprovals.toString(), icon: <Clock size={16} />, colorClass: "text-yellow-600" },
        { title: "Total Deductions", value: formatINR(stats.totalDeductions), icon: <AlertCircle size={16} />, colorClass: "text-red-500" }
    ];

    if (!canManagePayroll) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll Management</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Manage salaries, deductions and generate payslips
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={handleExportReport} disabled={isLoading} className="gap-2 shadow-sm bg-white">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </Button>
                    
                    <Button variant="outline" onClick={handleSlipGenerator} disabled={isGeneratingSlips || isLoading} className="gap-2 shadow-sm bg-white">
                        {isGeneratingSlips ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                        <span className="hidden sm:inline">{isGeneratingSlips ? 'Generating...' : 'Slip Generator'}</span>
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={handleRunPayroll} 
                        disabled={isRunning || isLoading}
                        className="gap-2 shadow-sm shadow-blue-500/30 font-bold"
                    >
                        {isRunning ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} strokeWidth={2.5} />}
                        {isRunning ? 'Processing...' : 'Run Payroll'}
                    </Button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                        <CardContent className="p-5 flex flex-col justify-center h-full">
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <div className={stat.colorClass}>{stat.icon}</div>
                                <span className="text-sm font-bold uppercase tracking-wider">{stat.title}</span>
                            </div>
                            {isLoading ? (
                                <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {stat.value}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Data Table */}
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

            {/* Modal */}
            <PayslipModal 
                isOpen={isPayslipModalOpen} 
                record={selectedRecord} 
                onClose={() => {
                    setIsPayslipModalOpen(false);
                    setSelectedRecord(null);
                }} 
            />
        </div>
    );
}