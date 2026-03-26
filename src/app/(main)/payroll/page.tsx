'use client';

import React from 'react';
import { Download, FileText, PlayCircle, IndianRupee, Users, Clock, AlertCircle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import PayrollTable from '@/components/payroll/PayrollTable';

// Data Contract for Backend Integration
export interface PayrollStatsData {
    totalPayroll: number; // Raw integer
    employeesPaid: number;
    pendingApprovals: number;
    totalDeductions: number; // Raw integer
}

// Mock Data Fallback
const mockStats: PayrollStatsData = {
    totalPayroll: 2450000,
    employeesPaid: 520,
    pendingApprovals: 12,
    totalDeductions: 320000,
};

// Currency Formatter
const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function PayrollPage() {

    // In the future, this is where you will fetch your data hooks:
    // const { data: stats } = usePayrollStats();
    // const { data: payrollRecords } = usePayrollRecords();
    const stats = mockStats;

    // Handlers for API integration
    const handleRunPayroll = () => {
        console.log('Initiating payroll run...');
        // await apiClient.post('/payroll/run');
    };

    const handleExportReport = () => {
        console.log('Exporting payroll report...');
        // window.open('/api/payroll/export', '_blank');
    };

    const handleSlipGenerator = () => {
        console.log('Opening slip generator...');
    };

    // Structure the stat cards for easy mapping
    const statCards = [
        {
            title: "Total Payroll",
            value: formatINR(stats.totalPayroll),
            icon: <IndianRupee size={16} />,
            colorClass: "text-blue-600",
        },
        {
            title: "Employees Paid",
            value: stats.employeesPaid.toString(),
            icon: <Users size={16} />,
            colorClass: "text-emerald-600",
        },
        {
            title: "Pending Approvals",
            value: stats.pendingApprovals.toString(),
            icon: <Clock size={16} />,
            colorClass: "text-yellow-600",
        },
        {
            title: "Total Deductions",
            value: formatINR(stats.totalDeductions),
            icon: <AlertCircle size={16} />,
            colorClass: "text-red-500",
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage salaries, deductions and generate payslips
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={handleExportReport} className="gap-2 shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </Button>

                    <Button variant="outline" onClick={handleSlipGenerator} className="gap-2 shadow-sm">
                        <FileText size={16} />
                        <span className="hidden sm:inline">Slip Generator</span>
                    </Button>

                    <Button variant="primary" onClick={handleRunPayroll} className="gap-2 shadow-sm shadow-blue-500/30">
                        <PlayCircle size={18} strokeWidth={2.5} />
                        Run Payroll
                    </Button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-5 flex flex-col justify-center h-full">
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <div className={stat.colorClass}>{stat.icon}</div>
                                <span className="text-sm font-medium">{stat.title}</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {stat.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Data Table */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100 mb-2">
                    <CardTitle className="text-lg">Employee Payroll List</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                    <PayrollTable
                        onViewPayslip={(record) => {
                            console.log('Viewing payslip for:', record.id);
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}