'use client';

import React from 'react';
import clsx from 'clsx';
import { MoreVertical, Monitor, Smartphone, Laptop as LaptopIcon, Headphones } from 'lucide-react';

const assetData = [
    { id: 'AST-1001', name: 'MacBook Pro 16"', category: 'Laptop', assignee: 'Alice Johnson', date: 'Jan 15, 2023', status: 'Assigned', icon: LaptopIcon },
    { id: 'AST-1042', name: 'Dell UltraSharp 27"', category: 'Monitor', assignee: 'Bob Smith', date: 'Feb 10, 2023', status: 'Assigned', icon: Monitor },
    { id: 'AST-1088', name: 'iPhone 13 Pro', category: 'Mobile', assignee: 'Unassigned', date: '-', status: 'Available', icon: Smartphone },
    { id: 'AST-1095', name: 'Sony WH-1000XM4', category: 'Accessories', assignee: 'Charlie Brown', date: 'Mar 01, 2023', status: 'Assigned', icon: Headphones },
    { id: 'AST-1022', name: 'Lenovo ThinkPad X1', category: 'Laptop', assignee: 'Unassigned', date: '-', status: 'Maintenance', icon: LaptopIcon },
];

export default function AssetTable() {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">ASSET DETAILS</th>
                        <th className="px-6 py-4">CATEGORY</th>
                        <th className="px-6 py-4">ASSIGNED TO</th>
                        <th className="px-6 py-4">ASSIGNED DATE</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {assetData.map((record) => {
                        const Icon = record.icon;
                        return (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <div className="p-2.5 bg-gray-100 text-gray-500 rounded-lg">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{record.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{record.id}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{record.category}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "font-medium",
                                        record.assignee === 'Unassigned' ? "text-gray-400 italic" : "text-gray-900"
                                    )}>
                                        {record.assignee}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{record.date}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        record.status === 'Available' ? "bg-green-100 text-green-700" : 
                                        record.status === 'Assigned' ? "bg-blue-100 text-blue-700" : 
                                        "bg-orange-100 text-orange-700"
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}