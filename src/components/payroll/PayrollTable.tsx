// src/components/payroll/PayrollTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Loader2, IndianRupee, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export type PayrollStatus = 'Processed' | 'Approved' | 'Pending' | 'Failed';

export interface PayrollRecord {
    id: string; // Employee ID
    name: string;
    department: string;
    basicSalary: number; 
    grossSalary: number; 
    netPayable: number;  
    status: PayrollStatus;
    dbId: string; // MongoDB Document ID
}

interface PayrollTableProps {
    data?: PayrollRecord[];
    isLoading?: boolean;
    onViewPayslip?: (record: PayrollRecord) => void;
}

// UI Helpers
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
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Premium Dark-Mode Compatible Skeleton
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
            <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
    </tr>
);

export default function PayrollTable({ 
    data = [], 
    isLoading = false, 
    onViewPayslip 
}: PayrollTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const filteredData = useMemo(() => {
        return data.filter((record) => {
            const matchesSearch = 
                record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, selectedStatus]);

    const isInitialLoad = isLoading && data.length === 0;

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none relative min-h-[400px] transition-colors duration-300">
            
            {/* Soft overlay for background fetches while data is still visible */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]" />
            )}
            
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 transition-colors">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-sm dark:shadow-none"
                    />
                </div>  
                
                <div className="w-full sm:w-auto relative">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full sm:w-44 h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Processed">Processed</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Basic Salary</th>
                            <th className="px-6 py-4">Gross Salary</th>
                            <th className="px-6 py-4">Net Payable</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                        {isInitialLoad ? (
                            // Render 5 skeleton rows during initial fetch
                            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                            <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">No payroll records found</p>
                                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Adjust your filters or generate a new payroll run.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((record) => (
                                <tr key={record.dbId || record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm dark:shadow-none transition-colors",
                                            getAvatarColor(record.name)
                                        )}>
                                            {getInitials(record.name)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{record.name}</p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors">{record.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                                        {record.department || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                        {formatINR(record.basicSalary)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                        {formatINR(record.grossSalary)}
                                    </td>
                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-gray-100 text-base transition-colors">
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
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-bold px-4 h-9 shadow-sm dark:shadow-none border border-blue-100 dark:border-blue-900/50 transition-colors"
                                            onClick={() => onViewPayslip && onViewPayslip(record)}
                                        >
                                            <FileText size={16} className="mr-2" strokeWidth={2.5} />
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