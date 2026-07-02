'use client';

import React from 'react';
import { Pin, Calendar, User, Pencil, Trash2, FileText, Eye, Download } from 'lucide-react';
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

const getNoticeCardStyles = (category?: string) => {
    const cat = (category || 'General').toLowerCase();
    switch (cat) {
        case 'event':
            return {
                cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.18)] hover:border-purple-300 dark:hover:border-purple-800',
                borderLine: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500'
            };
        case 'policy':
            return {
                cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.22)] hover:border-amber-300 dark:hover:border-amber-800',
                borderLine: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500'
            };
        case 'holiday':
            return {
                cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.18)] hover:border-emerald-300 dark:hover:border-emerald-800',
                borderLine: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400'
            };
        default:
            return {
                cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.18)] hover:border-blue-300 dark:hover:border-blue-800',
                borderLine: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
            };
    }
};

export default function NoticeFeed({
    notices,
    isLoading,
    onEditClick,
    onDeleteClick,
    onPinToggle,
}: NoticeFeedProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';

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
                const showActions = isAuthor || isHrOrAdmin;

                const createdTime = new Date(notice.createdAt).getTime();
                const updatedTime = notice.updatedAt ? new Date(notice.updatedAt).getTime() : 0;
                const isEdited = updatedTime > 0 && (updatedTime - createdTime > 1000);
                const targetDate = isEdited ? notice.updatedAt! : notice.createdAt;
                const datePrefix = isEdited ? "Modified" : "Published";

                const styles = getNoticeCardStyles(notice.category);

                return (
                    <div
                        key={notice._id}
                        className={cn(
                            "p-5 pt-7 rounded-xl border transition-all duration-300 relative overflow-hidden hover:-translate-y-1",
                            styles.cardClass,
                            notice.isPinned
                                ? "bg-blue-50/20 dark:bg-blue-900/5 border-blue-200 dark:border-blue-900/50"
                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        )}
                    >
                        {/* Top dynamic gradient border line */}
                        <div className={cn("absolute top-0 left-0 right-0 h-[4px]", styles.borderLine)} />
                        
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
                            
                            {showActions && (
                                <div className="flex items-center gap-1">
                                    {/* Pin/Unpin Button (HR/Admin only) */}
                                    {isHrOrAdmin && onPinToggle && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "p-1.5 h-8 w-8 rounded-full transition-colors",
                                                notice.isPinned
                                                    ? "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                            onClick={() => onPinToggle(notice._id)}
                                            aria-label={notice.isPinned ? 'Unpin notice' : 'Pin notice'}
                                            title={notice.isPinned ? 'Unpin Notice' : 'Pin Notice'}
                                        >
                                            <Pin size={16} className={notice.isPinned ? 'fill-current' : ''} />
                                        </Button>
                                    )}

                                    {/* Edit Button (Author only) */}
                                    {isAuthor && onEditClick && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            onClick={() => onEditClick(notice)}
                                            aria-label="Edit notice"
                                            title="Edit Notice"
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                    )}

                                    {/* Delete Button (HR/Admin only) */}
                                    {isHrOrAdmin && onDeleteClick && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            onClick={() => onDeleteClick(notice._id)}
                                            aria-label="Delete notice"
                                            title="Delete Notice"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
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