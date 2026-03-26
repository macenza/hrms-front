'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// 1. Data Contracts (Synchronized with EmployeeDrawer)
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Employee {
    id: string; // Swapped to string as most database IDs (UUID/MongoDB) are strings
    empId: string;
    name: string;
    department: string;
    role: string;
    email: string;
    phone: string;
    joiningDate: string;
    status: EmployeeStatus;
}

// Optional: Pagination interface for when the API is connected
export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    entriesPerPage: number;
}

interface EmployeeTableProps {
    data?: Employee[];
    pagination?: PaginationState;
    onRowClick: (employee: Employee) => void;
    onPageChange?: (page: number) => void;
}

// 2. Mock Data (Strictly backend-style data, no UI properties)
const mockEmployees: Employee[] = [
    { id: '1', empId: 'EMP001', name: 'Alice Johnson', department: 'Design', role: 'UX Designer', email: 'alice@macenza.com', phone: '+1 234 567 890', joiningDate: 'Jan 12, 2023', status: 'Active' },
    { id: '2', empId: 'EMP002', name: 'Bob Smith', department: 'Engineering', role: 'Frontend Dev', email: 'bob@macenza.com', phone: '+1 987 654 321', joiningDate: 'Feb 15, 2023', status: 'Active' },
    { id: '3', empId: 'EMP003', name: 'Charlie Brown', department: 'Product', role: 'Product Manager', email: 'charlie@macenza.com', phone: '+1 456 789 012', joiningDate: 'Mar 10, 2022', status: 'Active' },
    { id: '4', empId: 'EMP004', name: 'Diana Ross', department: 'Engineering', role: 'QA Engineer', email: 'diana@macenza.com', phone: '+1 654 321 987', joiningDate: 'Apr 05, 2023', status: 'Inactive' },
    { id: '5', empId: 'EMP005', name: 'Edward Norton', department: 'Engineering', role: 'Backend Dev', email: 'edward@macenza.com', phone: '+1 111 222 333', joiningDate: 'May 20, 2023', status: 'Active' },
];

// Default pagination state for the mock UI
const defaultPagination: PaginationState = {
    currentPage: 1,
    totalPages: 10,
    totalEntries: 50,
    entriesPerPage: 5,
};

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

const getStatusBadgeVariant = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active': return 'success';
        case 'On Leave': return 'warning';
        case 'Inactive': return 'error';
        default: return 'default';
    }
};

export default function EmployeeTable({
    data = mockEmployees,
    pagination = defaultPagination,
    onRowClick,
    onPageChange
}: EmployeeTableProps) {

    // Helper to calculate the displayed entries string (e.g., "Showing 1 to 5 of 50")
    const startEntry = ((pagination.currentPage - 1) * pagination.entriesPerPage) + 1;
    const endEntry = Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries);

    return (
        <Card className="overflow-hidden border-gray-200">
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
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
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
                                                e.stopPropagation(); // Prevents the drawer from opening when clicking actions
                                                // Handle actions menu (edit, delete) here
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
                        disabled={pagination.currentPage === 1}
                        onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                        className="h-8 px-3 text-xs"
                    >
                        Previous
                    </Button>

                    {/* Example of active/inactive page buttons */}
                    <Button variant="primary" size="sm" className="h-8 w-8 p-0 text-xs">
                        {pagination.currentPage}
                    </Button>

                    {pagination.currentPage < pagination.totalPages && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                            className="h-8 w-8 p-0 text-xs text-gray-600"
                        >
                            {pagination.currentPage + 1}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                        className="h-8 px-3 text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}