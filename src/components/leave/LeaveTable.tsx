'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useLeaveRequests, useUpdateLeaveStatus } from '@/hooks/api/useLeave';
import { Leave } from '@/types';
import { Loader2, CheckCircle2, XCircle, Clock, Filter, ChevronLeft, ChevronRight, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { toast } from 'sonner';

type SortKey = 'leaveType' | 'startDate' | 'numberOfDays' | 'status' | 'requestedAt' | 'employeeName';

// Dark-Mode Compatible Skeleton
const TableRowSkeleton = ({ isHrOrAdmin, viewMode }: { isHrOrAdmin: boolean, viewMode: string }) => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        {isHrOrAdmin && viewMode === 'all' && (
            <td className="p-4 space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </td>
        )}
        <td className="p-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="p-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="p-4"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="p-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="p-4"><div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="p-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        {isHrOrAdmin && viewMode === 'all' && (
            <td className="p-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
        )}
    </tr>
);

const getLeaveRowHoverStyles = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'hover:from-emerald-50/70 hover:via-emerald-50/20 hover:to-transparent dark:hover:from-emerald-950/20 dark:hover:via-emerald-950/5';
        case 'Pending':
            return 'hover:from-amber-50/70 hover:via-amber-50/20 hover:to-transparent dark:hover:from-amber-950/20 dark:hover:via-amber-950/5';
        case 'Rejected':
            return 'hover:from-rose-50/70 hover:via-rose-50/20 hover:to-transparent dark:hover:from-rose-950/20 dark:hover:via-rose-950/5';
        case 'Cancelled':
        default:
            return 'hover:from-gray-100 hover:via-gray-50/50 hover:to-transparent dark:hover:from-gray-800/40 dark:hover:via-gray-800/10';
    }
};

