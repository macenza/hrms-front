import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, Loader2, Info } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import apiClient from '@/services/apiClient';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize Socket and fetch initial unread count
    useEffect(() => {
        const token = Cookies.get('hrms_token') || localStorage.getItem('hrms_token') || Cookies.get('customer_token') || localStorage.getItem('customer_token');
        
        if (!token) return;

        // Fetch initial unread count
        apiClient.get('/notifications/unread-count')
            .then(res => setUnreadCount(res.data.count))
            .catch(console.error);

        // Connect Socket
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
        socketRef.current = io(socketUrl, {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            console.log('Notification socket connected');
        });

        socketRef.current.on('new_notification', (notification: Notification) => {
            setUnreadCount(prev => prev + 1);
            // Re-fetch to apply the correct "today" filtering logic
            fetchNotifications();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Only fetch today's notifications for the bell icon
            const res = await apiClient.get('/notifications?timeframe=today&limit=50');
            const todayNotifs: Notification[] = res.data.data;
            
            const unreadToday = todayNotifs.filter(n => !n.isRead);
            
            if (unreadToday.length > 0) {
                // If there are unread notifications, show all unread
                setNotifications(unreadToday);
            } else {
                // If all are read, show max 2 recent notifications from today
                setNotifications(todayNotifs.slice(0, 2));
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put('/notifications/read-all');
            setUnreadCount(0);
            await fetchNotifications(); // Re-fetch to apply the "show 2 if all read" logic
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.isRead) markAsRead(n._id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleToggle}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center bg-red-500 text-[9px] font-bold text-white rounded-full border border-white dark:border-gray-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                        <button 
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className={`text-xs font-medium transition-colors ${
                                unreadCount > 0 
                                ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400' 
                                : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                            }`}
                        >
                            Mark all as read
                        </button>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                                    <Bell size={20} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No notifications</p>
                                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map(n => (
                                    <div key={n._id} className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                {n.link ? (
                                                    <Link href={n.link} onClick={() => handleNotificationClick(n)} className="block focus:outline-none">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{n.title}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                                                    </Link>
                                                ) : (
                                                    <div onClick={() => handleNotificationClick(n)} className="cursor-pointer">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{n.title}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-medium text-gray-400 mt-1.5">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                        <Link 
                            href="/notifications" 
                            onClick={() => setIsOpen(false)}
                            className="block w-full py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
