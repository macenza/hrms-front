'use client';

import React, { useState } from 'react';
import { Pin, Calendar, User, MoreHorizontal, FileText, Eye, Download } from 'lucide-react';
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

const getFullFileUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
    return `${backendBaseUrl}${url}`;
};

const handleDownload = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        window.open(url, '_blank');
    }
};

export default function NoticeFeed({
    notices,
    isLoading,
    onEditClick,
    onDeleteClick,
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
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                            {notice.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap transition-colors">
                            {notice.content}
                        </p>
                        
                        {notice.attachmentUrl && (() => {
                            const absoluteUrl = getFullFileUrl(notice.attachmentUrl);
                            const filename = notice.attachmentUrl.split('/').pop() || 'attachment';
                            const displayName = filename.replace(/^\d+-/, '');

                            return (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mb-4 bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 rounded-xl transition-all">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 border border-blue-100 dark:border-blue-900/30">
                                            <FileText size={20} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate transition-colors" title={displayName}>
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                Notice Attachment
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(absoluteUrl, '_blank', 'noopener,noreferrer')}
                                            className="gap-1.5 h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold px-3 transition-colors shadow-sm"
                                        >
                                            <Eye size={14} /> View
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleDownload(absoluteUrl, displayName)}
                                            className="gap-1.5 h-9 text-xs font-bold px-3 transition-colors shadow-sm"
                                        >
                                            <Download size={14} /> Download
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                        
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