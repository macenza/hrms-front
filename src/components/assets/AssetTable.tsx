'use client';

import React from 'react';
import { MoreVertical, Monitor, Smartphone, Laptop as LaptopIcon, Headphones, Loader2, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// Define strict types for the backend payload
export type AssetStatus = 'Assigned' | 'Available' | 'Maintenance';

export interface Asset {
    id: string; // Database ID or physical asset tag
    name: string;
    category: string;
    assignee: string | null;
    date: string | null;
    status: AssetStatus;
    dbId: string; // MongoDB Document ID
}

interface AssetTableProps {
    assets?: Asset[];
    isLoading?: boolean;
    onEdit?: (record: Asset) => void;
}

// Helper to map strings from the API to frontend visual assets
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

export default function AssetTable({ 
    assets = [], 
    isLoading = false,
    onEdit 
}: AssetTableProps) {
    return (
        <div className="relative overflow-x-auto border border-gray-200 rounded-xl bg-white min-h-[400px]">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Loading company assets...</p>
                </div>
            )}

            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-6 py-4">Asset Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Assigned To</th>
                        <th className="px-6 py-4">Assigned Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {!isLoading && assets.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <PackageOpen size={24} className="text-gray-400" />
                                    </div>
                                    <p className="font-semibold text-gray-900 text-base">No assets found</p>
                                    <p className="text-sm mt-1">There are no assets matching your current criteria.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        assets.map((record) => (
                            <tr key={record.dbId || record.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <div className="p-2.5 bg-gray-100 text-gray-500 rounded-lg shadow-sm group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                        {getCategoryIcon(record.category)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{record.name}</p>
                                        <p className="text-xs font-mono text-gray-500 mt-0.5">{record.id}</p>
                                    </div>
                                </td>

                                <td className="px-6 py-4 font-medium text-gray-600">{record.category}</td>

                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "font-medium",
                                        !record.assignee ? "text-gray-400 italic" : "text-gray-900"
                                    )}>
                                        {record.assignee || 'Unassigned'}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    {record.date || '-'}
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
                                        className="p-2 rounded-full h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                                        aria-label="More actions"
                                        onClick={() => onEdit && onEdit(record)}
                                    >
                                        <MoreVertical size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}