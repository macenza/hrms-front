'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Loader2, CheckCircle2, ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import apiClient from '@/services/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

type FilterStatus = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (pageNum: number, status: FilterStatus, append: boolean = false) => {
        try {
            setLoading(true);
            let url = `/notifications?page=${pageNum}&limit=20`;
            if (status !== 'all') {
                url += `&status=${status}`;
            }

            const res = await apiClient.get(url);
            
            if (append) {
                setNotifications(prev => [...prev, ...res.data.data]);
            } else {
                setNotifications(res.data.data);
            }
            
            setHasMore(res.data.currentPage < res.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchNotifications(1, statusFilter, false);
    }, [statusFilter]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, statusFilter, true);
    };

    const markAsRead = async (id: string) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    // Grouping helper
    const groupNotifications = () => {
        const groups: { [key: string]: Notification[] } = {
            'Today': [],
            'Yesterday': [],
            'Older': []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        notifications.forEach(n => {
            const date = new Date(n.createdAt);
            if (date >= today) {
                groups['Today'].push(n);
            } else if (date >= yesterday) {
                groups['Yesterday'].push(n);
            } else {
                groups['Older'].push(n);
            }
        });

        return groups;
    };

    const grouped = groupNotifications();

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and view all your activity alerts.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-800">
                {(['all', 'unread', 'read'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            statusFilter === status 
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading && page === 1 ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Bell size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No notifications found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm text-center">
                        {statusFilter === 'unread' ? "You don't have any unread notifications." : "You're all caught up! Activity alerts will appear here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {['Today', 'Yesterday', 'Older'].map(group => {
                        const items = grouped[group];
                        if (items.length === 0) return null;

                        return (
                            <div key={group} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {group}
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {items.map(n => (
                                        <div 
                                            key={n._id} 
                                            className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start gap-4 ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            
                                            <div className="flex-1 min-w-0">
                                                {n.link ? (
                                                    <Link href={n.link} onClick={() => !n.isRead && markAsRead(n._id)} className="group block focus:outline-none">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                    {n.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                                    {n.message}
                                                                </p>
                                                            </div>
                                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1" />
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div onClick={() => !n.isRead && markAsRead(n._id)} className="cursor-pointer">
                                                        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                                            {n.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-4 mt-3">
                                                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    
                                                    {!n.isRead && (
                                                        <button 
                                                            onClick={() => markAsRead(n._id)}
                                                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
