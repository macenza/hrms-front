// src/components/employees/EmployeeTable.tsx
'use client';
import React from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
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
    isLoading?: boolean; // Added loading state
    onRowClick: (employee: Employee) => void;
    onPageChange: (page: number) => void;
}

// UI Helpers
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

const getStatusBadgeVariant = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active': return 'success';
        case 'On Leave': return 'warning';
        case 'Inactive': return 'error';
        default: return 'default';
    }
};

export default function EmployeeTable({
    data,
    pagination,
    isLoading = false,
    onRowClick,
    onPageChange
}: EmployeeTableProps) {

    // Helper to calculate the displayed entries string safely
    const startEntry = pagination.totalEntries === 0 ? 0 : ((pagination.currentPage - 1) * pagination.entriesPerPage) + 1;
    const endEntry = Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries);

    return (
        <Card className="overflow-hidden border-gray-200 relative">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">DEPARTMENT</th>
                            <th className="px-6 py-4">ROLE</th>
                            <th className="px-6 py-4">EMAIL</th>
                            <th className="px-6 py-4">PHONE</th>
                            <th className="px-6 py-4">JOINING DATE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!isLoading && data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            data.map((employee) => (
                                <tr
                                    key={employee.id}
                                    onClick={() => onRowClick(employee)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
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
                                                <p className="font-semibold text-gray-900">{employee.name}</p>
                                                <p className="text-xs text-gray-500">{employee.empId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{employee.department}</td>
                                    <td className="px-6 py-4 text-gray-600">{employee.role}</td>
                                    <td className="px-6 py-4 text-gray-600">{employee.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{employee.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{employee.joiningDate}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(employee.status)}>
                                            {employee.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700"
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
            
            {/* Backend-Ready Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 gap-4">
                <span className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">{startEntry}</span> to <span className="font-medium text-gray-900">{endEntry}</span> of <span className="font-medium text-gray-900">{pagination.totalEntries}</span> entries
                </span>
                
                <div className="flex space-x-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1 || isLoading}
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        className="h-8 px-3 text-xs"
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
                            className="h-8 w-8 p-0 text-xs text-gray-600"
                        >
                            {pagination.currentPage + 1}
                        </Button>
                    )}
                    
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        className="h-8 px-3 text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}