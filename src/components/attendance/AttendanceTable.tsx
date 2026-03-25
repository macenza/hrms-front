'use client';

import React from 'react';
import { Search, ChevronDown, MoreVertical } from 'lucide-react';
import clsx from 'clsx';

const attendanceData = [
    { id: 'EMP001', name: 'Alice Johnson', dept: 'Design', date: 'Oct 24, 2023', checkIn: '09:00 AM', checkOut: '05:00 PM', hours: '8h 00m', late: '0m', status: 'Present', avatarColor: 'bg-blue-100 text-blue-600' },
    { id: 'EMP002', name: 'Bob Smith', dept: 'Engineering', date: 'Oct 24, 2023', checkIn: '09:45 AM', checkOut: '06:15 PM', hours: '8h 30m', late: '45m', status: 'Late', avatarColor: 'bg-green-100 text-green-600' },
    { id: 'EMP003', name: 'Charlie Brown', dept: 'Product', date: 'Oct 24, 2023', checkIn: '-', checkOut: '-', hours: '0h 00m', late: '-', status: 'Absent', avatarColor: 'bg-orange-100 text-orange-600' },
    { id: 'EMP004', name: 'Diana Ross', dept: 'Engineering', date: 'Oct 24, 2023', checkIn: '09:00 AM', checkOut: '05:00 PM', hours: '8h 00m', late: '0m', status: 'Present', avatarColor: 'bg-purple-100 text-purple-600' },
];

export default function AttendanceTable() {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search employee by name or ID" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#4F7CF3]" />
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">Today (Oct 24) <ChevronDown size={14}/></button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">All Departments <ChevronDown size={14}/></button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">All Status <ChevronDown size={14}/></button>
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
                            <th className="px-6 py-4">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {attendanceData.map((record, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${record.avatarColor}`}>{getInitials(record.name)}</div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{record.name}</p>
                                        <p className="text-xs text-gray-500">{record.id}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{record.dept}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{record.checkIn}</td>
                                <td className="px-6 py-4 text-gray-600">{record.checkOut}</td>
                                <td className="px-6 py-4 text-gray-600">{record.hours}</td>
                                <td className="px-6 py-4 text-red-500 font-medium">{record.late}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", 
                                        record.status === 'Present' ? "bg-green-100 text-green-700" : 
                                        record.status === 'Late' ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"
                                    )}>{record.status}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-400 cursor-pointer hover:text-gray-600"><MoreVertical size={18} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}