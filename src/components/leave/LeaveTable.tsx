'use client';

import React from 'react';
import clsx from 'clsx';
import { MoreVertical } from 'lucide-react';

const leaveData = [
    { id: 'LV-1042', type: 'Annual Leave', from: 'Nov 20, 2023', to: 'Nov 24, 2023', days: 5, reason: 'Family vacation', status: 'Pending' },
    { id: 'LV-0981', type: 'Sick Leave', from: 'Oct 02, 2023', to: 'Oct 03, 2023', days: 2, reason: 'Viral fever', status: 'Approved' },
    { id: 'LV-0844', type: 'Casual Leave', from: 'Aug 15, 2023', to: 'Aug 15, 2023', days: 1, reason: 'Personal errands', status: 'Approved' },
    { id: 'LV-0712', type: 'Annual Leave', from: 'Jun 10, 2023', to: 'Jun 14, 2023', days: 5, reason: 'Out of station', status: 'Rejected' },
];

export default function LeaveTable() {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">LEAVE TYPE</th>
                        <th className="px-6 py-4">DURATION</th>
                        <th className="px-6 py-4">DAYS</th>
                        <th className="px-6 py-4">REASON</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {leaveData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">{record.type}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{record.id}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {record.from} <span className="mx-1 text-gray-400">→</span> {record.to}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{record.days} Days</td>
                            <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{record.reason}</td>
                            <td className="px-6 py-4">
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    record.status === 'Approved' ? "bg-green-100 text-green-700" : 
                                    record.status === 'Pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                )}>
                                    {record.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}