export default function LeaveTable() {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase();
    const isHrOrAdmin = userRole === 'hr' || userRole === 'admin';
    
    // View State
    const [viewMode, setViewMode] = useState<'all' | 'mine'>(isHrOrAdmin ? 'all' : 'mine');
    
    const updateLeaveStatusMutation = useUpdateLeaveStatus();

    const handleUpdateStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
        let reason = '';
        if (status === 'Rejected') {
            const inputReason = window.prompt("Please enter a reason for rejecting this leave request:");
            if (inputReason === null) {
                // User cancelled the prompt
                return;
            }
            if (!inputReason.trim()) {
                toast.error("Rejection reason is mandatory!");
                return;
            }
            reason = inputReason.trim();
        } else {
            if (!window.confirm(`Are you sure you want to approve this leave request?`)) {
                return;
            }
        }

        try {
            await updateLeaveStatusMutation.mutateAsync({ leaveId, status, rejectionReason: reason });
            toast.success(`Leave request ${status.toLowerCase()} successfully!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || `Failed to update leave status.`);
        }
    };
    
    // Fetch Data using React Query
    const { 
        data: leaves = [], 
        isLoading, 
        isFetching,
        isError,
        refetch
    } = useLeaveRequests(isHrOrAdmin && viewMode === 'all' ? undefined : user?.id);

    // Filters & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'requestedAt', direction: 'desc' });
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'mobile';

    // Client-side processing
    let processedLeaves = [...leaves];
    
    processedLeaves = processedLeaves.filter((leave) => {
        const matchType = filterType === 'All' || leave.leaveType === filterType;
        const matchStatus = filterStatus === 'All' || leave.status === filterStatus;
        return matchType && matchStatus;
    });

    if (searchQuery.trim() !== '' && isHrOrAdmin && viewMode === 'all') {
        const query = searchQuery.toLowerCase();
        processedLeaves = processedLeaves.filter((leave) => {
            const empData = typeof (leave as any).user === 'object' ? (leave as any).user : null;
            const empName = empData?.name?.toLowerCase() || '';
            const empId = empData?.employeeId?.toLowerCase() || empData?._id?.toLowerCase() || String((leave as any).user).toLowerCase();
            return empName.includes(query) || empId.includes(query);
        });
    }

    if (sortConfig) {
        processedLeaves.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Leave];
            let bValue: any = b[sortConfig.key as keyof Leave];

            if (sortConfig.key === 'employeeName') {
                aValue = typeof (a as any).user === 'object' ? ((a as any).user as any)?.name || '' : '';
                bValue = typeof (b as any).user === 'object' ? ((b as any).user as any)?.name || '' : '';
            }
            if (sortConfig.key === 'startDate' || sortConfig.key === 'requestedAt') {
                aValue = new Date(aValue || a.createdAt).getTime();
                bValue = new Date(bValue || b.createdAt).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(processedLeaves.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const currentData = processedLeaves.slice(startIndex, startIndex + entriesPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1); 
    }, [filterType, filterStatus, searchQuery, entriesPerPage, viewMode]);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="flex w-fit items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 transition-colors"><CheckCircle2 size={14}/> Approved</span>;
            case 'Rejected': return <span className="flex w-fit items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded border border-red-200 dark:border-red-900/50 transition-colors"><XCircle size={14}/> Rejected</span>;
            case 'Pending': return <span className="flex w-fit items-center gap-1 text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 px-2.5 py-1 rounded border border-yellow-200 dark:border-yellow-900/50 transition-colors"><Clock size={14}/> Pending</span>;
            default: return <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded transition-colors">{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300 relative">
            
            {/* Soft overlay for background fetches while data is still visible */}
            {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}

            {/* Header Toolbar */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg transition-colors">Leave Records</h3>
                    {isHrOrAdmin && (
                        <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors">
                            <button 
                                onClick={() => setViewMode('all')}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    viewMode === 'all' 
                                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" 
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                )}
                            >
                                Organization
                            </button>
                            <button 
                                onClick={() => setViewMode('mine')}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    viewMode === 'mine' 
                                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" 
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                )}
                            >
                                My Leaves
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => refetch()}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors"
                >
                    <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-b border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4 transition-colors">
                {isHrOrAdmin && viewMode === 'all' ? (
                    <div className="relative w-full md:w-64 group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search employee name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/40 outline-none transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                ) : (
                    <div></div> // Spacer
                )}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        <Filter size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="hidden sm:inline">Filter:</span>
                    </div>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all shadow-sm dark:shadow-none cursor-pointer"
                    >
                        <option value="All">All Types</option>
                        <option value="Sick">Sick</option>
                        <option value="Vacation">Vacation</option>
                        <option value="Personal">Personal</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Other">Other</option>
                    </select>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all shadow-sm dark:shadow-none cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {isError && <div className="p-4 m-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 transition-colors">Failed to load leave records.</div>}
            
            {/* Mobile Card View / Table */}
            {isMobile ? (
                <div className="p-3 space-y-3 min-h-[400px]">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between mb-3">
                                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                                </div>
                                <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800/50 mb-2" />
                                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800/50" />
                            </div>
                        ))
                    ) : currentData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                            <Filter size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="font-semibold text-gray-900 dark:text-gray-100">No leave records found.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        currentData.map((leave) => {
                            const empData = typeof (leave as any).user === 'object' ? (leave as any).user : null;
                            const empName = empData?.name || 'Unknown';

                            return (
                                <div
                                    key={leave._id}
                                    className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800"
                                >
                                    {/* Top: Employee name + Status */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0 flex-1">
                                            {isHrOrAdmin && viewMode === 'all' && (
                                                <p className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm" title={empName}>{empName}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{leave.leaveType}</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{leave.numberOfDays} day{leave.numberOfDays !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 ml-2">
                                            {getStatusBadge(leave.status)}
                                        </div>
                                    </div>

                                    {/* Date range */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        {' → '}
                                        {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>

                                    {/* Reason (truncated) */}
                                    {leave.reason && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mb-2" title={leave.reason}>
                                            {leave.reason}
                                        </p>
                                    )}

                                    {/* Actions for HR */}
                                    {isHrOrAdmin && viewMode === 'all' && leave.status === 'Pending' && (
                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                                className="flex-1 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 dark:border-emerald-500/20 transition-all text-center"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                                className="flex-1 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 dark:border-red-900/50 transition-all text-center"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Desktop / Tablet Table */
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold select-none transition-colors">
                                {isHrOrAdmin && viewMode === 'all' && (
                                    <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group" onClick={() => handleSort('employeeName')}>
                                        <div className="flex items-center gap-1">
                                            Employee <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                        </div>
                                    </th>
                                )}
                                <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group" onClick={() => handleSort('leaveType')}>
                                    <div className="flex items-center gap-1">
                                        Leave Type <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group" onClick={() => handleSort('startDate')}>
                                    <div className="flex items-center gap-1">
                                        Duration <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group" onClick={() => handleSort('numberOfDays')}>
                                    <div className="flex items-center gap-1">
                                        Days <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </th>
                                <th className="p-4 hidden lg:table-cell">Reason</th>
                                <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">
                                        Status <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group hidden lg:table-cell" onClick={() => handleSort('requestedAt')}>
                                    <div className="flex items-center gap-1">
                                        Requested <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </th>
                                {isHrOrAdmin && viewMode === 'all' && (
                                    <th className="p-4 text-center">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} isHrOrAdmin={isHrOrAdmin} viewMode={viewMode} />)
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={isHrOrAdmin && viewMode === 'all' ? 8 : 6} className="p-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <Filter size={32} className="text-gray-300 dark:text-gray-600 mb-3 transition-colors" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No leave records found.</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((leave) => (
                                    <tr 
                                        key={leave._id} 
                                        className={cn(
                                            "hover:bg-gradient-to-r hover:to-transparent cursor-pointer transition-all duration-205 group hover:translate-x-1",
                                            getLeaveRowHoverStyles(leave.status)
                                        )}
                                    >
                                        {isHrOrAdmin && viewMode === 'all' && (
                                            <td className="p-4 relative">
                                                {/* Left Side Glowing Status Bar Indicator on hover */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center",
                                                    leave.status === 'Approved' && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                                    leave.status === 'Pending' && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                                    leave.status === 'Rejected' && 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]',
                                                    (leave.status === 'Cancelled' || !leave.status) && 'bg-gray-400 dark:bg-gray-500 shadow-[0_0_12px_rgba(156,163,175,0.7)]'
                                                )} />
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                                    {typeof (leave as any).user === 'object' && (leave as any).user !== null ? ((leave as any).user as any).name : 'Unknown Employee'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 uppercase transition-colors">
                                                    ID: {typeof (leave as any).user === 'object' && (leave as any).user !== null ? (((leave as any).user as any).employeeId || String(((leave as any).user as any)._id).slice(-6)) : String((leave as any).user).slice(-6)}
                                                </div>
                                            </td>
                                        )}
                                        {!(isHrOrAdmin && viewMode === 'all') ? (
                                            <td className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors relative">
                                                {/* Left Side Glowing Status Bar Indicator on hover */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center",
                                                    leave.status === 'Approved' && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                                    leave.status === 'Pending' && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                                    leave.status === 'Rejected' && 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]',
                                                    (leave.status === 'Cancelled' || !leave.status) && 'bg-gray-400 dark:bg-gray-500 shadow-[0_0_12px_rgba(156,163,175,0.7)]'
                                                )} />
                                                {leave.leaveType}
                                            </td>
                                        ) : (
                                            <td className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                                                {leave.leaveType}
                                            </td>
                                        )}
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                            {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                                            <span className="text-gray-300 dark:text-gray-600 mx-2 transition-colors">→</span> 
                                            {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-center sm:text-left transition-colors">
                                            {leave.numberOfDays}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate transition-colors hidden lg:table-cell" title={leave.reason}>
                                            {leave.reason}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(leave.status)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 transition-colors hidden lg:table-cell">
                                            {new Date(leave.requestedAt || leave.createdAt).toLocaleDateString()}
                                        </td>
                                        {isHrOrAdmin && viewMode === 'all' && (
                                            <td className="p-4">
                                                {leave.status === 'Pending' ? (
                                                    <div className="flex items-center justify-center gap-2 min-w-[140px]">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                                            className="flex-1 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded border border-emerald-200 dark:border-emerald-500/20 transition-all text-center shadow-sm"
                                                            title="Approve Leave"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                                            className="flex-1 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 hover:text-white dark:hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-600 dark:hover:bg-red-600 rounded border border-red-200 dark:border-red-900/50 transition-all text-center shadow-sm"
                                                            title="Reject Leave"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center min-w-[140px]">
                                                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Processed</span>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Toolbar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    <span>Show</span>
                    <select 
                        value={entriesPerPage} 
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm dark:shadow-none cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    Showing <span className="font-medium text-gray-900 dark:text-gray-100">{processedLeaves.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(startIndex + entriesPerPage, processedLeaves.length)}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{processedLeaves.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 transition-colors">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}