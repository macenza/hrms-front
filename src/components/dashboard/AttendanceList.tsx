// src/components/dashboard/AttendanceList.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { Loader2, ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { PendingLeaveRequest } from '@/store/dashboardSlice';

interface AttendanceListProps {
    isEmployee?: boolean;
    listData?: PendingLeaveRequest[];
    isLoading?: boolean;
}

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
        'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export default function AttendanceList({ 
    isEmployee = false, 
    listData = [], 
    isLoading = false 
}: AttendanceListProps) {

    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const displayList = useMemo(() => {
        if (!listData) return [];
        return listData.slice(0, 5); 
    }, [listData]);

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

    const formatLeaveType = (type: string) => {
        if (!type) return 'N/A';
        const lower = type.toLowerCase();
        if (lower.startsWith('checked') || lower === 'active' || lower === 'inactive' || lower === 'terminated' || lower.includes('manager') || lower.includes('engineer') || lower.includes('designer') || lower.includes('developer')) {
            return type;
        }
        if (lower.endsWith('leave')) {
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Leave`;
    };

    const formatAppliedDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Premium Skeleton Loader
    if (isLoading && (!listData || listData.length === 0)) {
        return (
            <div className="rounded-2xl p-6 flex flex-col gap-5 h-[340px] bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none animate-pulse">
                <div className="flex justify-between mb-2">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100/50 dark:border-gray-800/40 last:border-0">
                        <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    const getLeaveTypeBadge = (type: string) => {
        const formatted = formatLeaveType(type);
        const lower = type.toLowerCase();

        let dotClass = "bg-gray-400 dark:bg-gray-600";

        if (lower.includes('sick')) {
            dotClass = "bg-rose-400 dark:bg-rose-500";
        } else if (lower.includes('casual')) {
            dotClass = "bg-sky-400 dark:bg-sky-500";
        } else if (lower.includes('annual') || lower.includes('vacation')) {
            dotClass = "bg-emerald-400 dark:bg-emerald-500";
        } else if (lower.includes('maternity') || lower.includes('paternity')) {
            dotClass = "bg-pink-400 dark:bg-pink-500";
        } else if (lower.includes('checked')) {
            dotClass = "bg-green-400 dark:bg-green-500";
        } else if (lower === 'active') {
            dotClass = "bg-emerald-450 dark:bg-emerald-500";
        } else if (lower === 'inactive' || lower === 'terminated') {
            dotClass = "bg-red-400 dark:bg-red-500";
        }

        return (
            <span className="inline-flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />
                <span className="text-xs font-medium truncate text-gray-600 dark:text-gray-400">{formatted}</span>
            </span>
        );
    };

    return (
        <div className={cn(
            "rounded-2xl p-6 flex flex-col gap-5 relative border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none min-h-[340px]",
            "hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-slate-250/20",
            "transition-all duration-300"
        )}>    
            
            {/* Background Fetching Overlay */}
            {isLoading && displayList.length > 0 && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl transition-opacity">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 transition-colors tracking-tight">
                    Pending Leave Requests
                </h3>
                <Link 
                    href="/leave" 
                    className="group flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3.5 py-2 rounded-xl border border-blue-100/30 dark:border-transparent cursor-pointer shadow-sm hover:shadow-md"
                >
                    View All
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-450 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search requests by employee or leave type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            <div className="grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider pb-2 border-b text-gray-400 dark:text-gray-500 border-gray-100/80 dark:border-gray-800/80 transition-colors px-2">
                <span className="col-span-5 text-left">Employee</span>
                <span className="col-span-3 text-left">Leave Type</span>
                <span className="col-span-2 text-center">Duration</span>
                <span className="col-span-2 text-center">Applied On</span>
            </div>

            {/* List Body */}
            <div className='flex flex-col gap-1.5'>
                {displayList.length === 0 ? (
                    <div className="text-center text-sm text-gray-405 dark:text-gray-500 py-8 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl mt-2 transition-colors font-semibold">
                        No pending leave requests.
                    </div>
                ) : (
                    displayList.map((row) => {
                        const userName = row.employeeName;
                        const initial = getInitials(userName);
                        const isMatch = !searchTerm || 
                            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            row.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        return (
                            <div
                                key={row._id}
                                onClick={() => router.push('/leave')}
                                style={{
                                    maxHeight: isMatch ? "80px" : "0px",
                                    opacity: isMatch ? 1 : 0,
                                    paddingTop: isMatch ? "8px" : "0px",
                                    paddingBottom: isMatch ? "8px" : "0px",
                                    marginTop: isMatch ? "4px" : "0px",
                                    marginBottom: isMatch ? "4px" : "0px",
                                    pointerEvents: isMatch ? "auto" : "none",
                                }}
                                className="grid grid-cols-12 items-center rounded-xl px-2 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:scale-[1.01] hover:shadow-sm group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-900/60 overflow-hidden"
                            >
                                <div className="col-span-5 flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                        getAvatarColor(userName)
                                    )}>
                                        {row.avatar ? (
                                            <img 
                                                src={row.avatar.startsWith('http') 
                                                    ? row.avatar 
                                                    : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:4000'}${row.avatar}`} 
                                                alt={userName} 
                                                className="w-full h-full rounded-full object-cover" 
                                            />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold truncate text-gray-700 dark:text-gray-200 transition-colors">
                                        {userName}
                                    </span>
                                </div>

                                <div className="col-span-3 flex items-center pr-2">
                                    {getLeaveTypeBadge(row.leaveType)}
                                </div>
                                
                                <span className="col-span-2 text-xs text-center font-bold text-gray-700 dark:text-gray-300 transition-colors font-mono tabular-nums">
                                    {row.numberOfDays} {row.numberOfDays === 1 ? 'day' : 'days'}
                                </span>

                                <span className="col-span-2 text-xs text-center font-semibold text-gray-500 dark:text-gray-400 transition-colors">
                                    {formatAppliedDate(row.createdAt)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
