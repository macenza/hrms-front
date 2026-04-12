'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

import NoticeStats, { NoticeStatsData } from '@/components/notice/NoticeStats';
import NoticeFeed, { Notice } from '@/components/notice/NoticeFeed';
import CreateNoticeModal from '@/components/notice/CreateNoticeModal';

import { noticeService } from '@/services/noticeService';

export default function NoticePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    const [notices, setNotices] = useState<Notice[]>([]);
    const [stats, setStats] = useState<NoticeStatsData | null>(null);
    
    const [isLoadingNotices, setIsLoadingNotices] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const fetchNotices = useCallback(async () => {
        setIsLoadingNotices(true);
        try {
            const payload = await noticeService.getNotices({ category: categoryFilter });
            
            setNotices(payload.data || []); 
        } catch (error) {
            console.error('Failed to fetch notices:', error);
            toast.error('Failed to load announcements.');
        } finally {
            setIsLoadingNotices(false);
        }
    }, [categoryFilter]);

    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const payload = await noticeService.getNoticeStats();

            setStats(payload.data || null);
        } catch (error) {
            console.error('Failed to fetch notice stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleNoticeSuccess = () => {
        setIsModalOpen(false);
        fetchNotices();
        fetchStats();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Company-wide announcements, updates, and events
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/30"
                    >
                        <Megaphone size={18} strokeWidth={2.5} />
                        Publish Notice
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <NoticeStats data={stats} isLoading={isLoadingStats} />

            {/* Main Feed */}
            <Card className="border-gray-200">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg">Recent Announcements</CardTitle>
                    <div className="relative flex items-center">
                        <Filter className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            disabled={isLoadingNotices}
                            className="h-9 pl-9 pr-8 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white cursor-pointer appearance-none transition-all disabled:opacity-50"
                        >
                            <option value="all">All Categories</option>
                            <option value="hr">HR & Policy</option>
                            <option value="events">Events</option>
                            <option value="it">IT Updates</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <NoticeFeed 
                        notices={notices} 
                        isLoading={isLoadingNotices}
                        onActionClick={(id) => console.log('Action menu for:', id)}
                    />
                </CardContent>
            </Card>

            {/* Creation Modal */}
            <CreateNoticeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNoticeSuccess} 
            />
        </div>
    );
}