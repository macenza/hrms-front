'use client';

import React from 'react';
import { MoreVertical, FileText, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export type LoanStatus = 'Active' | 'Pending' | 'Completed' | 'Rejected';

export interface LoanRecord {
    id: string;
    employeeName: string;
    employeeId: string; 
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

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
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

// Skeleton Loader
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-16" />
            </div>
        </td>
        <td className="px-6 py-4 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-12" />
        </td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded" /></td>
        <td className="px-6 py-4 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-16" />
        </td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" /></td>
        <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
        </td>
    </tr>
);

export default function LoanTable({ 
    data = [], 
    isLoading = false, 
    onViewDetails 
}: LoanTableProps) {
    
    const isInitialLoad = isLoading && data.length === 0;

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none relative min-h-[400px] transition-colors duration-300">
            
            {/* Soft overlay for background fetches while data is still visible */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Loan Details</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">EMI & Tenure</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                        {isInitialLoad ? (
                            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                            <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No loan records found</p>
                                        <p className="text-sm mt-1">There are no active or pending loans matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm dark:shadow-none transition-colors",
                                            getAvatarColor(record.employeeName)
                                        )}>
                                            {getInitials(record.employeeName)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{record.employeeName}</p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors">{record.employeeId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">{record.type}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono transition-colors">{record.id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-gray-100 text-base transition-colors">
                                        {formatINR(record.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">{formatINR(record.emi)} <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">/ mo</span></p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 transition-colors">{record.tenureMonths} {record.tenureMonths === 1 ? 'Month' : 'Months'}</p>
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
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                                title="View Details"
                                                onClick={() => onViewDetails && onViewDetails(record)}
                                            >
                                                <FileText size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
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