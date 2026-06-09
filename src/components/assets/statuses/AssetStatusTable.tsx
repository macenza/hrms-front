import React from 'react';
import { Edit2, Trash2, Power, Loader2, Star, Calendar, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { AssetStatus } from '@/hooks/api/useAssetStatuses';

interface AssetStatusTableProps {
    statuses?: AssetStatus[];
    isLoading?: boolean;
    onEdit: (record: AssetStatus) => void;
    onToggleStatus: (record: AssetStatus) => void;
    onDelete: (record: AssetStatus) => void;
}

const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
    </tr>
);

export default function AssetStatusTable({
    statuses = [],
    isLoading = false,
    onEdit,
    onToggleStatus,
    onDelete
}: AssetStatusTableProps) {
    const isInitialLoad = isLoading && statuses.length === 0;

    return (
        <div className="relative overflow-x-auto border-none sm:border-solid border-gray-200 dark:border-gray-800 sm:rounded-xl bg-white dark:bg-gray-900 min-h-[300px] transition-colors duration-300">
            {/* Background Fetch Loader Overlay */}
            {isLoading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}

            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs transition-colors">
                    <tr>
                        <th className="px-6 py-4">Status Details</th>
                        <th className="px-6 py-4">Sequence / Sort</th>
                        <th className="px-6 py-4">Default</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                    {isInitialLoad ? (
                        Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                    ) : statuses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                        <Bookmark size={24} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No statuses found</p>
                                    <p className="text-sm mt-1">There are no asset statuses defined yet.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        statuses.map((rec) => (
                            <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-4 max-w-sm truncate">
                                    {/* Color Indicator Box */}
                                    <div 
                                        className="w-10 h-10 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:scale-105 shrink-0 flex items-center justify-center"
                                        style={{ backgroundColor: rec.color }}
                                    >
                                        <span className="text-[10px] font-mono text-white mix-blend-difference drop-shadow-sm font-semibold">
                                            {rec.color.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="truncate">
                                        <p className={cn(
                                            "font-bold transition-colors truncate",
                                            rec.isActive 
                                                ? "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                                                : "text-gray-500 dark:text-gray-500 line-through"
                                        )}>
                                            {rec.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors font-mono">
                                            HEX: {rec.color}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono font-medium transition-colors">
                                    {rec.sequence}
                                </td>
                                <td className="px-6 py-4">
                                    {rec.isDefault ? (
                                        <Badge variant="info" className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                            <Star size={12} fill="currentColor" /> Default
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">No</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={rec.isActive ? 'success' : 'default'}>
                                        {rec.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            title="Edit Status"
                                            onClick={() => onEdit(rec)}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "p-1.5 rounded-full transition-colors",
                                                rec.isActive 
                                                    ? "text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10" 
                                                    : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                            )}
                                            title={rec.isActive ? 'Deactivate (Soft Delete)' : 'Reactivate'}
                                            onClick={() => onToggleStatus(rec)}
                                        >
                                            <Power size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="Hard Delete Status"
                                            onClick={() => onDelete(rec)}
                                            disabled={rec.isDefault} // Prevent deleting default status
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
