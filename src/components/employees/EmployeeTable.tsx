// src/components/employees/EmployeeTable.tsx
'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Employee {
    id: string; 
    empId: string;
    name: string;
    department: string;
    role: string;
    email: string;
    phone: string;
    joiningDate: string;
    status: EmployeeStatus;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    entriesPerPage: number;
}

interface EmployeeTableProps {
    data: Employee[];
    pagination: PaginationState;
    isLoading?: boolean;
    onRowClick: (employee: Employee) => void;
    onPageChange: (page: number) => void;
}

// UI Helpers
const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    
    // Upgraded with proper dark mode text/bg contrasts
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

const getStatusBadgeVariant = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active': return 'success';
        case 'On Leave': return 'warning';
        case 'Inactive': return 'error';
        default: return 'default';
    }
};

// Premium Dark-Mode Compatible Skeleton
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
    </tr>
);

export default function EmployeeTable({
    data,
    pagination,
    isLoading = false,
    onRowClick,
    onPageChange
}: EmployeeTableProps) {
    const startEntry = pagination.totalEntries === 0 ? 0 : ((pagination.currentPage - 1) * pagination.entriesPerPage) + 1;
    const endEntry = Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries);

    const isInitialLoad = isLoading && data.length === 0;

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none relative transition-colors duration-300">
            
            {/* Soft overlay for background fetches */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]" />
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        <tr>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Employee</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Department</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Role</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Email</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Phone</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Joining Date</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase">Status</th>
                            <th className="px-6 py-4 tracking-wider text-xs uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isInitialLoad ? (
                            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No employees found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            data.map((employee) => (
                                <tr
                                    key={employee.id}
                                    onClick={() => onRowClick(employee)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                                                getAvatarColor(employee.name)
                                            )}>
                                                {getInitials(employee.name)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{employee.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{employee.empId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{employee.department}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{employee.role}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{employee.email}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{employee.phone}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{employee.joiningDate}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(employee.status)}>
                                            {employee.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                console.log('Action menu clicked for', employee.id);
                                            }}
                                            aria-label="More actions"
                                        >
                                            <MoreVertical size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 gap-4 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-gray-100">{startEntry}</span> to <span className="font-medium text-gray-900 dark:text-gray-100">{endEntry}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalEntries}</span> entries
                </span>
                
                <div className="flex space-x-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1 || isLoading}
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        className="h-8 px-3 text-xs dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:dark:opacity-50"
                    >
                        Previous
                    </Button>
                    <Button variant="primary" size="sm" className="h-8 w-8 p-0 text-xs">
                        {pagination.currentPage}
                    </Button>
                    {pagination.currentPage < pagination.totalPages && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            className="h-8 w-8 p-0 text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            {pagination.currentPage + 1}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        className="h-8 px-3 text-xs dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:dark:opacity-50"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}