'use client';

import React from 'react';
import { CheckCircle2, XCircle, CalendarRange, Clock } from 'lucide-react';

export default function AttendanceTab() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Overview Stats */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Overview (This Month)</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-500">Present Days</p>
                            <CheckCircle2 size={18} className="text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">18</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-500">Absent</p>
                            <XCircle size={18} className="text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">1</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-500">On Leave</p>
                            <CalendarRange size={18} className="text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">2</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-500">Late Check-ins</p>
                            <Clock size={18} className="text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                </div>
            </div>

            {/* Recent Logs Table */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Logs</h2>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">DATE</th>
                                <th className="px-6 py-4">CHECK IN</th>
                                <th className="px-6 py-4">CHECK OUT</th>
                                <th className="px-6 py-4">TOTAL HOURS</th>
                                <th className="px-6 py-4">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3].map((_, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-900 font-medium">Oct {24 - i}, 2023</td>
                                    <td className="px-6 py-4 text-gray-600">09:00 AM</td>
                                    <td className="px-6 py-4 text-gray-600">05:00 PM</td>
                                    <td className="px-6 py-4 text-gray-600">8h 00m</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Present</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}