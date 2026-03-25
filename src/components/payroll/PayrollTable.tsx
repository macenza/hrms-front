'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import clsx from 'clsx';

const payrollData = [
    { id: 'EMP001', name: 'Alice Johnson', dept: 'Design', basic: '₹ 80,000', gross: '₹ 1,20,000', net: '₹ 1,05,000', status: 'Processed', avatarColor: 'bg-blue-100 text-blue-600' },
    { id: 'EMP002', name: 'Bob Smith', dept: 'Engineering', basic: '₹ 90,000', gross: '₹ 1,40,000', net: '₹ 1,22,000', status: 'Pending', avatarColor: 'bg-green-100 text-green-600' },
    { id: 'EMP003', name: 'Sarah Lee', dept: 'HR', basic: '₹ 75,000', gross: '₹ 1,10,000', net: '₹ 98,000', status: 'Approved', avatarColor: 'bg-purple-100 text-purple-600' },
];

export default function PayrollTable() {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">EMPLOYEE</th>
                        <th className="px-6 py-4">DEPARTMENT</th>
                        <th className="px-6 py-4">BASIC</th>
                        <th className="px-6 py-4">GROSS</th>
                        <th className="px-6 py-4">NET PAYABLE</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {payrollData.map((record, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${record.avatarColor}`}>{getInitials(record.name)}</div>
                                <div>
                                    <p className="font-semibold text-gray-900">{record.name}</p>
                                    <p className="text-xs text-gray-500">{record.id}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{record.dept}</td>
                            <td className="px-6 py-4 text-gray-600">{record.basic}</td>
                            <td className="px-6 py-4 text-gray-600">{record.gross}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{record.net}</td>
                            <td className="px-6 py-4">
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", 
                                    record.status === 'Processed' ? "bg-green-100 text-green-700" : 
                                    record.status === 'Approved' ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                                )}>{record.status}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-[#4F7CF3] hover:text-[#3A62D7] font-medium flex items-center justify-center gap-1 mx-auto">
                                    <FileText size={16} /> Payslip
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}