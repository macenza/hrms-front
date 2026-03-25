'use client';

import React, { useState } from 'react';
import { Plus, Megaphone } from 'lucide-react';
import NoticeStats from '@/components/notice/NoticeStats';
import NoticeFeed from '@/components/notice/NoticeFeed';
import CreateNoticeModal from '@/components/notice/CreateNoticeModal';

export default function NoticePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Company-wide announcements, updates, and events</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <Megaphone size={18} />
                        Publish Notice
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <NoticeStats />

            {/* Main Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Announcements</h2>
                    <div className="flex gap-2">
                        <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-[#4F7CF3]">
                            <option value="all">All Categories</option>
                            <option value="hr">HR & Policy</option>
                            <option value="events">Events</option>
                            <option value="it">IT Updates</option>
                        </select>
                    </div>
                </div>
                <NoticeFeed />
            </div>

            {/* Creation Modal */}
            <CreateNoticeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}