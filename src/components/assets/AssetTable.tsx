'use client';

import React from 'react';
import { MoreVertical, Monitor, Smartphone, Laptop as LaptopIcon, Headphones } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// 1. Define strict types for the backend payload
export type AssetStatus = 'Assigned' | 'Available' | 'Maintenance';

export interface Asset {
    id: string;
    name: string;
    category: string;
    assignee: string | null; // APIs usually return null instead of "Unassigned"
    date: string | null;
    status: AssetStatus;
}

interface AssetTableProps {
    assets?: Asset[];
}

// 2. Mock API Data (Notice: No React components are in this data anymore)
const mockAssets: Asset[] = [
    { id: 'AST-1001', name: 'MacBook Pro 16"', category: 'Laptop', assignee: 'Alice Johnson', date: 'Jan 15, 2023', status: 'Assigned' },
    { id: 'AST-1042', name: 'Dell UltraSharp 27"', category: 'Monitor', assignee: 'Bob Smith', date: 'Feb 10, 2023', status: 'Assigned' },
    { id: 'AST-1088', name: 'iPhone 13 Pro', category: 'Mobile', assignee: null, date: null, status: 'Available' },
    { id: 'AST-1095', name: 'Sony WH-1000XM4', category: 'Accessories', assignee: 'Charlie Brown', date: 'Mar 01, 2023', status: 'Assigned' },
    { id: 'AST-1022', name: 'Lenovo ThinkPad X1', category: 'Laptop', assignee: null, date: null, status: 'Maintenance' },
];

// 3. Helper to map strings from the API to frontend visual assets
const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'laptop': return <LaptopIcon size={20} />;
        case 'monitor': return <Monitor size={20} />;
        case 'mobile': return <Smartphone size={20} />;
        case 'accessories': return <Headphones size={20} />;
        default: return <Monitor size={20} />;
    }
};

const getStatusBadgeVariant = (status: AssetStatus) => {
    switch (status) {
        case 'Available': return 'success';
        case 'Assigned': return 'info';
        case 'Maintenance': return 'warning';
        default: return 'default';
    }
};

export default function AssetTable({ assets = mockAssets }: AssetTableProps) {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
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
                    {assets.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-4">
                                <div className="p-2.5 bg-gray-100 text-gray-500 rounded-lg">
                                    {getCategoryIcon(record.category)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{record.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{record.id}</p>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-gray-600">{record.category}</td>

                            <td className="px-6 py-4">
                                <span className={cn(
                                    "font-medium",
                                    !record.assignee ? "text-gray-400 italic" : "text-gray-900"
                                )}>
                                    {record.assignee || 'Unassigned'}
                                </span>
                            </td>

                            <td className="px-6 py-4 text-gray-600">
                                {record.date || '-'}
                            </td>

                            <td className="px-6 py-4">
                                <Badge variant={getStatusBadgeVariant(record.status)}>
                                    {record.status}
                                </Badge>
                            </td>

                            <td className="px-6 py-4 text-center">
                                <Button variant="ghost" size="sm" className="p-2 rounded-full h-8 w-8" aria-label="More actions">
                                    <MoreVertical size={18} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}