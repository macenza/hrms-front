// src/components/employees/EmployeeTable.tsx
'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useMediaQuery';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Pending';

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
    dob?: string;
    shiftId?: string | null;
    batchNo?: string;
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

const getAvatarGradient = (name: string) => {
    if (!name) return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
    
    const gradients = [
        'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20',
        'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm shadow-emerald-500/20',
        'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/20',
        'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-sm shadow-amber-500/20',
        'bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-sm shadow-rose-500/20',
        'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

const getStatusStyles = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active': 
            return 'bg-emerald-50/70 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.06)]';
        case 'Pending': 
            return 'bg-amber-50/70 text-amber-700 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.06)]';
        case 'On Leave': 
            return 'bg-purple-50/70 text-purple-700 border border-purple-200/50 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 shadow-[0_0_8px_rgba(139,92,246,0.06)]';
        case 'Inactive': 
            return 'bg-rose-50/70 text-rose-700 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.06)]';
        default: 
            return 'bg-gray-50/70 text-gray-700 border border-gray-250/50 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
    }
};

const getDepartmentColor = (dept: string) => {
    const d = dept?.toLowerCase() || '';
    if (d.includes('eng')) return 'text-blue-600 dark:text-blue-400';
    if (d.includes('hr') || d.includes('human')) return 'text-purple-600 dark:text-purple-400';
    if (d.includes('sale') || d.includes('market')) return 'text-emerald-600 dark:text-emerald-400';
    if (d.includes('fin') || d.includes('pay') || d.includes('loan')) return 'text-amber-600 dark:text-amber-400';
    if (d.includes('prod') || d.includes('design')) return 'text-pink-600 dark:text-pink-400';
    return 'text-indigo-600 dark:text-indigo-400';
};

const getRowHoverStyles = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active':
            return 'hover:from-emerald-50/70 hover:via-emerald-50/20 hover:to-transparent dark:hover:from-emerald-950/20 dark:hover:via-emerald-950/5';
        case 'Pending':
            return 'hover:from-amber-50/70 hover:via-amber-50/20 hover:to-transparent dark:hover:from-amber-950/20 dark:hover:via-amber-950/5';
        case 'On Leave':
            return 'hover:from-purple-50/70 hover:via-purple-50/20 hover:to-transparent dark:hover:from-purple-950/20 dark:hover:via-purple-950/5';
        case 'Inactive':
            return 'hover:from-rose-50/70 hover:via-rose-50/20 hover:to-transparent dark:hover:from-rose-950/20 dark:hover:via-rose-950/5';
        default:
            return 'hover:from-blue-50/60 hover:via-indigo-50/30 hover:to-transparent dark:hover:from-blue-950/20 dark:hover:via-indigo-950/10 dark:hover:to-transparent';
    }
};

const getCardHoverStyles = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active':
            return 'hover:from-emerald-500/5 hover:to-teal-500/5 dark:hover:from-emerald-500/10 dark:hover:to-teal-500/10 hover:border-emerald-500/30 dark:hover:border-emerald-400/30';
        case 'Pending':
            return 'hover:from-amber-500/5 hover:to-orange-500/5 dark:hover:from-amber-500/10 dark:hover:to-orange-500/10 hover:border-amber-500/30 dark:hover:border-amber-400/30';
        case 'On Leave':
            return 'hover:from-purple-500/5 hover:to-indigo-500/5 dark:hover:from-purple-500/10 dark:hover:to-indigo-500/10 hover:border-purple-500/30 dark:hover:border-purple-400/30';
        case 'Inactive':
            return 'hover:from-rose-500/5 hover:to-pink-500/5 dark:hover:from-rose-500/10 dark:hover:to-pink-500/10 hover:border-rose-500/30 dark:hover:border-rose-400/30';
        default:
            return 'hover:from-blue-500/5 hover:to-indigo-500/5 dark:hover:from-blue-500/10 dark:hover:to-indigo-500/10 hover:border-blue-500/30 dark:hover:border-blue-400/30';
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
        <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4 hidden xl:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
    </tr>
);

// Mobile Card Skeleton
const CardSkeleton = () => (
    <div className="animate-pulse p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded" />
            </div>
        </div>
        <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
    </div>
);

