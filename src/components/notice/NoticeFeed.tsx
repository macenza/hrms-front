'use client';

import React, { useState } from 'react';
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
    updatedAt?: string;
    isPinned: boolean;
    attachmentUrl?: string | null;
}

interface NoticeFeedProps {
    notices: Notice[];
    isLoading: boolean;
    onEditClick?: (notice: Notice) => void;
    onDeleteClick?: (noticeId: string) => void;
    onPinToggle?: (noticeId: string) => void;
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
    onEditClick,
    onDeleteClick,
    onPinToggle,
}: NoticeFeedProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

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
        <div className="space-y-4 font-sans">
            {notices.map((notice) => {
                const isAuthor = user?.id === notice.author?._id;
                const isHrOrAdmin = userRole === 'hr' || userRole === 'admin';
                const showMenu = isAuthor || isHrOrAdmin;

                const createdTime = new Date(notice.createdAt).getTime();
                const updatedTime = notice.updatedAt ? new Date(notice.updatedAt).getTime() : 0;
                const isEdited = updatedTime > 0 && (updatedTime - createdTime > 1000);
                const targetDate = isEdited ? notice.updatedAt! : notice.createdAt;
                const datePrefix = isEdited ? "Modified" : "Published";

                return (
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
                            
                            <div className="flex items-center gap-1">
                                {isHrOrAdmin && onPinToggle && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "p-1.5 h-8 w-8 rounded-full transition-all duration-200",
                                            notice.isPinned
                                                ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                        onClick={() => onPinToggle(notice._id)}
                                        title={notice.isPinned ? "Unpin Notice" : "Pin Notice"}
                                        aria-label={notice.isPinned ? "Unpin Notice" : "Pin Notice"}
                                    >
                                        <Pin size={16} className={cn(notice.isPinned && "fill-current")} />
                                    </Button>
                                )}
                                
                                {showMenu && (
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => setActiveDropdownId(activeDropdownId === notice._id ? null : notice._id)}
                                            aria-label="Notice options"
                                        >
                                            <MoreHorizontal size={20} />
                                        </Button>
                                        
                                        {activeDropdownId === notice._id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                                <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1 z-20 transition-all">
                                                    {isHrOrAdmin && onPinToggle && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                onPinToggle(notice._id);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            {notice.isPinned ? 'Unpin Notice' : 'Pin Notice'}
                                                        </button>
                                                    )}
                                                    {isAuthor && onEditClick && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                onEditClick(notice);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            Edit Notice
                                                        </button>
                                                    )}
                                                    {isHrOrAdmin && onDeleteClick && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                onDeleteClick(notice._id);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            Delete Notice
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                <span>
                                    {datePrefix}: {new Date(targetDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}