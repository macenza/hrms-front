'use client';

import React from 'react';
import { Eye, Trash2, UserPlus, UserMinus, Loader2, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ActionMenu, { ActionMenuItem } from '@/components/ui/ActionMenu';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useMediaQuery';

export type AssetStatus = 'Assigned' | 'Available' | 'Maintenance' | 'In Maintenance';

export interface Asset {
    id: string; // Database ID or physical asset tag
    name: string;
    category: string;
    assignee: string | null;
    date: string | null;
    status: AssetStatus;
    dbId: string; // MongoDB Document ID
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    cost?: number;
    condition?: string;
    notes?: string;
    expectedReturnDate?: string | null;
    assignedBy?: string | null;
}

interface AssetTableProps {
    assets?: Asset[];
    isLoading?: boolean;
    onEdit?: (record: Asset) => void;
    onAssign?: (record: Asset) => void;
    onUnassign?: (record: Asset) => void;
    onView?: (record: Asset) => void;
    onDelete?: (record: Asset) => void;
}

const getStatusBadgeVariant = (status: AssetStatus) => {
    switch (status) {
        case 'Available': return 'success';
        case 'Assigned': return 'info';
        case 'Maintenance':
        case 'In Maintenance': return 'warning';
        default: return 'default';
    }
};

// Premium Dark-Mode Compatible Skeleton
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4">
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
    </tr>
);

const CardSkeleton = () => (
    <div className="animate-pulse p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
    </div>
);

export default function AssetTable({ 
    assets = [], 
    isLoading = false,
    onEdit,
    onAssign,
    onUnassign,
    onView,
    onDelete
}: AssetTableProps) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'mobile';
    const isInitialLoad = isLoading && assets.length === 0;

    // Build action menu items for a given asset
    const getActionItems = (record: Asset): ActionMenuItem[] => {
        const items: ActionMenuItem[] = [];
        if (onView) items.push({ label: 'View Details', icon: <Eye size={14} />, onClick: () => onView(record) });
        if (onAssign && record.status === 'Available') items.push({ label: 'Assign', icon: <UserPlus size={14} />, onClick: () => onAssign(record) });
        if (onUnassign && record.status === 'Assigned') items.push({ label: 'Unassign', icon: <UserMinus size={14} />, onClick: () => onUnassign(record) });
        if (onDelete) items.push({ label: 'Delete', icon: <Trash2 size={14} />, onClick: () => onDelete(record), variant: 'danger' });
        return items;
    };

    return (
        <div className="relative overflow-hidden border-none sm:border-solid border-gray-200 dark:border-gray-800 sm:rounded-xl bg-white dark:bg-gray-900 min-h-[400px] transition-colors duration-300">
            
            {/* Soft overlay for background fetches */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}

            {/* Mobile Card View */}
            {isMobile ? (
                <div className="p-3 space-y-3">
                    {isInitialLoad ? (
                        Array.from({ length: 5 }).map((_, idx) => <CardSkeleton key={idx} />)
                    ) : assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <PackageOpen size={24} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">No assets found</p>
                            <p className="text-sm mt-1">No assets matching your current criteria.</p>
                        </div>
                    ) : (
                        assets.map((record) => (
                            <div
                                key={record.dbId || record.id}
                                onClick={() => onView?.(record)}
                                className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors cursor-pointer active:scale-[0.99]"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate" title={record.name}>
                                            {record.name}
                                        </p>
                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                                            {record.id}
                                        </p>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(record.status)} className="shrink-0 ml-2">
                                        {record.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">{record.category}</span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className={cn(!record.assignee && "italic text-gray-400 dark:text-gray-500")}>
                                            {record.assignee || 'Unassigned'}
                                        </span>
                                    </div>
                                    <ActionMenu items={getActionItems(record)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Desktop / Tablet Table View */
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                            <tr>
                                <th className="px-6 py-4">Asset Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Assigned To</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Assigned Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                            {isInitialLoad ? (
                                 Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                                <PackageOpen size={24} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No assets found</p>
                                            <p className="text-sm mt-1">There are no assets matching your current criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((record) => (
                                    <tr key={record.dbId || record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{record.name}</p>
                                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{record.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300 transition-colors">{record.category}</td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className={cn(
                                                "font-medium transition-colors",
                                                !record.assignee ? "text-gray-400 dark:text-gray-500 italic" : "text-gray-900 dark:text-gray-100"
                                            )}>
                                                {record.assignee || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors hidden lg:table-cell">
                                            {record.date || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(record.status)}>
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {onView && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" 
                                                        title="View Details"
                                                        onClick={() => onView(record)}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                )}
                                                {onAssign && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        disabled={record.status !== 'Available'}
                                                        className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 transition-colors" 
                                                        title={record.status === 'Available' ? 'Assign Asset' : 'Already Assigned'}
                                                        onClick={() => onAssign(record)}
                                                    >
                                                        <UserPlus size={16} />
                                                    </Button>
                                                )}
                                                {onUnassign && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        disabled={record.status !== 'Assigned'}
                                                        className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 transition-colors" 
                                                        title={record.status === 'Assigned' ? 'Unassign Asset' : 'Not Assigned'}
                                                        onClick={() => onUnassign(record)}
                                                    >
                                                        <UserMinus size={16} />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" 
                                                        title="Delete Asset"
                                                        onClick={() => onDelete(record)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}