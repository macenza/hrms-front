'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import clsx from 'clsx';

// Interface
export interface Employee {
    id: number;
    empId: string;
    name: string;
    department: string;
    role: string;
    email: string;
    phone: string;
    joiningDate: string;
    status: 'Active' | 'Inactive';
    avatarColor: string;
}

const employeesData: Employee[] = [
    { id: 1, empId: 'EMP001', name: 'Alice Johnson', department: 'Design', role: 'UX Designer', email: 'alice@macenza.com', phone: '+1 234 567 890', joiningDate: 'Jan 12, 2023', status: 'Active', avatarColor: 'bg-blue-100 text-blue-600' },
    { id: 2, empId: 'EMP002', name: 'Bob Smith', department: 'Engineering', role: 'Frontend Dev', email: 'bob@macenza.com', phone: '+1 987 654 321', joiningDate: 'Feb 15, 2023', status: 'Active', avatarColor: 'bg-green-100 text-green-600' },
    { id: 3, empId: 'EMP003', name: 'Charlie Brown', department: 'Product', role: 'Product Manager', email: 'charlie@macenza.com', phone: '+1 456 789 012', joiningDate: 'Mar 10, 2022', status: 'Active', avatarColor: 'bg-orange-100 text-orange-600' },
    { id: 4, empId: 'EMP004', name: 'Diana Ross', department: 'Engineering', role: 'QA Engineer', email: 'diana@macenza.com', phone: '+1 654 321 987', joiningDate: 'Apr 05, 2023', status: 'Inactive', avatarColor: 'bg-purple-100 text-purple-600' },
    { id: 5, empId: 'EMP005', name: 'Edward Norton', department: 'Engineering', role: 'Backend Dev', email: 'edward@macenza.com', phone: '+1 111 222 333', joiningDate: 'May 20, 2023', status: 'Active', avatarColor: 'bg-pink-100 text-pink-600' },
];

interface EmployeeTableProps {
    onRowClick: (employee: Employee) => void;
}

export default function EmployeeTable({ onRowClick }: EmployeeTableProps) {
    // Helper to get initials for the avatar
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <tbody className="divide-y divide-gray-200">
                        {employeesData.map((employee) => (
                            <tr 
                                key={employee.id} 
                                onClick={() => onRowClick(employee)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${employee.avatarColor}`}>
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
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-medium",
                                        employee.status === 'Active' 
                                            ? "bg-green-100 text-green-700" 
                                            : "bg-red-100 text-red-700"
                                    )}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents row click when clicking the dots
                                            // Handle actions menu here
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer matches screenshot */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Showing 1 to 5 of 50 entries</span>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 border border-gray-200 bg-white text-gray-600 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-[#4F7CF3] text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-200 bg-white text-gray-600 rounded-md text-sm hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 border border-gray-200 bg-white text-gray-600 rounded-md text-sm hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
}