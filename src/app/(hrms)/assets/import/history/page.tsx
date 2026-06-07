'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Search, X, RotateCcw, Calendar, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { assetImportHistoryService, ImportHistoryFilterParams } from '@/services/assetImportHistoryService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

export default function ImportHistoryPage() {
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Filters and Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);

    // Data Load States
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const params: ImportHistoryFilterParams = {
                page: currentPage,
                limit: entriesPerPage,
                search: debouncedSearchTerm
            };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await assetImportHistoryService.getImportHistory(params);
            setRecords(res.data || []);
            if (res.pagination) {
                setTotalPages(res.pagination.totalPages || 1);
                setTotalEntries(res.pagination.totalEntries || 0);
            }
        } catch (err) {
            console.error("Failed to load import history:", err);
            toast.error("Failed to fetch import history logs.");
        } finally {
            setIsLoading(false);
        }
    };

    // Reload when paging or filter search parameters change
    useEffect(() => {
        loadHistory();
    }, [currentPage, entriesPerPage, debouncedSearchTerm, startDate, endDate]);

    // Reset pagination to first page when search or date filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, startDate, endDate, entriesPerPage]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/assets')}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm"
                        aria-label="Back to Inventory"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Spreadsheet Import History
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Audit log and execution details of all bulk asset import operations.
                        </p>
                    </div>
                </div>

                {/* Filter and Search Panel */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                    <div className="relative w-full lg:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-555">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by file name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-405 dark:placeholder-gray-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-650 dark:hover:text-gray-450 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end">
                        
                        {/* Start Date */}
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-gray-400 dark:text-gray-500">
                                <Calendar size={14} />
                            </span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                aria-label="Start date"
                                className="pl-9 pr-3 h-9 text-xs border border-gray-205 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 font-medium"
                            />
                        </div>

                        <span className="text-gray-450 self-center hidden sm:inline">&mdash;</span>

                        {/* End Date */}
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-gray-400 dark:text-gray-500">
                                <Calendar size={14} />
                            </span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                aria-label="End date"
                                className="pl-9 pr-3 h-9 text-xs border border-gray-205 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 font-medium"
                            />
                        </div>

                        {(searchTerm || startDate || endDate) && (
                            <Button
                                variant="outline"
                                onClick={handleResetFilters}
                                className="gap-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-bold h-9 shrink-0"
                            >
                                <RotateCcw size={14} />
                                <span>Reset Filters</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Listing Grid */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                            Audit History Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                <Loader2 size={36} className="animate-spin text-blue-650" />
                                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">Fetching audit trails...</p>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="text-center p-20 space-y-3">
                                <p className="text-gray-550 dark:text-gray-400 text-base font-semibold">No import history logs found.</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Upload asset spreadsheets to view the logs here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-mono font-bold">
                                        <tr>
                                            <th className="px-6 py-4">File Name</th>
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4">Imported By</th>
                                            <th className="px-6 py-4 text-center">Success Rows</th>
                                            <th className="px-6 py-4 text-center">Failure Rows</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 font-medium">
                                        {records.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                    {record.fileName}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                                                    {formatDate(record.createdAt || record.date)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-gray-400" />
                                                        <div>
                                                            <div className="text-sm font-semibold">{record.userId?.name || 'System'}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">{record.userId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-green-50 text-green-700 dark:bg-green-955/30 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                                        <CheckCircle2 size={12} /> {record.successCount} Rows
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {record.failureCount > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-red-50 text-red-700 dark:bg-red-955/30 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                                            <AlertTriangle size={12} /> {record.failureCount} Errors
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 font-medium">0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>

                    {/* Pagination Toolbar */}
                    {!isLoading && records.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors font-medium">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Show</span>
                                <select 
                                    value={entriesPerPage} 
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm font-semibold"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
