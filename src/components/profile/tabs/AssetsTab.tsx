'use client';

import React from 'react';
import { Laptop, Monitor, Smartphone, Cpu, Box, HelpCircle, HardDrive, Calendar, ShieldCheck, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AssetRecord {
    id: string; // assetTag
    name: string;
    category: string;
    assignee: string | null;
    date: string | null; // assignedDate
    status: string;
    dbId: string;
    serialNumber: string;
    manufacturer: string;
    model: string;
    cost: number;
    condition: string;
    notes: string;
    expectedReturnDate: string | null;
    assignedBy: string | null;
}

interface AssetsTabProps {
    assets?: AssetRecord[];
    isLoading?: boolean;
    isAdminOrHR?: boolean;
    onUnassign?: (assetDbId: string, assetName: string) => void;
    isUnassigning?: boolean;
}

const getAssetIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'laptop':
            return Laptop;
        case 'monitor':
            return Monitor;
        case 'mobile':
        case 'smartphone':
            return Smartphone;
        case 'peripheral':
        case 'accessories':
            return HardDrive;
        case 'furniture':
            return Box;
        case 'software':
            return Cpu;
        default:
            return HelpCircle;
    }
};

const getConditionBadgeColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
        case 'new':
            return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
        case 'good':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
        case 'fair':
            return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
        case 'poor':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20';
        case 'broken':
            return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
        default:
            return 'bg-gray-50 text-gray-750 dark:bg-gray-800 dark:text-gray-400 border-gray-150 dark:border-gray-700';
    }
};

const AssetSkeleton = () => (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-none animate-pulse flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                <div className="h-3 bg-gray-150 dark:bg-gray-800/50 rounded w-1/3" />
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-50 dark:border-gray-800/50">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-150 dark:bg-gray-800/50 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                </div>
            ))}
        </div>
    </div>
);

export default function AssetsTab({
    assets = [],
    isLoading = false,
    isAdminOrHR = false,
    onUnassign,
    isUnassigning = false,
}: AssetsTabProps) {
    return (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Assigned Corporate Assets</h2>
            
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, idx) => <AssetSkeleton key={idx} />)}
                </div>
            ) : !assets || assets.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl transition-colors">
                    <div className="p-4 bg-white dark:bg-gray-800 w-16 h-16 mx-auto rounded-full text-gray-400 dark:text-gray-550 mb-3 shadow-sm dark:shadow-none flex items-center justify-center transition-colors">
                        <ClipboardList size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No assets assigned yet.</p>
                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 transition-colors">
                        Any corporate hardware or resources checked out to this employee will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assets.map((asset) => {
                        const Icon = getAssetIcon(asset.category);
                        return (
                            <div
                                key={asset.dbId}
                                className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-900/50 hover:shadow-md dark:hover:shadow-none transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/60">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-500/20 shrink-0">
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                                    {asset.name}
                                                </h3>
                                                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800/50">
                                                    {asset.id}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-450 mt-1 transition-colors">
                                                {asset.category} • {asset.manufacturer} {asset.model}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        {isAdminOrHR && onUnassign && (
                                            <button
                                                type="button"
                                                onClick={() => onUnassign(asset.dbId, asset.name)}
                                                disabled={isUnassigning}
                                                className="px-3 py-1.5 text-xs font-bold text-red-650 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-450 dark:hover:bg-red-500/20 rounded-lg border border-red-100 dark:border-red-950/30 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {isUnassigning ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin dark:border-red-400" />
                                                ) : null}
                                                Unassign
                                            </button>
                                        )}
                                        <span className={cn(
                                            "px-2.5 py-1 text-xs font-bold rounded-full border transition-colors",
                                            getConditionBadgeColor(asset.condition)
                                        )}>
                                            {asset.condition} Condition
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                                    <div>
                                        <p className="text-gray-400 dark:text-gray-500 font-bold transition-colors">Serial Number</p>
                                        <p className="text-gray-700 dark:text-gray-350 font-bold mt-1 select-all transition-colors">{asset.serialNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 dark:text-gray-500 font-bold transition-colors flex items-center gap-1">
                                            <Calendar size={13} />
                                            Assigned On
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-350 font-bold mt-1 transition-colors">{asset.date || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 dark:text-gray-500 font-bold transition-colors flex items-center gap-1">
                                            <Calendar size={13} />
                                            Expected Return
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-350 font-bold mt-1 transition-colors">{asset.expectedReturnDate || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 dark:text-gray-500 font-bold transition-colors flex items-center gap-1">
                                            <ShieldCheck size={13} />
                                            Assigned By
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-350 font-bold mt-1 transition-colors">{asset.assignedBy || '—'}</p>
                                    </div>
                                </div>

                                {asset.notes && (
                                    <div className="mt-4 p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800 flex gap-2.5">
                                        <FileText size={16} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="text-gray-400 dark:text-gray-500 font-bold transition-colors">Assignment Remarks</p>
                                            <p className="text-gray-700 dark:text-gray-300 font-medium mt-1 leading-relaxed transition-colors">{asset.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
