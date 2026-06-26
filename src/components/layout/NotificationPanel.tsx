'use client';

import React, { useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Loader2, Inbox } from 'lucide-react';
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
} from '@/hooks/api/useNotifications';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
}

function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        LEAVE_APPROVED: 'bg-emerald-500',
        LEAVE_REJECTED: 'bg-red-500',
        LEAVE_REQUESTED: 'bg-amber-500',
        EMPLOYEE_CREATED: 'bg-blue-500',
        EMPLOYEE_DELETED: 'bg-red-500',
        EMPLOYEE_UPDATED: 'bg-indigo-500',
        PAYROLL_PROCESSED: 'bg-violet-500',
        ASSET_ASSIGNED: 'bg-cyan-500',
        HOLIDAY_CREATED: 'bg-pink-500',
        NOTICE_CREATED: 'bg-orange-500',
        TASK_ASSIGNED: 'bg-teal-500',
        SYSTEM_ALERT: 'bg-gray-500',
        PAYMENT_SUCCESS: 'bg-emerald-500',
    };
    return colors[type] || 'bg-blue-500';
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const { data, isLoading } = useNotifications(1, 30);
    const markReadMutation = useMarkNotificationRead();
    const markAllReadMutation = useMarkAllNotificationsRead();

    const notifications = data?.data || [];
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleMarkRead = (id: string) => {
        markReadMutation.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllReadMutation.isPending}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                        <CheckCheck size={14} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400 dark:text-gray-500">
                        <Inbox size={32} strokeWidth={1.5} />
                        <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                ) : (
                    <ul>
                        {notifications.map((notif: any) => (
                            <li
                                key={notif._id}
                                className={`relative flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/50 transition-colors cursor-pointer group ${
                                    notif.isRead
                                        ? 'bg-white dark:bg-gray-900'
                                        : 'bg-blue-50/50 dark:bg-blue-950/20'
                                } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                                onClick={() => {
                                    if (!notif.isRead) handleMarkRead(notif._id);
                                }}
                            >
                                {/* Type Indicator Dot */}
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${getTypeColor(notif.type)}`} />

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug ${
                                        notif.isRead
                                            ? 'text-gray-600 dark:text-gray-400 font-normal'
                                            : 'text-gray-900 dark:text-gray-100 font-semibold'
                                    }`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 font-medium">
                                        {timeAgo(notif.createdAt)}
                                    </p>
                                </div>

                                {/* Mark Read Button */}
                                {!notif.isRead && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkRead(notif._id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 shrink-0 mt-1"
                                        title="Mark as read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                        Showing latest {notifications.length} notifications
                    </p>
                </div>
            )}
        </div>
    );
}
