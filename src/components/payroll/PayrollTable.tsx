// src/components/payroll/PayrollTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, IndianRupee, Search, ChevronDown, Check, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface PayrollRecord {
    id: string; // Employee ID
    name: string;
    department: string;
    role: string;
    baseSalary: number;
    basicSalary: number; // Support PayslipModal backward compatibility
    grossSalary: number;
    taxDeduction: number;
    unpaidLeaveDeduction: number;
    loanDeduction: number;
    netPayable: number;
    status: 'Draft' | 'Paid' | 'Failed';
    paymentDate?: string;
    month?: number;
    year?: number;
    dbId: string; // MongoDB Document ID
}

interface PayrollTableProps {
    data?: PayrollRecord[];
    isLoading?: boolean;
    onProcessPayment?: (record: PayrollRecord) => void;
    isProcessing?: boolean;
    processingId?: string | null;
}

// UI Helpers
const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

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

const formatINR = (amount: number) => {
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
};

// Premium Dark-Mode Skeleton for Ledger Row
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded animate-pulse"></div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div></td>
        <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse font-bold"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse"></div></td>
    </tr>
);

export default function PayrollTable({ 
    data = [], 
    isLoading = false, 
    onProcessPayment,
    isProcessing = false,
    processingId = null
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
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]" />
            )}
            
            {/* Table Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 transition-colors">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-sm dark:shadow-none"
                    />
                </div>  
                
                <div className="w-full sm:w-auto relative">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full sm:w-44 h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/75 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Gross Pay</th>
                            <th className="px-6 py-4">LWP Deduct</th>
                            <th className="px-6 py-4">Taxes</th>
                            <th className="px-6 py-4">Net Pay</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                        {isInitialLoad ? (
                            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                            <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">No payroll records found</p>
                                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Generate a new payroll draft to see ledger records.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((record) => {
                                const isThisProcessing = isProcessing && processingId === record.dbId;
                                return (
                                    <tr key={record.dbId || record.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm dark:shadow-none transition-colors",
                                                getAvatarColor(record.name)
                                            )}>
                                                {getInitials(record.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{record.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{record.id}</span>
                                                    <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">{record.department}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                                            {formatINR(record.grossSalary)}
                                        </td>
                                        <td className="px-6 py-4 text-red-500 dark:text-red-400/90 font-medium transition-colors">
                                            {record.unpaidLeaveDeduction > 0 ? `-${formatINR(record.unpaidLeaveDeduction)}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                            {formatINR(record.taxDeduction)}
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900 dark:text-gray-100 text-base transition-colors">
                                            {formatINR(record.netPayable)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.status === 'Paid' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <Check size={12} strokeWidth={3} />
                                                    Disbursed
                                                </span>
                                            ) : record.status === 'Draft' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    Draft
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {record.status === 'Draft' ? (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    disabled={isProcessing}
                                                    onClick={() => onProcessPayment && onProcessPayment(record)}
                                                    className="shadow-sm font-semibold h-9 px-4 text-xs transition-all gap-1.5"
                                                >
                                                    {isThisProcessing ? (
                                                        <Loader2 size={13} className="animate-spin" />
                                                    ) : (
                                                        <CreditCard size={13} />
                                                    )}
                                                    {isThisProcessing ? 'Paying...' : 'Pay Employee'}
                                                </Button>
                                            ) : record.status === 'Paid' ? (
                                                <div className="text-emerald-500 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1">
                                                    <Check size={14} strokeWidth={2.5} />
                                                    Paid Date: {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}