export default function EmployeeTable({
    data,
    pagination,
    isLoading = false,
    onRowClick,
    onPageChange
}: EmployeeTableProps) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'mobile';

    const startEntry = pagination.totalEntries === 0 ? 0 : ((pagination.currentPage - 1) * pagination.entriesPerPage) + 1;
    const endEntry = Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries);

    const isInitialLoad = isLoading && data.length === 0;

    return (
        <Card className="overflow-hidden border-gray-200/80 dark:border-gray-800/60 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shadow-lg shadow-gray-200/10 dark:shadow-none relative transition-all duration-300 rounded-2xl">
            
            {/* Soft overlay for background fetches */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]" />
            )}
 
            {/* Mobile Card View */}
            {isMobile ? (
                <div className="p-4 space-y-3.5">
                    {isInitialLoad ? (
                        Array.from({ length: 5 }).map((_, idx) => <CardSkeleton key={idx} />)
                    ) : data.length === 0 ? (
                        <div className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 font-semibold">
                            No employees found matching your criteria.
                        </div>
                    ) : (
                        data.map((employee, idx) => (
                          <div
                                key={employee.id}
                                onClick={() => onRowClick(employee)}
                                style={{ animationDelay: `${idx * 40}ms` }}
                                className={cn(
                                    "p-4.5 rounded-2xl bg-gray-55/50 dark:bg-gray-900/25 hover:bg-gradient-to-tr hover:shadow-md cursor-pointer transition-all duration-300 active:scale-[0.99] group animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden border border-gray-150/60 dark:border-gray-800/60",
                                    getCardHoverStyles(employee.status)
                                )}
                            >
                                {/* Left Side Glowing Status Bar Indicator on hover */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center",
                                    employee.status === 'Active' && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                    employee.status === 'Pending' && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                    employee.status === 'On Leave' && 'bg-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]',
                                    employee.status === 'Inactive' && 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                                )} />
                                
                                <div className="flex items-center gap-3.5 mb-3">
                                    <div className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 tracking-wider shadow-inner",
                                        getAvatarGradient(employee.name)
                                    )}>
                                        {getInitials(employee.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer truncate text-sm" title={employee.name}>
                                            {employee.name}
                                        </p>
                                        <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                                            {employee.empId}
                                        </p>
                                    </div>
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 border", getStatusStyles(employee.status))}>
                                        {employee.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs pl-[58px]">
                                    <span className={cn("font-bold text-[11px] uppercase tracking-wider", getDepartmentColor(employee.department))}>
                                        {employee.department}
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-700 font-bold">•</span>
                                    <span className="font-semibold text-gray-500 dark:text-gray-400">{employee.role}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Desktop / Tablet Table View */
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/70 dark:bg-gray-900/40 border-b border-gray-150 dark:border-gray-800/80 text-gray-400 dark:text-gray-500 font-extrabold transition-colors">
                            <tr>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black">Employee</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black">Department</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black">Role</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black hidden lg:table-cell">Email</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black hidden lg:table-cell">Phone</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black hidden xl:table-cell">Joining Date</th>
                                <th className="px-6 py-4 tracking-wider text-[10px] uppercase font-black">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-0">
                            {isInitialLoad ? (
                                Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-semibold">
                                        No employees found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                data.map((employee, idx) => (
                                    <tr
                                        key={employee.id}
                                        onClick={() => onRowClick(employee)}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                        className={cn(
                                            "hover:bg-gradient-to-r hover:to-transparent cursor-pointer transition-all duration-205 group animate-in fade-in slide-in-from-bottom-1 duration-250 hover:translate-x-1",
                                            getRowHoverStyles(employee.status)
                                        )}
                                    >
                                        <td className="px-6 py-4 relative">
                                            {/* Left Side Glowing Status Bar Indicator on hover */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center",
                                                employee.status === 'Active' && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                                employee.status === 'Pending' && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                                employee.status === 'On Leave' && 'bg-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]',
                                                employee.status === 'Inactive' && 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                                            )} />

                                            <div className="flex items-center space-x-3.5">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 tracking-wider shadow-inner",
                                                    getAvatarGradient(employee.name)
                                                )}>
                                                    {getInitials(employee.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer text-sm">{employee.name}</p>
                                                    <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 transition-colors">{employee.empId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/80 shadow-sm", getDepartmentColor(employee.department))}>
                                                {employee.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold transition-colors">{employee.role}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 transition-colors hidden lg:table-cell">{employee.email}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 transition-colors hidden lg:table-cell">{employee.phone}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 transition-colors hidden xl:table-cell">{employee.joiningDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border", getStatusStyles(employee.status))}>
                                                {employee.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 gap-4 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isMobile ? (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                    ) : (
                        <>
                            Showing <span className="font-medium text-gray-900 dark:text-gray-100">{startEntry}</span> to <span className="font-medium text-gray-900 dark:text-gray-100">{endEntry}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalEntries}</span> entries
                        </>
                    )}
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