'use client';

import React from 'react';
import { Download, CheckSquare, CheckCircle2, XCircle, CalendarRange, Clock } from 'lucide-react';
import AttendanceTable from '@/components/attendance/AttendanceTable';

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor and manage employee attendance records</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-medium hover:bg-[#3A62D7] transition-colors shadow-sm">
                        <CheckSquare size={16} />
                        Mark Attendance
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Present Today</p>
                        <p className="text-3xl font-bold text-gray-900">450</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-500 rounded-full"><CheckCircle2 size={24} /></div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Absent Today</p>
                        <p className="text-3xl font-bold text-gray-900">25</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-500 rounded-full"><XCircle size={24} /></div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">On Leave</p>
                        <p className="text-3xl font-bold text-gray-900">15</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-500 rounded-full"><CalendarRange size={24} /></div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Late Check-ins</p>
                        <p className="text-3xl font-bold text-gray-900">18</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-full"><Clock size={24} /></div>
                </div>
            </div>

            {/* Data Table */}
            <AttendanceTable />
        </div>
    );
}