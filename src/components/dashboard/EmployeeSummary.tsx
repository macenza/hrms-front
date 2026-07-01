// src/components/dashboard/EmployeeSummary.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users, Search } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/cn";
import { useCompanySettings } from "@/hooks/api/useSettings";

// Upgraded to handle deep dark mode contrasts
const STATUS_STYLES: Record<string, string> = {
    PAID: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    PENDING: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    OVERDUE: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    ON_LEAVE: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    TERMINATED: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
    INACTIVE: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
};

// Extracted from backend schema
export interface RecentEmployee {
    _id: string;
    employeeId?: string;
    name: string;
    jobTitle?: string;
    netSalary?: number;
    status?: string;
    avatar?: string;
    joiningDate?: string;
}

interface EmployeeSummaryProps {
    employees?: RecentEmployee[];
    isLoading?: boolean;
    disableAnimations?: boolean;
}

// 5-color rich avatar palette
const getAvatarColor = (name: string): { bg: string; text: string } => {
    if (!name) return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
    const palettes = [
        { bg: 'bg-violet-100 dark:bg-violet-500/15', text: 'text-violet-700 dark:text-violet-300' },
        { bg: 'bg-sky-100 dark:bg-sky-500/15', text: 'text-sky-700 dark:text-sky-300' },
        { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300' },
        { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300' },
        { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-300' },
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palettes[hash % palettes.length];
};

// Minimal dot status config
const STATUS_DOT: Record<string, string> = {
    ACTIVE:     'bg-emerald-400',
    ON_LEAVE:   'bg-blue-400',
    INACTIVE:   'bg-gray-400',
    TERMINATED: 'bg-red-400',
    PENDING:    'bg-amber-400',
};


export default function EmployeeSummary({
    employees = [],
    isLoading = false,
    disableAnimations = false,
}: EmployeeSummaryProps) {
    const { data: companySettings } = useCompanySettings();
    const currency = companySettings?.currency || 'USD';
    

    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    // Keep auth in Redux, it's global client state
    const { user } = useAppSelector((state) => state.auth);
    const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
    const displayEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.slice(0, 5);
    }, [employees]);

    const getInitials = (name: string) =>
        name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

    const formatRelativeDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    };


    // Premium Skeleton Loader
    if (isLoading && employees.length === 0) {
        return (
            <div className="rounded-2xl flex flex-col overflow-hidden h-full min-h-[340px] border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none animate-pulse">
                <div className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-1.5">
                                <div className="w-36 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="w-20 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                            </div>
                        </div>
                        <div className="w-16 h-7 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="w-28 h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="w-20 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                            </div>
                            <div className="w-14 h-5 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const formatJoiningDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            className={cn(
                "rounded-2xl flex flex-col overflow-hidden h-full relative border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none min-h-[340px]",
                "hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-slate-250/20",
                !disableAnimations && "transition-all duration-300"
            )}
        >
            <div className="flex flex-col gap-4 p-5 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100/80 dark:border-blue-500/20 shadow-sm shrink-0">
                            <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                                Recent New Joiners
                            </h3>
                            <p className="text-[10px] mt-0.5 text-gray-400 dark:text-gray-500 font-medium">Last 30 days</p>
                        </div>
                    </div>
                    <Link
                        href="/employees"
                        className="group/btn flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3.5 py-1.5 rounded-xl border border-blue-100/60 dark:border-blue-500/20 shadow-sm hover:shadow-md"
                    >
                        See All
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-450 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search joiners by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* List */}
                <div className="flex flex-col gap-1">
                    {displayEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-sm text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl mt-2">
                            No employee data available.
                        </div>
                    ) : (
                        displayEmployees.map((emp) => {
                            const initials = getInitials(emp.name);
                            const avatarColor = getAvatarColor(emp.name);
                            const dotClass = STATUS_DOT[emp.status || 'ACTIVE'] || 'bg-gray-400';
                            const statusLabel = emp.status ? emp.status.charAt(0) + emp.status.slice(1).toLowerCase().replace('_', ' ') : 'Active';

                            const isMatch = !searchTerm || 
                                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (emp.jobTitle && emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

                            return (
                                <div
                                    key={emp._id}
                                    onClick={() => router.push(`/employees/${emp._id}`)}
                                    style={{
                                        maxHeight: isMatch ? "80px" : "0px",
                                        opacity: isMatch ? 1 : 0,
                                        paddingTop: isMatch ? "8px" : "0px",
                                        paddingBottom: isMatch ? "8px" : "0px",
                                        marginTop: isMatch ? "4px" : "0px",
                                        marginBottom: isMatch ? "4px" : "0px",
                                        pointerEvents: isMatch ? "auto" : "none",
                                    }}
                                    className="flex items-center gap-3 px-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100/80 dark:hover:border-gray-800/60 group/row overflow-hidden"
                                >
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm group-hover/row:shadow-md group-hover/row:scale-105 transition-all duration-200",
                                        avatarColor.bg, avatarColor.text
                                    )}>
                                        {emp.avatar ? (
                                            <img
                                                src={emp.avatar.startsWith('http')
                                                    ? emp.avatar
                                                    : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:4000'}${emp.avatar}`}
                                                alt={emp.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : initials}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate leading-tight group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
                                            {emp.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">
                                            {emp.jobTitle || 'N/A'} · <span className="font-mono">{emp.employeeId || '—'}</span>
                                        </p>
                                    </div>

                                    {/* Status dot + label */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
                                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{statusLabel}</span>
                                    </div>

                                    {/* Relative joining date */}
                                    <span className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 tabular-nums shrink-0 hidden sm:block">
                                        {formatRelativeDate(emp.joiningDate)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}