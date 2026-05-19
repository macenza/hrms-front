'use client';

import React from 'react';
import { Pin, Calendar, User, MoreHorizontal, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button'; 
import { useAppSelector } from '@/store/hooks';

export interface Notice {
    _id: string; 
    title: string;
    content: string;
    category: string;
    author: {
        _id: string;
        name?: string;
        firstName?: string; 
        lastName?: string;
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

// Skeleton Loader
const FeedSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse transition-colors">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-50 dark:bg-gray-800 rounded w-48"></div>
            </div>
        ))}
    </div>
);

export default function NoticeFeed({
    notices,
    isLoading,
    onActionClick,
}: NoticeFeedProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const canManageNotices = ['admin', 'hr', 'manager'].includes(userRole);

    if (isLoading) {
        return <FeedSkeleton />;
    }

    if (!notices || notices.length === 0) {
        return (
            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-none flex flex-col items-center justify-center min-h-[300px] transition-colors">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-3 text-gray-400 dark:text-gray-500 transition-colors">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors">No notices found</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">There are currently no announcements to display.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notices.map((notice) => (
                <div
                    key={notice._id}
                    className={cn(
                        "p-5 rounded-xl border transition-all duration-300 hover:shadow-md dark:hover:shadow-none",
                        notice.isPinned
                            ? "bg-blue-50/40 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    )}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {notice.isPinned && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                                    <Pin size={12} className="fill-current" /> Pinned
                                </span>
                            )}
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                                {notice.category}
                            </span>
                        </div>
                        {canManageNotices && onActionClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1.5 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => onActionClick(notice._id)}
                                aria-label="Notice options"
                            >
                                <MoreHorizontal size={20} />
                            </Button>
                        )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                        {notice.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap transition-colors">
                        {notice.content}
                    </p>
                    
                    {notice.attachmentUrl && (
                        <a
                            href={notice.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg w-fit hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-sm dark:hover:shadow-none transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600 group"
                        >
                            <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-md group-hover:scale-105 transition-all">
                                <FileText size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    View Attachment
                                </span>
                            </div>
                        </a>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/60 dark:border-gray-800 mt-auto transition-colors">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400 dark:text-gray-500 transition-colors" />
                            {notice.author 
                                ? (notice.author.name || `${notice.author.firstName || ''} ${notice.author.lastName || ''}`.trim() || 'Unknown User') 
                                : 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400 dark:text-gray-500 transition-colors" />
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