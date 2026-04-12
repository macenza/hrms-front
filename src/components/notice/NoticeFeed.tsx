'use client';

import React from 'react';
import { Pin, Calendar, User, MoreHorizontal, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button'; // Adjusted to match your dir structure (src/components/ui/vui/Button.tsx)
import { useAppSelector } from '@/store/hooks';

// Data Contract synced strictly with Express Backend
export interface Notice {
    _id: string; 
    title: string;
    content: string;
    category: string;
    author: {
        _id: string;
        firstName: string; 
        lastName: string;
    };
    createdAt: string; 
    isPinned: boolean;
    attachmentUrl?: string | null;
}

interface NoticeFeedProps {
    notices: Notice[];
    isLoading: boolean;
    onActionClick?: (noticeId: string) => void;
}

export default function NoticeFeed({
    notices,
    isLoading,
    onActionClick,
}: NoticeFeedProps) {
    // 1. Global State & RBAC
    const { user } = useAppSelector((state) => state.auth);
    
    // Safely check roles regardless of case formatting in the JWT/Redux store
    const userRole = user?.role?.toLowerCase() || '';
    const canManageNotices = ['admin', 'hr'].includes(userRole);

    // 2. Handle Loading State
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="p-5 rounded-xl border border-gray-100 bg-white animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-16 bg-gray-100 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-50 rounded w-48"></div>
                    </div>
                ))}
            </div>
        );
    }

    // 3. Handle Empty State
    if (!notices || notices.length === 0) {
        return (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-400">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No notices found</h3>
                <p className="text-gray-500 font-medium mt-1">There are currently no announcements to display.</p>
            </div>
        );
    }

    // 4. Render Data
    return (
        <div className="space-y-4">
            {notices.map((notice) => (
                <div
                    key={notice._id}
                    className={cn(
                        "p-5 rounded-xl border transition-all hover:shadow-md",
                        notice.isPinned
                            ? "bg-blue-50/40 border-blue-200"
                            : "bg-white border-gray-200"
                    )}
                >
                    {/* Header row: Tags and Actions */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {notice.isPinned && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <Pin size={12} className="fill-current" /> Pinned
                                </span>
                            )}
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                {notice.category}
                            </span>
                        </div>

                        {/* RBAC Applied: Only render action menu for HR/Admin */}
                        {canManageNotices && onActionClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1.5 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                onClick={() => onActionClick(notice._id)}
                                aria-label="Notice options"
                            >
                                <MoreHorizontal size={20} />
                            </Button>
                        )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                        {notice.content}
                    </p>

                    {/* Attachment Box */}
                    {notice.attachmentUrl && (
                        <a
                            href={notice.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-lg w-fit hover:border-blue-600 hover:shadow-sm transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600 group"
                        >
                            <div className="p-2 bg-red-50 text-red-500 rounded-md group-hover:scale-105 transition-transform">
                                <FileText size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                    View Attachment
                                </span>
                            </div>
                        </a>
                    )}

                    {/* Footer Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pt-4 border-t border-gray-200/60 mt-auto">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            {/* Updated to use populated firstName/lastName */}
                            {notice.author ? `${notice.author.firstName} ${notice.author.lastName}` : 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(notice.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}