'use client';

import React from 'react';
import clsx from 'clsx';
import { MoreVertical, FileText } from 'lucide-react';

const loanData = [
    { id: 'LN-2045', name: 'Alice Johnson', type: 'Personal Loan', amount: '₹ 1,00,000', emi: '₹ 8,500', tenure: '12 Months', status: 'Active', avatarColor: 'bg-blue-100 text-blue-600' },
    { id: 'LN-2088', name: 'Bob Smith', type: 'Salary Advance', amount: '₹ 25,000', emi: '₹ 25,000', tenure: '1 Month', status: 'Pending', avatarColor: 'bg-green-100 text-green-600' },
    { id: 'LN-1992', name: 'Charlie Brown', type: 'Medical Emergency', amount: '₹ 50,000', emi: '₹ 5,000', tenure: '10 Months', status: 'Active', avatarColor: 'bg-orange-100 text-orange-600' },
    { id: 'LN-1840', name: 'Diana Ross', type: 'Personal Loan', amount: '₹ 2,00,000', emi: '₹ 10,000', tenure: '24 Months', status: 'Completed', avatarColor: 'bg-purple-100 text-purple-600' },
];

export default function LoanTable() {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">EMPLOYEE</th>
                        <th className="px-6 py-4">LOAN DETAILS</th>
                        <th className="px-6 py-4">AMOUNT</th>
                        <th className="px-6 py-4">EMI & TENURE</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loanData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${record.avatarColor}`}>
                                    {getInitials(record.name)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{record.name}</p>
                                    <p className="text-xs text-gray-500">{record.id}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">{record.type}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{record.amount}</td>
                            <td className="px-6 py-4">
                                <p className="font-medium text-gray-900">{record.emi} / mo</p>
                                <p className="text-xs text-gray-500">{record.tenure}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    record.status === 'Active' ? "bg-blue-100 text-blue-700" : 
                                    record.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : 
                                    record.status === 'Pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                )}>
                                    {record.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button className="p-2 text-gray-400 hover:text-[#4F7CF3] hover:bg-blue-50 rounded-full transition-colors" title="View Details">
                                        <FileText size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}