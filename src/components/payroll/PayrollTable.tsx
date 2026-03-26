'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type PayrollStatus = 'Processed' | 'Approved' | 'Pending' | 'Failed';

export interface PayrollRecord {
    id: string; // Employee ID
    name: string;
    department: string;
    basicSalary: number; // API sends raw numbers
    grossSalary: number; // API sends raw numbers
    netPayable: number;  // API sends raw numbers
    status: PayrollStatus;
}

interface PayrollTableProps {
    data?: PayrollRecord[];
    onViewPayslip?: (record: PayrollRecord) => void;
}

// 2. Mock Data (Strictly backend-style data, no UI properties)
const mockPayrollData: PayrollRecord[] = [
    { id: 'EMP001', name: 'Alice Johnson', department: 'Design', basicSalary: 80000, grossSalary: 120000, netPayable: 105000, status: 'Processed' },
    { id: 'EMP002', name: 'Bob Smith', department: 'Engineering', basicSalary: 90000, grossSalary: 140000, netPayable: 122000, status: 'Pending' },
    { id: 'EMP003', name: 'Sarah Lee', department: 'HR', basicSalary: 75000, grossSalary: 110000, netPayable: 98000, status: 'Approved' },
];

// 3. Dynamic UI Helpers
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

const getStatusBadgeVariant = (status: PayrollStatus) => {
    switch (status) {
        case 'Processed': return 'success';
        case 'Approved': return 'info';
        case 'Pending': return 'warning';
        case 'Failed': return 'error';
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

export default function PayrollTable({ data = mockPayrollData, onViewPayslip }: PayrollTableProps) {
    return (
        <Card className="overflow-hidden border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">DEPARTMENT</th>
                            <th className="px-6 py-4">BASIC</th>
                            <th className="px-6 py-4">GROSS</th>
                            <th className="px-6 py-4">NET PAYABLE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No payroll records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                                            getAvatarColor(record.name)
                                        )}>
                                            {getInitials(record.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{record.name}</p>
                                            <p className="text-xs text-gray-500">{record.id}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {record.department}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {formatINR(record.basicSalary)}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {formatINR(record.grossSalary)}
                                    </td>

                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {formatINR(record.netPayable)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-3"
                                            onClick={() => onViewPayslip && onViewPayslip(record)}
                                        >
                                            <FileText size={16} className="mr-1.5" />
                                            Payslip
                                        </Button>
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