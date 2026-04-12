'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Loader2, IndianRupee, Search, ChevronDown } from 'lucide-react';
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

export default function PayrollTable({ 
    data = [], 
    isLoading = false, 
    onViewPayslip 
}: PayrollTableProps) {
    
    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Smart Client-Side Filtering
    const filteredData = useMemo(() => {
        return data.filter((record) => {
            const matchesSearch = 
                record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, selectedStatus]);

    return (
        <Card className="overflow-hidden border-gray-200 relative min-h-[400px]">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Loading payroll records...</p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                    />
                </div>
                
                <div className="w-full sm:w-auto relative">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full sm:w-44 h-10 pl-3 pr-8 appearance-none bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Processed">Processed</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-xs">
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
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {!isLoading && filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <IndianRupee size={24} className="text-gray-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 text-base">No payroll records found</p>
                                        <p className="text-sm mt-1">Adjust your filters or generate a new payroll run.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((record) => (
                                <tr key={record.dbId || record.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm",
                                            getAvatarColor(record.name)
                                        )}>
                                            {getInitials(record.name)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{record.name}</p>
                                            <p className="text-xs font-medium text-gray-500">{record.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {record.department || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {formatINR(record.basicSalary)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {formatINR(record.grossSalary)}
                                    </td>
                                    <td className="px-6 py-4 font-black text-gray-900 text-base">
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
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold px-4 h-9 shadow-sm border border-blue-100"
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