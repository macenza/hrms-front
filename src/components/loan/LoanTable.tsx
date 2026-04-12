'use client';

import React from 'react';
import { MoreVertical, FileText, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type LoanStatus = 'Active' | 'Pending' | 'Completed' | 'Rejected';

export interface LoanRecord {
    id: string; // The database document ID
    employeeName: string;
    employeeId: string; // The textual ID of the employee, e.g., 'EMP001'
    type: string;
    amount: number; 
    emi: number; 
    tenureMonths: number; 
    status: LoanStatus;
}

interface LoanTableProps {
    data?: LoanRecord[];
    isLoading?: boolean;
    onViewDetails?: (record: LoanRecord) => void;
}

// Dynamic UI Helpers
const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700';
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
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function LoanTable({ 
    data = [], 
    isLoading = false, 
    onViewDetails 
}: LoanTableProps) {
    
    return (
        <Card className="overflow-hidden border-gray-200 relative min-h-[400px]">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Loading loan records...</p>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Loan Details</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">EMI & Tenure</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {!isLoading && data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <IndianRupee size={24} className="text-gray-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 text-base">No loan records found</p>
                                        <p className="text-sm mt-1">There are no active or pending loans matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm",
                                            getAvatarColor(record.employeeName)
                                        )}>
                                            {getInitials(record.employeeName)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{record.employeeName}</p>
                                            <p className="text-xs font-medium text-gray-500">{record.employeeId}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{record.type}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{record.id.slice(-6).toUpperCase()}</p>
                                    </td>

                                    <td className="px-6 py-4 font-black text-gray-900 text-base">
                                        {formatINR(record.amount)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{formatINR(record.emi)} <span className="text-gray-500 font-medium text-xs">/ mo</span></p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{record.tenureMonths} {record.tenureMonths === 1 ? 'Month' : 'Months'}</p>
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
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="View Details"
                                                onClick={() => onViewDetails && onViewDetails(record)}
                                            >
                                                <FileText size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
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