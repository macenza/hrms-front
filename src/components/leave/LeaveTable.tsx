'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getMyLeaves, getAllLeaves } from '@/services/leaveService';
import { Leave } from '@/types';
import { Loader2, CheckCircle2, XCircle, Clock, Filter, ChevronLeft, ChevronRight, Search, ArrowUpDown, RefreshCw } from 'lucide-react';

interface LeaveTableProps {
    refreshTrigger?: number;
}

type SortKey = 'leaveType' | 'startDate' | 'numberOfDays' | 'status' | 'requestedAt' | 'employeeName';

export default function LeaveTable({ refreshTrigger = 0 }: LeaveTableProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isHrOrAdmin = user?.role === 'HR' || user?.role === 'Admin';

    // --- New State Controls ---
    const [viewMode, setViewMode] = useState<'all' | 'mine'>(isHrOrAdmin ? 'all' : 'mine');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    
    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'requestedAt', direction: 'desc' });

    // Fetch Function extracted so it can be called manually via the refresh button
    const fetchLeaves = async (showRefreshSpinner = false) => {
        if (!user) return;
        if (showRefreshSpinner) setIsRefreshing(true);
        else setIsLoading(true);
        
        try {
            let data: Leave[] = [];
            // If user is HR/Admin AND they want to see all leaves, fetch all. Otherwise, fetch their own.
            if (isHrOrAdmin && viewMode === 'all') {
                data = await getAllLeaves();
            } else {
                data = await getMyLeaves();
            }
            setLeaves(data);
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Auto-fetch on mount, when dependencies change, or when HR toggles the view
    useEffect(() => {
        fetchLeaves();
    }, [user, isHrOrAdmin, refreshTrigger, viewMode]);

    // --- Data Processing: Filter -> Search -> Sort ---
    let processedLeaves = [...leaves];

    // 1. Filtering (Dropdowns)
    processedLeaves = processedLeaves.filter((leave) => {
        const matchType = filterType === 'All' || leave.leaveType === filterType;
        const matchStatus = filterStatus === 'All' || leave.status === filterStatus;
        return matchType && matchStatus;
    });

    // 2. Searching (Employee Name or ID) - Only apply if viewing all leaves
    if (searchQuery.trim() !== '' && isHrOrAdmin && viewMode === 'all') {
        const query = searchQuery.toLowerCase();
        processedLeaves = processedLeaves.filter((leave) => {
            const empData = typeof leave.userId === 'object' ? leave.userId : null;
            const empName = (empData as any)?.name?.toLowerCase() || '';
            const empId = (empData as any)?._id?.toLowerCase() || String(leave.userId).toLowerCase();
            
            return empName.includes(query) || empId.includes(query);
        });
    }

    // 3. Sorting
    if (sortConfig) {
        processedLeaves.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Leave];
            let bValue: any = b[sortConfig.key as keyof Leave];

            // Special handling for Employee Name sorting
            if (sortConfig.key === 'employeeName') {
                aValue = typeof a.userId === 'object' ? (a.userId as any)?.name || '' : '';
                bValue = typeof b.userId === 'object' ? (b.userId as any)?.name || '' : '';
            }
            // Special handling for Dates
            if (sortConfig.key === 'startDate' || sortConfig.key === 'requestedAt') {
                aValue = new Date(aValue || a.createdAt).getTime();
                bValue = new Date(bValue || b.createdAt).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // --- Pagination Logic ---
    const totalPages = Math.ceil(processedLeaves.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const currentData = processedLeaves.slice(startIndex, startIndex + entriesPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset page when filters change
    }, [filterType, filterStatus, searchQuery, entriesPerPage, viewMode]);

    // Handlers
    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="flex w-fit items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200"><CheckCircle2 size={14}/> Approved</span>;
            case 'Rejected': return <span className="flex w-fit items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><XCircle size={14}/> Rejected</span>;
            case 'Pending': return <span className="flex w-fit items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200"><Clock size={14}/> Pending</span>;
            default: return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
                <span className="text-gray-500 font-medium">Loading leave records...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Header, View Toggle & Refresh */}
            <div className="p-5 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-900 text-lg">Leave Records</h3>
                    
                    {/* HR/Admin Toggle */}
                    {isHrOrAdmin && (
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button 
                                onClick={() => setViewMode('all')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Organization
                            </button>
                            <button 
                                onClick={() => setViewMode('mine')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'mine' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Leaves
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => fetchLeaves(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg border border-gray-200"
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            {/* Filters & Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                
                {/* Search Bar (Only for Organization View) */}
                {isHrOrAdmin && viewMode === 'all' ? (
                    <div className="relative w-full md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search employee name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                ) : (
                    <div></div> // Spacer
                )}

                {/* Dropdown Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter size={16} className="text-gray-400" />
                        <span className="hidden sm:inline">Filter:</span>
                    </div>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {error && <div className="p-4 m-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
            
            {/* Table Data */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold select-none">
                            {/* Employee Column - Only visible in Organization view */}
                            {isHrOrAdmin && viewMode === 'all' && (
                                <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('employeeName')}>
                                    <div className="flex items-center gap-1">
                                        Employee <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                    </div>
                                </th>
                            )}
                            <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('leaveType')}>
                                <div className="flex items-center gap-1">
                                    Leave Type <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('startDate')}>
                                <div className="flex items-center gap-1">
                                    Duration <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('numberOfDays')}>
                                <div className="flex items-center gap-1">
                                    Days <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </th>
                            <th className="p-4">Reason</th>
                            <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-1">
                                    Status <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort('requestedAt')}>
                                <div className="flex items-center gap-1">
                                    Requested <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={isHrOrAdmin && viewMode === 'all' ? 7 : 6} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Filter size={32} className="text-gray-300 mb-3" />
                                        <p className="text-sm font-medium">No leave records found.</p>
                                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentData.map((leave) => (
                                <tr key={leave._id} className="hover:bg-blue-50/50 transition-colors">
                                    {isHrOrAdmin && viewMode === 'all' && (
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">
                                                {typeof leave.userId === 'object' && leave.userId !== null ? (leave.userId as any).name : 'Unknown Employee'}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 uppercase">
                                                ID: {typeof leave.userId === 'object' && leave.userId !== null ? String((leave.userId as any)._id).slice(-6) : String(leave.userId).slice(-6)}
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-4 text-sm font-semibold text-gray-700">
                                        {leave.leaveType}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                                        <span className="text-gray-300 mx-2">→</span> 
                                        {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900 text-center sm:text-left">
                                        {leave.numberOfDays}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 max-w-[200px] truncate" title={leave.reason}>
                                        {leave.reason}
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(leave.requestedAt || leave.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select 
                        value={entriesPerPage} 
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                </div>

                <div className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">{processedLeaves.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + entriesPerPage, processedLeaves.length)}</span> of <span className="font-medium text-gray-900">{processedLeaves.length}</span> entries
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}