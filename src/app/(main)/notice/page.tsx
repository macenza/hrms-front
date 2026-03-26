'use client';

import React, { useState } from 'react';
import { Megaphone, Filter } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import NoticeStats from '@/components/notice/NoticeStats';
import NoticeFeed from '@/components/notice/NoticeFeed';
import CreateNoticeModal, { NoticePayload } from '@/components/notice/CreateNoticeModal';

export default function NoticePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Controlled Filter State
    const [categoryFilter, setCategoryFilter] = useState('all');

    // In the future, this is where you will fetch your data hooks:
    // const { data: stats } = useNoticeStats();
    // const { data: notices, isLoading } = useNotices({ category: categoryFilter });

    const handleCreateNotice = (payload: NoticePayload) => {
        // When backend is ready (handling potential file uploads via FormData):
        // const data = new FormData();
        // data.append('title', payload.title); ... etc.
        // await apiClient.post('/notices', data);

        console.log('Submitting new notice:', payload);

        // Trigger a re-fetch of your notices here
        // mutate('/api/notices');

        setIsModalOpen(false);
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
            {/* <NoticeStats data={stats} /> */}
            <NoticeStats />

            {/* Main Feed */}
            <Card className="border-gray-200">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg">Recent Announcements</CardTitle>

                    {/* Controlled Category Filter */}
                    <div className="relative flex items-center">
                        <Filter className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-9 pl-9 pr-8 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white cursor-pointer appearance-none transition-all"
                        >
                            <option value="all">All Categories</option>
                            <option value="hr">HR & Policy</option>
                            <option value="events">Events</option>
                            <option value="it">IT Updates</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* <NoticeFeed notices={notices} /> */}
                    <NoticeFeed
                        onActionClick={(id) => console.log('Action menu for:', id)}
                        onAttachmentClick={(file) => console.log('Downloading:', file)}
                    />
                </CardContent>
            </Card>

            {/* Creation Modal */}
            <CreateNoticeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateNotice}
            />
        </div>
    );
}