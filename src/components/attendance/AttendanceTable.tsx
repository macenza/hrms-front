// src/components/attendance/AttendanceTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MoreVertical, Loader2, Calendar, ChevronLeft, ChevronRight, Plus, X, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useActiveEmployees } from '@/hooks/api/useEmployees';
import { useMarkAttendance } from '@/hooks/api/useAttendance';
import { toast } from 'sonner';

// Aligned with backend Mongoose Schema enum
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Late';

export interface AttendanceRecord {
    id: string; // Employee ID
    name: string;
    dept: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    hours: string;
    late: string | null;
    status: AttendanceStatus;
    dbId: string; // MongoDB _id
    employeeUserId?: string; // MongoDB user _id
}

interface AttendanceTableProps {
    data?: AttendanceRecord[];
    isLoading?: boolean;
    selectedDate: string; // YYYY-MM-DD
    onDateChange: (date: string) => void;
}

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

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

const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
        case 'Present': return 'success';
        case 'Late': return 'warning';
        case 'Half-Day': return 'info';
        case 'On Leave': return 'warning';
        case 'Absent': return 'error';
        default: return 'default';
    }
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
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
    </tr>
);

export default function AttendanceTable({ 
    data = [], 
    isLoading = false,
    selectedDate,
    onDateChange
}: AttendanceTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Pagination State - minimum 50 entries
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(50);

    // Modal & Form States
    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    const [employeeId, setEmployeeId] = useState('');
    const [status, setStatus] = useState<AttendanceStatus>('Present');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [lateMinutes, setLateMinutes] = useState(0);
    const [workFormat, setWorkFormat] = useState('Office');

    const { data: activeEmployees = [] } = useActiveEmployees();
    const markMutation = useMarkAttendance();

    const parseToTimeString = (timeStr: string | null) => {
        if (!timeStr) return '';
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = match[2];
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
        return '';
    };

    const handleEditClick = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setEmployeeId(record.employeeUserId || '');
        setStatus(record.status === 'Late' ? 'Present' : record.status);
        setCheckInTime(parseToTimeString(record.checkIn));
        setCheckOutTime(parseToTimeString(record.checkOut));
        setIsLate(record.status === 'Late' || record.late === 'Yes');
        setLateMinutes(0);
        setWorkFormat('Office');
        setIsMarkModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!employeeId) {
            toast.error("Please select an employee.");
            return;
        }

        const isAbsentOrLeave = status === 'Absent' || status === 'On Leave';

        if (!isAbsentOrLeave) {
            if (checkOutTime && !checkInTime) {
                toast.error("Check-in time is required if check-out time is specified.");
                return;
            }

            if (checkInTime && checkOutTime) {
                const [inH, inM] = checkInTime.split(':').map(Number);
                const [outH, outM] = checkOutTime.split(':').map(Number);
                if (outH < inH || (outH === inH && outM < inM)) {
                    toast.error("Check-out time cannot be before check-in time.");
                    return;
                }
            }
        }

        try {
            await markMutation.mutateAsync({
                employeeId,
                dateString: selectedDate,
                status,
                checkInTime: isAbsentOrLeave ? undefined : checkInTime || undefined,
                checkOutTime: isAbsentOrLeave ? undefined : checkOutTime || undefined,
                isLate: isAbsentOrLeave ? false : isLate,
                lateByMinutes: (isAbsentOrLeave || !isLate) ? 0 : lateMinutes,
                workFormat
            });
            toast.success("Attendance marked successfully!");
            setIsMarkModalOpen(false);
            // Reset form
            setEmployeeId('');
            setStatus('Present');
            setCheckInTime('');
            setCheckOutTime('');
            setIsLate(false);
            setLateMinutes(0);
            setWorkFormat('Office');
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to mark attendance.");
            }
        }
    };

    const filteredData = useMemo(() => {
        return data.filter((record) => {
            const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDept === 'All' || record.dept === selectedDept;
            const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [data, searchTerm, selectedDept, selectedStatus]);

    // Reset page to 1 on filter or page size changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDept, selectedStatus, entriesPerPage, selectedDate]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return filteredData.slice(startIndex, startIndex + entriesPerPage);
    }, [filteredData, currentPage, entriesPerPage]);

    const totalPages = Math.max(Math.ceil(filteredData.length / entriesPerPage), 1);
    const totalEntries = filteredData.length;

    const departments = ['All', ...Array.from(new Set(data.map(d => d.dept).filter(Boolean)))];
    
    const isInitialLoad = isLoading && data.length === 0;

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none relative min-h-[400px] transition-colors duration-300">
            
            {/* Soft overlay for background fetches while data is still visible */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}

            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 transition-colors">
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    {/* Mark Attendance Trigger Button */}
                    <Button
                        variant="primary"
                        onClick={() => {
                            setSelectedRecord(null);
                            setEmployeeId('');
                            setStatus('Present');
                            setCheckInTime('');
                            setCheckOutTime('');
                            setIsLate(false);
                            setLateMinutes(0);
                            setWorkFormat('Office');
                            setIsMarkModalOpen(true);
                        }}
                        className="h-10 text-xs font-extrabold gap-1.5 shadow-sm shadow-blue-500/25 dark:shadow-none mr-2 flex items-center justify-center"
                    >
                        <Plus size={14} strokeWidth={3} /> Mark Attendance
                    </Button>

                    {/* Date Picker */}
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="h-10 px-3 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>
                    
                    {/* Department Filter */}
                    <div className="relative">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none transition-all cursor-pointer"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                    
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm dark:shadow-none transition-all cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Half-Day">Half Day</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        <tr>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Employee</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Department</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Check In</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Check Out</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Total Hours</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Late</th>
                            <th className="px-6 py-4 uppercase text-xs tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                        {isInitialLoad ? (
                            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                            <Calendar size={24} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No attendance records found</p>
                                        <p className="text-sm mt-1">There are no records matching your current filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((record) => (
                                <tr key={record.dbId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm dark:shadow-none transition-colors",
                                            getAvatarColor(record.name)
                                        )}>
                                            {getInitials(record.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{record.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{record.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{record.dept}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 transition-colors">
                                        {record.checkIn || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">
                                        {record.checkOut || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                                        {record.hours}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "font-medium transition-colors",
                                            record.late ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"
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
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleEditClick(record)}
                                            className="font-bold text-xs h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 rounded-lg transition-all"
                                        >
                                            Adjust
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Toolbar */}
            {!isInitialLoad && filteredData.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors font-medium">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        <span>Show</span>
                        <select 
                            value={entriesPerPage} 
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm dark:shadow-none cursor-pointer font-semibold"
                        >
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                        Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                            aria-label="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 transition-colors">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                            aria-label="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
            {/* Mark / Adjust Attendance Overlay Modal */}
            {isMarkModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40 transition-colors">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors">
                                <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
                                {selectedRecord ? 'Adjust Attendance' : 'Mark Attendance'}
                            </h2>
                            <button 
                                onClick={() => setIsMarkModalOpen(false)} 
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 dark:text-gray-500"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Form Body */}
                        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                            
                            {/* Employee Selection */}
                            {selectedRecord ? (
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Employee</label>
                                    <div className="h-10 px-3 flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                        {selectedRecord.name} ({selectedRecord.id})
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Select Employee</label>
                                    <div className="relative">
                                        <select
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                                        >
                                            <option value="">-- Choose Employee --</option>
                                            {activeEmployees.map((emp: any) => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.empId})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Attendance Status Selector */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Attendance Status</label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                                        className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                                    >
                                        <option value="Present">Present</option>
                                        <option value="Half-Day">Half Day</option>
                                        <option value="On Leave">On Leave</option>
                                        <option value="Absent">Absent</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Clock Times (only present or half-day) */}
                            {status !== 'Absent' && status !== 'On Leave' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Check-In Time</label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    value={checkInTime}
                                                    onChange={(e) => setCheckInTime(e.target.value)}
                                                    className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Check-Out Time</label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    value={checkOutTime}
                                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                                    className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lateness Manual Overrides */}
                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isLate}
                                                onChange={(e) => setIsLate(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            Mark as Late (Manual Override)
                                        </label>
                                        {isLate && (
                                            <div className="flex items-center gap-1.5 ml-auto animate-in fade-in slide-in-from-right-2 duration-200">
                                                <input
                                                    type="number"
                                                    value={lateMinutes}
                                                    min={0}
                                                    onChange={(e) => setLateMinutes(Number(e.target.value))}
                                                    placeholder="Minutes"
                                                    className="w-20 h-8 px-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-xs font-mono font-bold text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500"
                                                />
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase">mins</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Working Format */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Working Format</label>
                                <div className="relative">
                                    <select
                                        value={workFormat}
                                        onChange={(e) => setWorkFormat(e.target.value)}
                                        className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                                    >
                                        <option value="Office">Office</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Field">Field</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>



                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex justify-end gap-3 transition-colors">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsMarkModalOpen(false)}
                                className="h-10 px-4 text-xs font-semibold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-55"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSubmit}
                                disabled={markMutation.isPending}
                                className="h-10 px-6 text-xs font-bold gap-1.5 shadow-sm shadow-blue-500/25 dark:shadow-none"
                            >
                                {markMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                {markMutation.isPending ? 'Saving...' : 'Save Record'}
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </Card>
    );
}