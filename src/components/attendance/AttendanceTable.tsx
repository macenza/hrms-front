'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// 1. Strict API Data Contracts
export type AttendanceStatus = 'Present' | 'Late' | 'Absent';

export interface AttendanceRecord {
    id: string;
    name: string;
    dept: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    hours: string;
    late: string | null;
    status: AttendanceStatus;
}

interface AttendanceTableProps {
    data?: AttendanceRecord[];
}

// 2. Mock Data (No UI styling classes included)
const mockData: AttendanceRecord[] = [
    { id: 'EMP001', name: 'Alice Johnson', dept: 'Design', date: 'Oct 24, 2023', checkIn: '09:00 AM', checkOut: '05:00 PM', hours: '8h 00m', late: null, status: 'Present' },
    { id: 'EMP002', name: 'Bob Smith', dept: 'Engineering', date: 'Oct 24, 2023', checkIn: '09:45 AM', checkOut: '06:15 PM', hours: '8h 30m', late: '45m', status: 'Late' },
    { id: 'EMP003', name: 'Charlie Brown', dept: 'Product', date: 'Oct 24, 2023', checkIn: null, checkOut: null, hours: '0h 00m', late: null, status: 'Absent' },
    { id: 'EMP004', name: 'Diana Ross', dept: 'Engineering', date: 'Oct 24, 2023', checkIn: '09:00 AM', checkOut: '05:00 PM', hours: '8h 00m', late: null, status: 'Present' },
];

// 3. UI Helpers
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

// Deterministic color assignment based on name length or first letter char code
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-purple-100 text-purple-600',
        'bg-orange-100 text-orange-600',
        'bg-pink-100 text-pink-600'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
};

const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
        case 'Present': return 'success';
        case 'Late': return 'warning';
        case 'Absent': return 'error';
        default: return 'default';
    }
};

export default function AttendanceTable({ data = mockData }: AttendanceTableProps) {
    // 4. Local state for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // 5. Client-side filtering logic (can be swapped for API refetching later)
    const filteredData = useMemo(() => {
        return data.filter((record) => {
            const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDept === 'All' || record.dept === selectedDept;
            const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;

            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [data, searchTerm, selectedDept, selectedStatus]);

    // Extract unique departments for the dropdown
    const departments = ['All', ...Array.from(new Set(data.map(d => d.dept)))];

    return (
        <Card className="overflow-hidden border-gray-200">
            {/* Table Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                {/* Search Input */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                </div>

                {/* Filter Buttons / Selects */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="gap-2 text-gray-600 whitespace-nowrap">
                        Today (Oct 24) <ChevronDown size={14} />
                    </Button>

                    <div className="relative">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="h-8 pl-3 pr-8 appearance-none bg-transparent border border-gray-300 rounded-md text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-8 pl-3 pr-8 appearance-none bg-transparent border border-gray-300 rounded-md text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="All">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">DEPARTMENT</th>
                            <th className="px-6 py-4">CHECK IN</th>
                            <th className="px-6 py-4">CHECK OUT</th>
                            <th className="px-6 py-4">TOTAL HOURS</th>
                            <th className="px-6 py-4">LATE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    No attendance records found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                                            getAvatarColor(record.name)
                                        )}>
                                            {getInitials(record.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{record.name}</p>
                                            <p className="text-xs text-gray-500">{record.id}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">{record.dept}</td>

                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {record.checkIn || '-'}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {record.checkOut || '-'}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">{record.hours}</td>

                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "font-medium",
                                            record.late ? "text-red-500" : "text-gray-400"
                                        )}>
                                            {record.late || '-'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <Button variant="ghost" size="sm" className="p-2 rounded-full h-8 w-8 text-gray-400 hover:text-gray-700">
                                            <MoreVertical size={18} />
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