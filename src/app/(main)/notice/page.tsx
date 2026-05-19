'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import NoticeStats from '@/components/notice/NoticeStats';
import NoticeFeed from '@/components/notice/NoticeFeed';
import CreateNoticeModal from '@/components/notice/CreateNoticeModal';
import { useAppSelector } from '@/store/hooks';
import { useNoticeStats, useNotices } from '@/hooks/api/useNotices';

export default function NoticePage() {
    const router = useRouter();
    
    // 1. RBAC & Auth State
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = ['admin', 'hr', 'manager'].includes(role);

    // 2. Local UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // 3. React Query Data Layer
    const { data: stats, isLoading: isLoadingStats } = useNoticeStats();
    const { data: responsePayload, isLoading: isLoadingNotices } = useNotices(categoryFilter, currentPage, entriesPerPage);

    const notices = responsePayload?.data || [];
    const pagination = responsePayload?.pagination || { currentPage: 1, totalPages: 1, totalEntries: 0 };
    const totalPages = pagination.totalPages || 1;
    const totalEntries = pagination.totalEntries || 0;

    // Reset pagination when category filter or limit changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, entriesPerPage]);

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    // Notice Success Handler
    const handleNoticeSuccess = () => {
        setIsModalOpen(false);
        toast.success('Announcement published successfully!');
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Notice Board</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Company-wide announcements, updates, and events
                        </p>
                    </div>
                    
                    {/* Only Admins/HR/Managers can publish notices */}
                    {isManagerial && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                onClick={() => setIsModalOpen(true)}
                                className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold"
                            >
                                <Megaphone size={18} strokeWidth={2.5} />
                                Publish Notice
                            </Button>
                        </div>
                    )}
                </div>

                {/* Dashboard Stats */}
                <NoticeStats data={stats} isLoading={isLoadingStats} />

                {/* Main Content Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">Recent Announcements</CardTitle>
                        
                        {/* Category Filter */}
                        <div className="relative flex items-center group">
                            <Filter className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors group-focus-within:text-blue-500" size={16} />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                disabled={isLoadingNotices}
                                className="h-10 pl-9 pr-8 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 bg-gray-50 dark:bg-gray-950 cursor-pointer appearance-none transition-all disabled:opacity-50 shadow-sm dark:shadow-none"
                            >
                                <option value="all">All Categories</option>
                                <option value="HR">HR & Policy</option>
                                <option value="Events">Events</option>
                                <option value="IT">IT Updates</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6 pb-6">
                        <NoticeFeed 
                            notices={notices} 
                            isLoading={isLoadingNotices}
                            onActionClick={(id) => console.log('Action menu for:', id)}
                        />
                    </CardContent>

                    {/* Pagination Toolbar */}
                    {!isLoadingNotices && notices.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors font-medium">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors font-medium">
                                <span>Show</span>
                                <select 
                                    value={entriesPerPage} 
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm dark:shadow-none cursor-pointer"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors font-medium">
                                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoadingNotices}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 transition-colors">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoadingNotices}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Create Modal */}
                {isManagerial && (
                    <CreateNoticeModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={handleNoticeSuccess} 
                    />
                )}
            </div>
        </div>
    );
}