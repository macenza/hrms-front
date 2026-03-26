'use client';

import React from 'react';
import { MoreVertical, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type LoanStatus = 'Active' | 'Pending' | 'Completed' | 'Rejected';

export interface LoanRecord {
    id: string;
    employeeName: string;
    employeeId: string; // The ID of the employee, e.g., 'EMP001'
    type: string;
    amount: number; // API sends raw numbers
    emi: number; // API sends raw numbers
    tenureMonths: number; // API sends integer
    status: LoanStatus;
}

interface LoanTableProps {
    data?: LoanRecord[];
    onViewDetails?: (record: LoanRecord) => void;
}

// Mock Data (Strictly backend-style data, no UI properties or strings for numbers)
const mockLoanData: LoanRecord[] = [
    { id: 'LN-2045', employeeName: 'Alice Johnson', employeeId: 'EMP001', type: 'Personal Loan', amount: 100000, emi: 8500, tenureMonths: 12, status: 'Active' },
    { id: 'LN-2088', employeeName: 'Bob Smith', employeeId: 'EMP002', type: 'Salary Advance', amount: 25000, emi: 25000, tenureMonths: 1, status: 'Pending' },
    { id: 'LN-1992', employeeName: 'Charlie Brown', employeeId: 'EMP003', type: 'Medical Emergency', amount: 50000, emi: 5000, tenureMonths: 10, status: 'Active' },
    { id: 'LN-1840', employeeName: 'Diana Ross', employeeId: 'EMP004', type: 'Personal Loan', amount: 200000, emi: 10000, tenureMonths: 24, status: 'Completed' },
];

// Dynamic UI Helpers
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
};

const getStatusBadgeVariant = (status: LoanStatus) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Active': return 'info';
        case 'Pending': return 'warning';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function LoanTable({ data = mockLoanData, onViewDetails }: LoanTableProps) {
    return (
        <Card className="overflow-hidden border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">LOAN DETAILS</th>
                            <th className="px-6 py-4">AMOUNT</th>
                            <th className="px-6 py-4">EMI & TENURE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No active or pending loans found.
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                                            getAvatarColor(record.employeeName)
                                        )}>
                                            {getInitials(record.employeeName)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{record.employeeName}</p>
                                            <p className="text-xs text-gray-500">{record.employeeId}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{record.type}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{record.id}</p>
                                    </td>

                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {formatINR(record.amount)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{formatINR(record.emi)} / mo</p>
                                        <p className="text-xs text-gray-500">{record.tenureMonths} {record.tenureMonths === 1 ? 'Month' : 'Months'}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                title="View Details"
                                                onClick={() => onViewDetails && onViewDetails(record)}
                                            >
                                                <FileText size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                                title="More Actions"
                                            >
                                                <MoreVertical size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}